
import React, { useState, useMemo } from 'react';
import { Run, CartonEvaluationSample, CommodityData, CartonConfig, Size, BoxType, EvaluationDefects, CustomEvaluationDefect, CartonEvaluationEntry, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { getSizesForCommodity, getMappedCommodity } from '../../utils/commodityHelper';
import { DEFECTS } from '../../constants/commoditySizes';


interface CartonEvaluationPageProps {
  run: Run;
  onSaveCartonEvaluation: (runId: string, cartonEvaluations: CartonEvaluationSample[]) => void;
  commodityData: CommodityData;
  cartonConfig: CartonConfig;
  isReadOnly?: boolean;
  onApprove?: (runId: string, qcType: 'cartonEvaluations', entryId: string, username: string) => void;
  entryToView?: CartonEvaluationEntry | null;
  currentUser: User | null;
}

const CUSTOM_DEFECT_COUNT = 6;

const CartonEvaluationPage: React.FC<CartonEvaluationPageProps> = ({ run, onSaveCartonEvaluation, commodityData, cartonConfig, isReadOnly = false, onApprove, entryToView, currentUser }) => {
  const [samples, setSamples] = useState<CartonEvaluationSample[]>(() => {
    if (isReadOnly && entryToView) {
        const initialSamples = entryToView.samples || [];
        // FIX: Ensure correct typing for custom defects during initialization.
        return initialSamples.map(sample => {
            const existingCustoms = sample.customDefects || [];
            const paddedCustoms: CustomEvaluationDefect[] = Array.from({ length: CUSTOM_DEFECT_COUNT }, (_, i) => 
                existingCustoms[i] || { name: '', counts: { klas1: '', klas2: '', klas3: '' } }
            );
            return {
                ...sample,
                sampleSize: sample.sampleSize || '',
                defects: sample.defects || {},
                customDefects: paddedCustoms,
            };
        });
    }
    return [];
  });
  const [newSampleSize, setNewSampleSize] = useState<string>('');
  const [newSampleClass, setNewSampleClass] = useState<string>('');
  const [newSampleBoxType, setNewSampleBoxType] = useState<string>('');

  const sizes: Size[] = useMemo(() => getSizesForCommodity(run.commodity, commodityData), [run.commodity, commodityData]);
  const mappedCommodity = useMemo(() => getMappedCommodity(run.commodity), [run.commodity]);
  const boxTypes: BoxType[] = useMemo(() => cartonConfig.boxTypes[mappedCommodity] || [], [mappedCommodity, cartonConfig.boxTypes]);
  const classes: string[] = useMemo(() => cartonConfig.classes || [], [cartonConfig.classes]);

  const handleAddSample = () => {
    if (!newSampleSize || !newSampleClass || !newSampleBoxType) {
      alert('Please select a size, class, and box type.');
      return;
    }
    const newSample: CartonEvaluationSample = {
      id: `sample-${Date.now()}`,
      size: newSampleSize,
      class: newSampleClass,
      boxType: newSampleBoxType,
      sampleSize: '',
      counts: { vsa: '', klas1: '', klas2: '', klas3: '' },
      defects: {},
      customDefects: Array.from({ length: CUSTOM_DEFECT_COUNT }, () => ({ name: '', counts: { klas1: '', klas2: '', klas3: '' } })),
    };
    setSamples(prev => [...prev, newSample]);
    setNewSampleSize('');
    setNewSampleClass('');
    setNewSampleBoxType('');
  };

  const handleSampleSizeChange = (sampleId: string, value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    // FIX: Replaced unsafe `as number` cast with a type guard to safely check for NaN.
    if (typeof numValue === 'number' && isNaN(numValue)) return;

    setSamples(prev => prev.map(sample => {
        if (sample.id === sampleId) {
            return { ...sample, sampleSize: numValue };
        }
        return sample;
    }));
  };

  const handleCountChange = (sampleId: string, evalClass: keyof CartonEvaluationSample['counts'], value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    // FIX: Replaced unsafe `as number` cast with a type guard to safely check for NaN.
    if (typeof numValue === 'number' && isNaN(numValue)) return;

    setSamples(prev => prev.map(sample => {
      if (sample.id === sampleId) {
        const newCounts = { ...sample.counts, [evalClass]: numValue };
        return { ...sample, counts: newCounts };
      }
      return sample;
    }));
  };

  const handleDefectChange = (sampleId: string, defectName: string, className: 'klas1' | 'klas2' | 'klas3', value: string) => {
      const numValue = value === '' ? '' : parseInt(value, 10);
      // FIX: Replaced unsafe `as number` cast with a type guard to safely check for NaN.
      if (typeof numValue === 'number' && isNaN(numValue)) return;

      setSamples(prev => prev.map(sample => {
        if (sample.id === sampleId) {
            const newDefects: EvaluationDefects = JSON.parse(JSON.stringify(sample.defects || {}));
            if (!newDefects[defectName]) {
                newDefects[defectName] = { klas1: '', klas2: '', klas3: '' };
            }
            newDefects[defectName][className] = numValue;
            return { ...sample, defects: newDefects };
        }
        return sample;
      }));
  };

  const handleCustomDefectChange = (sampleId: string, index: number, field: 'name' | 'klas1' | 'klas2' | 'klas3', value: string) => {
      setSamples(prev => prev.map(sample => {
          if (sample.id === sampleId) {
              const newCustomDefects = JSON.parse(JSON.stringify(sample.customDefects || []));
              const defectToUpdate = newCustomDefects[index];

              if (field === 'name') {
                  defectToUpdate.name = value;
              } else {
                  const numValue = value === '' ? '' : parseInt(value, 10);
                  // FIX: Replaced unsafe `as number` cast with a type guard to safely check for NaN.
                  if (typeof numValue === 'number' && isNaN(numValue)) return sample; // Do not update if invalid number
                  defectToUpdate.counts[field] = numValue;
              }
              return { ...sample, customDefects: newCustomDefects };
          }
          return sample;
      }));
  };

  const handleDeleteSample = (sampleId: string) => {
    if (window.confirm('Are you sure you want to delete this evaluation sample?')) {
      setSamples(prev => prev.filter(sample => sample.id !== sampleId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadOnly) {
        onSaveCartonEvaluation(run.id, samples);
    }
  };

  const handleApproveClick = () => {
    if (onApprove && entryToView && currentUser) {
        onApprove(run.id, 'cartonEvaluations', entryToView.id, currentUser.username);
    }
  };
  
  const getTotalCount = (counts: CartonEvaluationSample['counts']): number => {
    return Object.values(counts).reduce((sum: number, current) => {
        const val = typeof current === 'number' ? current : 0;
        return sum + val;
    }, 0);
  };
  
  const isApproved = entryToView?.approvalDetails?.status === 'approved';

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
           {isReadOnly && (
             <div className="p-4 mb-6 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
                <p className="font-semibold">Read-Only Mode: This form is for viewing or approval.</p>
             </div>
           )}
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Karton evaluering</h2>
            <p className="text-slate-500 mt-1">Carton evaluation for Run: <span className="font-semibold text-orange-600">{run.runNumber}</span></p>
          </div>
          
          {!isReadOnly && (
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Add New Evaluation Sample</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <Label htmlFor="size-select">Size</Label>
                    <select id="size-select" value={newSampleSize} onChange={e => setNewSampleSize(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                    <option value="">Select Size</option>
                    {sizes.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                    </select>
                </div>
                <div>
                    <Label htmlFor="class-select">Class</Label>
                    <select id="class-select" value={newSampleClass} onChange={e => setNewSampleClass(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <Label htmlFor="box-type-select">Box Type</Label>
                    <select id="box-type-select" value={newSampleBoxType} onChange={e => setNewSampleBoxType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                    <option value="">Select Box Type</option>
                    {boxTypes.map(bt => <option key={bt.name} value={bt.name}>{bt.name}</option>)}
                    </select>
                </div>
                <div>
                    <Button type="button" onClick={handleAddSample} className="w-full">Add Sample</Button>
                </div>
                </div>
            </div>
          )}
        </Card>

        <div className="mt-8 space-y-8">
          {samples.length === 0 && (
            <Card>
              <p className="text-center text-slate-500 py-8">No carton evaluation samples have been added yet.</p>
            </Card>
          )}
          {samples.map(sample => {
            const totalCount = getTotalCount(sample.counts);
            const sampleSize = Number(sample.sampleSize) || 0;
            
            return (
              <Card key={sample.id}>
                <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700">
                      Sample: <span className="text-indigo-600">{sample.size} / {sample.class} / {sample.boxType}</span>
                    </h3>
                  </div>
                  {!isReadOnly && (
                    <button type="button" onClick={() => handleDeleteSample(sample.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>

                <div className="mb-6">
                    <Label htmlFor={`sample-size-${sample.id}`}>Sample Grootte</Label>
                    <Input
                        id={`sample-size-${sample.id}`}
                        type="number"
                        min="1"
                        placeholder="Total fruit in sample"
                        value={sample.sampleSize}
                        onChange={(e) => handleSampleSizeChange(sample.id, e.target.value)}
                        className="w-full max-w-xs"
                        required
                        disabled={isReadOnly}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4 items-end">
                    {(['vsa', 'klas1', 'klas2', 'klas3'] as const).map(key => {
                        const percentage = sampleSize > 0 ? ((Number(sample.counts[key]) || 0) / sampleSize) * 100 : 0;
                        const label = key.charAt(0).toUpperCase() + key.slice(1).replace('klas', 'Klas ');
                        return (
                             <div key={key}>
                                <Label htmlFor={`count-${key}-${sample.id}`}>{label}</Label>
                                <div className="flex items-center space-x-2">
                                    <Input id={`count-${key}-${sample.id}`} type="number" min="0" placeholder="0" value={sample.counts[key]} onChange={(e) => handleCountChange(sample.id, key, e.target.value)} className="w-full text-center" disabled={isReadOnly} />
                                    <span className="text-xs text-slate-500 w-12 text-right">({percentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                        );
                    })}
                     <div className="bg-slate-100 p-3 rounded-lg text-center h-full flex flex-col justify-center">
                        <p className="text-sm font-medium text-slate-500">Total Vrugte</p>
                        <p className="text-lg font-bold text-slate-700">{totalCount}</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-700 mb-4">Defekte gekry per klas</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Defek</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Klas 1</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Klas 2</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Klas 3</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Totaal (% van monster)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {DEFECTS.map(defectName => {
                            const klas1 = Number(sample.defects?.[defectName]?.klas1 || 0);
                            const klas2 = Number(sample.defects?.[defectName]?.klas2 || 0);
                            const klas3 = Number(sample.defects?.[defectName]?.klas3 || 0);
                            const defectTotal = klas1 + klas2 + klas3;
                            const percentage = sampleSize > 0 ? (defectTotal / sampleSize) * 100 : 0;
                            return (
                                <tr key={defectName}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800">{defectName}</td>
                                    <td className="px-2 py-1">
                                    <Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={sample.defects?.[defectName]?.klas1 || ''} onChange={e => handleDefectChange(sample.id, defectName, 'klas1', e.target.value)} disabled={isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1">
                                    <Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={sample.defects?.[defectName]?.klas2 || ''} onChange={e => handleDefectChange(sample.id, defectName, 'klas2', e.target.value)} disabled={isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1">
                                    <Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={sample.defects?.[defectName]?.klas3 || ''} onChange={e => handleDefectChange(sample.id, defectName, 'klas3', e.target.value)} disabled={isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1 text-center align-middle text-sm">
                                        {defectTotal > 0 ? (
                                            <span className="font-medium">{defectTotal} <span className="text-slate-500">({percentage.toFixed(1)}%)</span></span>
                                        ) : (
                                            <span className="text-slate-400">0</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {sample.customDefects?.map((defect, index) => {
                            const klas1 = Number(defect.counts.klas1 || 0);
                            const klas2 = Number(defect.counts.klas2 || 0);
                            const klas3 = Number(defect.counts.klas3 || 0);
                            const defectTotal = klas1 + klas2 + klas3;
                            const percentage = sampleSize > 0 ? (defectTotal / sampleSize) * 100 : 0;
                            return (
                                <tr key={`custom-${index}`}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                        <Input type="text" value={defect.name} onChange={e => handleCustomDefectChange(sample.id, index, 'name', e.target.value)} className="w-full text-sm" placeholder="Custom defect..." disabled={isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1">
                                        <Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={defect.counts.klas1} onChange={e => handleCustomDefectChange(sample.id, index, 'klas1', e.target.value)} disabled={!defect.name || isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1">
                                        <Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={defect.counts.klas2} onChange={e => handleCustomDefectChange(sample.id, index, 'klas2', e.target.value)} disabled={!defect.name || isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1">
                                        <Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={defect.counts.klas3} onChange={e => handleCustomDefectChange(sample.id, index, 'klas3', e.target.value)} disabled={!defect.name || isReadOnly} />
                                    </td>
                                    <td className="px-2 py-1 text-center align-middle text-sm">
                                        {defectTotal > 0 ? (
                                            <span className="font-medium">{defectTotal} <span className="text-slate-500">({percentage.toFixed(1)}%)</span></span>
                                        ) : (
                                            <span className="text-slate-400">0</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {samples.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200 text-center">
                {isReadOnly ? (
                    !isApproved && (
                        <Button type="button" onClick={handleApproveClick} className="w-full max-w-sm bg-green-600 hover:bg-green-700 focus:ring-green-500">
                            Approve Carton Evaluations
                        </Button>
                    )
                ) : (
                    <Button type="submit" className="w-full max-w-sm">
                        Save All Evaluations
                    </Button>
                )}
            </div>
        )}
      </form>
    </div>
  );
};

export default CartonEvaluationPage;

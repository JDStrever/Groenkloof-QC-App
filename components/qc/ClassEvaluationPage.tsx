
import React, { useState, useMemo, useRef } from 'react';
import { Run, ClassEvaluationSample, CommodityData, CartonConfig, Size, EvaluationDefects, ClassEvaluationEntry, CustomEvaluationDefect, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { getSizesForCommodity } from '../../utils/commodityHelper';
import { DEFECTS } from '../../constants/commoditySizes';

interface ClassEvaluationPageProps {
  run: Run;
  onSaveClassEvaluation: (runId: string, classEvaluations: ClassEvaluationSample[]) => void;
  commodityData: CommodityData;
  cartonConfig: CartonConfig;
  isReadOnly?: boolean;
  onApprove?: (runId: string, qcType: 'classEvaluations', entryId: string, username: string) => void;
  entryToView?: ClassEvaluationEntry | null;
  currentUser: User | null;
}

const CUSTOM_DEFECT_COUNT = 6;

const ClassEvaluationPage: React.FC<ClassEvaluationPageProps> = ({ run, onSaveClassEvaluation, commodityData, cartonConfig, isReadOnly = false, onApprove, entryToView, currentUser }) => {
  const [samples, setSamples] = useState<ClassEvaluationSample[]>(() => {
    if (isReadOnly && entryToView) {
        const initialSamples = entryToView.samples || [];
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
            photos: sample.photos || [],
            classPhotos: sample.classPhotos || {},
            defectPhotos: sample.defectPhotos || []
        };
        });
    }
    return [];
  });

  const [newSampleSize, setNewSampleSize] = useState<string>('');
  const [newSampleClass, setNewSampleClass] = useState<string>('');
  
  // Photo handling
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoContext, setActivePhotoContext] = useState<{ sampleId: string, type: 'class' | 'defects', key?: string } | null>(null);

  const sizes: Size[] = useMemo(() => getSizesForCommodity(run.commodity, commodityData), [run.commodity, commodityData]);
  const classes: string[] = useMemo(() => cartonConfig.classes || [], [cartonConfig.classes]);

  const handleAddSample = () => {
    if (!newSampleSize || !newSampleClass) {
      alert('Please select a size and class.');
      return;
    }
    const newSample: ClassEvaluationSample = {
      id: `sample-${Date.now()}`,
      size: newSampleSize,
      class: newSampleClass,
      sampleSize: '',
      counts: { vsa: '', klas1: '', klas2: '', klas3: '' },
      defects: {},
      customDefects: Array.from({ length: CUSTOM_DEFECT_COUNT }, () => ({ name: '', counts: { klas1: '', klas2: '', klas3: '' } })),
      photos: [],
      classPhotos: {},
      defectPhotos: []
    };
    setSamples(prev => [...prev, newSample]);
    setNewSampleSize('');
    setNewSampleClass('');
  };

  const handleSampleSizeChange = (sampleId: string, value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    if (typeof numValue === 'number' && isNaN(numValue)) return;
    setSamples(prev => prev.map(sample =>
      sample.id === sampleId ? { ...sample, sampleSize: numValue } : sample
    ));
  };

  const handleCountChange = (sampleId: string, evalClass: keyof ClassEvaluationSample['counts'], value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
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
          if (typeof numValue === 'number' && isNaN(numValue)) return sample;
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
  
  // --- Photo Handling ---

  const handleAddPhotoClick = (context: { sampleId: string, type: 'class' | 'defects', key?: string }, source: 'camera' | 'gallery') => {
      if (isReadOnly) return;
      setActivePhotoContext(context);
      if (source === 'camera') {
          cameraInputRef.current?.click();
      } else {
          galleryInputRef.current?.click();
      }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0 || !activePhotoContext) return;

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              if (loadEvent.target?.result) {
                  const base64Data = loadEvent.target.result as string;
                  setSamples(prev => prev.map(sample => {
                      if (sample.id === activePhotoContext.sampleId) {
                          if (activePhotoContext.type === 'class' && activePhotoContext.key) {
                              const newClassPhotos = { ...sample.classPhotos };
                              newClassPhotos[activePhotoContext.key] = [...(newClassPhotos[activePhotoContext.key] || []), base64Data];
                              return { ...sample, classPhotos: newClassPhotos };
                          } else if (activePhotoContext.type === 'defects') {
                              return { ...sample, defectPhotos: [...(sample.defectPhotos || []), base64Data] };
                          }
                      }
                      return sample;
                  }));
              }
          };
          reader.readAsDataURL(file);
      }
      
      e.target.value = '';
      setActivePhotoContext(null);
  };

  const handleRemovePhoto = (sampleId: string, type: 'class' | 'defects', index: number, key?: string) => {
      if (isReadOnly) return;
      setSamples(prev => prev.map(sample => {
          if (sample.id === sampleId) {
              if (type === 'class' && key) {
                  const newClassPhotos = { ...sample.classPhotos };
                  newClassPhotos[key] = (newClassPhotos[key] || []).filter((_, i) => i !== index);
                  return { ...sample, classPhotos: newClassPhotos };
              } else if (type === 'defects') {
                  const newDefectPhotos = (sample.defectPhotos || []).filter((_, i) => i !== index);
                  return { ...sample, defectPhotos: newDefectPhotos };
              }
          }
          return sample;
      }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    // Validation
    const errors: string[] = [];
    samples.forEach((sample, idx) => {
        ['vsa', 'klas1', 'klas2', 'klas3'].forEach(key => {
            const count = Number(sample.counts[key as keyof typeof sample.counts]);
            if (count > 0) {
                const hasPhotos = sample.classPhotos?.[key] && sample.classPhotos[key].length > 0;
                if (!hasPhotos) {
                    errors.push(`Sample ${idx + 1}: Photos missing for ${key.toUpperCase()}`);
                }
            }
        });
    });

    if (errors.length > 0) {
        alert("Validation Error:\n" + errors.join("\n"));
        return;
    }

    onSaveClassEvaluation(run.id, samples);
  };

  const handleApproveClick = () => {
    if (onApprove && entryToView && currentUser) {
        onApprove(run.id, 'classEvaluations', entryToView.id, currentUser.username);
    }
  };

  const getTotalCount = (counts: ClassEvaluationSample['counts']): number => {
    return Object.values(counts).reduce<number>((sum, current) => {
        const val = typeof current === 'number' ? current : 0;
        return sum + val;
    }, 0);
  };
  
  const getTotalDefects = (sample: ClassEvaluationSample): number => {
      let total = 0;
      Object.values(sample.defects || {}).forEach(d => {
          total += (Number(d.klas1)||0) + (Number(d.klas2)||0) + (Number(d.klas3)||0);
      });
      sample.customDefects?.forEach(d => {
          total += (Number(d.counts.klas1)||0) + (Number(d.counts.klas2)||0) + (Number(d.counts.klas3)||0);
      });
      return total;
  };
  
  const isApproved = entryToView?.approvalDetails?.status === 'approved';

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
           {isReadOnly && (
             <div className="p-4 mb-6 text-center bg-yellow-900 border border-yellow-700 text-yellow-100 rounded-lg">
                <p className="font-semibold">Read-Only Mode: This form is for viewing or approval.</p>
             </div>
           )}
          <div className="border-b border-slate-700 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-green-400">Klas evaluering</h2>
            <p className="text-slate-400 mt-1">Class evaluation for Run: <span className="font-semibold text-orange-500">{run.runNumber}</span></p>
          </div>
          {!isReadOnly && (
            <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Add New Evaluation Sample</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                    <Button type="button" onClick={handleAddSample} className="w-full">Add Sample</Button>
                </div>
                </div>
            </div>
          )}
          
          {/* Hidden File Inputs */}
          <input 
              type="file" 
              ref={galleryInputRef} 
              onChange={handleFileSelected}
              accept="image/*" 
              multiple 
              className="hidden" 
              disabled={isReadOnly}
          />
          <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleFileSelected}
              accept="image/*"
              capture="environment"
              className="hidden" 
              disabled={isReadOnly}
          />
        </Card>

        <div className="mt-8 space-y-8">
          {samples.length === 0 ? (
            <Card>
              <p className="text-center text-slate-500 py-8">No class evaluation samples have been added yet.</p>
            </Card>
          ) : (
            samples.map(sample => {
              const totalCount = getTotalCount(sample.counts);
              const sampleSize = Number(sample.sampleSize) || 0;
              const totalDefects = getTotalDefects(sample);
              
              return (
                <Card key={sample.id}>
                  <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
                    <h3 className="text-xl font-semibold text-slate-200">
                      Sample: <span className="text-purple-400">{sample.size} / {sample.class}</span>
                    </h3>
                    {!isReadOnly && (
                        <button type="button" onClick={() => handleDeleteSample(sample.id)} className="text-red-400 hover:text-red-300 p-1 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                  </div>
                  <div className="mb-6">
                    <Label htmlFor={`sample-size-${sample.id}`}>Sample Grootte</Label>
                    <Input id={`sample-size-${sample.id}`} type="number" min="1" placeholder="Total fruit in sample" value={sample.sampleSize} onChange={(e) => handleSampleSizeChange(sample.id, e.target.value)} className="w-full max-w-xs" required disabled={isReadOnly} />
                  </div>
                  
                  {/* Counts and Photos Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(['vsa', 'klas1', 'klas2', 'klas3'] as const).map(key => {
                      const countValue = Number(sample.counts[key]) || 0;
                      const percentage = sampleSize > 0 ? (countValue / sampleSize) * 100 : 0;
                      const label = key.charAt(0).toUpperCase() + key.slice(1).replace('klas', 'Klas ');
                      const currentPhotos = sample.classPhotos?.[key] || [];

                      return (
                        <div key={key} className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                          <Label htmlFor={`count-${key}-${sample.id}`}>{label}</Label>
                          <div className="flex items-center space-x-2 mb-2">
                            <Input id={`count-${key}-${sample.id}`} type="number" min="0" placeholder="0" value={sample.counts[key]} onChange={(e) => handleCountChange(sample.id, key, e.target.value)} className="w-full text-center" disabled={isReadOnly} />
                            <span className="text-xs text-slate-500 w-12 text-right">({percentage.toFixed(1)}%)</span>
                          </div>
                          
                          {/* Photo controls for this class */}
                          <div className="flex flex-wrap gap-2 mt-2">
                              {currentPhotos.map((photo, pIdx) => (
                                  <div key={pIdx} className="relative group w-10 h-10">
                                      <img src={photo} className="w-full h-full object-cover rounded border border-slate-600" />
                                      {!isReadOnly && <button type="button" onClick={() => handleRemovePhoto(sample.id, 'class', pIdx, key)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">X</button>}
                                  </div>
                              ))}
                              {!isReadOnly && (
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => handleAddPhotoClick({ sampleId: sample.id, type: 'class', key }, 'camera')} className="bg-slate-600 p-1 rounded text-white hover:bg-orange-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                                    <button type="button" onClick={() => handleAddPhotoClick({ sampleId: sample.id, type: 'class', key }, 'gallery')} className="bg-slate-600 p-1 rounded text-white hover:bg-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                                </div>
                              )}
                          </div>
                          {countValue > 0 && currentPhotos.length === 0 && <p className="text-[10px] text-red-400 mt-1 font-bold">Photo required</p>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-slate-200 mb-4">Defekte gekry per klas</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-600 border border-slate-600 rounded-lg">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Defek</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Klas 1</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Klas 2</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Klas 3</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Totaal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-600">
                          {DEFECTS.map(defectName => {
                            const klas1 = Number(sample.defects?.[defectName]?.klas1 || 0);
                            const klas2 = Number(sample.defects?.[defectName]?.klas2 || 0);
                            const klas3 = Number(sample.defects?.[defectName]?.klas3 || 0);
                            const defectTotal = klas1 + klas2 + klas3;
                            const percentage = sampleSize > 0 ? (defectTotal / sampleSize) * 100 : 0;
                            return (
                              <tr key={defectName}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-200">{defectName}</td>
                                <td className="px-2 py-1"><Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={sample.defects?.[defectName]?.klas1 || ''} onChange={e => handleDefectChange(sample.id, defectName, 'klas1', e.target.value)} disabled={isReadOnly} /></td>
                                <td className="px-2 py-1"><Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={sample.defects?.[defectName]?.klas2 || ''} onChange={e => handleDefectChange(sample.id, defectName, 'klas2', e.target.value)} disabled={isReadOnly} /></td>
                                <td className="px-2 py-1"><Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={sample.defects?.[defectName]?.klas3 || ''} onChange={e => handleDefectChange(sample.id, defectName, 'klas3', e.target.value)} disabled={isReadOnly} /></td>
                                <td className="px-2 py-1 text-center align-middle text-sm">
                                  {defectTotal > 0 ? <span className="font-medium text-slate-200">{defectTotal} <span className="text-slate-500">({percentage.toFixed(1)}%)</span></span> : <span className="text-slate-600">0</span>}
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
                                 <td className="px-4 py-2 whitespace-nowrap text-sm font-medium"><Input type="text" value={defect.name} onChange={e => handleCustomDefectChange(sample.id, index, 'name', e.target.value)} className="w-full text-sm" placeholder="Custom defect..." disabled={isReadOnly} /></td>
                                 <td className="px-2 py-1"><Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={defect.counts.klas1} onChange={e => handleCustomDefectChange(sample.id, index, 'klas1', e.target.value)} disabled={!defect.name || isReadOnly} /></td>
                                 <td className="px-2 py-1"><Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={defect.counts.klas2} onChange={e => handleCustomDefectChange(sample.id, index, 'klas2', e.target.value)} disabled={!defect.name || isReadOnly} /></td>
                                 <td className="px-2 py-1"><Input type="number" min="0" className="w-24 mx-auto text-center" placeholder="0" value={defect.counts.klas3} onChange={e => handleCustomDefectChange(sample.id, index, 'klas3', e.target.value)} disabled={!defect.name || isReadOnly} /></td>
                                 <td className="px-2 py-1 text-center align-middle text-sm">
                                    {defectTotal > 0 ? <span className="font-medium text-slate-200">{defectTotal} <span className="text-slate-500">({percentage.toFixed(1)}%)</span></span> : <span className="text-slate-600">0</span>}
                                 </td>
                               </tr>
                             );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-700">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold text-slate-200">
                                    Totale defekte gekry:
                                </td>
                                <td className="px-4 py-3 text-center text-lg font-bold text-orange-500">
                                    {totalDefects}
                                </td>
                            </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Defect Photos Section */}
                  <div className="mt-6 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Defect Photos</h4>
                      <div className="flex flex-wrap gap-2">
                          {sample.defectPhotos?.map((photo, pIdx) => (
                              <div key={pIdx} className="relative group w-16 h-16">
                                  <img src={photo} className="w-full h-full object-cover rounded border border-slate-600" />
                                  {!isReadOnly && <button type="button" onClick={() => handleRemovePhoto(sample.id, 'defects', pIdx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">X</button>}
                              </div>
                          ))}
                          {!isReadOnly && (
                            <div className="flex flex-col gap-1 justify-center">
                                <button type="button" onClick={() => handleAddPhotoClick({ sampleId: sample.id, type: 'defects' }, 'camera')} className="bg-slate-700 text-xs px-2 py-1 rounded border border-slate-600 hover:bg-orange-600 text-white">Cam</button>
                                <button type="button" onClick={() => handleAddPhotoClick({ sampleId: sample.id, type: 'defects' }, 'gallery')} className="bg-slate-700 text-xs px-2 py-1 rounded border border-slate-600 hover:bg-blue-600 text-white">Gal</button>
                            </div>
                          )}
                      </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {samples.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-700 text-center">
             {isReadOnly ? (
                !isApproved && (
                    <Button type="button" onClick={handleApproveClick} className="w-full max-w-sm bg-green-600 hover:bg-green-700 focus:ring-green-500">
                        Approve Class Evaluations
                    </Button>
                )
             ) : (
                <Button type="submit" className="w-full max-w-sm">Save All Evaluations</Button>
             )}
          </div>
        )}
      </form>
    </div>
  );
};

export default ClassEvaluationPage;

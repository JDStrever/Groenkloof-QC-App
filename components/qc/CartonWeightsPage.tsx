

import React, { useState, useMemo, useRef } from 'react';
import { Run, CartonWeightSample, CommodityData, CartonConfig, Size, BoxType, CartonWeightsEntry, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { getSizesForCommodity, getMappedCommodity } from '../../utils/commodityHelper';

interface CartonWeightsPageProps {
  run: Run;
  onSaveCartonWeights: (runId: string, cartonWeights: CartonWeightSample[]) => void;
  commodityData: CommodityData;
  cartonConfig: CartonConfig;
  isReadOnly?: boolean;
  onApprove?: (runId: string, qcType: 'cartonWeights', entryId: string, username: string) => void;
  entryToView?: CartonWeightsEntry | null;
  currentUser: User | null;
}

const checkWeightInRange = (value: number | '', boxType: BoxType | undefined): boolean | null => {
    if (value === '' || value === null || value === undefined || !boxType) {
        return null; // No validation for empty input or if box type is not found
    }

    const numValue = Number(value);
    const min = boxType.minWeight !== '' ? Number(boxType.minWeight) : null;
    const max = boxType.maxWeight !== '' ? Number(boxType.maxWeight) : null;

    if (min === null && max === null) {
        return null; // No range defined
    }

    if (min !== null && numValue < min) {
        return false;
    }

    if (max !== null && numValue > max) {
        return false;
    }

    return true;
};


const CartonWeightsPage: React.FC<CartonWeightsPageProps> = ({ run, onSaveCartonWeights, commodityData, cartonConfig, isReadOnly = false, onApprove, entryToView, currentUser }) => {
  const [samples, setSamples] = useState<CartonWeightSample[]>(isReadOnly && entryToView ? entryToView.samples : []);
  const [newSampleSize, setNewSampleSize] = useState<string>('');
  const [newSampleClass, setNewSampleClass] = useState<string>('');
  const [newSampleBoxType, setNewSampleBoxType] = useState<string>('');

  // Photo handling
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSampleId, setActivePhotoSampleId] = useState<string | null>(null);

  const sizes: Size[] = useMemo(() => getSizesForCommodity(run.commodity, commodityData), [run.commodity, commodityData]);
  const mappedCommodity = useMemo(() => getMappedCommodity(run.commodity), [run.commodity]);
  const boxTypes: BoxType[] = useMemo(() => cartonConfig.boxTypes[mappedCommodity] || [], [mappedCommodity, cartonConfig.boxTypes]);
  const classes: string[] = useMemo(() => cartonConfig.classes || [], [cartonConfig.classes]);

  const handleAddSample = () => {
    if (!newSampleSize || !newSampleClass || !newSampleBoxType) {
      alert('Please select a size, class, and box type.');
      return;
    }
    const newSample: CartonWeightSample = {
      id: `sample-${Date.now()}`,
      size: newSampleSize,
      class: newSampleClass,
      boxType: newSampleBoxType,
      weights: Array(10).fill(''),
    };
    setSamples(prev => [...prev, newSample]);
    // Reset form
    setNewSampleSize('');
    setNewSampleClass('');
    setNewSampleBoxType('');
  };

  const handleWeightChange = (sampleId: string, index: number, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    if (isNaN(numValue as number) && value !== '') return;

    setSamples(prev => prev.map(sample => {
      if (sample.id === sampleId) {
        const newWeights = [...sample.weights];
        newWeights[index] = numValue;
        return { ...sample, weights: newWeights };
      }
      return sample;
    }));
  };

  const handleDeleteSample = (sampleId: string) => {
    if (window.confirm('Are you sure you want to delete this sample?')) {
      setSamples(prev => prev.filter(sample => sample.id !== sampleId));
    }
  };

  // --- Photo Logic ---

  const handleAddPhotoClick = (sampleId: string, source: 'camera' | 'gallery') => {
      if (isReadOnly) return;
      setActivePhotoSampleId(sampleId);
      if (source === 'camera') {
          cameraInputRef.current?.click();
      } else {
          galleryInputRef.current?.click();
      }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activePhotoSampleId) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
          if (loadEvent.target?.result) {
              const base64Data = loadEvent.target.result as string;
              setSamples(prev => prev.map(sample => {
                  if (sample.id === activePhotoSampleId) {
                      return { ...sample, photo: base64Data };
                  }
                  return sample;
              }));
          }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      setActivePhotoSampleId(null);
  };

  const handleRemovePhoto = (sampleId: string) => {
      if (isReadOnly) return;
      setSamples(prev => prev.map(sample => {
          if (sample.id === sampleId) {
              const newSample = { ...sample };
              delete newSample.photo;
              return newSample;
          }
          return sample;
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadOnly) {
        onSaveCartonWeights(run.id, samples);
    }
  };

  const handleApproveClick = () => {
    if (onApprove && entryToView && currentUser) {
        onApprove(run.id, 'cartonWeights', entryToView.id, currentUser.username);
    }
  };
  
  const averageWeight = (weights: (number | '')[]) => {
    const validWeights = weights.map(Number).filter(w => !isNaN(w) && w > 0);
    if (validWeights.length === 0) return 0;
    const sum = validWeights.reduce((a, b) => a + b, 0);
    return (sum / validWeights.length).toFixed(2);
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
            <h2 className="text-3xl font-bold text-green-400">Karton gewigte</h2>
            <p className="text-slate-400 mt-1">Carton weights for Run: <span className="font-semibold text-orange-500">{run.runNumber}</span></p>
          </div>
          
          {!isReadOnly && (
            <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Add New Weight Sample</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <Label htmlFor="size-select">Size</Label>
                    <select id="size-select" value={newSampleSize} onChange={e => setNewSampleSize(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                    <option value="">Select Size</option>
                    {sizes.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <Label htmlFor="class-select">Class</Label>
                    <select id="class-select" value={newSampleClass} onChange={e => setNewSampleClass(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <Label htmlFor="box-type-select">Box Type</Label>
                    <select id="box-type-select" value={newSampleBoxType} onChange={e => setNewSampleBoxType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                    <option value="">Select Box Type</option>
                    {boxTypes.map(bt => <option key={bt.name} value={bt.name}>{bt.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
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
          {samples.length === 0 && (
            <Card>
              <p className="text-center text-slate-500 py-8">No carton weight samples have been added yet.</p>
            </Card>
          )}
          {samples.map(sample => {
            const sampleBoxTypeConfig = boxTypes.find(bt => bt.name === sample.boxType);
            
            return (
              <Card key={sample.id}>
                <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-200">
                      Sample: <span className="text-orange-500">{sample.size} / {sample.class} / {sample.boxType}</span>
                    </h3>
                    <div className="text-sm text-slate-400 flex items-center space-x-2">
                      <span>Average Weight: {averageWeight(sample.weights)} kg</span>
                       {sampleBoxTypeConfig && (sampleBoxTypeConfig.minWeight || sampleBoxTypeConfig.maxWeight) && (
                           <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full border border-slate-600">
                               (Range: {sampleBoxTypeConfig.minWeight || 'N/A'} - {sampleBoxTypeConfig.maxWeight || 'N/A'} kg)
                           </span>
                       )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button type="button" onClick={() => handleDeleteSample(sample.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
                  {sample.weights.map((weight, index) => {
                    const isInRange = checkWeightInRange(weight, sampleBoxTypeConfig);
                    let textColorClass = '';
                    if (isInRange === true) {
                        textColorClass = 'text-green-500 font-bold';
                    } else if (isInRange === false) {
                        textColorClass = 'text-red-500 font-bold';
                    }

                    return (
                        <div key={index}>
                        <Label htmlFor={`weight-${sample.id}-${index}`}>Weight {index + 1} (kg)</Label>
                        <Input
                            id={`weight-${sample.id}-${index}`}
                            type="number"
                            step="0.01"
                            placeholder="kg"
                            value={weight}
                            onChange={(e) => handleWeightChange(sample.id, index, e.target.value)}
                            className={`w-full text-center ${textColorClass}`}
                            disabled={isReadOnly}
                        />
                        </div>
                    );
                  })}
                </div>

                {/* Photo Section */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Sample Photo</h4>
                    {sample.photo ? (
                        <div className="relative group w-32 h-32">
                            <img src={sample.photo} alt="Sample weight" className="w-full h-full object-cover rounded-lg border border-slate-600 shadow-md" />
                            {!isReadOnly && (
                                <button 
                                    type="button" 
                                    onClick={() => handleRemovePhoto(sample.id)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => handleAddPhotoClick(sample.id, 'camera')}
                                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-orange-600 text-slate-300 hover:text-white px-4 py-2 rounded transition-colors disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 border border-slate-600"
                                disabled={isReadOnly}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-medium">Camera</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleAddPhotoClick(sample.id, 'gallery')}
                                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white px-4 py-2 rounded transition-colors disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 border border-slate-600"
                                disabled={isReadOnly}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Gallery</span>
                            </button>
                        </div>
                    )}
                </div>
              </Card>
            );
          })}
        </div>

        {samples.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-700 text-center">
                {isReadOnly ? (
                    !isApproved && (
                        <Button type="button" onClick={handleApproveClick} className="w-full max-w-sm bg-green-600 hover:bg-green-700 focus:ring-green-500">
                            Approve Carton Weights
                        </Button>
                    )
                ) : (
                    <Button type="submit" className="w-full max-w-sm">
                        Save All Carton Weights
                    </Button>
                )}
            </div>
        )}
      </form>
    </div>
  );
};

export default CartonWeightsPage;

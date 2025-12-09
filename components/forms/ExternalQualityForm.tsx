
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Delivery, ExternalQualityData, DefectsData, InternalQualityData, Size, CommodityData } from '../../types';
import { DEFECTS } from '../../constants/commoditySizes';
import { getSizesForCommodity } from '../../utils/commodityHelper';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';

export interface CustomDefect {
    name: string;
    count: number | '';
}

interface ExternalQualityFormProps {
    delivery: Delivery;
    onSave: () => void;
    commodityData: CommodityData;
    qualityData: ExternalQualityData;
    defectsData: DefectsData;
    customDefects: CustomDefect[];
    internalQualityData: InternalQualityData;
    sizeCounts: { [sizeCode: string]: number | '' };
    externalQualityPhotos: { [className: string]: string[] };
    defectsPhotos: string[];
    setQualityData: React.Dispatch<React.SetStateAction<ExternalQualityData>>;
    setDefectsData: React.Dispatch<React.SetStateAction<DefectsData>>;
    setCustomDefects: React.Dispatch<React.SetStateAction<CustomDefect[]>>;
    setInternalQualityData: React.Dispatch<React.SetStateAction<InternalQualityData>>;
    setSizeCounts: React.Dispatch<React.SetStateAction<{ [sizeCode: string]: number | '' }>>;
    setExternalQualityPhotos: React.Dispatch<React.SetStateAction<{ [className: string]: string[] }>>;
    setDefectsPhotos: React.Dispatch<React.SetStateAction<string[]>>;
    readOnly?: boolean;
}

export const QUALITY_CLASSES = ['VSA', 'Klas 1', 'Klas 2', 'Klas 3', 'Klas 4'];
const SAMPLE_TARGET = 50;
export const CUSTOM_DEFECT_COUNT = 5;

export const initialInternalQuality: InternalQualityData = {
    totalMass: '', peelMass: '', juiceMass: '', juicePercentage: '',
    brix: '', titration: '', acid: '', relation: '', seeds: '',
    fruitsUsedForSeeds: '',
};

const ExternalQualityForm: React.FC<ExternalQualityFormProps> = ({ 
    delivery, onSave, commodityData,
    qualityData, defectsData, customDefects, internalQualityData, sizeCounts,
    externalQualityPhotos, defectsPhotos,
    setQualityData, setDefectsData, setCustomDefects, setInternalQualityData, setSizeCounts,
    setExternalQualityPhotos, setDefectsPhotos,
    readOnly = false
}) => {
    const [sizes, setSizes] = useState<Size[]>([]);
    
    // Photo handling state
    const [activePhotoContext, setActivePhotoContext] = useState<{ type: 'external' | 'defects', className?: string } | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSizes(getSizesForCommodity(delivery.commodity, commodityData));
    }, [delivery.commodity, commodityData]);

    const handleQualityChange = (className: string, value: string) => {
        if (readOnly) return;
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setQualityData(prev => ({
            ...prev,
            [className]: numValue,
        }));
    };
    
    const handleDefectChange = (defectName: string, value: string) => {
        if (readOnly) return;
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setDefectsData(prev => ({
            ...prev,
            [defectName]: numValue,
        }));
    };

    const handleCustomDefectChange = (index: number, field: 'name' | 'count', value: string) => {
        if (readOnly) return;
        const newCustomDefects = [...customDefects];
        const defectToUpdate = { ...newCustomDefects[index] };

        if (field === 'name') {
            defectToUpdate.name = value;
        } else { // It's count
            const numValue = value === '' ? '' : parseInt(value, 10);
            if (typeof numValue === 'number' && isNaN(numValue)) return;
            defectToUpdate.count = numValue;
        }
        
        newCustomDefects[index] = defectToUpdate;
        setCustomDefects(newCustomDefects);
    };

    const handleInternalQualityChange = (field: keyof InternalQualityData, value: string) => {
        if (readOnly) return;
        const numValue = value === '' ? '' : parseFloat(value);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setInternalQualityData(prev => ({
            ...prev,
            [field]: numValue,
        }));
    };

    const handleSizeCountChange = (sizeCode: string, value: string) => {
        if (readOnly) return;
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setSizeCounts(prev => ({
            ...prev,
            [sizeCode]: numValue
        }));
    };

    const totalFruitCount = useMemo(() => {
        return Object.values(qualityData)
            .reduce<number>((total, count) => total + (Number(count) || 0), 0);
    }, [qualityData]);
    
    const totalAantal = useMemo(() => {
        return Object.values(sizeCounts).reduce<number>((sum, count) => sum + (Number(count) || 0), 0);
    }, [sizeCounts]);

    // --- Photo Logic ---

    const handleAddPhotoClick = (context: { type: 'external' | 'defects', className?: string }, source: 'camera' | 'gallery') => {
        if (readOnly) return;
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
                const target = loadEvent.target;
                if (target && target.result) {
                    const base64Data = target.result as string;
                    if (activePhotoContext.type === 'external' && activePhotoContext.className) {
                        setExternalQualityPhotos(prev => ({
                            ...prev,
                            [activePhotoContext.className!]: [...(prev[activePhotoContext.className!] || []), base64Data]
                        }));
                    } else if (activePhotoContext.type === 'defects') {
                        setDefectsPhotos(prev => [...prev, base64Data]);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset input
    };

    const handleRemovePhoto = (type: 'external' | 'defects', index: number, className?: string) => {
        if (readOnly) return;
        if (type === 'external' && className) {
            setExternalQualityPhotos(prev => ({
                ...prev,
                [className]: prev[className].filter((_, i) => i !== index)
            }));
        } else if (type === 'defects') {
            setDefectsPhotos(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) {
            onSave();
            return;
        }

        // Validation: Require photos for classes with fruit > 0
        const missingPhotos: string[] = [];
        QUALITY_CLASSES.forEach(className => {
            const count = Number(qualityData[className]);
            if (count > 0) {
                const photos = externalQualityPhotos[className];
                if (!photos || photos.length === 0) {
                    missingPhotos.push(className);
                }
            }
        });

        if (missingPhotos.length > 0) {
            alert(`Validation Error: Please add at least one photo for the following classes where fruits were found: ${missingPhotos.join(', ')}`);
            return;
        }

        onSave();
    };

    if (sizes.length === 0) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h3 className="text-xl font-semibold text-slate-300">Unsupported Commodity</h3>
                    <p className="mt-2 text-slate-400">
                        No size information is available for "{delivery.commodity}". Please add it in the admin panel.
                    </p>
                </div>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Hidden File Inputs */}
            <input 
                type="file" 
                ref={galleryInputRef} 
                onChange={handleFileSelected}
                accept="image/*" 
                multiple 
                className="hidden" 
                disabled={readOnly}
            />
            <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileSelected}
                accept="image/*"
                capture="environment"
                className="hidden" 
                disabled={readOnly}
            />

            {/* Aantal Summary Section */}
            <Card className="mb-8">
                <h3 className="text-2xl font-bold text-green-400 mb-1">Aantal</h3>
                <p className="text-slate-400 mb-6">Voer die aantal vrugte per grootte in.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-600 border border-slate-600 rounded-lg">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Grootte</th>
                                {sizes.map(size => <th key={size.code} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">{size.code}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-600">
                            <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">Aantal</td>
                                {sizes.map(size => (
                                    <td key={size.code} className="px-2 py-2 whitespace-nowrap text-sm text-slate-400 text-center">
                                         <Input 
                                            type="number" 
                                            min="0"
                                            value={sizeCounts[size.code] || ''}
                                            onChange={(e) => handleSizeCountChange(size.code, e.target.value)}
                                            className="w-20 text-center !text-black font-semibold px-1 py-2 !bg-white"
                                            placeholder="0"
                                            disabled={readOnly}
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">%</td>
                                {sizes.map(size => {
                                    const count = Number(sizeCounts[size.code]) || 0;
                                    const percentage = totalAantal > 0 ? ((count / totalAantal) * 100).toFixed(1) : '0.0';
                                    return (
                                        <td key={size.code} className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-slate-300">
                                            {percentage}%
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                        <tfoot className="bg-slate-700">
                            <tr>
                                <td colSpan={sizes.length + 1} className="px-4 py-3 text-right">
                                    <p className="text-lg font-bold text-green-500">
                                        Totaal: {totalAantal}
                                    </p>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            <Card>
                <h3 className="text-2xl font-bold text-green-400 mb-1">Eksterne kwaliteit</h3>
                 <p className="text-slate-400 mb-6">Voer die aantal vrugte vir elke klas in. <span className="text-orange-500 font-semibold">Photos are required for any class with fruit.</span> (Teiken: {SAMPLE_TARGET} vrugte).</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-600 border border-slate-600 rounded-lg">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/4">Klas</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider w-1/4">Aantal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/2">Foto's</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-600">
                            {QUALITY_CLASSES.map(className => {
                                const countValue = Number(qualityData[className]) || 0;
                                const percentageText = totalFruitCount > 0 ? ((countValue / totalFruitCount) * 100).toFixed(1) : '0.0';
                                const classPhotos = externalQualityPhotos[className] || [];
                                
                                return (
                                    <tr key={className}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">{className}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-400 text-center align-top">
                                            <div className="flex flex-col items-center justify-center space-y-1">
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    value={qualityData[className] || ''}
                                                    onChange={(e) => handleQualityChange(className, e.target.value)}
                                                    className="w-24 text-center !text-black font-semibold px-2 py-2 !bg-white"
                                                    placeholder="0"
                                                    disabled={readOnly}
                                                />
                                                <span className="text-xs text-slate-500">
                                                    ({percentageText}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-slate-400">
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {classPhotos.map((photo, index) => (
                                                    <div key={index} className="relative group w-12 h-12">
                                                        <img src={photo} alt={`${className} ${index}`} className="w-full h-full object-cover rounded border border-slate-600 cursor-pointer hover:scale-150 transition-transform z-10 hover:z-20 hover:absolute" />
                                                        {!readOnly && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemovePhoto('external', index, className)}
                                                                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 z-30"
                                                            >
                                                                X
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {!readOnly && (
                                                    <div className="flex flex-col gap-1">
                                                         <button 
                                                            type="button"
                                                            onClick={() => handleAddPhotoClick({ type: 'external', className }, 'camera')}
                                                            className="text-xs bg-slate-700 hover:bg-orange-600 text-white px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            Cam
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleAddPhotoClick({ type: 'external', className }, 'gallery')}
                                                            className="text-xs bg-slate-700 hover:bg-blue-600 text-white px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            Gal
                                                        </button>
                                                    </div>
                                                )}
                                                {countValue > 0 && classPhotos.length === 0 && (
                                                    <span className="text-red-500 text-xs font-bold animate-pulse ml-2">Photo Required</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-slate-700">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right">
                                    <p className={`text-lg font-bold ${totalFruitCount === SAMPLE_TARGET ? 'text-green-500' : 'text-slate-200'}`}>
                                        Totaal: {totalFruitCount} / {SAMPLE_TARGET}
                                    </p>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
            
            <div className="mt-8">
                <Card>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-green-400 mb-1">Defekte gekry</h3>
                            <p className="text-slate-400">Voer die aantal vrugte per defek in.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Defects Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-600 border border-slate-600 rounded-lg">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/2">Defek</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider w-1/2">Aantal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-600">
                                    {DEFECTS.map(defectName => (
                                        <tr key={defectName}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">{defectName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-400 text-center">
                                                <div className="flex justify-center">
                                                    <Input 
                                                        type="number"
                                                        min="0"
                                                        value={defectsData[defectName] || ''}
                                                        onChange={(e) => handleDefectChange(defectName, e.target.value)}
                                                        className="w-24 text-center !text-black font-semibold px-1 py-2 !bg-white"
                                                        placeholder="0"
                                                        disabled={readOnly}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {customDefects.map((defect, index) => (
                                        <tr key={`custom-${index}`}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">
                                                <Input 
                                                    type="text"
                                                    value={defect.name}
                                                    onChange={(e) => handleCustomDefectChange(index, 'name', e.target.value)}
                                                    className="w-full text-sm !text-black !bg-white"
                                                    placeholder="Custom defect..."
                                                    disabled={readOnly}
                                                />
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-400 text-center">
                                                <div className="flex justify-center">
                                                    <Input 
                                                        type="number"
                                                        min="0"
                                                        value={defect.count}
                                                        onChange={(e) => handleCustomDefectChange(index, 'count', e.target.value)}
                                                        className="w-24 text-center !text-black font-semibold px-1 py-2 !bg-white"
                                                        placeholder="0"
                                                        disabled={!defect.name || readOnly}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Defect Photos Section */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                             <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Defect Photos
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {defectsPhotos.map((photo, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img src={photo} alt={`Defect photo ${index + 1}`} className="w-full h-full object-cover rounded shadow border border-slate-600" />
                                        {!readOnly && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePhoto('defects', index)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!readOnly && (
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleAddPhotoClick({ type: 'defects' }, 'camera')}
                                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:border-orange-500 hover:text-orange-500 transition-colors p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs">Camera</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleAddPhotoClick({ type: 'defects' }, 'gallery')}
                                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:border-blue-500 hover:text-blue-500 transition-colors p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-xs">Gallery</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <h3 className="text-2xl font-bold text-green-400 mb-1">Interne Kwaliteit</h3>
                    <p className="text-slate-400 mb-6">Voer die interne kwaliteit toetsresultate vir die monster in.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <Label htmlFor="totalMass">Total mass (g)</Label>
                            <Input id="totalMass" name="totalMass" type="number" step="0.1" value={internalQualityData.totalMass} onChange={(e) => handleInternalQualityChange('totalMass', e.target.value)} placeholder="0.0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                        <div>
                            <Label htmlFor="peelMass">Peel mass (g)</Label>
                            <Input id="peelMass" name="peelMass" type="number" step="0.1" value={internalQualityData.peelMass} onChange={(e) => handleInternalQualityChange('peelMass', e.target.value)} placeholder="0.0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                        <div>
                            <Label htmlFor="juiceMass">Juice mass (g)</Label>
                            <Input id="juiceMass" name="juiceMass" type="number" step="0.1" value={internalQualityData.juiceMass} onChange={(e) => handleInternalQualityChange('juiceMass', e.target.value)} placeholder="0.0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                        <div>
                            <Label htmlFor="juicePercentage">Juice %</Label>
                            <Input id="juicePercentage" name="juicePercentage" type="number" value={internalQualityData.juicePercentage} readOnly placeholder="0.0" className="bg-slate-800 cursor-not-allowed text-slate-400 border-slate-600" />
                        </div>
                        <div>
                            <Label htmlFor="brix">Brix</Label>
                            <Input id="brix" name="brix" type="number" step="0.1" value={internalQualityData.brix} onChange={(e) => handleInternalQualityChange('brix', e.target.value)} placeholder="0.0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                        <div>
                            <Label htmlFor="titration">Titration</Label>
                            <Input id="titration" name="titration" type="number" step="0.1" value={internalQualityData.titration} onChange={(e) => handleInternalQualityChange('titration', e.target.value)} placeholder="0.0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                        <div>
                            <Label htmlFor="acid">Acid</Label>
                            <Input id="acid" name="acid" type="number" value={internalQualityData.acid} readOnly placeholder="0.00" className="bg-slate-800 cursor-not-allowed text-slate-400 border-slate-600" />
                        </div>
                        <div>
                            <Label htmlFor="relation">Relation</Label>
                            <Input id="relation" name="relation" type="number" value={internalQualityData.relation} readOnly placeholder="0.0" className="bg-slate-800 cursor-not-allowed text-slate-400 border-slate-600" />
                        </div>
                        <div>
                            <Label htmlFor="seeds">Seeds</Label>
                            <Input id="seeds" name="seeds" type="number" min="0" value={internalQualityData.seeds} onChange={(e) => handleInternalQualityChange('seeds', e.target.value)} placeholder="0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                        <div>
                            <Label htmlFor="fruitsUsedForSeeds"># Fruits used for Seeds</Label>
                            <Input id="fruitsUsedForSeeds" name="fruitsUsedForSeeds" type="number" min="0" value={internalQualityData.fruitsUsedForSeeds ?? ''} onChange={(e) => handleInternalQualityChange('fruitsUsedForSeeds', e.target.value)} placeholder="0" className="!text-black !bg-white" disabled={readOnly} />
                        </div>
                    </div>
                </Card>
            </div>

            {!readOnly && (
                <div className="mt-8 text-center">
                    <Button type="submit" className="w-full max-w-sm">Save Inspection</Button>
                </div>
            )}
        </form>
    );
};

export default ExternalQualityForm;

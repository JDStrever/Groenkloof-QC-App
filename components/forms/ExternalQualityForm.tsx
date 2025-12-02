
import React, { useState, useMemo, useEffect } from 'react';
import { Delivery, ExternalQualityData, DefectsData, InternalQualityData, Size, CommodityData } from '../../types';
import { DEFECTS } from '../../constants/commoditySizes';
import { getSizesForCommodity } from '../../utils/commodityHelper';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';

export interface CustomDefect {
    name: string;
    counts: { [sizeCode: string]: number | '' };
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
    photos: string[];
    setQualityData: React.Dispatch<React.SetStateAction<ExternalQualityData>>;
    setDefectsData: React.Dispatch<React.SetStateAction<DefectsData>>;
    setCustomDefects: React.Dispatch<React.SetStateAction<CustomDefect[]>>;
    setInternalQualityData: React.Dispatch<React.SetStateAction<InternalQualityData>>;
    setSizeCounts: React.Dispatch<React.SetStateAction<{ [sizeCode: string]: number | '' }>>;
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
}

export const QUALITY_CLASSES = ['VSA', 'Klas 1', 'Klas 2', 'Klas 3', 'Klas 4'];
const SAMPLE_TARGET = 50;
export const CUSTOM_DEFECT_COUNT = 5;

export const initialInternalQuality: InternalQualityData = {
    totalMass: '', peelMass: '', juiceMass: '', juicePercentage: '',
    brix: '', titration: '', acid: '', relation: '', seeds: '',
};

const ExternalQualityForm: React.FC<ExternalQualityFormProps> = ({ 
    delivery, onSave, commodityData,
    qualityData, defectsData, customDefects, internalQualityData, sizeCounts, photos,
    setQualityData, setDefectsData, setCustomDefects, setInternalQualityData, setSizeCounts, setPhotos
}) => {
    const [sizes, setSizes] = useState<Size[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSizes(getSizesForCommodity(delivery.commodity, commodityData));
    }, [delivery.commodity, commodityData]);

    const handleQualityChange = (className: string, sizeCode: string, value: string) => {
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setQualityData(prev => ({
            ...prev,
            [className]: {
                ...prev[className],
                [sizeCode]: numValue,
            },
        }));
    };
    
    const handleDefectChange = (defectName: string, sizeCode: string, value: string) => {
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setDefectsData(prev => ({
            ...prev,
            [defectName]: {
                ...prev[defectName],
                [sizeCode]: numValue,
            },
        }));
    };

    const handleCustomDefectChange = (index: number, field: 'name' | string, value: string) => {
        const newCustomDefects = [...customDefects];
        const defectToUpdate = { ...newCustomDefects[index] };

        if (field === 'name') {
            defectToUpdate.name = value;
        } else { // It's a size code
            const numValue = value === '' ? '' : parseInt(value, 10);
            if (typeof numValue === 'number' && isNaN(numValue)) return;
            defectToUpdate.counts = { ...defectToUpdate.counts, [field]: numValue };
        }
        
        newCustomDefects[index] = defectToUpdate;
        setCustomDefects(newCustomDefects);
    };

    const handleInternalQualityChange = (field: keyof InternalQualityData, value: string) => {
        const numValue = value === '' ? '' : parseFloat(value);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setInternalQualityData(prev => ({
            ...prev,
            [field]: numValue,
        }));
    };

    const handleSizeCountChange = (sizeCode: string, value: string) => {
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (typeof numValue === 'number' && isNaN(numValue)) return;

        setSizeCounts(prev => ({
            ...prev,
            [sizeCode]: numValue
        }));
    };

    const totalFruitCount = useMemo(() => {
        return Object.values(qualityData)
            .flatMap(sizeCounts => Object.values(sizeCounts))
            .reduce<number>((total, count) => total + (Number(count) || 0), 0);
    }, [qualityData]);
    
    // Calculate totals for "Aantal" inputs
    const totalAantal = useMemo(() => {
        return Object.values(sizeCounts).reduce<number>((sum, count) => sum + (Number(count) || 0), 0);
    }, [sizeCounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave();
    };

    const handleAddPhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const target = loadEvent.target;
                if (target && target.result) {
                    setPhotos(prevPhotos => [...prevPhotos, target.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleRemovePhoto = (indexToRemove: number) => {
        setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
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
            {/* Aantal Summary Section (Now Manual) */}
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
                 <p className="text-slate-400 mb-6">Voer die aantal vrugte vir elke grootte en klas in (Teiken: {SAMPLE_TARGET} vrugte).</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-600 border border-slate-600 rounded-lg">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Klas / Grootte</th>
                                {sizes.map(size => <th key={size.code} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">{size.code}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-600">
                            {QUALITY_CLASSES.map(className => (
                                <tr key={className}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">{className}</td>
                                    {sizes.map(size => {
                                        const countValue = Number(qualityData[className]?.[size.code]) || 0;
                                        const percentageText = totalFruitCount > 0 ? ((countValue / totalFruitCount) * 100).toFixed(1) : '0.0';
                                        return (
                                            <td key={size.code} className="px-2 py-2 whitespace-nowrap text-sm text-slate-400">
                                                <div className="flex items-center space-x-2">
                                                    <Input 
                                                        type="number" 
                                                        min="0"
                                                        value={qualityData[className]?.[size.code] || ''}
                                                        onChange={(e) => handleQualityChange(className, size.code, e.target.value)}
                                                        className="w-20 text-center !text-black font-semibold px-1 py-2 !bg-white"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-xs text-slate-500 w-10 text-right">
                                                        ({percentageText}%)
                                                    </span>
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-700">
                            <tr>
                                <td colSpan={sizes.length + 1} className="px-4 py-3 text-right">
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
                    <h3 className="text-2xl font-bold text-green-400 mb-1">Defekte gekry</h3>
                    <p className="text-slate-400 mb-6">Voer die aantal vrugte per defek en grootte in.</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-600 border border-slate-600 rounded-lg">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Defek / Grootte</th>
                                    {sizes.map(size => <th key={size.code} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">{size.code}</th>)}
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-600">
                                {DEFECTS.map(defectName => (
                                    <tr key={defectName}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">{defectName}</td>
                                        {sizes.map(size => (
                                            <td key={size.code} className="px-2 py-2 whitespace-nowrap text-sm text-slate-400">
                                                <Input 
                                                    type="number"
                                                    min="0"
                                                    value={defectsData[defectName]?.[size.code] || ''}
                                                    onChange={(e) => handleDefectChange(defectName, size.code, e.target.value)}
                                                    className="w-20 text-center !text-black font-semibold px-1 py-2 !bg-white"
                                                    placeholder="0"
                                                />
                                            </td>
                                        ))}
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
                                            />
                                        </td>
                                        {sizes.map(size => (
                                            <td key={size.code} className="px-2 py-2 whitespace-nowrap text-sm text-slate-400">
                                                <Input 
                                                    type="number"
                                                    min="0"
                                                    value={defect.counts[size.code] || ''}
                                                    onChange={(e) => handleCustomDefectChange(index, size.code, e.target.value)}
                                                    className="w-20 text-center !text-black font-semibold px-1 py-2 !bg-white"
                                                    placeholder="0"
                                                    disabled={!defect.name}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                            <Input id="totalMass" name="totalMass" type="number" step="0.1" value={internalQualityData.totalMass} onChange={(e) => handleInternalQualityChange('totalMass', e.target.value)} placeholder="0.0" className="!text-black !bg-white" />
                        </div>
                        <div>
                            <Label htmlFor="peelMass">Peel mass (g)</Label>
                            <Input id="peelMass" name="peelMass" type="number" step="0.1" value={internalQualityData.peelMass} onChange={(e) => handleInternalQualityChange('peelMass', e.target.value)} placeholder="0.0" className="!text-black !bg-white" />
                        </div>
                        <div>
                            <Label htmlFor="juiceMass">Juice mass (g)</Label>
                            <Input id="juiceMass" name="juiceMass" type="number" step="0.1" value={internalQualityData.juiceMass} onChange={(e) => handleInternalQualityChange('juiceMass', e.target.value)} placeholder="0.0" className="!text-black !bg-white" />
                        </div>
                        <div>
                            <Label htmlFor="juicePercentage">Juice %</Label>
                            <Input id="juicePercentage" name="juicePercentage" type="number" value={internalQualityData.juicePercentage} readOnly placeholder="0.0" className="bg-slate-800 cursor-not-allowed text-slate-400 border-slate-600" />
                        </div>
                        <div>
                            <Label htmlFor="brix">Brix</Label>
                            <Input id="brix" name="brix" type="number" step="0.1" value={internalQualityData.brix} onChange={(e) => handleInternalQualityChange('brix', e.target.value)} placeholder="0.0" className="!text-black !bg-white" />
                        </div>
                        <div>
                            <Label htmlFor="titration">Titration</Label>
                            <Input id="titration" name="titration" type="number" step="0.1" value={internalQualityData.titration} onChange={(e) => handleInternalQualityChange('titration', e.target.value)} placeholder="0.0" className="!text-black !bg-white" />
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
                            <Input id="seeds" name="seeds" type="number" min="0" value={internalQualityData.seeds} onChange={(e) => handleInternalQualityChange('seeds', e.target.value)} placeholder="0" className="!text-black !bg-white" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-green-400 mb-1">Foto's</h3>
                            <p className="text-slate-400">Add photos for the inspection record.</p>
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelected}
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img src={photo} alt={`Inspection photo ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemovePhoto(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove photo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button"
                            onClick={handleAddPhotoClick}
                            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 hover:border-orange-500 hover:text-orange-500 transition-colors aspect-square"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Add Photo</span>
                        </button>
                    </div>
                </Card>
            </div>

            <div className="mt-8 text-center">
                <Button type="submit" className="w-full max-w-sm">Save Inspection</Button>
            </div>
        </form>
    );
};

export default ExternalQualityForm;

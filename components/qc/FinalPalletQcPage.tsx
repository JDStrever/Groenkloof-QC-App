
import React, { useState, useRef, useMemo } from 'react';
import { Run, FinalPalletQcData, CommodityData, CartonConfig, Size, BoxType, FinalPalletQcEntry, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Label from '../ui/Label';
import { getSizesForCommodity, getMappedCommodity } from '../../utils/commodityHelper';

// Define photo types and labels
type PhotoType = 'base' | 'id' | 'boxLabel' | 'wholePallet';
const PHOTO_TYPES: { key: PhotoType, label: string }[] = [
    { key: 'base', label: 'Pallet blok' },
    { key: 'id', label: 'Pallet ID' },
    { key: 'boxLabel', label: 'Boks Label' },
    { key: 'wholePallet', label: 'Volledige pallet' },
];

interface FinalPalletQcPageProps {
  run: Run;
  onSave: (runId: string, data: FinalPalletQcData[]) => void;
  commodityData: CommodityData;
  cartonConfig: CartonConfig;
  isReadOnly?: boolean;
  onApprove?: (runId: string, qcType: 'finalPalletQc', entryId: string, username: string) => void;
  entryToView?: FinalPalletQcEntry | null;
  currentUser: User | null;
}

const FinalPalletQcPage: React.FC<FinalPalletQcPageProps> = ({ run, onSave, commodityData, cartonConfig, isReadOnly = false, onApprove, entryToView, currentUser }) => {
    const [pallets, setPallets] = useState<FinalPalletQcData[]>(isReadOnly && entryToView ? entryToView.pallets : []);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [photoTarget, setPhotoTarget] = useState<{ palletId: string; photoType: PhotoType } | null>(null);

    const sizes: Size[] = useMemo(() => getSizesForCommodity(run.commodity, commodityData), [run.commodity, commodityData]);
    const mappedCommodity = useMemo(() => getMappedCommodity(run.commodity), [run.commodity]);
    const boxTypes: BoxType[] = useMemo(() => cartonConfig.boxTypes[mappedCommodity] || [], [mappedCommodity, cartonConfig.boxTypes]);
    const classes: string[] = useMemo(() => cartonConfig.classes || [], [cartonConfig.classes]);

    const handleAddPallet = () => {
        const newPallet: FinalPalletQcData = {
            id: `pallet-${Date.now()}`,
            size: '',
            class: '',
            boxType: '',
            photos: {
                base: null,
                id: null,
                boxLabel: null,
                wholePallet: null,
            },
        };
        setPallets(prev => [...prev, newPallet]);
    };

    const handlePalletDetailChange = (palletInternalId: string, field: 'size' | 'class' | 'boxType', value: string) => {
        setPallets(prev => prev.map(p => 
            p.id === palletInternalId ? { ...p, [field]: value } : p
        ));
    };

    const handleAddPhotoClick = (palletInternalId: string, photoType: PhotoType, source: 'camera' | 'gallery') => {
        if (isReadOnly) return;
        setPhotoTarget({ palletId: palletInternalId, photoType });
        
        if (source === 'camera') {
            cameraInputRef.current?.click();
        } else {
            galleryInputRef.current?.click();
        }
    };
    
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !photoTarget) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) {
                const newPhotoData = loadEvent.target.result as string;
                setPallets(prev => prev.map(p => {
                    if (p.id === photoTarget.palletId) {
                        const newPhotos = { ...p.photos, [photoTarget.photoType]: newPhotoData };
                        return { ...p, photos: newPhotos };
                    }
                    return p;
                }));
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        setPhotoTarget(null);
    };

    const handleRemovePhoto = (palletInternalId: string, photoType: PhotoType) => {
        if (isReadOnly) return;
        setPallets(prev => prev.map(p => {
            if (p.id === palletInternalId) {
                const newPhotos = { ...p.photos, [photoType]: null };
                return { ...p, photos: newPhotos };
            }
            return p;
        }));
    };

    const handleDeletePallet = (palletInternalId: string) => {
        if (window.confirm('Are you sure you want to delete this pallet QC entry?')) {
            setPallets(prev => prev.filter(p => p.id !== palletInternalId));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReadOnly) {
            onSave(run.id, pallets);
        }
    };
    
    const handleApproveClick = () => {
        if (onApprove && entryToView && currentUser) {
            onApprove(run.id, 'finalPalletQc', entryToView.id, currentUser.username);
        }
    };
    
    const isApproved = entryToView?.approvalDetails?.status === 'approved';

    // UI component for a single photo slot
    const PhotoSlot: React.FC<{ pallet: FinalPalletQcData, photoType: PhotoType, label: string }> = ({ pallet, photoType, label }) => {
        const photoData = pallet.photos[photoType];
        return (
            <div className="flex flex-col items-center justify-center space-y-2">
                <Label className="font-semibold text-slate-200">{label}</Label>
                <div className="relative group w-48 h-48 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600 overflow-hidden">
                    {photoData ? (
                        <>
                            <img src={photoData} alt={label} className="w-full h-full object-contain rounded-lg" />
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(pallet.id, photoType)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Remove ${label} photo`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 w-full px-4">
                            {/* Camera Button */}
                            <button
                                type="button"
                                onClick={() => handleAddPhotoClick(pallet.id, photoType, 'camera')}
                                className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-orange-600 text-white py-2 rounded transition-colors disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
                                disabled={isReadOnly}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-medium">Camera</span>
                            </button>

                            {/* Gallery Button */}
                             <button
                                type="button"
                                onClick={() => handleAddPhotoClick(pallet.id, photoType, 'gallery')}
                                className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-blue-600 text-white py-2 rounded transition-colors disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
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
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSubmit}>
                <Card>
                    {isReadOnly && (
                        <div className="p-4 mb-6 text-center bg-yellow-900 border border-yellow-700 text-yellow-100 rounded-lg">
                            <p className="font-semibold">Read-Only Mode: This form is for viewing or approval.</p>
                        </div>
                    )}
                    <div className="flex flex-wrap justify-between items-start border-b border-slate-700 pb-4 mb-6 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-green-400">Final Pallet QC</h2>
                            <p className="text-slate-400 mt-1">Take photos for Run: <span className="font-semibold text-orange-500">{run.runNumber}</span></p>
                        </div>
                        {!isReadOnly && <Button type="button" onClick={handleAddPallet}>Add New Pallet QC</Button>}
                    </div>

                    {/* Hidden Inputs */}
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
                    {pallets.length === 0 && (
                        <Card>
                            <p className="text-center text-slate-500 py-8">No final pallet QC entries have been added yet.</p>
                        </Card>
                    )}
                    {pallets.map(pallet => (
                        <Card key={pallet.id}>
                            <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                                    <div>
                                        <Label htmlFor={`size-${pallet.id}`}>Size</Label>
                                        <select id={`size-${pallet.id}`} value={pallet.size} onChange={e => handlePalletDetailChange(pallet.id, 'size', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={isReadOnly}>
                                            <option value="">Select Size</option>
                                            {sizes.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor={`class-${pallet.id}`}>Class</Label>
                                        <select id={`class-${pallet.id}`} value={pallet.class} onChange={e => handlePalletDetailChange(pallet.id, 'class', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={isReadOnly}>
                                            <option value="">Select Class</option>
                                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor={`boxType-${pallet.id}`}>Box Type</Label>
                                        <select id={`boxType-${pallet.id}`} value={pallet.boxType} onChange={e => handlePalletDetailChange(pallet.id, 'boxType', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={isReadOnly}>
                                            <option value="">Select Box Type</option>
                                            {boxTypes.map(bt => <option key={bt.name} value={bt.name}>{bt.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {!isReadOnly && (
                                    <button type="button" onClick={() => handleDeletePallet(pallet.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full transition-colors ml-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                                {PHOTO_TYPES.map(pt => (
                                    <PhotoSlot key={pt.key} pallet={pallet} photoType={pt.key} label={pt.label} />
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {pallets.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-slate-700 text-center">
                        {isReadOnly ? (
                            !isApproved && (
                                <Button type="button" onClick={handleApproveClick} className="w-full max-w-sm bg-green-600 hover:bg-green-700 focus:ring-green-500">
                                    Approve Final Pallet QC
                                </Button>
                            )
                        ) : (
                            <Button type="submit" className="w-full max-w-sm">
                                Save All Pallet QC Data
                            </Button>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default FinalPalletQcPage;

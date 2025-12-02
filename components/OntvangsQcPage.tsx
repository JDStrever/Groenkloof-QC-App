
import React, { useState, useEffect } from 'react';
import { Delivery, ExternalQualityData, DefectsData, InternalQualityData, InternalQualityDataKey, CommodityData, Size } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ExternalQualityForm, { QUALITY_CLASSES, CustomDefect, initialInternalQuality, CUSTOM_DEFECT_COUNT } from './forms/ExternalQualityForm';
import { getSizesForCommodity } from '../utils/commodityHelper';
import { DEFECTS } from '../constants/commoditySizes';

declare var JSZip: any;

interface OntvangsQcPageProps {
  delivery: Delivery;
  onSaveInspection: (qualityData: ExternalQualityData, defectsData: DefectsData, internalQualityData: InternalQualityData, photos: string[], sizeCounts: { [sizeCode: string]: number | '' }) => void;
  commodityData: CommodityData;
}

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-slate-700 rounded-lg p-3 text-center border border-slate-600">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-100">{value}</p>
    </div>
);

const OntvangsQcPage: React.FC<OntvangsQcPageProps> = ({ delivery, onSaveInspection, commodityData }) => {
  const [loading, setLoading] = useState(false);
  
  const [qualityData, setQualityData] = useState<ExternalQualityData>({});
  const [defectsData, setDefectsData] = useState<DefectsData>({});
  const [customDefects, setCustomDefects] = useState<CustomDefect[]>([]);
  const [internalQualityData, setInternalQualityData] = useState<InternalQualityData>(initialInternalQuality);
  const [sizeCounts, setSizeCounts] = useState<{ [sizeCode: string]: number | '' }>({});
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const allDefects = delivery.defects || {};
    const standardDefectSet = new Set(DEFECTS);
    
    const initialStandardDefects: DefectsData = {};
    const existingCustomDefects: CustomDefect[] = [];

    Object.entries(allDefects).forEach(([defectName, count]) => {
        if (standardDefectSet.has(defectName)) {
            // Handle legacy data where count might be an object, forcing it to number if needed or resetting
            // For now assuming clean data or overwrite
            initialStandardDefects[defectName] = typeof count === 'number' ? count : '';
        } else {
            existingCustomDefects.push({ name: defectName, count: typeof count === 'number' ? count : '' });
        }
    });

    const initialCustomDefectState = Array.from({ length: CUSTOM_DEFECT_COUNT }, (_, i) => 
        existingCustomDefects[i] || { name: '', count: '' }
    );

    setQualityData(delivery.externalQuality || {});
    setDefectsData(initialStandardDefects);
    setCustomDefects(initialCustomDefectState);
    setInternalQualityData(delivery.internalQuality || initialInternalQuality);
    setSizeCounts(delivery.sizeCounts || {});
    setPhotos(delivery.photos || []);
  }, [delivery]);

  useEffect(() => {
      const totalMass = Number(internalQualityData.totalMass) || 0;
      const juiceMass = Number(internalQualityData.juiceMass) || 0;
      const brix = Number(internalQualityData.brix) || 0;
      const titration = Number(internalQualityData.titration) || 0;

      const newJuicePercentage = totalMass > 0 ? parseFloat(((juiceMass / totalMass) * 100).toFixed(2)) : '';
      const newAcid = titration > 0 ? parseFloat((titration / 20).toFixed(2)) : '';
      const newRelation = (typeof newAcid === 'number' && newAcid > 0) ? parseFloat((brix / newAcid).toFixed(1)) : '';
      
      setInternalQualityData(prev => {
          if (
              newJuicePercentage !== prev.juicePercentage ||
              newAcid !== prev.acid ||
              newRelation !== prev.relation
          ) {
              return {
                  ...prev,
                  juicePercentage: newJuicePercentage,
                  acid: newAcid,
                  relation: newRelation,
              };
          }
          return prev;
      });
  }, [
      internalQualityData.totalMass, 
      internalQualityData.juiceMass, 
      internalQualityData.brix, 
      internalQualityData.titration,
  ]);

  const generateCsvContent = () => {
    const sizes = getSizesForCommodity(delivery.commodity, commodityData);
    const sizeHeaders = sizes.map((s: Size) => `"${s.code}"`).join(',');
    let csvContent = "";
    csvContent += "Delivery QC Report\n";
    csvContent += `"Delivery Note:","${delivery.deliveryNote}"\n`;
    csvContent += `"Date Received:","${delivery.dateReceived}"\n`;
    csvContent += `"Farm Name:","${delivery.farmName}"\n`;
    csvContent += `"Boord:","${delivery.boord}"\n`;
    csvContent += `"PUC:","${delivery.puc}"\n`;
    csvContent += `"Exporter:","${delivery.exporter}"\n`;
    csvContent += `"Commodity:","${delivery.commodity}"\n`;
    csvContent += `"Variety:","${delivery.variety}"\n\n`;
    
    csvContent += "Aantal (Manual)\n";
    csvContent += `"Grootte",${sizeHeaders}\n`;
    const aantalRow = sizes.map((s: Size) => sizeCounts[s.code] || 0).join(',');
    csvContent += `"Totaal",${aantalRow}\n\n`;

    csvContent += "Eksterne kwaliteit\n";
    csvContent += `"Klas","Aantal"\n`;
    QUALITY_CLASSES.forEach(className => {
        const count = qualityData?.[className] || 0;
        csvContent += `"${className}",${count}\n`;
    });
    csvContent += "\n";

    csvContent += "Defekte gekry\n";
    csvContent += `"Defek","Aantal"\n`;
    
    const combinedDefects = { ...defectsData };
    customDefects.forEach(defect => {
        if (defect.name.trim() !== '') {
            combinedDefects[defect.name.trim()] = defect.count;
        }
    });

    Object.keys(combinedDefects).forEach(defectName => {
        const count = combinedDefects[defectName] || 0;
        csvContent += `"${defectName}",${count}\n`;
    });
    csvContent += "\n";

    const internalQualityLabels: { [key in InternalQualityDataKey]: string } = {
        totalMass: 'Total mass (g)', peelMass: 'Peel mass (g)', juiceMass: 'Juice mass (g)',
        juicePercentage: 'Juice %', brix: 'Brix', titration: 'Titration',
        acid: 'Acid', relation: 'Relation', seeds: 'Seeds',
    };
    csvContent += "Interne Kwaliteit\n";
    csvContent += "Metric,Value\n";
    (Object.keys(internalQualityData) as InternalQualityDataKey[]).forEach(key => {
        const label = internalQualityLabels[key] || key;
        const value = internalQualityData?.[key] ?? '';
        csvContent += `"${label}","${value}"\n`;
    });
    return csvContent;
  };

  const handleExportPackage = async () => {
    setLoading(true);
    try {
        const csvContent = generateCsvContent();
        const zip = new JSZip();

        zip.file(`QC_Report_${delivery.deliveryNote}.csv`, csvContent);

        if (photos && photos.length > 0) {
            const photosFolder = zip.folder("photos");
            photos.forEach((photoDataUrl, index) => {
                const match = photoDataUrl.match(/^data:image\/(.+);base64,(.*)$/);
                if (match) {
                    const extension = match[1].split(';')[0]; // e.g., jpeg
                    const base64Data = match[2];
                    photosFolder.file(`photo_${index + 1}.${extension}`, base64Data, { base64: true });
                }
            });
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = `QC_Package_${delivery.deliveryNote}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error creating ZIP file:", error);
        alert("Failed to create ZIP file. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleFormSave = () => {
    const combinedDefects = { ...defectsData };
    customDefects.forEach(defect => {
        if (defect.name.trim() !== '') {
            combinedDefects[defect.name.trim()] = defect.count;
        }
    });
    onSaveInspection(qualityData, combinedDefects, internalQualityData, photos, sizeCounts);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <Card>
            <div className="flex flex-wrap justify-between items-start border-b border-slate-700 pb-6 mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-green-400">Ontvangs QC for: {delivery.deliveryNote}</h2>
                    <p className="text-slate-400 mt-1">Details for the selected delivery are shown below.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportPackage} disabled={loading} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{loading ? 'Exporting...' : 'Export Package (.zip)'}</span>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <InfoPill label="Farm Name" value={delivery.farmName} />
                <InfoPill label="PUC" value={delivery.puc} />
                <InfoPill label="Boord" value={delivery.boord} />
                <InfoPill label="Exporter" value={delivery.exporter} />
                <InfoPill label="Commodity" value={delivery.commodity} />
                <InfoPill label="Variety" value={delivery.variety} />
                <InfoPill label="Date Received" value={delivery.dateReceived} />
            </div>
        </Card>
        
        <ExternalQualityForm 
            delivery={delivery} 
            onSave={handleFormSave} 
            commodityData={commodityData}
            qualityData={qualityData}
            defectsData={defectsData}
            customDefects={customDefects}
            internalQualityData={internalQualityData}
            sizeCounts={sizeCounts}
            photos={photos}
            setQualityData={setQualityData}
            setDefectsData={setDefectsData}
            setCustomDefects={setCustomDefects}
            setInternalQualityData={setInternalQualityData}
            setSizeCounts={setSizeCounts}
            setPhotos={setPhotos}
        />
    </div>
  );
};

export default OntvangsQcPage;

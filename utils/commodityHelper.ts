
import { Size, CommodityData, SizingEntry, Run, CartonWeightsEntry, CartonEvaluationEntry, ClassEvaluationEntry, FinalPalletQcEntry, CartonEvaluationSample, ClassEvaluationSample, ApprovalDetails } from '../types';
import { DEFECTS } from '../constants/commoditySizes';

declare var JSZip: any;

const commodityMap: { [key: string]: string } = {
    'orange': 'Orange',
    'lemoen': 'Orange',
    'lemon': 'Lemon',
    'suurlemoen': 'Lemon',
    'grapefruit': 'Grapefruit',
    'pomelo': 'Grapefruit',
    'mandarin': 'Mandarin',
    'nartjie': 'Mandarin',
    'soft citrus': 'Mandarin',
};

export const getMappedCommodity = (commodity: string): string => {
    const normalizedCommodity = commodity.toLowerCase().trim();
    const mappedKey = Object.keys(commodityMap).find(key => normalizedCommodity.includes(key));
    const finalCommodity = mappedKey ? commodityMap[mappedKey] : commodity;
    return mappedKey ? commodityMap[mappedKey] : finalCommodity;
};


export const getSizesForCommodity = (commodity: string, commodityData: CommodityData): Size[] => {
    const mappedCommodity = getMappedCommodity(commodity);
    const finalCommodityKey = Object.keys(commodityData).find(key => mappedCommodity.toLowerCase().includes(key.toLowerCase()));
    return finalCommodityKey ? commodityData[finalCommodityKey] : [];
};


// CSV Export Utilities
const downloadCsv = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const getRunInfoHeader = (run: Run, entry: {timestamp: string, approvalDetails: ApprovalDetails}): string => {
    const approvalStatus = entry.approvalDetails.status === 'approved' 
        ? `Approved by ${entry.approvalDetails.approvedBy}` 
        : 'Pending';
    return `
"Run Number:",${run.runNumber}
"Farm Name:",${run.farmName}
"PUC:",${run.puc}
"Boord:",${run.boord}
"Commodity:",${run.commodity}
"Variety:",${run.variety}
"Entry Timestamp:",${new Date(entry.timestamp).toLocaleString()}
"Approval Status:",${approvalStatus}
\n`;
};

export const exportSizingToCsv = (entry: SizingEntry, run: Run, commodityData: CommodityData) => {
    let csvContent = `"Sizing Report"\n`;
    csvContent += getRunInfoHeader(run, entry);
    
    const sizes = getSizesForCommodity(run.commodity, commodityData);
    const headers = ["Size Code", "Diameter Range", ...Array.from({ length: 10 }, (_, i) => `Fruit ${i + 1} (mm)`)];
    csvContent += headers.join(',') + '\n';
    
    sizes.forEach(size => {
        const measurements = entry.data[size.code] || Array(10).fill('');
        const row = [size.code, `"${size.diameterRange}"`, ...measurements];
        csvContent += row.join(',') + '\n';
    });

    downloadCsv(csvContent, `Sizing_${run.runNumber}_${entry.id}.csv`);
};


export const exportCartonWeightsToCsv = (entry: CartonWeightsEntry, run: Run) => {
    let csvContent = `"Carton Weights Report"\n`;
    csvContent += getRunInfoHeader(run, entry);

    entry.samples.forEach((sample, index) => {
        csvContent += `\n"Sample ${index + 1}:",Size: ${sample.size},Class: ${sample.class},Box Type: ${sample.boxType}\n`;
        const headers = Array.from({ length: 10 }, (_, i) => `Weight ${i + 1} (kg)`);
        csvContent += headers.join(',') + '\n';
        csvContent += sample.weights.join(',') + '\n';
    });

    downloadCsv(csvContent, `CartonWeights_${run.runNumber}_${entry.id}.csv`);
};

const formatEvaluationCsv = (samples: (CartonEvaluationSample | ClassEvaluationSample)[], run: Run, entry: {timestamp: string, approvalDetails: ApprovalDetails}, title: string): string => {
    let csvContent = `"${title}"\n`;
    csvContent += getRunInfoHeader(run, entry);
    
    samples.forEach((sample, index) => {
        csvContent += `\n"Sample ${index + 1}"\n`;
        const sampleType = 'boxType' in sample ? ` / ${sample.boxType}` : '';
        csvContent += `"Details:","${sample.size} / ${sample.class}${sampleType}"\n`;
        csvContent += `"Sample Size:",${sample.sampleSize || 0}\n\n`;

        csvContent += '"Counts","VSA","Klas 1","Klas 2","Klas 3"\n';
        const counts = [
            'Fruit Count',
            sample.counts.vsa || 0,
            sample.counts.klas1 || 0,
            sample.counts.klas2 || 0,
            sample.counts.klas3 || 0
        ];
        csvContent += counts.join(',') + '\n';
        
        const sampleSizeNum = Number(sample.sampleSize) || 0;
        const percentages = [
            'Percentage',
            sampleSizeNum > 0 ? `${((Number(sample.counts.vsa) || 0) / sampleSizeNum * 100).toFixed(1)}%` : '0.0%',
            sampleSizeNum > 0 ? `${((Number(sample.counts.klas1) || 0) / sampleSizeNum * 100).toFixed(1)}%` : '0.0%',
            sampleSizeNum > 0 ? `${((Number(sample.counts.klas2) || 0) / sampleSizeNum * 100).toFixed(1)}%` : '0.0%',
            sampleSizeNum > 0 ? `${((Number(sample.counts.klas3) || 0) / sampleSizeNum * 100).toFixed(1)}%` : '0.0%',
        ];
        csvContent += percentages.join(',') + '\n\n';

        csvContent += '"Defects per Class","Klas 1","Klas 2","Klas 3","Total"\n';
        const allDefects = [...DEFECTS, ...(sample.customDefects?.map(d => d.name).filter(Boolean) || [])];
        allDefects.forEach(defectName => {
            const isCustom = !DEFECTS.includes(defectName);
            const defectData = isCustom 
                ? sample.customDefects?.find(d => d.name === defectName)?.counts
                : sample.defects?.[defectName];
            
            if (defectData) {
                const k1 = Number(defectData.klas1) || 0;
                const k2 = Number(defectData.klas2) || 0;
                const k3 = Number(defectData.klas3) || 0;
                const total = k1 + k2 + k3;
                if (total > 0) {
                   csvContent += `"${defectName}",${k1},${k2},${k3},${total}\n`;
                }
            }
        });
    });
    return csvContent;
}

export const exportCartonEvaluationToCsv = (entry: CartonEvaluationEntry, run: Run) => {
    const csvContent = formatEvaluationCsv(entry.samples, run, entry, 'Carton Evaluation Report');
    downloadCsv(csvContent, `CartonEval_${run.runNumber}_${entry.id}.csv`);
};

export const exportClassEvaluationToCsv = (entry: ClassEvaluationEntry, run: Run) => {
    const csvContent = formatEvaluationCsv(entry.samples, run, entry, 'Class Evaluation Report');
    downloadCsv(csvContent, `ClassEval_${run.runNumber}_${entry.id}.csv`);
};

export const exportFinalPalletQcPhotosToZip = async (entry: FinalPalletQcEntry, run: Run) => {
    try {
        const zip = new JSZip();

        for (const [palletIndex, pallet] of entry.pallets.entries()) {
            const palletFolder = zip.folder(`pallet_${palletIndex + 1}_${pallet.size}_${pallet.class}`);
            if (!palletFolder) continue;

            for (const [photoType, photoData] of Object.entries(pallet.photos)) {
                if (photoData) {
                    const match = photoData.match(/^data:image\/(.+);base64,(.*)$/);
                    if (match) {
                        const extension = match[1].split(';')[0];
                        const base64Data = match[2];
                        palletFolder.file(`${photoType}.${extension}`, base64Data, { base64: true });
                    }
                }
            }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = `FinalPalletPhotos_${run.runNumber}_${entry.id}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error creating ZIP file:", error);
        alert("Failed to create ZIP file. Please try again.");
    }
};
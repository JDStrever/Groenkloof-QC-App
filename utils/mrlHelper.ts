
import { MrlRecord } from '../types';

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

export const exportMrlRecordToCsv = (record: MrlRecord) => {
    let csvContent = `"MRL Record Report"\n`;
    csvContent += `"Customer Reference:",${record.customerRef}\n`;
    csvContent += `"Producer:",${record.producer}\n`;
    csvContent += `"PUC:",${record.puc}\n`;
    csvContent += `"PHC:",${record.phc}\n`;
    csvContent += `"Orchard:",${record.orchard}\n`;
    csvContent += `"Date Captured:",${record.dateCaptured}\n`;
    csvContent += `"Commodity:",${record.commodity}\n`;
    csvContent += `"Variety:",${record.variety}\n`;
    csvContent += `\n`;
    csvContent += `"Component","Residue (mg/kg)"\n`;
    csvContent += `"2,4D",${record.residues.d24}\n`;
    csvContent += `"Imazalil",${record.residues.imazalil}\n`;
    csvContent += `"Pyrimethanil",${record.residues.pyrimethanil}\n`;
    csvContent += `"Thiabendazole",${record.residues.thiabendazole}\n`;

    if (record.customResidues && record.customResidues.length > 0) {
        record.customResidues.forEach(residue => {
            if (residue.name) {
                csvContent += `"${residue.name}",${residue.value}\n`;
            }
        });
    }
    
    downloadCsv(csvContent, `MRL_Record_${record.customerRef}.csv`);
};

export const downloadPdfFromBase64 = (base64String: string | null, filename: string) => {
    if (!base64String) {
        alert('No PDF file available for this record.');
        return;
    }
    const link = document.createElement("a");
    link.href = base64String;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
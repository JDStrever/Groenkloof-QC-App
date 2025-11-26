
import React, { useState, useRef } from 'react';
import { MrlRecord, MrlResidues, CustomMrlResidue } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';

interface AddMrlPageProps {
  onRecordCreated: (newRecord: Omit<MrlRecord, 'id'>) => void;
}

const AddMrlPage: React.FC<AddMrlPageProps> = ({ onRecordCreated }) => {
  const [formData, setFormData] = useState({
    customerRef: '',
    producer: '',
    puc: '',
    phc: '',
    orchard: '',
    dateCaptured: '',
    commodity: '',
    variety: '',
  });

  const [residues, setResidues] = useState<MrlResidues>({
    d24: '',
    imazalil: '',
    pyrimethanil: '',
    thiabendazole: '',
  });
  
  const [customResidues, setCustomResidues] = useState<CustomMrlResidue[]>(
    Array.from({ length: 4 }, () => ({ name: '', value: '' }))
  );

  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResidueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : parseFloat(value);
    if (isNaN(numValue as number) && value !== '') return;
    setResidues(prev => ({ ...prev, [name]: numValue }));
  };
  
  const handleCustomResidueChange = (index: number, field: 'name' | 'value', value: string) => {
    const newCustomResidues = [...customResidues];
    const target = newCustomResidues[index];

    if (field === 'name') {
        target.name = value;
    } else { // field is 'value'
        const numValue = value === '' ? '' : parseFloat(value);
        if (isNaN(numValue as number) && value !== '') return;
        target.value = numValue;
    }
    setCustomResidues(newCustomResidues);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              if (loadEvent.target?.result) {
                  setPdfFile(loadEvent.target.result as string);
                  setPdfFileName(file.name);
              }
          };
          reader.readAsDataURL(file);
      } else {
          alert('Please select a valid PDF file.');
          setPdfFile(null);
          setPdfFileName('');
      }
      e.target.value = ''; // Reset file input
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormFilled = Object.values(formData).every(field => typeof field === 'string' && field.trim() !== '');
    if (isFormFilled) {
      onRecordCreated({
        ...formData,
        residues,
        customResidues: customResidues.filter(r => r.name.trim() !== ''),
        labReportPdf: pdfFile
      });
    } else {
      alert('Please fill out all fields.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-400">Add New MRL Record</h2>
            <p className="text-slate-400 mt-2">Enter the details from the lab analysis report.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup name="customerRef" label="Customer Reference (Order nr)" value={formData.customerRef} onChange={handleChange} />
            <InputGroup name="producer" label="Producer" value={formData.producer} onChange={handleChange} />
            <InputGroup name="puc" label="PUC" value={formData.puc} onChange={handleChange} />
            <InputGroup name="phc" label="PHC" value={formData.phc} onChange={handleChange} />
            <InputGroup name="orchard" label="Orchard" value={formData.orchard} onChange={handleChange} />
            <InputGroup name="dateCaptured" label="Date Captured" value={formData.dateCaptured} onChange={handleChange} type="date" />
            <InputGroup name="commodity" label="Commodity" value={formData.commodity} onChange={handleChange} />
            <InputGroup name="variety" label="Variety" value={formData.variety} onChange={handleChange} />
          </div>

          <div className="pt-6 border-t border-slate-700">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Components Detected (Residue [mg/kg])</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResidueInput name="d24" label="2,4D" value={residues.d24} onChange={handleResidueChange} />
              <ResidueInput name="imazalil" label="Imazalil" value={residues.imazalil} onChange={handleResidueChange} />
              <ResidueInput name="pyrimethanil" label="Pyrimethanil" value={residues.pyrimethanil} onChange={handleResidueChange} />
              <ResidueInput name="thiabendazole" label="Thiabendazole" value={residues.thiabendazole} onChange={handleResidueChange} />
            </div>
          </div>

           <div className="pt-6 border-t border-slate-700">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Other Components Detected (Residue [mg/kg])</h3>
            <div className="space-y-4">
                {customResidues.map((custom, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Input 
                            type="text"
                            placeholder={`Component Name ${index + 1}`}
                            value={custom.name}
                            onChange={(e) => handleCustomResidueChange(index, 'name', e.target.value)}
                        />
                        <Input 
                            type="number"
                            step="0.001"
                            placeholder="mg/kg"
                            value={custom.value}
                            onChange={(e) => handleCustomResidueChange(index, 'value', e.target.value)}
                            disabled={!custom.name}
                        />
                    </div>
                ))}
            </div>
          </div>


          <div className="pt-6 border-t border-slate-700">
              <h3 className="text-xl font-semibold text-green-400 mb-4">Lab Report</h3>
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <div className="flex items-center gap-4">
                  <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-slate-600 hover:bg-slate-700">
                      Upload PDF
                  </Button>
                  {pdfFileName && <span className="text-slate-400 text-sm">{pdfFileName}</span>}
              </div>
          </div>
          
          <div className="pt-6 text-center">
            <Button type="submit" className="w-full max-w-sm">Save MRL Record</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Helper components for inputs
const InputGroup: React.FC<any> = ({ name, label, ...props }) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} required {...props} />
  </div>
);

const ResidueInput: React.FC<any> = ({ name, label, ...props }) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} type="number" step="0.001" placeholder="mg/kg" {...props} />
  </div>
);

export default AddMrlPage;

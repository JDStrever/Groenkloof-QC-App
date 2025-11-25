
import React, { useState } from 'react';
import { Run, RunConfig, CommodityData } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Label from './ui/Label';

interface RunSetupPageProps {
  onRunCreated: (newRun: Omit<Run, 'id'>) => void;
  runConfig: RunConfig;
  commodityData: CommodityData;
}

const RunSetupPage: React.FC<RunSetupPageProps> = ({ onRunCreated, runConfig, commodityData }) => {
  const [formData, setFormData] = useState({
    runNumber: '',
    puc: '',
    farmName: '',
    boord: '',
    exporter: '',
    commodity: '',
    variety: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Add type guard to ensure field is a string before calling trim().
    if (Object.values(formData).every(field => typeof field === 'string' && field.trim() !== '')) {
      onRunCreated(formData);
    } else {
      alert('Please fill out all fields.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Setup New Run</h2>
            <p className="text-slate-500 mt-2">Enter the details for the new production run.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="runNumber">Run Number</Label>
            <Input id="runNumber" name="runNumber" value={formData.runNumber} onChange={handleChange} placeholder="e.g., R12345" required />
          </div>
          
          <div>
            <Label htmlFor="puc">PUC</Label>
            <select
              id="puc"
              name="puc"
              value={formData.puc}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
              <option value="">Select PUC</option>
              {runConfig.pucOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="farmName">Farm Name</Label>
            <select
              id="farmName"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
              <option value="">Select Farm</option>
              {runConfig.farmNameOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="boord">Boord</Label>
            <select
              id="boord"
              name="boord"
              value={formData.boord}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
               <option value="">Select Boord</option>
               {runConfig.boordOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="exporter">Exporter</Label>
            <select
              id="exporter"
              name="exporter"
              value={formData.exporter}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
              <option value="">Select Exporter</option>
              {runConfig.exporterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="commodity">Commodity</Label>
             <select
              id="commodity"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
              <option value="">Select Commodity</option>
              {Object.keys(commodityData).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="variety">Variety</Label>
             <select
              id="variety"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
              <option value="">Select Variety</option>
              {runConfig.varietyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">Create Run</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RunSetupPage;

import React, { useState } from 'react';
import { Delivery } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Label from './ui/Label';

interface PlaasSetupPageProps {
  onDeliveryCreated: (newDelivery: Omit<Delivery, 'id'>) => void;
}

const PlaasSetupPage: React.FC<PlaasSetupPageProps> = ({ onDeliveryCreated }) => {
  const [formData, setFormData] = useState({
    deliveryNote: '',
    dateReceived: '',
    puc: '',
    farmName: '',
    boord: '',
    exporter: '',
    commodity: '',
    variety: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).every(field => typeof field === 'string' && field.trim() !== '')) {
      onDeliveryCreated(formData);
    } else {
      alert('Please fill out all fields.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Setup New Delivery</h2>
            <p className="text-slate-500 mt-2">Enter the details for the new fruit delivery.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="deliveryNote">Delivery Note</Label>
            <Input id="deliveryNote" name="deliveryNote" value={formData.deliveryNote} onChange={handleChange} placeholder="e.g., DN-54321" required />
          </div>
          <div>
            <Label htmlFor="dateReceived">Date Received</Label>
            <Input id="dateReceived" name="dateReceived" type="date" value={formData.dateReceived} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="puc">PUC</Label>
            <Input id="puc" name="puc" value={formData.puc} onChange={handleChange} placeholder="e.g., 100256" required />
          </div>
          <div>
            <Label htmlFor="farmName">Farm Name</Label>
            <Input id="farmName" name="farmName" value={formData.farmName} onChange={handleChange} placeholder="e.g., Sunnyvale Orchards" required />
          </div>
          <div>
            <Label htmlFor="boord">Boord</Label>
            <Input id="boord" name="boord" value={formData.boord} onChange={handleChange} placeholder="e.g., Block A" required />
          </div>
          <div>
            <Label htmlFor="exporter">Exporter</Label>
            <Input id="exporter" name="exporter" value={formData.exporter} onChange={handleChange} placeholder="e.g., Citrus World Inc." required />
          </div>
          <div>
            <Label htmlFor="commodity">Commodity</Label>
            <Input id="commodity" name="commodity" value={formData.commodity} onChange={handleChange} placeholder="e.g., Orange" required />
          </div>
          <div>
            <Label htmlFor="variety">Variety</Label>
            <Input id="variety" name="variety" value={formData.variety} onChange={handleChange} placeholder="e.g., Valencia" required />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full">Create Delivery</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PlaasSetupPage;
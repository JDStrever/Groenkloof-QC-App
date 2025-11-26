
import React, { useState, useEffect } from 'react';
import { Size, CommodityData } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface CommodityManagementPageProps {
  initialCommodityData: CommodityData;
  onUpdate: (data: CommodityData) => void;
}

const CommodityManagementPage: React.FC<CommodityManagementPageProps> = ({ initialCommodityData, onUpdate }) => {
  const [commodities, setCommodities] = useState<CommodityData>(initialCommodityData);
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
  const [editedSizes, setEditedSizes] = useState<Size[]>([]);
  const [newCommodityName, setNewCommodityName] = useState('');

  useEffect(() => {
    setCommodities(initialCommodityData);
  }, [initialCommodityData]);

  useEffect(() => {
    if (selectedCommodity && commodities[selectedCommodity]) {
      // Deep copy to avoid mutating state directly
      setEditedSizes(JSON.parse(JSON.stringify(commodities[selectedCommodity])));
    } else {
      setEditedSizes([]);
    }
  }, [selectedCommodity, commodities]);

  const handleSelectCommodity = (name: string) => {
    setSelectedCommodity(name);
  };

  const handleSizeChange = (index: number, field: keyof Size, value: string) => {
    const newSizes = [...editedSizes];
    const targetSize = { ...newSizes[index] };
    
    if (field === 'min' || field === 'max') {
        targetSize[field] = value === '' ? '' : parseInt(value, 10);
    } else {
        // @ts-ignore
        targetSize[field] = value;
    }
    
    newSizes[index] = targetSize;
    setEditedSizes(newSizes);
  };

  const handleAddSize = () => {
    setEditedSizes([...editedSizes, { code: '', diameterRange: '', min: '', max: '' }]);
  };

  const handleRemoveSize = (index: number) => {
    setEditedSizes(editedSizes.filter((_, i) => i !== index));
  };
  
  const handleSaveChanges = () => {
    if (!selectedCommodity) return;
    const newCommodities = { ...commodities, [selectedCommodity]: editedSizes };
    onUpdate(newCommodities);
    alert('Changes saved successfully!');
  };

  const handleAddNewCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCommodityName.trim();
    if (name && !commodities[name]) {
      const newCommodities = { ...commodities, [name]: [] };
      onUpdate(newCommodities);
      setSelectedCommodity(name);
      setNewCommodityName('');
    } else if (commodities[name]) {
      alert('A commodity with this name already exists.');
    }
  };

  const handleDeleteCommodity = () => {
    if (!selectedCommodity || !window.confirm(`Are you sure you want to delete the commodity "${selectedCommodity}"? This action cannot be undone.`)) return;
    const newCommodities = { ...commodities };
    delete newCommodities[selectedCommodity];
    onUpdate(newCommodities);
    setSelectedCommodity(null);
  };

  return (
    <Card>
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-green-400">Manage Commodities</h2>
        <p className="text-slate-400 mt-1">Add, edit, or remove commodities and their sizes.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col">
          <h3 className="text-xl font-semibold text-green-400 mb-4">Commodities</h3>
          <form onSubmit={handleAddNewCommodity} className="flex gap-2 mb-4">
            <Input 
              value={newCommodityName}
              onChange={e => setNewCommodityName(e.target.value)}
              placeholder="New commodity name"
              className="flex-grow"
              aria-label="New commodity name"
            />
            <Button type="submit" className="px-4 py-2 text-sm flex-shrink-0">Add</Button>
          </form>
          <div className="border border-slate-700 rounded-lg p-2 flex-grow min-h-[400px] bg-slate-900/50">
              <ul className="space-y-2 h-full overflow-y-auto">
                {Object.keys(commodities).length > 0 ? Object.keys(commodities).sort().map(name => (
                  <li key={name}>
                    <button
                      onClick={() => handleSelectCommodity(name)}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedCommodity === name ? 'bg-orange-600 text-white font-semibold' : 'hover:bg-slate-700 text-slate-300'}`}
                    >
                      {name}
                    </button>
                  </li>
                )) : (
                    <li className="text-center text-slate-500 p-4">No commodities found.</li>
                )}
              </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedCommodity ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-200">Edit Sizes for <span className="text-orange-500">{selectedCommodity}</span></h3>
                <Button onClick={handleDeleteCommodity} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-sm px-3 py-1">Delete Commodity</Button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 border-b border-slate-700 pb-4">
                {editedSizes.map((size, index) => (
                  <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div>
                      <Label>Code</Label>
                      <Input value={size.code} onChange={e => handleSizeChange(index, 'code', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label>Diameter Range</Label>
                      <Input value={size.diameterRange} onChange={e => handleSizeChange(index, 'diameterRange', e.target.value)} placeholder="e.g., 100-109mm" />
                    </div>
                    <div>
                      <Label>Min (mm)</Label>
                      <Input type="number" value={size.min} onChange={e => handleSizeChange(index, 'min', e.target.value)} />
                    </div>
                    <div>
                      <Label>Max (mm)</Label>
                      <Input type="number" value={size.max} onChange={e => handleSizeChange(index, 'max', e.target.value)} />
                    </div>
                    <div className="col-span-full md:col-span-1 flex justify-end">
                      <button type="button" onClick={() => handleRemoveSize(index)} className="text-red-400 hover:text-red-300 font-medium text-sm p-2">Remove</button>
                    </div>
                  </div>
                ))}
                 {editedSizes.length === 0 && <p className="text-slate-500 text-center py-4">No sizes defined for this commodity.</p>}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button type="button" onClick={handleAddSize} className="bg-slate-600 hover:bg-slate-700 focus:ring-slate-500">Add Size</Button>
                <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
              <p className="text-slate-500 text-lg">Select a commodity to edit its sizes.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommodityManagementPage;

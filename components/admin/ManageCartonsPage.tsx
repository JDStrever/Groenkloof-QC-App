
import React, { useState, useEffect } from 'react';
import { CartonConfig, CommodityData, BoxType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { getMappedCommodity } from '../../utils/commodityHelper';

interface ManageCartonsPageProps {
  initialCartonConfig: CartonConfig;
  onUpdate: (config: CartonConfig) => void;
  commodityData: CommodityData;
}

const ManageCartonsPage: React.FC<ManageCartonsPageProps> = ({ initialCartonConfig, onUpdate, commodityData }) => {
  const [config, setConfig] = useState<CartonConfig>(initialCartonConfig);
  const [newClassName, setNewClassName] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>(Object.keys(commodityData)[0] || '');
  const [newBoxType, setNewBoxType] = useState('');

  useEffect(() => {
    setConfig(initialCartonConfig);
  }, [initialCartonConfig]);

  const handleAddClass = () => {
    const name = newClassName.trim();
    if (name && !config.classes.includes(name)) {
      const newConfig = { ...config, classes: [...config.classes, name].sort() };
      setConfig(newConfig);
      onUpdate(newConfig);
      setNewClassName('');
    }
  };

  const handleRemoveClass = (className: string) => {
    if (window.confirm(`Are you sure you want to remove the class "${className}"?`)) {
      const newConfig = { ...config, classes: config.classes.filter(c => c !== className) };
      setConfig(newConfig);
      onUpdate(newConfig);
    }
  };

  const handleAddBoxType = () => {
    const mappedCommodity = getMappedCommodity(selectedCommodity);
    const name = newBoxType.trim();
    if (name && mappedCommodity) {
      const currentBoxTypes = config.boxTypes[mappedCommodity] || [];
      if (!currentBoxTypes.some(bt => bt.name === name)) {
        const newBoxTypeObject: BoxType = { name, minWeight: '', maxWeight: '' };
        const newBoxTypes = {
          ...config.boxTypes,
          [mappedCommodity]: [...currentBoxTypes, newBoxTypeObject].sort((a, b) => a.name.localeCompare(b.name)),
        };
        const newConfig = { ...config, boxTypes: newBoxTypes };
        setConfig(newConfig);
        onUpdate(newConfig);
        setNewBoxType('');
      }
    }
  };

  const handleRemoveBoxType = (boxTypeName: string) => {
    const mappedCommodity = getMappedCommodity(selectedCommodity);
    if (mappedCommodity && window.confirm(`Are you sure you want to remove "${boxTypeName}" from "${mappedCommodity}"?`)) {
      const newBoxTypesForCommodity = (config.boxTypes[mappedCommodity] || []).filter(bt => bt.name !== boxTypeName);
      const newBoxTypes = { ...config.boxTypes, [mappedCommodity]: newBoxTypesForCommodity };
      const newConfig = { ...config, boxTypes: newBoxTypes };
      setConfig(newConfig);
      onUpdate(newConfig);
    }
  };

  const handleBoxTypeChange = (boxTypeName: string, field: 'minWeight' | 'maxWeight', value: string) => {
    const mappedCommodity = getMappedCommodity(selectedCommodity);
    if (!mappedCommodity) return;
    
    const numValue = value === '' ? '' : parseFloat(value);
    if (isNaN(numValue as number) && value !== '') return;

    const newBoxTypesForCommodity = (config.boxTypes[mappedCommodity] || []).map(bt => {
        if (bt.name === boxTypeName) {
            return { ...bt, [field]: numValue };
        }
        return bt;
    });

    const newBoxTypes = { ...config.boxTypes, [mappedCommodity]: newBoxTypesForCommodity };
    const newConfig = { ...config, boxTypes: newBoxTypes };
    setConfig(newConfig);
    onUpdate(newConfig);
  };


  return (
    <Card>
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-green-400">Manage Kartonne</h2>
        <p className="text-slate-400 mt-1">Manage fruit classes and box types for QC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manage Classes */}
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">Fruit Classes</h3>
          <div className="flex gap-2 mb-4">
            <Input
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="New class name"
              aria-label="New class name"
            />
            <Button type="button" onClick={handleAddClass} className="px-4 py-2 text-sm">Add</Button>
          </div>
          <ul className="space-y-2 border border-slate-700 rounded-lg p-3 min-h-[200px] bg-slate-900/50">
            {config.classes.map(className => (
              <li key={className} className="flex justify-between items-center bg-slate-700 p-2 rounded-md shadow-sm border border-slate-600">
                <span className="font-medium text-slate-200">{className}</span>
                <button onClick={() => handleRemoveClass(className)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Remove</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Manage Box Types */}
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">Box Types per Commodity</h3>
          <div className="mb-4">
            <Label htmlFor="commodity-select">Select Commodity</Label>
            <select
              id="commodity-select"
              value={selectedCommodity}
              onChange={e => setSelectedCommodity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            >
              {Object.keys(commodityData).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          {selectedCommodity && (
            <div>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newBoxType}
                  onChange={e => setNewBoxType(e.target.value)}
                  placeholder="New box type"
                  aria-label="New box type"
                />
                <Button type="button" onClick={handleAddBoxType} className="px-4 py-2 text-sm">Add</Button>
              </div>
              <ul className="space-y-2 border border-slate-700 rounded-lg p-3 min-h-[200px] bg-slate-900/50 max-h-[400px] overflow-y-auto">
                {(config.boxTypes[getMappedCommodity(selectedCommodity)] || []).map(boxType => (
                  <li key={boxType.name} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-700 p-3 rounded-md shadow-sm gap-2 border border-slate-600">
                    <span className="font-medium text-slate-200 flex-1">{boxType.name}</span>
                    <div className="flex items-center gap-2">
                        <Label htmlFor={`min-${boxType.name}`} className="sr-only">Min Weight</Label>
                        <Input id={`min-${boxType.name}`} type="number" step="0.01" placeholder="Min kg" value={boxType.minWeight} onChange={(e) => handleBoxTypeChange(boxType.name, 'minWeight', e.target.value)} className="w-24 text-center" />
                        <Label htmlFor={`max-${boxType.name}`} className="sr-only">Max Weight</Label>
                        <Input id={`max-${boxType.name}`} type="number" step="0.01" placeholder="Max kg" value={boxType.maxWeight} onChange={(e) => handleBoxTypeChange(boxType.name, 'maxWeight', e.target.value)} className="w-24 text-center" />
                    </div>
                    <button onClick={() => handleRemoveBoxType(boxType.name)} className="text-red-400 hover:text-red-300 text-sm font-semibold self-center md:self-auto">Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ManageCartonsPage;

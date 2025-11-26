
import React, { useState } from 'react';
import { RunConfig } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ManageRunInfoPageProps {
  runConfig: RunConfig;
  onUpdate: (config: RunConfig) => void;
}

const ManageRunInfoPage: React.FC<ManageRunInfoPageProps> = ({ runConfig, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<keyof RunConfig>('pucOptions');
  const [newItem, setNewItem] = useState('');

  const tabs: { key: keyof RunConfig; label: string }[] = [
    { key: 'pucOptions', label: 'PUCs' },
    { key: 'farmNameOptions', label: 'Farms' },
    { key: 'boordOptions', label: 'Boords' },
    { key: 'exporterOptions', label: 'Exporters' },
    { key: 'varietyOptions', label: 'Varieties' },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      const currentList = [...(runConfig[activeTab] || [])];
      if (!currentList.includes(newItem.trim())) {
        const updatedList = [...currentList, newItem.trim()].sort();
        const newConfig = {
          ...runConfig,
          [activeTab]: updatedList,
        };
        onUpdate(newConfig);
        setNewItem('');
      } else {
        alert('This item already exists in the list.');
      }
    }
  };

  const handleDeleteItem = (itemToDelete: string) => {
    if (window.confirm(`Are you sure you want to remove "${itemToDelete}"?`)) {
      const currentList = runConfig[activeTab] || [];
      const newConfig = {
        ...runConfig,
        [activeTab]: currentList.filter(item => item !== itemToDelete),
      };
      onUpdate(newConfig);
    }
  };

  return (
    <Card>
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Manage Run Info</h2>
        <p className="text-slate-500 mt-1">Manage dropdown options for Run Setup.</p>
        <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-sm">
            <strong>Note:</strong> Commodities are managed in the <span className="font-semibold">Manage Commodities</span> page to ensure they are linked to size data.
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-1/4 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              type="button"
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setNewItem(''); }}
              className={`px-4 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:w-3/4">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            Manage {tabs.find(t => t.key === activeTab)?.label}
          </h3>

          <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
            <Input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Add new ${tabs.find(t => t.key === activeTab)?.label.slice(0, -1)}`}
              className="flex-grow"
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 max-h-[500px] overflow-y-auto">
            {(runConfig[activeTab] && runConfig[activeTab].length > 0) ? (
              <ul className="space-y-2">
                {runConfig[activeTab].map((item) => (
                  <li key={item} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                    <span className="text-slate-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-center py-4">No items found. Add one to get started.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ManageRunInfoPage;


import React, { useState } from 'react';
import { Run, Delivery } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ManageDataPageProps {
  runs: Run[];
  deliveries: Delivery[];
  onEditRun: (run: Run) => void;
  onDeleteRun: (runId: string) => void;
  onEditDelivery: (delivery: Delivery) => void;
  onDeleteDelivery: (deliveryId: string) => void;
}

const ManageDataPage: React.FC<ManageDataPageProps> = ({ 
    runs, deliveries, onEditRun, onDeleteRun, onEditDelivery, onDeleteDelivery 
}) => {
  const [activeTab, setActiveTab] = useState<'runs' | 'deliveries'>('runs');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRuns = runs.filter(run => 
    run.runNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    run.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    run.puc.includes(searchTerm)
  );

  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.deliveryNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.puc.includes(searchTerm)
  );

  return (
    <Card>
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-green-400">Manage Data</h2>
        <p className="text-slate-400 mt-1">Edit or delete Runs and Ontvangs QC entries.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-4 py-2 rounded-lg transition-colors font-semibold ${activeTab === 'runs' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          Runs ({runs.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-lg transition-colors font-semibold ${activeTab === 'deliveries' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          Deliveries ({deliveries.length})
        </button>
      </div>

      <div className="mb-6">
        <input 
            type="text" 
            placeholder="Search by ID, Farm, or PUC..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white text-black border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700 border border-slate-700 rounded-lg">
              <thead className="bg-slate-700">
                  <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Farm Info</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {activeTab === 'runs' ? (
                      filteredRuns.length > 0 ? filteredRuns.map(run => (
                          <tr key={run.id} className="hover:bg-slate-700/50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-400">{run.runNumber}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                  <div>{run.farmName}</div>
                                  <div className="text-xs text-slate-500">{run.puc} - {run.boord}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{run.commodity} ({run.variety})</td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                  <button onClick={() => onEditRun(run)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                  <button onClick={() => onDeleteRun(run.id)} className="text-red-400 hover:text-red-300">Delete</button>
                              </td>
                          </tr>
                      )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No runs found matching your search.</td></tr>
                  ) : (
                      filteredDeliveries.length > 0 ? filteredDeliveries.map(delivery => (
                        <tr key={delivery.id} className="hover:bg-slate-700/50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-400">{delivery.deliveryNote}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                <div>{delivery.farmName}</div>
                                <div className="text-xs text-slate-500">{delivery.puc} - {delivery.boord}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                {delivery.commodity} ({delivery.variety})
                                <div className="text-xs text-slate-500">{delivery.dateReceived}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button onClick={() => onEditDelivery(delivery)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                <button onClick={() => onDeleteDelivery(delivery.id)} className="text-red-400 hover:text-red-300">Delete</button>
                            </td>
                        </tr>
                      )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No deliveries found matching your search.</td></tr>
                  )}
              </tbody>
          </table>
      </div>
    </Card>
  );
};

export default ManageDataPage;
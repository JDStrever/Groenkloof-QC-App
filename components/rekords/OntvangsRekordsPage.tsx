
import React from 'react';
import { Delivery } from '../../types';
import Card from '../ui/Card';

interface OntvangsRekordsPageProps {
  deliveries: Delivery[];
  onSelectDelivery: (delivery: Delivery) => void;
}

const OntvangsRekordsPage: React.FC<OntvangsRekordsPageProps> = ({ deliveries, onSelectDelivery }) => {
  // Only show deliveries that have been completed (have an inspection date)
  const completedDeliveries = deliveries.filter(d => d.inspectionCompletedDate);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-400">Ontvangs Rekords</h2>
            <p className="text-slate-400 mt-2">Select a delivery to view the completed report.</p>
        </div>
      {completedDeliveries.length > 0 ? (
        <div className="space-y-4">
          {completedDeliveries.map(delivery => (
            <Card 
              key={delivery.id} 
              onClick={() => onSelectDelivery(delivery)}
              className="cursor-pointer hover:bg-slate-700 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-purple-500">Delivery: {delivery.deliveryNote}</h3>
                  <p className="text-slate-300">{delivery.farmName} ({delivery.boord}) - {delivery.variety}</p>
                   <p className="text-sm text-slate-400 mt-1">Completed: {delivery.inspectionCompletedDate}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h3 className="mt-4 text-xl font-semibold text-slate-300">No Records Found</h3>
            <p className="mt-1 text-slate-500">Only completed inspections appear here.</p>
        </div>
      )}
    </div>
  );
};

export default OntvangsRekordsPage;

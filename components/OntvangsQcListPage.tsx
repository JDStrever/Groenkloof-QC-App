import React from 'react';
import { Delivery } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface OntvangsQcListPageProps {
  deliveries: Delivery[];
  onSelectDelivery: (delivery: Delivery) => void;
  onSetupNewDelivery: () => void;
}

const OntvangsQcListPage: React.FC<OntvangsQcListPageProps> = ({ deliveries, onSelectDelivery, onSetupNewDelivery }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Select a Delivery</h2>
            <p className="text-slate-500 mt-2">Choose a delivery from the list below to enter QC data.</p>
        </div>
      {deliveries.length > 0 ? (
        <div className="space-y-4">
          {deliveries.map(delivery => (
            <Card 
              key={delivery.id} 
              onClick={() => onSelectDelivery(delivery)}
              className="cursor-pointer hover:bg-slate-50 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-purple-600">Delivery: {delivery.deliveryNote}</h3>
                  <p className="text-slate-600">{delivery.farmName} ({delivery.boord}) - {delivery.variety} ({delivery.dateReceived})</p>
                  {delivery.inspectionCompletedDate && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="-ml-1 mr-1.5 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Completed: {delivery.inspectionCompletedDate}
                      </span>
                    </div>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No Deliveries Found</h3>
            <p className="mt-1 text-slate-500">Get started by setting up a new fruit delivery.</p>
            <div className="mt-6">
                <Button onClick={onSetupNewDelivery}>Setup New Delivery</Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default OntvangsQcListPage;
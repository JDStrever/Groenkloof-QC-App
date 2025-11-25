
import React from 'react';
import { Run } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface QcListPageProps {
  runs: Run[];
  onSelectRun: (run: Run) => void;
  onSetupNewRun: () => void;
}

const QcListPage: React.FC<QcListPageProps> = ({ runs, onSelectRun, onSetupNewRun }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Select a Run</h2>
            <p className="text-slate-500 mt-2">Choose a run from the list below to enter QC data.</p>
        </div>
      {runs.length > 0 ? (
        <div className="space-y-4">
          {runs.map(run => (
            <Card 
              key={run.id} 
              onClick={() => onSelectRun(run)}
              className="cursor-pointer hover:bg-slate-50 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-orange-600">Run: {run.runNumber}</h3>
                  <p className="text-slate-600">{run.farmName} ({run.boord}) - {run.variety}</p>
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
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No Runs Found</h3>
            <p className="mt-1 text-slate-500">Get started by setting up a new production run.</p>
            <div className="mt-6">
                <Button onClick={onSetupNewRun}>Setup New Run</Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default QcListPage;

import React from 'react';
import { Run } from '../../types';
import Card from '../ui/Card';

interface RunRekordsPageProps {
  runs: Run[];
  onSelectRun: (run: Run) => void;
}

const RunRekordsPage: React.FC<RunRekordsPageProps> = ({ runs, onSelectRun }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-400">Run Rekords</h2>
            <p className="text-slate-400 mt-2">Select a run to view approved records.</p>
        </div>
      {runs.length > 0 ? (
        <div className="space-y-4">
          {runs.map(run => (
            <Card 
              key={run.id} 
              onClick={() => onSelectRun(run)}
              className="cursor-pointer hover:bg-slate-700 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-orange-500">Run: {run.runNumber}</h3>
                  <p className="text-slate-300">{run.farmName} ({run.boord}) - {run.variety}</p>
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
             <h3 className="mt-4 text-xl font-semibold text-slate-300">No Runs Found</h3>
        </div>
      )}
    </div>
  );
};

export default RunRekordsPage;

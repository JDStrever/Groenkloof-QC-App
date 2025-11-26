
import React from 'react';
import { Run, View } from '../types';
import Card from './ui/Card';

interface QcRunPageProps {
  run: Run;
  onNavigate: (view: View) => void;
}

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-slate-700 rounded-lg p-3 text-center border border-slate-600">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-100">{value}</p>
    </div>
);

const QCMenuCard: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
    <Card 
        onClick={onClick}
        className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center p-6 hover:bg-slate-700"
    >
        {children}
        <h3 className="text-xl font-semibold mt-4 text-slate-100">{title}</h3>
    </Card>
);

const QcRunPage: React.FC<QcRunPageProps> = ({ run, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <div className="border-b border-slate-700 pb-6 mb-6">
                <h2 className="text-3xl font-bold text-green-400">QC for Run: {run.runNumber}</h2>
                <p className="text-slate-400 mt-1">Select a quality control task for this run.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <InfoPill label="Farm Name" value={run.farmName} />
                <InfoPill label="PUC" value={run.puc} />
                <InfoPill label="Boord" value={run.boord} />
                <InfoPill label="Exporter" value={run.exporter} />
                <InfoPill label="Commodity" value={run.commodity} />
                <InfoPill label="Variety" value={run.variety} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <QCMenuCard title="Sizing" onClick={() => onNavigate(View.SIZING)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="8" cy="12" r="5" />
                        <circle cx="17" cy="12" r="3" />
                    </svg>
                </QCMenuCard>
                <QCMenuCard title="Karton gewigte" onClick={() => onNavigate(View.CARTON_WEIGHTS)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </QCMenuCard>
                <QCMenuCard title="Karton evaluering" onClick={() => onNavigate(View.CARTON_EVALUATION)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </QCMenuCard>
                <QCMenuCard title="Klas evaluering" onClick={() => onNavigate(View.CLASS_EVALUATION)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </QCMenuCard>
                <QCMenuCard title="Kwaliteit opsomming" onClick={() => onNavigate(View.QUALITY_SUMMARY)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </QCMenuCard>
                <QCMenuCard title="Final pallet QC" onClick={() => onNavigate(View.FINAL_PALLET_QC)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </QCMenuCard>
            </div>
        </Card>
    </div>
  );
};

export default QcRunPage;

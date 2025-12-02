
import React from 'react';
import { View } from '../types';
import Card from './ui/Card';

interface RekordsPageProps {
  onNavigate: (view: View) => void;
}

const RekordsPage: React.FC<RekordsPageProps> = ({ onNavigate }) => {
  return (
    <div className="text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-4">Rekords</h2>
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">Select which records you want to view.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card
                onClick={() => onNavigate(View.REKORDS_RUN_LIST)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out hover:bg-slate-700"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Run Rekords</h3>
                <p className="text-slate-400">View approved QC entries for production runs.</p>
            </Card>

            <Card
                onClick={() => onNavigate(View.REKORDS_ONTVANGS_LIST)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out hover:bg-slate-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Ontvangs Rekords</h3>
                <p className="text-slate-400">View completed Ontvangs QC forms.</p>
            </Card>
        </div>
    </div>
  );
};

export default RekordsPage;

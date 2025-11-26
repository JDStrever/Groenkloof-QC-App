
import React from 'react';
import { View } from '../types';
import Card from './ui/Card';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

const SetupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const QCIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const FarmIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const DeliveryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16h2a2 2 0 002-2V7a2 2 0 00-2-2h-2v11z" />
    </svg>
);

const MrlIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Welcome</h2>
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">Select an option to begin tracking quality control data for your citrus runs.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card
                onClick={() => onNavigate(View.RUN_SETUP)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out hover:bg-slate-700"
            >
                <SetupIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Run Setup</h3>
                <p className="text-slate-400">Create and configure new production runs before they are packed.</p>
            </Card>

            <Card
                onClick={() => onNavigate(View.QC_LIST)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out hover:bg-slate-700"
            >
                <QCIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">QC Data Entry</h3>
                <p className="text-slate-400">Select an active run and enter quality control inspection data.</p>
            </Card>
            
            <Card
                onClick={() => onNavigate(View.PLAAS_SETUP)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out hover:bg-slate-700"
            >
                <FarmIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Plaas Setup</h3>
                <p className="text-slate-400">Log new fruit deliveries from farms with delivery notes.</p>
            </Card>

            <Card
                onClick={() => onNavigate(View.ONTVANGS_QC_LIST)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out hover:bg-slate-700"
            >
                <DeliveryIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Ontvangs QC</h3>
                <p className="text-slate-400">Perform quality checks on newly received fruit deliveries.</p>
            </Card>

             <Card
                onClick={() => onNavigate(View.MRL)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out md:col-span-2 hover:bg-slate-700"
            >
                <MrlIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">MRL'e</h3>
                <p className="text-slate-400">Manage Maximum Residue Limits for different markets.</p>
            </Card>
        </div>
    </div>
  );
};

export default HomePage;

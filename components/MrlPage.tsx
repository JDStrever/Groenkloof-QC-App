
import React from 'react';
import { View } from '../types';
import Card from './ui/Card';

interface MrlPageProps {
  onNavigate: (view: View) => void;
}

const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);


const MrlPage: React.FC<MrlPageProps> = ({ onNavigate }) => {
  return (
    <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-700 mb-4">MRL Management</h2>
        <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">Add new MRL records or view existing ones.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card
                onClick={() => onNavigate(View.MRL_ADD)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out"
            >
                <AddIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-800">Add MRL</h3>
                <p className="text-slate-500">Create a new MRL record with lab results.</p>
            </Card>

            <Card
                onClick={() => onNavigate(View.MRL_LIST)}
                className="cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out"
            >
                <ListIcon />
                <h3 className="text-2xl font-semibold mb-2 text-slate-800">MRL Records</h3>
                <p className="text-slate-500">View, manage, and export existing MRL records.</p>
            </Card>
        </div>
    </div>
  );
};

export default MrlPage;

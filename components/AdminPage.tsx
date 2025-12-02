
import React from 'react';
import { View, User } from '../types';
import Card from './ui/Card';

interface AdminPageProps {
  onNavigate: (view: View) => void;
  currentUser: User | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, currentUser }) => {
  const permissions = currentUser?.permissions || [];
  const isAdmin = permissions.includes(View.ADMIN);

  const canViewCommodities = isAdmin || permissions.includes(View.ADMIN_COMMODITIES);
  const canViewCartons = isAdmin || permissions.includes(View.ADMIN_CARTONS);
  const canViewRunInfo = isAdmin || permissions.includes(View.ADMIN_RUN_INFO);
  const canViewUsers = isAdmin || permissions.includes(View.ADMIN_USERS);
  const canViewData = isAdmin || permissions.includes(View.ADMIN_DATA);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-400">Admin Panel</h2>
        <p className="text-slate-400 mt-2">Manage application settings and data.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canViewCommodities && (
            <Card
            onClick={() => onNavigate(View.ADMIN_COMMODITIES)}
            className="cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
            <div className="flex items-center space-x-4">
                <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10l8 4 8-4V7l-8-4-8 4z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12l8 4 8-4"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22V12"></path>
                </svg>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-slate-100">Manage Commodities</h3>
                <p className="text-slate-400">Add, edit, or remove commodities and their size specifications.</p>
                </div>
            </div>
            </Card>
        )}
        
        {canViewCartons && (
            <Card
            onClick={() => onNavigate(View.ADMIN_CARTONS)}
            className="cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
            <div className="flex items-center space-x-4">
                <div className="bg-green-900/50 p-3 rounded-lg border border-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-slate-100">Manage Kartonne</h3>
                <p className="text-slate-400">Define fruit classes and box types for different commodities.</p>
                </div>
            </div>
            </Card>
        )}

        {canViewRunInfo && (
            <Card
            onClick={() => onNavigate(View.ADMIN_RUN_INFO)}
            className="cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
            <div className="flex items-center space-x-4">
                <div className="bg-orange-900/50 p-3 rounded-lg border border-orange-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-slate-100">Manage Run Info</h3>
                <p className="text-slate-400">Edit dropdown options for run setup (Farms, PUCs, etc.).</p>
                </div>
            </div>
            </Card>
        )}

        {canViewUsers && (
            <Card
            onClick={() => onNavigate(View.ADMIN_USERS)}
            className="cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
            <div className="flex items-center space-x-4">
                <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" />
                    </svg>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-slate-100">Manage Users</h3>
                <p className="text-slate-400">Add new users and manage their access permissions.</p>
                </div>
            </div>
            </Card>
        )}

        {canViewData && (
            <Card
            onClick={() => onNavigate(View.ADMIN_DATA)}
            className="cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
            <div className="flex items-center space-x-4">
                <div className="bg-red-900/50 p-3 rounded-lg border border-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-slate-100">Manage Data</h3>
                <p className="text-slate-400">Edit or delete existing runs and deliveries.</p>
                </div>
            </div>
            </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
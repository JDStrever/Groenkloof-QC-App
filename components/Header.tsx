import React from 'react';
import { View, User } from '../types';

interface HeaderProps {
    currentView: View;
    onNavigateHome: () => void;
    onNavigateBack?: () => void;
    onNavigateAdmin: () => void;
    currentUser: User | null;
    onLogout: () => void;
}

const CitrusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.636 6.636a.5.5 0 01.707 0L10 9.293l2.657-2.657a.5.5 0 01.707.707L10.707 10l2.657 2.657a.5.5 0 01-.707.707L10 10.707l-2.657 2.657a.5.5 0 01-.707-.707L9.293 10 6.636 7.343a.5.5 0 010-.707z" clipRule="evenodd" />
        <path d="M10 2a.5.5 0 01.5.5V4a.5.5 0 01-1 0V2.5A.5.5 0 0110 2zM13.5 4.793a.5.5 0 01.354.146l1.06 1.06a.5.5 0 01-.707.708L13.146 5.646a.5.5 0 01.354-.853z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ currentView, onNavigateHome, onNavigateBack, onNavigateAdmin, currentUser, onLogout }) => {
    const showAdminButton = currentUser && currentUser.permissions.includes(View.ADMIN);

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {onNavigateBack && (
                        <button 
                            onClick={onNavigateBack} 
                            className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                            aria-label="Go back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                     <div className="flex items-center space-x-2 cursor-pointer" onClick={onNavigateHome}>
                        <CitrusIcon />
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                            Groenkloof QC App
                        </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {currentUser && (
                        <>
                            <span className="text-sm text-slate-600 hidden sm:block">Welcome, <span className="font-bold">{currentUser.username}</span></span>
                            {showAdminButton && (
                                <button 
                                    onClick={onNavigateAdmin} 
                                    className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                                    aria-label="Go to Admin"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            )}
                             <button 
                                onClick={onLogout} 
                                className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                                aria-label="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
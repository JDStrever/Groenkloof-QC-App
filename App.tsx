
import React, { useState, useEffect } from 'react';
import { View, Run, Delivery, ExternalQualityData, DefectsData, InternalQualityData, SizingData, CommodityData, CartonConfig, CartonWeightSample, CartonEvaluationSample, FinalPalletQcData, ClassEvaluationSample, SizingEntry, CartonWeightsEntry, CartonEvaluationEntry, ClassEvaluationEntry, FinalPalletQcEntry, User, MrlRecord, RunConfig } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RunSetupPage from './components/RunSetupPage';
import QcListPage from './components/QcListPage';
import QcRunPage from './components/QcRunPage';
import PlaasSetupPage from './components/PlaasSetupPage';
import OntvangsQcListPage from './components/OntvangsQcListPage';
import OntvangsQcPage from './components/OntvangsQcPage';
import SizingPage from './components/qc/SizingPage';
import CartonWeightsPage from './components/qc/CartonWeightsPage';
import CartonEvaluationPage from './components/qc/CartonEvaluationPage';
import ClassEvaluationPage from './components/qc/ClassEvaluationPage';
import QualitySummaryPage from './components/qc/QualitySummaryPage';
import FinalPalletQcPage from './components/qc/FinalPalletQcPage';
import AdminPage from './components/AdminPage';
import CommodityManagementPage from './components/admin/CommodityManagementPage';
import ManageCartonsPage from './components/admin/ManageCartonsPage';
import ManageRunInfoPage from './components/admin/ManageRunInfoPage';
import { COMMODITY_SIZES as DEFAULT_COMMODITY_SIZES } from './constants/commoditySizes';
import { DEFAULT_CARTON_CONFIG } from './constants/cartonConfig';
import MrlPage from './components/MrlPage';
import LoginPage from './components/LoginPage';
import UserManagementPage from './components/admin/UserManagementPage';
import AddMrlPage from './components/mrl/AddMrlPage';
import MrlListPage from './components/mrl/MrlListPage';

const PROTECTED_VIEWS: View[] = [
    View.RUN_SETUP, View.QC_LIST, View.PLAAS_SETUP, View.ONTVANGS_QC_LIST, View.MRL, View.MRL_LIST, View.MRL_ADD, View.ADMIN, View.QUALITY_SUMMARY
];

const DEFAULT_RUN_CONFIG: RunConfig = {
    pucOptions: ['100256', '200123'],
    farmNameOptions: ['Sunnyvale Orchards', 'Green Valley Farms'],
    boordOptions: ['Block A', 'Block B', 'East Field'],
    exporterOptions: ['Citrus World Inc.', 'Global Fruits'],
    varietyOptions: ['Valencia', 'Navel', 'Star Ruby', 'Eureka']
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [runs, setRuns] = useState<Run[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [mrlRecords, setMrlRecords] = useState<MrlRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [commodityData, setCommodityData] = useState<CommodityData>({});
  const [cartonConfig, setCartonConfig] = useState<CartonConfig>(DEFAULT_CARTON_CONFIG);
  const [runConfig, setRunConfig] = useState<RunConfig>(DEFAULT_RUN_CONFIG);
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [entryToView, setEntryToView] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);


  useEffect(() => {
    try {
        const storedCommodityData = localStorage.getItem('commodityData');
        if (storedCommodityData) setCommodityData(JSON.parse(storedCommodityData));
        else {
            setCommodityData(DEFAULT_COMMODITY_SIZES);
            localStorage.setItem('commodityData', JSON.stringify(DEFAULT_COMMODITY_SIZES));
        }

        const storedCartonConfig = localStorage.getItem('cartonConfig');
        if (storedCartonConfig) setCartonConfig(JSON.parse(storedCartonConfig));
        else {
            setCartonConfig(DEFAULT_CARTON_CONFIG);
            localStorage.setItem('cartonConfig', JSON.stringify(DEFAULT_CARTON_CONFIG));
        }

        const storedRunConfig = localStorage.getItem('runConfig');
        if (storedRunConfig) setRunConfig(JSON.parse(storedRunConfig));
        else {
            setRunConfig(DEFAULT_RUN_CONFIG);
            localStorage.setItem('runConfig', JSON.stringify(DEFAULT_RUN_CONFIG));
        }

        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            const initialAdmin: User = {
                id: 'user-admin-jd',
                username: 'JD',
                password: 'JD',
                permissions: Object.values(View)
            };
            const initialUsers = [initialAdmin];
            setUsers(initialUsers);
            localStorage.setItem('users', JSON.stringify(initialUsers));
        }

        const storedMrlRecords = localStorage.getItem('mrlRecords');
        if (storedMrlRecords) {
            setMrlRecords(JSON.parse(storedMrlRecords));
        }

        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            setCurrentUser(JSON.parse(sessionUser));
        } else {
            setCurrentView(View.LOGIN);
        }

    } catch (error) {
        console.error("Failed to load or parse data from localStorage", error);
        setCommodityData(DEFAULT_COMMODITY_SIZES);
        setCartonConfig(DEFAULT_CARTON_CONFIG);
    }
  }, []);


  const handleCommodityDataUpdate = (newCommodityData: CommodityData) => {
    setCommodityData(newCommodityData);
    localStorage.setItem('commodityData', JSON.stringify(newCommodityData));
  };

  const handleCartonConfigUpdate = (newCartonConfig: CartonConfig) => {
    setCartonConfig(newCartonConfig);
    localStorage.setItem('cartonConfig', JSON.stringify(newCartonConfig));
  };
  
  const handleRunConfigUpdate = (newRunConfig: RunConfig) => {
      setRunConfig(newRunConfig);
      localStorage.setItem('runConfig', JSON.stringify(newRunConfig));
  }
  
  const handleUsersUpdate = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }

  const handleNavigate = (view: View, readOnly: boolean = false, entry: any = null) => {
    const isProtected = PROTECTED_VIEWS.includes(view) || view.startsWith('ADMIN');
    
    if (isProtected && !currentUser) {
        alert('You must be logged in to access this page.');
        setCurrentView(View.LOGIN);
        return;
    }

    if (currentUser && isProtected && !currentUser.permissions.includes(view)) {
        alert('You do not have permission to access this page.');
        return; 
    }
    
    if (readOnly) setEntryToView(entry);
    else setEntryToView(null);
    
    setIsReadOnlyView(readOnly);
    setCurrentView(view);
  };

  const handleNavigateHome = () => {
    setCurrentView(View.HOME);
    setSelectedRun(null);
    setSelectedDelivery(null);
  };
  
  const handleNavigateBack = () => {
    const qcRunDetailViews = new Set([ View.SIZING, View.CARTON_WEIGHTS, View.CARTON_EVALUATION, View.CLASS_EVALUATION, View.FINAL_PALLET_QC ]);

    if (qcRunDetailViews.has(currentView) && isReadOnlyView) handleNavigate(View.QUALITY_SUMMARY);
    else if (currentView === View.QUALITY_SUMMARY || (qcRunDetailViews.has(currentView) && !isReadOnlyView)) setCurrentView(View.QC_RUN);
    else if (currentView === View.QC_RUN) { setSelectedRun(null); setCurrentView(View.QC_LIST); }
    else if (currentView === View.ONTVANGS_QC) { setSelectedDelivery(null); setCurrentView(View.ONTVANGS_QC_LIST); }
    else if (currentView === View.ADMIN_COMMODITIES || currentView === View.ADMIN_CARTONS || currentView === View.ADMIN_USERS || currentView === View.ADMIN_RUN_INFO) setCurrentView(View.ADMIN);
    else if (currentView === View.MRL_ADD || currentView === View.MRL_LIST) setCurrentView(View.MRL);
    else if (currentView !== View.HOME) setCurrentView(View.HOME);
  };

  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        handleNavigateHome();
        return true;
    }
    alert('Invalid credentials');
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    setCurrentView(View.LOGIN);
  };

  const handleRunCreated = (newRunData: Omit<Run, 'id'>) => {
    const newRun: Run = { ...newRunData, id: `run-${Date.now()}` };
    setRuns(prev => [...prev, newRun]);
    setCurrentView(View.QC_LIST);
  };

  const handleDeliveryCreated = (newDeliveryData: Omit<Delivery, 'id'>) => {
    const newDelivery: Delivery = { ...newDeliveryData, id: `delivery-${Date.now()}` };
    setDeliveries(prev => [...prev, newDelivery]);
    setCurrentView(View.ONTVANGS_QC_LIST);
  };

  const handleMrlRecordCreated = (newRecordData: Omit<MrlRecord, 'id'>) => {
    const newRecord: MrlRecord = { ...newRecordData, id: `mrl-${Date.now()}` };
    const updatedRecords = [...mrlRecords, newRecord];
    setMrlRecords(updatedRecords);
    localStorage.setItem('mrlRecords', JSON.stringify(updatedRecords));
    setCurrentView(View.MRL_LIST);
  };

  const handleSelectRun = (run: Run) => {
    setSelectedRun(run);
    setCurrentView(View.QC_RUN);
  };

  const handleSelectDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setCurrentView(View.ONTVANGS_QC);
  };

  const handleSaveInspection = (deliveryId: string, qualityData: ExternalQualityData, defectsData: DefectsData, internalQualityData: InternalQualityData, photos: string[]) => {
    const newDeliveries = deliveries.map(d => 
      d.id === deliveryId ? { ...d, externalQuality: qualityData, defects: defectsData, internalQuality: internalQualityData, photos: photos, inspectionCompletedDate: new Date().toISOString().split('T')[0] } : d
    );
    setDeliveries(newDeliveries);
    const updatedDelivery = newDeliveries.find(d => d.id === deliveryId);
    if (updatedDelivery) setSelectedDelivery(updatedDelivery);
    alert('Inspection data saved successfully!');
  };

  const handleSaveSizing = (runId: string, sizingData: SizingData) => {
    const newEntry: SizingEntry = { id: `sizing-${Date.now()}`, timestamp: new Date().toISOString(), data: sizingData, approvalDetails: { status: 'pending' } };
    const newRuns = runs.map(r => r.id === runId ? { ...r, sizingData: [...(r.sizingData || []), newEntry] } : r);
    setRuns(newRuns);
    setSelectedRun(newRuns.find(r => r.id === runId) || null);
    setCurrentView(View.QC_RUN);
  };

  const handleSaveCartonWeights = (runId: string, cartonWeights: CartonWeightSample[]) => {
    const newEntry: CartonWeightsEntry = { id: `cartonweights-${Date.now()}`, timestamp: new Date().toISOString(), samples: cartonWeights, approvalDetails: { status: 'pending' } };
    const newRuns = runs.map(r => r.id === runId ? { ...r, cartonWeights: [...(r.cartonWeights || []), newEntry] } : r);
    setRuns(newRuns);
    setSelectedRun(newRuns.find(r => r.id === runId) || null);
    setCurrentView(View.QC_RUN);
  };

  const handleSaveCartonEvaluation = (runId: string, cartonEvaluations: CartonEvaluationSample[]) => {
    const newEntry: CartonEvaluationEntry = { id: `cartoneval-${Date.now()}`, timestamp: new Date().toISOString(), samples: cartonEvaluations, approvalDetails: { status: 'pending' } };
    const newRuns = runs.map(r => r.id === runId ? { ...r, cartonEvaluations: [...(r.cartonEvaluations || []), newEntry] } : r);
    setRuns(newRuns);
    setSelectedRun(newRuns.find(r => r.id === runId) || null);
    setCurrentView(View.QC_RUN);
  };

  const handleSaveClassEvaluation = (runId: string, classEvaluations: ClassEvaluationSample[]) => {
     const newEntry: ClassEvaluationEntry = { id: `classeval-${Date.now()}`, timestamp: new Date().toISOString(), samples: classEvaluations, approvalDetails: { status: 'pending' } };
    const newRuns = runs.map(r => r.id === runId ? { ...r, classEvaluations: [...(r.classEvaluations || []), newEntry] } : r);
    setRuns(newRuns);
    setSelectedRun(newRuns.find(r => r.id === runId) || null);
    setCurrentView(View.QC_RUN);
  };

  const handleSaveFinalPalletQc = (runId: string, finalPalletQc: FinalPalletQcData[]) => {
    const newEntry: FinalPalletQcEntry = { id: `palletqc-${Date.now()}`, timestamp: new Date().toISOString(), pallets: finalPalletQc, approvalDetails: { status: 'pending' } };
    const newRuns = runs.map(r => r.id === runId ? { ...r, finalPalletQc: [...(r.finalPalletQc || []), newEntry] } : r);
    setRuns(newRuns);
    setSelectedRun(newRuns.find(r => r.id === runId) || null);
    setCurrentView(View.QC_RUN);
  };

  const handleApproveQc = (runId: string, qcType: keyof Omit<Run, 'id' | 'runNumber' | 'puc' | 'farmName' | 'boord' | 'exporter' | 'commodity' | 'variety'>, entryId: string, username: string) => {
    const newRuns = runs.map(r => {
        if (r.id === runId) {
            const updatedRun = { ...r };
            const entries = (updatedRun[qcType] as any[]) || [];
            const updatedEntries = entries.map(entry => {
                if (entry.id === entryId) {
                    return { ...entry, approvalDetails: { status: 'approved' as const, approvedBy: username } };
                }
                return entry;
            });
            (updatedRun as any)[qcType] = updatedEntries;
            return updatedRun;
        }
        return r;
    });
    setRuns(newRuns);
    const updatedRun = newRuns.find(r => r.id === runId);
    setSelectedRun(updatedRun || null);
    if(updatedRun) handleNavigate(View.QUALITY_SUMMARY, false);
  };


  const renderContent = () => {
    if (!currentUser) return <LoginPage onLogin={handleLogin} />;

    switch (currentView) {
      case View.RUN_SETUP:
        return <RunSetupPage onRunCreated={handleRunCreated} runConfig={runConfig} commodityData={commodityData} />;
      case View.QC_LIST:
        return <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.QC_RUN:
        return selectedRun ? <QcRunPage run={selectedRun} onNavigate={(view) => handleNavigate(view, false)} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.PLAAS_SETUP:
        return <PlaasSetupPage onDeliveryCreated={handleDeliveryCreated} />;
      case View.ONTVANGS_QC_LIST:
          return <OntvangsQcListPage deliveries={deliveries} onSelectDelivery={handleSelectDelivery} onSetupNewDelivery={() => handleNavigate(View.PLAAS_SETUP)} />;
      case View.ONTVANGS_QC:
          return selectedDelivery ? <OntvangsQcPage delivery={selectedDelivery} onSaveInspection={(qualityData, defectsData, internalQualityData, photos) => handleSaveInspection(selectedDelivery.id, qualityData, defectsData, internalQualityData, photos)} commodityData={commodityData} /> : <OntvangsQcListPage deliveries={deliveries} onSelectDelivery={handleSelectDelivery} onSetupNewDelivery={() => handleNavigate(View.PLAAS_SETUP)} />;
      case View.SIZING:
        return selectedRun ? <SizingPage run={selectedRun} onSaveSizing={handleSaveSizing} commodityData={commodityData} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.CARTON_WEIGHTS:
        return selectedRun ? <CartonWeightsPage run={selectedRun} onSaveCartonWeights={handleSaveCartonWeights} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.CARTON_EVALUATION:
        return selectedRun ? <CartonEvaluationPage run={selectedRun} onSaveCartonEvaluation={handleSaveCartonEvaluation} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.CLASS_EVALUATION:
        return selectedRun ? <ClassEvaluationPage run={selectedRun} onSaveClassEvaluation={handleSaveClassEvaluation} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.QUALITY_SUMMARY:
        return selectedRun ? <QualitySummaryPage run={selectedRun} onViewDetails={(view, entry) => handleNavigate(view, true, entry)} commodityData={commodityData} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.FINAL_PALLET_QC:
        return selectedRun ? <FinalPalletQcPage run={selectedRun} onSave={handleSaveFinalPalletQc} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.ADMIN:
        return <AdminPage onNavigate={handleNavigate} />;
      case View.ADMIN_COMMODITIES:
        return <CommodityManagementPage initialCommodityData={commodityData} onUpdate={handleCommodityDataUpdate} />;
      case View.ADMIN_CARTONS:
        return <ManageCartonsPage initialCartonConfig={cartonConfig} onUpdate={handleCartonConfigUpdate} commodityData={commodityData} />;
      case View.ADMIN_USERS:
        return <UserManagementPage users={users} onUpdateUsers={handleUsersUpdate} />;
      case View.ADMIN_RUN_INFO:
        return <ManageRunInfoPage runConfig={runConfig} onUpdate={handleRunConfigUpdate} />;
      case View.MRL:
        return <MrlPage onNavigate={handleNavigate} />;
      case View.MRL_ADD:
        return <AddMrlPage onRecordCreated={handleMrlRecordCreated} />;
      case View.MRL_LIST:
        return <MrlListPage records={mrlRecords} onNavigate={handleNavigate} />;
      case View.LOGIN:
         return <LoginPage onLogin={handleLogin} />;
      case View.HOME:
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header 
        currentView={currentView}
        onNavigateHome={handleNavigateHome} 
        onNavigateBack={currentView !== View.HOME && currentView !== View.LOGIN ? handleNavigateBack : undefined}
        onNavigateAdmin={() => handleNavigate(View.ADMIN)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

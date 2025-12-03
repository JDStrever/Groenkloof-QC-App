import React, { useState, useEffect } from 'react';
import { View, Run, Delivery, ExternalQualityData, DefectsData, InternalQualityData, SizingData, CommodityData, CartonConfig, CartonWeightSample, CartonEvaluationSample, FinalPalletQcData, ClassEvaluationSample, SizingEntry, CartonWeightsEntry, CartonEvaluationEntry, ClassEvaluationEntry, FinalPalletQcEntry, User, MrlRecord, RunConfig, ShelfLifeBucket } from './types';
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
import ShelfLifePage from './components/qc/ShelfLifePage';
import AdminPage from './components/AdminPage';
import CommodityManagementPage from './components/admin/CommodityManagementPage';
import ManageCartonsPage from './components/admin/ManageCartonsPage';
import ManageRunInfoPage from './components/admin/ManageRunInfoPage';
import { COMMODITY_SIZES as DEFAULT_COMMODITY_SIZES } from './constants/commoditySizes';
import { DEFAULT_CARTON_CONFIG } from './constants/cartonConfig';
import MrlPage from './components/MrlPage';
import LoginPage from './components/LoginPage';
import UserManagementPage from './components/admin/UserManagementPage';
import ManageDataPage from './components/admin/ManageDataPage';
import AddMrlPage from './components/mrl/AddMrlPage';
import MrlListPage from './components/mrl/MrlListPage';
import RekordsPage from './components/RekordsPage';
import RunRekordsPage from './components/rekords/RunRekordsPage';
import RunRekordsDetailsPage from './components/rekords/RunRekordsDetailsPage';
import OntvangsRekordsPage from './components/rekords/OntvangsRekordsPage';
import * as supabaseStorage from './utils/supabaseStorage';
import { supabase } from './supabaseClient';

const PROTECTED_VIEWS: View[] = [
    View.RUN_SETUP, View.QC_LIST, View.PLAAS_SETUP, View.ONTVANGS_QC_LIST, View.MRL, View.MRL_LIST, View.MRL_ADD, View.ADMIN, View.QUALITY_SUMMARY,
    View.REKORDS, View.REKORDS_RUN_LIST, View.REKORDS_RUN_DETAILS, View.REKORDS_ONTVANGS_LIST, View.SHELF_LIFE
];

const DEFAULT_RUN_CONFIG: RunConfig = {
    pucOptions: ['100256', '200123'],
    farmNameOptions: ['Sunnyvale Orchards', 'Green Valley Farms'],
    boordOptions: ['Block A', 'Block B', 'East Field'],
    exporterOptions: ['Citrus World Inc.', 'Global Fruits'],
    varietyOptions: ['Valencia', 'Navel', 'Star Ruby', 'Eureka']
};

const INITIAL_ADMIN: User = {
    id: 'user-admin-jd',
    username: 'JD',
    password: 'JD',
    permissions: Object.values(View)
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [runs, setRuns] = useState<Run[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [mrlRecords, setMrlRecords] = useState<MrlRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [commodityData, setCommodityData] = useState<CommodityData>(DEFAULT_COMMODITY_SIZES);
  const [cartonConfig, setCartonConfig] = useState<CartonConfig>(DEFAULT_CARTON_CONFIG);
  const [runConfig, setRunConfig] = useState<RunConfig>(DEFAULT_RUN_CONFIG);
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [entryToView, setEntryToView] = useState<any>(null);
  const [entryToEdit, setEntryToEdit] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Data from Supabase on Mount
  useEffect(() => {
    const loadData = async () => {
        try {
            // Parallel fetching for performance
            const [
                fetchedRuns,
                fetchedDeliveries,
                fetchedMrls,
                fetchedCommodityData,
                fetchedCartonConfig,
                fetchedRunConfig,
                fetchedUsers
            ] = await Promise.all([
                supabaseStorage.fetchRuns(),
                supabaseStorage.fetchDeliveries(),
                supabaseStorage.fetchMrls(),
                supabaseStorage.fetchSetting<CommodityData>('commodityData', DEFAULT_COMMODITY_SIZES),
                supabaseStorage.fetchSetting<CartonConfig>('cartonConfig', DEFAULT_CARTON_CONFIG),
                supabaseStorage.fetchSetting<RunConfig>('runConfig', DEFAULT_RUN_CONFIG),
                supabaseStorage.fetchSetting<User[]>('users', [INITIAL_ADMIN])
            ]);

            setRuns(fetchedRuns);
            setDeliveries(fetchedDeliveries);
            setMrlRecords(fetchedMrls);
            setCommodityData(fetchedCommodityData);
            setCartonConfig(fetchedCartonConfig);
            // Merge defaults with fetched config to ensure all keys exist
            setRunConfig({ ...DEFAULT_RUN_CONFIG, ...fetchedRunConfig });
            setUsers(fetchedUsers);

            // Handle session persistence
            const sessionUser = sessionStorage.getItem('currentUser');
            if (sessionUser) {
                try {
                    const parsedUser = JSON.parse(sessionUser);
                    // Validate if user still exists in fetched users
                    const validUser = fetchedUsers.find(u => u.username === parsedUser.username);
                    if (validUser) {
                        setCurrentUser(validUser);
                    } else {
                        sessionStorage.removeItem('currentUser');
                        setCurrentView(View.LOGIN);
                    }
                } catch (e) {
                    console.error("Error parsing session user", e);
                    sessionStorage.removeItem('currentUser');
                }
            }

        } catch (error) {
            console.error("Failed to load data from Supabase", error);
            alert("Failed to connect to the database. Please check your internet connection.");
        } finally {
            setIsLoading(false);
        }
    };
    loadData();

    // Set up Realtime Subscription
    const channel = supabase
      .channel('realtime:frutia_tables')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'frutia_runs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRun = supabaseStorage.mapRunFromDB(payload.new);
            setRuns(prev => {
                // Prevent duplicate if we added it optimistically
                if (prev.some(r => r.id === newRun.id)) return prev;
                return [newRun, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedRun = supabaseStorage.mapRunFromDB(payload.new);
            setRuns(prev => prev.map(r => r.id === updatedRun.id ? updatedRun : r));
            // Update selected run if it's the one currently being viewed
            setSelectedRun(prev => prev && prev.id === updatedRun.id ? updatedRun : prev);
          } else if (payload.eventType === 'DELETE') {
            setRuns(prev => prev.filter(r => r.id !== payload.old.id));
            setSelectedRun(prev => prev && prev.id === payload.old.id ? null : prev);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'frutia_deliveries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDelivery = supabaseStorage.mapDeliveryFromDB(payload.new);
            setDeliveries(prev => {
                 if (prev.some(d => d.id === newDelivery.id)) return prev;
                 return [newDelivery, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedDelivery = supabaseStorage.mapDeliveryFromDB(payload.new);
            setDeliveries(prev => prev.map(d => d.id === updatedDelivery.id ? updatedDelivery : d));
            setSelectedDelivery(prev => prev && prev.id === updatedDelivery.id ? updatedDelivery : prev);
          } else if (payload.eventType === 'DELETE') {
            setDeliveries(prev => prev.filter(d => d.id !== payload.old.id));
            setSelectedDelivery(prev => prev && prev.id === payload.old.id ? null : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);


  const handleCommodityDataUpdate = async (newCommodityData: CommodityData) => {
    setCommodityData(newCommodityData);
    await supabaseStorage.saveSetting('commodityData', newCommodityData);
  };

  const handleCartonConfigUpdate = async (newCartonConfig: CartonConfig) => {
    setCartonConfig(newCartonConfig);
    await supabaseStorage.saveSetting('cartonConfig', newCartonConfig);
  };
  
  const handleRunConfigUpdate = async (newRunConfig: RunConfig) => {
      setRunConfig(newRunConfig);
      await supabaseStorage.saveSetting('runConfig', newRunConfig);
  }
  
  const handleUsersUpdate = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    await supabaseStorage.saveSetting('users', updatedUsers);
  }

  const handleNavigate = (view: View, readOnly: boolean = false, entry: any = null) => {
    const isProtected = PROTECTED_VIEWS.includes(view) || view.startsWith('ADMIN');
    
    if (isProtected && !currentUser) {
        alert('You must be logged in to access this page.');
        setCurrentView(View.LOGIN);
        return;
    }

    // Reset edit state when navigating
    if (view !== View.RUN_SETUP && view !== View.PLAAS_SETUP) {
        setEntryToEdit(null);
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
    setEntryToEdit(null);
  };
  
  const handleNavigateBack = () => {
    const qcRunDetailViews = new Set([ View.SIZING, View.CARTON_WEIGHTS, View.CARTON_EVALUATION, View.CLASS_EVALUATION, View.FINAL_PALLET_QC, View.SHELF_LIFE ]);

    if (qcRunDetailViews.has(currentView) && isReadOnlyView) {
         setCurrentView(View.REKORDS_RUN_DETAILS); 
    } 
    else if (currentView === View.QUALITY_SUMMARY) handleNavigate(View.QC_RUN, false);
    else if (qcRunDetailViews.has(currentView) && !isReadOnlyView) setCurrentView(View.QC_RUN);
    else if (currentView === View.QC_RUN) { setSelectedRun(null); setCurrentView(View.QC_LIST); }
    else if (currentView === View.ONTVANGS_QC) { setSelectedDelivery(null); setCurrentView(View.ONTVANGS_QC_LIST); }
    else if (currentView === View.ADMIN_COMMODITIES || currentView === View.ADMIN_CARTONS || currentView === View.ADMIN_USERS || currentView === View.ADMIN_RUN_INFO || currentView === View.ADMIN_DATA) setCurrentView(View.ADMIN);
    else if (currentView === View.MRL_ADD || currentView === View.MRL_LIST) setCurrentView(View.MRL);
    // Rekords Navigation
    else if (currentView === View.REKORDS_RUN_LIST || currentView === View.REKORDS_ONTVANGS_LIST) setCurrentView(View.REKORDS);
    else if (currentView === View.REKORDS_RUN_DETAILS) setCurrentView(View.REKORDS_RUN_LIST);
    else if (currentView !== View.HOME) setCurrentView(View.HOME);
  };
  
  // Custom back handler for Sizing/etc pages when they are used in different contexts
  const handleDetailBack = () => {
       if (isReadOnlyView) {
           if (entryToView) {
           }
           setCurrentView(returnView); 
       } else {
           setCurrentView(View.QC_RUN);
       }
  }

  const [returnView, setReturnView] = useState<View>(View.QC_RUN);

  const navigateToDetail = (view: View, readOnly: boolean, entry: any, returnTo: View) => {
      setReturnView(returnTo);
      handleNavigate(view, readOnly, entry);
  }


  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
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

  const handleRunCreated = async (newRunData: Omit<Run, 'id'>) => {
    const newRun: Run = { ...newRunData, id: `run-${Date.now()}` };
    // Optimistic Update
    setRuns(prev => [newRun, ...prev]); 
    setCurrentView(View.QC_LIST);
    await supabaseStorage.createRun(newRun);
  };

  const handleRunUpdated = async (updatedRun: Run) => {
      // Optimistic Update
      setRuns(prev => prev.map(r => r.id === updatedRun.id ? updatedRun : r));
      setCurrentView(View.ADMIN_DATA);
      setEntryToEdit(null);
      await supabaseStorage.updateRun(updatedRun);
      alert('Run updated successfully!');
  };

  const handleDeleteRun = async (runId: string) => {
      if (window.confirm('Are you sure you want to delete this run and all its QC data? This cannot be undone.')) {
          setRuns(prev => prev.filter(r => r.id !== runId));
          await supabaseStorage.deleteRun(runId);
      }
  };

  const handleDeliveryCreated = async (newDeliveryData: Omit<Delivery, 'id'>) => {
    const newDelivery: Delivery = { ...newDeliveryData, id: `delivery-${Date.now()}` };
    setDeliveries(prev => [newDelivery, ...prev]);
    setCurrentView(View.ONTVANGS_QC_LIST);
    await supabaseStorage.createDelivery(newDelivery);
  };

  const handleDeliveryUpdated = async (updatedDelivery: Delivery) => {
    setDeliveries(prev => prev.map(d => d.id === updatedDelivery.id ? updatedDelivery : d));
    setCurrentView(View.ADMIN_DATA);
    setEntryToEdit(null);
    await supabaseStorage.updateDelivery(updatedDelivery);
    alert('Delivery updated successfully!');
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    if (window.confirm('Are you sure you want to delete this delivery? This cannot be undone.')) {
        setDeliveries(prev => prev.filter(d => d.id !== deliveryId));
        await supabaseStorage.deleteDelivery(deliveryId);
    }
  };

  const handleMrlRecordCreated = async (newRecordData: Omit<MrlRecord, 'id'>) => {
    const newRecord: MrlRecord = { ...newRecordData, id: `mrl-${Date.now()}` };
    const updatedRecords = [newRecord, ...mrlRecords];
    setMrlRecords(updatedRecords);
    setCurrentView(View.MRL_LIST);
    await supabaseStorage.createMrl(newRecord);
  };

  const handleSelectRun = (run: Run) => {
    setSelectedRun(run);
    setCurrentView(View.QC_RUN);
  };

  const handleSelectDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setCurrentView(View.ONTVANGS_QC);
  };
  
  const handleSelectRekordRun = (run: Run) => {
      setSelectedRun(run);
      setCurrentView(View.REKORDS_RUN_DETAILS);
  };

  const handleSelectRekordDelivery = (delivery: Delivery) => {
      setSelectedDelivery(delivery);
      setReturnView(View.REKORDS_ONTVANGS_LIST);
      handleNavigate(View.ONTVANGS_QC, true); // readOnly = true
  };

  // Edit Handlers for Admin
  const handleEditRun = (run: Run) => {
      setEntryToEdit(run);
      setCurrentView(View.RUN_SETUP);
  };

  const handleEditDelivery = (delivery: Delivery) => {
      setEntryToEdit(delivery);
      setCurrentView(View.PLAAS_SETUP);
  };

  const handleSaveInspection = async (deliveryId: string, qualityData: ExternalQualityData, defectsData: DefectsData, internalQualityData: InternalQualityData, photos: string[], sizeCounts: { [sizeCode: string]: number | '' }) => {
    const newDeliveries = deliveries.map(d => 
      d.id === deliveryId ? { 
          ...d, 
          externalQuality: qualityData, 
          defects: defectsData, 
          internalQuality: internalQualityData, 
          sizeCounts: sizeCounts,
          photos: photos, 
          inspectionCompletedDate: new Date().toISOString().split('T')[0] 
      } : d
    );
    // Optimistic Update
    setDeliveries(newDeliveries);
    const updatedDelivery = newDeliveries.find(d => d.id === deliveryId);
    if (updatedDelivery) {
        setSelectedDelivery(updatedDelivery);
        await supabaseStorage.updateDelivery(updatedDelivery);
        setCurrentView(View.ONTVANGS_QC_LIST); // Navigate back to list on complete
    }
    alert('Inspection completed and saved to Rekords!');
  };

  const updateRunStateAndDB = async (runId: string, updater: (run: Run) => Run) => {
    const newRuns = runs.map(r => r.id === runId ? updater(r) : r);
    setRuns(newRuns); // Optimistic Update
    const updatedRun = newRuns.find(r => r.id === runId);
    if (updatedRun) {
        setSelectedRun(updatedRun);
        setCurrentView(View.QC_RUN);
        await supabaseStorage.updateRun(updatedRun);
    }
  };

  const handleSaveSizing = (runId: string, sizingData: SizingData) => {
    const newEntry: SizingEntry = { id: `sizing-${Date.now()}`, timestamp: new Date().toISOString(), data: sizingData, approvalDetails: { status: 'pending' } };
    updateRunStateAndDB(runId, r => ({ ...r, sizingData: [...(r.sizingData || []), newEntry] }));
  };

  const handleSaveCartonWeights = (runId: string, cartonWeights: CartonWeightSample[]) => {
    const newEntry: CartonWeightsEntry = { id: `cartonweights-${Date.now()}`, timestamp: new Date().toISOString(), samples: cartonWeights, approvalDetails: { status: 'pending' } };
    updateRunStateAndDB(runId, r => ({ ...r, cartonWeights: [...(r.cartonWeights || []), newEntry] }));
  };

  const handleSaveCartonEvaluation = (runId: string, cartonEvaluations: CartonEvaluationSample[]) => {
    const newEntry: CartonEvaluationEntry = { id: `cartoneval-${Date.now()}`, timestamp: new Date().toISOString(), samples: cartonEvaluations, approvalDetails: { status: 'pending' } };
    updateRunStateAndDB(runId, r => ({ ...r, cartonEvaluations: [...(r.cartonEvaluations || []), newEntry] }));
  };

  const handleSaveClassEvaluation = (runId: string, classEvaluations: ClassEvaluationSample[]) => {
     const newEntry: ClassEvaluationEntry = { id: `classeval-${Date.now()}`, timestamp: new Date().toISOString(), samples: classEvaluations, approvalDetails: { status: 'pending' } };
     updateRunStateAndDB(runId, r => ({ ...r, classEvaluations: [...(r.classEvaluations || []), newEntry] }));
  };

  const handleSaveFinalPalletQc = (runId: string, finalPalletQc: FinalPalletQcData[]) => {
    const newEntry: FinalPalletQcEntry = { id: `palletqc-${Date.now()}`, timestamp: new Date().toISOString(), pallets: finalPalletQc, approvalDetails: { status: 'pending' } };
    updateRunStateAndDB(runId, r => ({ ...r, finalPalletQc: [...(r.finalPalletQc || []), newEntry] }));
  };
  
  const handleSaveShelfLife = async (runId: string, shelfLifeBuckets: ShelfLifeBucket[]) => {
      // For shelf life, we replace the entire buckets array since we are modifying state inside specific buckets
      const newRuns = runs.map(r => r.id === runId ? { ...r, shelfLifeBuckets } : r);
      setRuns(newRuns);
      const updatedRun = newRuns.find(r => r.id === runId);
      if (updatedRun) {
          setSelectedRun(updatedRun);
          await supabaseStorage.updateRun(updatedRun);
          alert('Shelf Life data updated.');
      }
  };

  const handleApproveQc = async (runId: string, qcType: keyof Omit<Run, 'id' | 'runNumber' | 'puc' | 'farmName' | 'boord' | 'exporter' | 'commodity' | 'variety'>, entryId: string, username: string) => {
    let updatedRunCopy: Run | null = null;
    
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
            updatedRunCopy = updatedRun;
            return updatedRun;
        }
        return r;
    });
    setRuns(newRuns);
    if(updatedRunCopy) {
        setSelectedRun(updatedRunCopy);
        handleNavigate(View.QUALITY_SUMMARY, false);
        await supabaseStorage.updateRun(updatedRunCopy);
    }
  };


  const renderContent = () => {
    if (!currentUser && PROTECTED_VIEWS.includes(currentView)) return <LoginPage onLogin={handleLogin} />;

    switch (currentView) {
      case View.RUN_SETUP:
        return <RunSetupPage onRunCreated={handleRunCreated} onRunUpdated={handleRunUpdated} runConfig={runConfig} commodityData={commodityData} initialRun={entryToEdit} />;
      case View.QC_LIST:
        return <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.QC_RUN:
        return selectedRun ? <QcRunPage run={selectedRun} onNavigate={(view) => handleNavigate(view, false)} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.PLAAS_SETUP:
        return <PlaasSetupPage onDeliveryCreated={handleDeliveryCreated} onDeliveryUpdated={handleDeliveryUpdated} initialDelivery={entryToEdit} />;
      case View.ONTVANGS_QC_LIST:
          return <OntvangsQcListPage deliveries={deliveries} onSelectDelivery={handleSelectDelivery} onSetupNewDelivery={() => handleNavigate(View.PLAAS_SETUP)} />;
      case View.ONTVANGS_QC:
          return selectedDelivery ? <OntvangsQcPage delivery={selectedDelivery} onSaveInspection={(qualityData, defectsData, internalQualityData, photos, sizeCounts) => handleSaveInspection(selectedDelivery.id, qualityData, defectsData, internalQualityData, photos, sizeCounts)} commodityData={commodityData} readOnly={isReadOnlyView} /> : <OntvangsQcListPage deliveries={deliveries} onSelectDelivery={handleSelectDelivery} onSetupNewDelivery={() => handleNavigate(View.PLAAS_SETUP)} />;
      case View.SIZING:
        return selectedRun ? <SizingPage run={selectedRun} onSaveSizing={handleSaveSizing} commodityData={commodityData} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.CARTON_WEIGHTS:
        return selectedRun ? <CartonWeightsPage run={selectedRun} onSaveCartonWeights={handleSaveCartonWeights} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.CARTON_EVALUATION:
        return selectedRun ? <CartonEvaluationPage run={selectedRun} onSaveCartonEvaluation={handleSaveCartonEvaluation} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.CLASS_EVALUATION:
        return selectedRun ? <ClassEvaluationPage run={selectedRun} onSaveClassEvaluation={handleSaveClassEvaluation} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.QUALITY_SUMMARY:
        return selectedRun ? <QualitySummaryPage run={selectedRun} onViewDetails={(view, entry) => navigateToDetail(view, true, entry, View.QUALITY_SUMMARY)} commodityData={commodityData} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.FINAL_PALLET_QC:
        return selectedRun ? <FinalPalletQcPage run={selectedRun} onSave={handleSaveFinalPalletQc} commodityData={commodityData} cartonConfig={cartonConfig} isReadOnly={isReadOnlyView} onApprove={handleApproveQc} entryToView={entryToView} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.SHELF_LIFE:
        return selectedRun ? <ShelfLifePage run={selectedRun} onSave={handleSaveShelfLife} commodityData={commodityData} cartonConfig={cartonConfig} currentUser={currentUser} /> : <QcListPage runs={runs} onSelectRun={handleSelectRun} onSetupNewRun={() => handleNavigate(View.RUN_SETUP)} />;
      case View.ADMIN:
        return <AdminPage onNavigate={handleNavigate} currentUser={currentUser} />;
      case View.ADMIN_COMMODITIES:
        return <CommodityManagementPage initialCommodityData={commodityData} onUpdate={handleCommodityDataUpdate} />;
      case View.ADMIN_CARTONS:
        return <ManageCartonsPage initialCartonConfig={cartonConfig} onUpdate={handleCartonConfigUpdate} commodityData={commodityData} />;
      case View.ADMIN_USERS:
        return <UserManagementPage users={users} onUpdateUsers={handleUsersUpdate} />;
      case View.ADMIN_RUN_INFO:
        return <ManageRunInfoPage runConfig={runConfig} onUpdate={handleRunConfigUpdate} />;
      case View.ADMIN_DATA:
        return <ManageDataPage runs={runs} deliveries={deliveries} onEditRun={handleEditRun} onDeleteRun={handleDeleteRun} onEditDelivery={handleEditDelivery} onDeleteDelivery={handleDeleteDelivery} />;
      case View.MRL:
        return <MrlPage onNavigate={handleNavigate} />;
      case View.MRL_ADD:
        return <AddMrlPage onRecordCreated={handleMrlRecordCreated} />;
      case View.MRL_LIST:
        return <MrlListPage records={mrlRecords} onNavigate={handleNavigate} />;
      case View.REKORDS:
        return <RekordsPage onNavigate={handleNavigate} />;
      case View.REKORDS_RUN_LIST:
        return <RunRekordsPage runs={runs} onSelectRun={handleSelectRekordRun} />;
      case View.REKORDS_RUN_DETAILS:
        return selectedRun ? <RunRekordsDetailsPage run={selectedRun} commodityData={commodityData} onViewDetails={(view, entry) => navigateToDetail(view, true, entry, View.REKORDS_RUN_DETAILS)} /> : <RunRekordsPage runs={runs} onSelectRun={handleSelectRekordRun} />;
      case View.REKORDS_ONTVANGS_LIST:
        return <OntvangsRekordsPage deliveries={deliveries} onSelectDelivery={handleSelectRekordDelivery} />;
      case View.LOGIN:
         return <LoginPage onLogin={handleLogin} />;
      case View.HOME:
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };
  
  // Custom navigation handler for header back button
  const handleHeaderBack = () => {
      // If we are in a detail view triggered by "View Details" (read-only), go back to the returnView
      if (isReadOnlyView && entryToView) {
          setCurrentView(returnView);
          setEntryToView(null);
          setIsReadOnlyView(false); 
      } else {
          handleNavigateBack();
      }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-green-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-slate-100">Loading Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen">
      <Header 
        currentView={currentView}
        onNavigateHome={handleNavigateHome} 
        onNavigateBack={currentView !== View.HOME && currentView !== View.LOGIN ? handleHeaderBack : undefined}
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
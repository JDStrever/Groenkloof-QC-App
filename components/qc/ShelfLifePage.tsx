

import React, { useState, useMemo } from 'react';
import { Run, ShelfLifeBucket, CommodityData, CartonConfig, Size, BoxType, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { getSizesForCommodity, getMappedCommodity } from '../../utils/commodityHelper';

interface ShelfLifePageProps {
  run: Run;
  onSave: (runId: string, buckets: ShelfLifeBucket[]) => void;
  commodityData: CommodityData;
  cartonConfig: CartonConfig;
  currentUser: User | null;
}

const ShelfLifePage: React.FC<ShelfLifePageProps> = ({ run, onSave, commodityData, cartonConfig, currentUser }) => {
  const [activeBuckets, setActiveBuckets] = useState<ShelfLifeBucket[]>(run.shelfLifeBuckets || []);
  const [checkComments, setCheckComments] = useState<{ [bucketId: string]: string }>({});
  
  // New Bucket Form State
  const [newSize, setNewSize] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newBoxType, setNewBoxType] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const sizes: Size[] = useMemo(() => getSizesForCommodity(run.commodity, commodityData), [run.commodity, commodityData]);
  const mappedCommodity = useMemo(() => getMappedCommodity(run.commodity), [run.commodity]);
  const boxTypes: BoxType[] = useMemo(() => cartonConfig.boxTypes[mappedCommodity] || [], [mappedCommodity, cartonConfig.boxTypes]);
  const classes: string[] = useMemo(() => cartonConfig.classes || [], [cartonConfig.classes]);

  const handleAddBucket = () => {
    if (!newSize || !newClass || !newBoxType || !newPhone) {
        alert('Please fill in all fields (Size, Class, Box Type, Mobile Number).');
        return;
    }

    const newBucket: ShelfLifeBucket = {
        id: `bucket-${Date.now()}`,
        size: newSize,
        class: newClass,
        boxType: newBoxType,
        phoneNumber: newPhone,
        startDate: new Date().toISOString(),
        status: 'active',
        checks: [
            {
                date: new Date().toISOString(),
                checkedBy: currentUser?.username || 'Unknown',
                notes: 'Initial check'
            }
        ]
    };
    
    const updatedBuckets = [...activeBuckets, newBucket];
    setActiveBuckets(updatedBuckets);
    onSave(run.id, updatedBuckets);
    
    // Reset Form
    setNewSize('');
    setNewClass('');
    setNewBoxType('');
    setNewPhone('');
  };

  const calculateDaysSinceLastCheck = (bucket: ShelfLifeBucket): number => {
      const lastCheck = bucket.checks[bucket.checks.length - 1];
      if (!lastCheck) return 0;
      
      const lastDate = new Date(lastCheck.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays;
  };

  const isCheckDue = (bucket: ShelfLifeBucket): boolean => {
      // Logic: Must be at least 4 days since last check
      // We calculate difference in days. If diff >= 4, check is allowed.
      const lastCheck = bucket.checks[bucket.checks.length - 1];
      const lastDate = new Date(lastCheck.date).setHours(0,0,0,0);
      const today = new Date().setHours(0,0,0,0);
      
      const diffTime = today - lastDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      return diffDays >= 4;
  };

  const getNextCheckDate = (bucket: ShelfLifeBucket): string => {
      const lastCheck = bucket.checks[bucket.checks.length - 1];
      const date = new Date(lastCheck.date);
      date.setDate(date.getDate() + 4);
      return date.toLocaleDateString();
  };

  const handlePerformCheck = (bucketId: string) => {
      const notes = checkComments[bucketId]?.trim();
      
      if (!notes) {
          alert("Please enter a comment for this check.");
          return;
      }

      const updatedBuckets = activeBuckets.map(bucket => {
          if (bucket.id === bucketId) {
              return {
                  ...bucket,
                  checks: [
                      ...bucket.checks,
                      {
                          date: new Date().toISOString(),
                          checkedBy: currentUser?.username || 'Unknown',
                          notes: notes
                      }
                  ]
              };
          }
          return bucket;
      });
      
      setActiveBuckets(updatedBuckets);
      onSave(run.id, updatedBuckets);
      
      // Clear comment for this bucket
      setCheckComments(prev => {
          const newState = { ...prev };
          delete newState[bucketId];
          return newState;
      });
      
      alert('Check recorded successfully.');
  };

  const handleEndCycle = (bucketId: string) => {
      if(window.confirm('Are you sure you want to end the shelf life cycle for this box? It will be moved to Rekords.')) {
        const updatedBuckets = activeBuckets.map(bucket => {
            if (bucket.id === bucketId) {
                return {
                    ...bucket,
                    status: 'completed' as const,
                    completedDate: new Date().toISOString()
                };
            }
            return bucket;
        });
        setActiveBuckets(updatedBuckets);
        onSave(run.id, updatedBuckets);
      }
  };

  // Filter out completed buckets from active view
  const visibleBuckets = activeBuckets.filter(b => b.status === 'active');

  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <div className="border-b border-slate-700 pb-4 mb-6">
                <h2 className="text-3xl font-bold text-green-400">Rakleeftyd Check</h2>
                <p className="text-slate-400 mt-1">Track boxes every 4 days for shelf life analysis.</p>
            </div>

            {/* Add New Bucket Form */}
            <div className="bg-slate-700 p-6 rounded-lg border border-slate-600 mb-8">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Add New Box to Track</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <Label>Size</Label>
                        <select value={newSize} onChange={e => setNewSize(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                            <option value="">Select Size</option>
                            {sizes.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>Class</Label>
                        <select value={newClass} onChange={e => setNewClass(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>Box Type</Label>
                        <select value={newBoxType} onChange={e => setNewBoxType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-slate-900">
                            <option value="">Select Box Type</option>
                            {boxTypes.map(bt => <option key={bt.name} value={bt.name}>{bt.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <Label>Mobile Number</Label>
                         <Input 
                            value={newPhone} 
                            onChange={e => setNewPhone(e.target.value)} 
                            placeholder="082 123 4567" 
                            className="!bg-white !text-black"
                        />
                    </div>
                    <div>
                        <Button onClick={handleAddBucket} className="w-full">Start Tracking</Button>
                    </div>
                </div>
            </div>

            {/* Active Buckets List */}
            <h3 className="text-xl font-bold text-slate-200 mb-4">Active Checks ({visibleBuckets.length})</h3>
            <div className="space-y-4">
                {visibleBuckets.length === 0 && <p className="text-slate-500">No boxes currently being tracked.</p>}
                
                {visibleBuckets.map(bucket => {
                    const checkDue = isCheckDue(bucket);
                    const nextDate = getNextCheckDate(bucket);
                    const currentComment = checkComments[bucket.id] || '';
                    
                    return (
                        <div key={bucket.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-grow w-full md:w-auto">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-bold text-orange-400">{bucket.size} / {bucket.class}</span>
                                    <span className="text-sm bg-slate-700 px-2 py-1 rounded border border-slate-600 text-slate-300">{bucket.boxType}</span>
                                </div>
                                <div className="text-sm text-slate-400">
                                    <p>Start Date: {new Date(bucket.startDate).toLocaleDateString()}</p>
                                    <p>Checks Performed: <span className="text-white font-semibold">{bucket.checks.length}</span></p>
                                    <p>Notify: <span className="text-white">{bucket.phoneNumber}</span></p>
                                </div>
                                <div className="mt-3">
                                    {checkDue ? (
                                        <div className="w-full">
                                            <div className="inline-flex items-center text-red-400 font-bold bg-red-900/30 px-3 py-1 rounded mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Check Due Now!
                                            </div>
                                            <div>
                                                <Label className="text-sm text-slate-300 mb-1">Observations (Required)</Label>
                                                <textarea
                                                    value={currentComment}
                                                    onChange={(e) => setCheckComments(prev => ({ ...prev, [bucket.id]: e.target.value }))}
                                                    placeholder="Enter observations..."
                                                    className="w-full p-3 rounded-md bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-green-400 text-sm">
                                            Next check due: {nextDate}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 w-full md:w-auto min-w-[150px] self-start md:self-center">
                                <Button 
                                    onClick={() => handlePerformCheck(bucket.id)} 
                                    disabled={!checkDue || !currentComment.trim()}
                                    className={`w-full ${checkDue && currentComment.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 opacity-50 cursor-not-allowed'}`}
                                >
                                    {checkDue ? 'Perform Check' : 'Wait 4 Days'}
                                </Button>
                                <Button 
                                    onClick={() => handleEndCycle(bucket.id)} 
                                    className="w-full bg-red-900/50 hover:bg-red-800 border border-red-800 text-red-200"
                                >
                                    End Cycle
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    </div>
  );
};

export default ShelfLifePage;

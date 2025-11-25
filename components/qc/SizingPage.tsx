import React, { useState, useEffect } from 'react';
import { Run, SizingData, CommodityData, Size, SizingEntry, User } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import { getSizesForCommodity } from '../../utils/commodityHelper';

interface SizingPageProps {
  run: Run;
  onSaveSizing: (runId: string, sizingData: SizingData) => void;
  commodityData: CommodityData;
  isReadOnly?: boolean;
  onApprove?: (runId: string, qcType: 'sizingData', entryId: string, username: string) => void;
  entryToView?: SizingEntry | null;
  currentUser: User | null;
}

const checkSizeInRange = (value: number | '', size: Size): boolean | null => {
    if (value === '' || value === null || value === undefined) {
        return null; // No validation for empty input
    }
    const numValue = Number(value);
    const min = Number(size.min);
    const max = Number(size.max);
    return numValue >= min && numValue <= max;
};

const SizingPage: React.FC<SizingPageProps> = ({ run, onSaveSizing, commodityData, isReadOnly = false, onApprove, entryToView, currentUser }) => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sizingData, setSizingData] = useState<SizingData>({});

  useEffect(() => {
    const commoditySizes = getSizesForCommodity(run.commodity, commodityData);
    setSizes(commoditySizes);

    const initialData: SizingData = {};
    if (isReadOnly && entryToView) {
        // In read-only mode, populate with the specific entry's data
        commoditySizes.forEach(size => {
            initialData[size.code] = entryToView.data[size.code] || Array(10).fill('');
        });
    } else {
        // In entry mode, always start fresh
        commoditySizes.forEach(size => {
            initialData[size.code] = Array(10).fill('');
        });
    }
    setSizingData(initialData);
  }, [run.commodity, commodityData, isReadOnly, entryToView]);

  const handleSizeChange = (sizeCode: string, index: number, value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    if (isNaN(numValue as number) && value !== '') return;

    const newSizingData = { ...sizingData };
    // Ensure the array for the size code exists
    const newMeasurements = [...(newSizingData[sizeCode] || Array(10).fill(''))];
    newMeasurements[index] = numValue;
    newSizingData[sizeCode] = newMeasurements;
    setSizingData(newSizingData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadOnly) {
        onSaveSizing(run.id, sizingData);
    }
  };

  const handleApproveClick = () => {
    if (onApprove && entryToView && currentUser) {
        onApprove(run.id, 'sizingData', entryToView.id, currentUser.username);
    }
  };

  if (sizes.length === 0) {
    return (
        <Card>
            <div className="text-center p-8">
                <h3 className="text-xl font-semibold text-slate-700">Unsupported Commodity</h3>
                <p className="mt-2 text-slate-500">
                    No size information is available for "{run.commodity}". Please add it in the admin panel.
                </p>
            </div>
        </Card>
    );
  }

  const isApproved = entryToView?.approvalDetails?.status === 'approved';

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
           {isReadOnly && (
             <div className="p-4 mb-6 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
                <p className="font-semibold">Read-Only Mode: This form is for viewing or approval.</p>
             </div>
           )}
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Sizing</h2>
            <p className="text-slate-500 mt-1">
              {isReadOnly ? 'Viewing' : 'Enter'} 10 fruit measurements (in mm) for each size in Run: <span className="font-semibold text-orange-600">{run.runNumber}</span>
            </p>
          </div>
          
          <div className="space-y-10">
            {sizes.map(size => (
              <div key={size.code}>
                <h3 className="text-2xl font-semibold text-slate-700 border-b-2 border-orange-500 pb-2 mb-6">
                  Size: {size.code}
                  <span className="text-base font-normal text-slate-500 ml-3">({size.diameterRange})</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
                  {Array(10).fill(0).map((_, index) => {
                    const measurement = sizingData[size.code]?.[index];
                    const isInRange = checkSizeInRange(measurement, size);
                    
                    let textColorClass = '';
                    if (isInRange === true) {
                        textColorClass = 'text-green-500 font-bold';
                    } else if (isInRange === false) {
                        textColorClass = 'text-red-500 font-bold';
                    }

                    return (
                        <div key={index}>
                        <Label htmlFor={`size-${size.code}-${index}`}>Fruit {index + 1}</Label>
                        <Input
                            id={`size-${size.code}-${index}`}
                            type="number"
                            min="0"
                            placeholder="mm"
                            value={sizingData[size.code]?.[index] || ''}
                            onChange={(e) => handleSizeChange(size.code, index, e.target.value)}
                            className={`w-full text-center ${textColorClass}`}
                            disabled={isReadOnly}
                        />
                        </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
             {isReadOnly ? (
                 !isApproved && (
                    <Button type="button" onClick={handleApproveClick} className="w-full max-w-sm bg-green-600 hover:bg-green-700 focus:ring-green-500">
                        Approve Sizing Data
                    </Button>
                 )
             ) : (
                <Button type="submit" className="w-full max-w-sm">
                  Save Sizing Data
                </Button>
             )}
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SizingPage;
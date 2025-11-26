
import React, { useState } from 'react';
import { Run, View, ApprovalDetails, SizingEntry, CartonWeightsEntry, CartonEvaluationEntry, ClassEvaluationEntry, FinalPalletQcEntry, CommodityData } from '../../types';
import Card from '../ui/Card';
import { exportSizingToCsv, exportCartonWeightsToCsv, exportCartonEvaluationToCsv, exportClassEvaluationToCsv, exportFinalPalletQcPhotosToZip } from '../../utils/commodityHelper';

type QCDataEntry = SizingEntry | CartonWeightsEntry | CartonEvaluationEntry | ClassEvaluationEntry | FinalPalletQcEntry;

interface QualitySummaryPageProps {
  run: Run;
  onViewDetails: (view: View, entry: QCDataEntry) => void;
  commodityData: CommodityData;
}

const StatusDisplay: React.FC<{ details: ApprovalDetails }> = ({ details }) => {
    const isApproved = details.status === 'approved';
    const bgColor = isApproved ? 'bg-green-900' : 'bg-yellow-900';
    const textColor = isApproved ? 'text-green-200' : 'text-yellow-200';
    const borderColor = isApproved ? 'border-green-700' : 'border-yellow-700';
    
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
            {isApproved ? `Approved by: ${details.approvedBy}` : 'Pending'}
        </span>
    );
};

interface QcCategorySummaryProps {
    title: string;
    view: View;
    entries: QCDataEntry[];
    run: Run;
    onViewDetails: (view: View, entry: QCDataEntry) => void;
    onExport: (entry: any) => void;
    exportLabel?: string;
}

const QcCategorySummary: React.FC<QcCategorySummaryProps> = ({ title, view, entries, run, onViewDetails, onExport, exportLabel = 'Export CSV' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const total = entries.length;
    const approved = entries.filter(e => e.approvalDetails.status === 'approved').length;
    const pending = total - approved;

    if (total === 0) {
        return (
            <Card className="bg-slate-800/50 opacity-80 border border-slate-700">
                <h3 className="text-xl font-bold text-slate-500">{title}</h3>
                <p className="text-slate-600 mt-1">No data submitted yet.</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div 
                className="flex justify-between items-center cursor-pointer p-4 -m-4 hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                aria-expanded={isOpen}
            >
                <div>
                    <h3 className="text-xl font-bold text-green-400">{title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                        <span>Total: <span className="font-semibold text-slate-200">{total}</span></span>
                        <span>Approved: <span className="font-semibold text-green-400">{approved}</span></span>
                        <span>Pending: <span className="font-semibold text-yellow-500">{pending}</span></span>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date / Time</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-4 py-2">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {entries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{new Date(entry.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <StatusDisplay details={entry.approvalDetails} />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => onViewDetails(view, entry)} className="text-indigo-400 hover:text-indigo-300 font-semibold">View Details</button>
                                            <button onClick={() => onExport(entry)} className="text-green-400 hover:text-green-300 font-semibold">{exportLabel}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Card>
    );
};


const QualitySummaryPage: React.FC<QualitySummaryPageProps> = ({ run, onViewDetails, commodityData }) => {
    
    const summaryItems = [
        {
            title: 'Sizing',
            view: View.SIZING,
            entries: run.sizingData || [],
            onExport: (entry: SizingEntry) => exportSizingToCsv(entry, run, commodityData)
        },
        {
            title: 'Karton gewigte',
            view: View.CARTON_WEIGHTS,
            entries: run.cartonWeights || [],
            onExport: (entry: CartonWeightsEntry) => exportCartonWeightsToCsv(entry, run)
        },
        {
            title: 'Karton evaluering',
            view: View.CARTON_EVALUATION,
            entries: run.cartonEvaluations || [],
            onExport: (entry: CartonEvaluationEntry) => exportCartonEvaluationToCsv(entry, run)
        },
        {
            title: 'Klas evaluering',
            view: View.CLASS_EVALUATION,
            entries: run.classEvaluations || [],
            onExport: (entry: ClassEvaluationEntry) => exportClassEvaluationToCsv(entry, run)
        },
        {
            title: 'Final pallet QC',
            view: View.FINAL_PALLET_QC,
            entries: run.finalPalletQc || [],
            onExport: (entry: FinalPalletQcEntry) => exportFinalPalletQcPhotosToZip(entry, run),
            exportLabel: 'Export Photos (.zip)'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="border-b border-slate-700 pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-green-400">Kwaliteit opsomming</h2>
                    <p className="text-slate-400 mt-1">Quality summary for Run: <span className="font-semibold text-orange-500">{run.runNumber}</span></p>
                </div>
                <div className="space-y-6">
                    {summaryItems.map(item => (
                        <QcCategorySummary
                            key={item.title}
                            title={item.title}
                            view={item.view}
                            entries={item.entries as QCDataEntry[]}
                            run={run}
                            onViewDetails={onViewDetails}
                            onExport={item.onExport}
                            exportLabel={item.exportLabel}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default QualitySummaryPage;

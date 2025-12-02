
import React, { useMemo } from 'react';
import { Run, View, ApprovalDetails, SizingEntry, CartonWeightsEntry, CartonEvaluationEntry, ClassEvaluationEntry, FinalPalletQcEntry, CommodityData } from '../../types';
import Card from '../ui/Card';
import { exportSizingToCsv, exportCartonWeightsToCsv, exportCartonEvaluationToCsv, exportClassEvaluationToCsv, exportFinalPalletQcPhotosToZip } from '../../utils/commodityHelper';

type QCDataEntry = SizingEntry | CartonWeightsEntry | CartonEvaluationEntry | ClassEvaluationEntry | FinalPalletQcEntry;

interface RunRekordsDetailsPageProps {
  run: Run;
  onViewDetails: (view: View, entry: QCDataEntry) => void;
  commodityData: CommodityData;
}

interface QcCategorySummaryProps {
    title: string;
    view: View;
    entries: QCDataEntry[];
    onViewDetails: (view: View, entry: QCDataEntry) => void;
    onExport: (entry: any) => void;
    exportLabel?: string;
}

const QcCategorySummary: React.FC<QcCategorySummaryProps> = ({ title, view, entries, onViewDetails, onExport, exportLabel = 'Export CSV' }) => {
    if (entries.length === 0) {
        return null;
    }

    return (
        <Card className="overflow-hidden mb-6">
            <h3 className="text-xl font-bold text-green-400 mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date / Time</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Approved By</th>
                            <th scope="col" className="relative px-4 py-2">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {entries.map((entry) => (
                            <tr key={entry.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{new Date(entry.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-300">
                                    {entry.approvalDetails.approvedBy}
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
        </Card>
    );
};


const RunRekordsDetailsPage: React.FC<RunRekordsDetailsPageProps> = ({ run, onViewDetails, commodityData }) => {
    
    // Filter functions to get only approved items
    const approvedSizing = useMemo(() => (run.sizingData || []).filter(e => e.approvalDetails.status === 'approved'), [run.sizingData]);
    const approvedWeights = useMemo(() => (run.cartonWeights || []).filter(e => e.approvalDetails.status === 'approved'), [run.cartonWeights]);
    const approvedCartonEval = useMemo(() => (run.cartonEvaluations || []).filter(e => e.approvalDetails.status === 'approved'), [run.cartonEvaluations]);
    const approvedClassEval = useMemo(() => (run.classEvaluations || []).filter(e => e.approvalDetails.status === 'approved'), [run.classEvaluations]);
    const approvedPalletQc = useMemo(() => (run.finalPalletQc || []).filter(e => e.approvalDetails.status === 'approved'), [run.finalPalletQc]);

    const hasAnyRecords = approvedSizing.length > 0 || approvedWeights.length > 0 || approvedCartonEval.length > 0 || approvedClassEval.length > 0 || approvedPalletQc.length > 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-green-400">Approved Records: {run.runNumber}</h2>
                <p className="text-slate-400 mt-1">{run.farmName} ({run.boord}) - {run.variety}</p>
            </div>

            {!hasAnyRecords && (
                 <Card>
                    <p className="text-center text-slate-500 py-8">No approved records found for this run.</p>
                </Card>
            )}

            <QcCategorySummary
                title="Sizing"
                view={View.SIZING}
                entries={approvedSizing}
                onViewDetails={onViewDetails}
                onExport={(entry) => exportSizingToCsv(entry as SizingEntry, run, commodityData)}
            />
            
            <QcCategorySummary
                title="Karton gewigte"
                view={View.CARTON_WEIGHTS}
                entries={approvedWeights}
                onViewDetails={onViewDetails}
                onExport={(entry) => exportCartonWeightsToCsv(entry as CartonWeightsEntry, run)}
            />

            <QcCategorySummary
                title="Karton evaluering"
                view={View.CARTON_EVALUATION}
                entries={approvedCartonEval}
                onViewDetails={onViewDetails}
                onExport={(entry) => exportCartonEvaluationToCsv(entry as CartonEvaluationEntry, run)}
            />

            <QcCategorySummary
                title="Klas evaluering"
                view={View.CLASS_EVALUATION}
                entries={approvedClassEval}
                onViewDetails={onViewDetails}
                onExport={(entry) => exportClassEvaluationToCsv(entry as ClassEvaluationEntry, run)}
            />

            <QcCategorySummary
                title="Final Pallet QC"
                view={View.FINAL_PALLET_QC}
                entries={approvedPalletQc}
                onViewDetails={onViewDetails}
                onExport={(entry) => exportFinalPalletQcPhotosToZip(entry as FinalPalletQcEntry, run)}
                exportLabel="Export Photos"
            />
        </div>
    );
};

export default RunRekordsDetailsPage;

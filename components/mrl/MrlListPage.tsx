
import React from 'react';
import { MrlRecord, View } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { exportMrlRecordToCsv, downloadPdfFromBase64 } from '../../utils/mrlHelper';

interface MrlListPageProps {
  records: MrlRecord[];
  onNavigate: (view: View) => void;
}

const MrlListPage: React.FC<MrlListPageProps> = ({ records, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div className="text-left">
                <h2 className="text-3xl font-bold text-slate-800">MRL Records</h2>
                <p className="text-slate-500 mt-2">View and export all submitted MRL records.</p>
            </div>
            <Button onClick={() => onNavigate(View.MRL_ADD)}>Add New MRL</Button>
        </div>
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map(record => (
            <Card key={record.id}>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">Ref: {record.customerRef}</h3>
                  <p className="text-slate-600">{record.producer} - {record.variety}</p>
                  <p className="text-sm text-slate-500">Captured: {record.dateCaptured}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => exportMrlRecordToCsv(record)} className="text-sm py-2 px-3 bg-green-600 hover:bg-green-700">
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => downloadPdfFromBase64(record.labReportPdf, `MRL_Report_${record.customerRef}.pdf`)} 
                    disabled={!record.labReportPdf}
                    className="text-sm py-2 px-3 bg-red-500 hover:bg-red-700"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
               {(record.customResidues && record.customResidues.length > 0) && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700">Other Residues:</h4>
                    <ul className="text-sm text-slate-600 list-disc list-inside grid grid-cols-2 gap-x-4">
                        {record.customResidues.map((res, index) => (
                            <li key={index}>{res.name}: {res.value} mg/kg</li>
                        ))}
                    </ul>
                </div>
               )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No MRL Records Found</h3>
            <p className="mt-1 text-slate-500">Get started by adding a new MRL record.</p>
        </div>
      )}
    </div>
  );
};

export default MrlListPage;
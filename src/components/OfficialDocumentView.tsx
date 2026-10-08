import React from 'react';
import { CommuneEntry, SheetMetadata } from '../types/sheet';
import { OfficialDocumentSheet } from './OfficialDocumentSheet';
import { printSheetContentOnly, exportSheetToCSV, exportSheetToStandaloneHTML } from '../utils/exportSheet';
import { Printer, Download, ArrowLeft, FileSpreadsheet, FileCode, CheckCircle2 } from 'lucide-react';

interface OfficialDocumentViewProps {
  data: CommuneEntry[];
  metadata: SheetMetadata;
  onBackToGrid: () => void;
}

export const OfficialDocumentView: React.FC<OfficialDocumentViewProps> = ({
  data,
  metadata,
  onBackToGrid,
}) => {
  const handlePrint = () => {
    printSheetContentOnly(metadata);
  };

  const handleExportCSV = () => {
    exportSheetToCSV(data, metadata);
  };

  const handleExportHTML = () => {
    exportSheetToStandaloneHTML('official-document-sheet', metadata);
  };

  return (
    <div className="space-y-4">
      {/* Control / Export Bar (Hidden completely during Print) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGrid}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅតារាង (Back to Grid)</span>
          </button>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>បោះពុម្ព & នាំចេញតែសន្លឹករបាយការណ៍ (Content Sheet Only)</span>
          </span>
        </div>

        {/* Action Buttons: Print / Save PDF, Export CSV, Export HTML */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV / Excel */}
          <button
            onClick={handleExportCSV}
            title="ទាញយកទិន្នន័យតារាងជា Excel / CSV (UTF-8)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>នាំចេញ CSV (Excel)</span>
          </button>

          {/* Export Standalone HTML */}
          <button
            onClick={handleExportHTML}
            title="ទាញយកជាឯកសារ HTML តែសន្លឹករបាយការណ៍ (Standalone HTML)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>ទាញយក HTML</span>
          </button>

          {/* Print / Save PDF (Sheet Only) */}
          <button
            onClick={handlePrint}
            title="បោះពុម្ព ឬរក្សាទុកជា PDF ដោយយកតែសន្លឹករបាយការណ៍ប៉ុណ្ណោះ"
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-normal text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>បោះពុម្ព / Save PDF (តែសន្លឹក)</span>
          </button>
        </div>
      </div>

      {/* Official Sheet Print Canvas (id="official-document-sheet" targeted exclusively for print & export) */}
      <OfficialDocumentSheet
        id="official-document-sheet"
        data={data}
        metadata={metadata}
      />
    </div>
  );
};

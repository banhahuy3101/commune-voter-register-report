import React from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  Users,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  Calendar,
  LogOut,
  Printer,
  CheckCircle2,
  AlertCircle,
  Send,
  Edit3,
  Flame,
  Lock,
  Menu,
  CalendarDays,
  HelpCircle,
  Download,
} from 'lucide-react';
import { SheetMetadata } from '../types/sheet';
import { DatePicker } from './ui/date-picker';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  metadata: SheetMetadata;
  onUpdateMetadata: (m: Partial<SheetMetadata>) => void;
  onCreateSheet: () => void;
  onSyncToSheet: () => void;
  onFetchFromSheet: () => void;
  onOpenCollaborators: () => void;
  onOpenCommunePopup: () => void;
  onOpenShareLinks: () => void;
  onToggleOfficialView: () => void;
  isOfficialView: boolean;
  isSyncing: boolean;
  isCreating: boolean;
  isFirebaseLive?: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  lockedCommuneId?: number | null;
  assignedCommuneName?: string;
  onToggleSidebar?: () => void;
  monthsCount?: number;
  activeMonthName?: string;
  onOpenOAuthHelp?: () => void;
  onExportExcel?: () => void;
  onPrintDocument?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  metadata,
  onUpdateMetadata,
  onCreateSheet,
  onSyncToSheet,
  onFetchFromSheet,
  onOpenCollaborators,
  onOpenCommunePopup,
  onOpenShareLinks,
  onToggleOfficialView,
  isOfficialView,
  isSyncing,
  isCreating,
  isFirebaseLive = false,
  lastSyncedAt,
  syncError,
  lockedCommuneId,
  assignedCommuneName,
  onToggleSidebar,
  monthsCount = 0,
  activeMonthName,
  onOpenOAuthHelp,
  onExportExcel,
  onPrintDocument,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Top Banner: Party, National Motto, and Auth Status */}
      <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={metadata.logoUrl || "/cpp-logo.png"}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://www.cpp.org.kh/wp-content/themes/cpptwentyseventeen/assets/images/cpp-logo.png";
              }}
              alt="CPP Logo"
              className="w-5 h-5 object-contain shrink-0"
            />
            <span className="font-moul tracking-wide text-amber-300 text-sm">
              គណបក្សប្រជាជនកម្ពុជា
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-slate-300">
              គណៈកម្មាធិការខេត្តកំពង់ចាម - គណៈកម្មាធិការស្រុកជើងព្រៃ
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-moul text-amber-200 text-xs">
              ឯករាជ្យ សន្តិភាព សេរីភាព ប្រជាធិបតេយ្យ
            </span>

            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-slate-200 font-medium truncate max-w-[140px]">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={onLogout}
                  title="ចាកចេញ (Sign Out)"
                  className="text-slate-400 hover:text-red-400 ml-1 p-0.5 rounded cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onLogin}
                  className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>ចូលគណនី Google</span>
                </button>
                {onOpenOAuthHelp && (
                  <button
                    onClick={onOpenOAuthHelp}
                    title="ជំនួយដោះស្រាយ Error 403 (Test Users / Google Verification)"
                    className="p-1 rounded text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar: Title, Date, Google Sheets Action Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-normal shadow-xs transition-colors cursor-pointer border border-slate-700"
                  title="បើក / បិទ បញ្ជីតាមខែ (Toggle Monthly Records)"
                >
                  <Menu className="w-4 h-4 text-amber-400" />
                  <span>បញ្ជីតាមខែ ({monthsCount})</span>
                  {activeMonthName && (
                    <span className="bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded text-[11px] font-normal">
                      {activeMonthName}
                    </span>
                  )}
                </button>
              )}
              <h1 className="text-base sm:text-lg md:text-xl font-normal text-gray-900 tracking-tight font-moul text-blue-950">
                {metadata.reportTitleKh}
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 text-xs font-normal text-slate-700 shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>កាលបរិច្ឆេទ៖</span>
              </span>
              <DatePicker
                value={metadata.reportDateKh}
                onChange={(formattedKh) => {
                  const loc = metadata.districtKh ? metadata.districtKh.replace(/^ស្រុក\s*/, '').trim() : 'ជើងព្រៃ';
                  const datePart = formattedKh.replace(/^ប្រចាំ\s*/, '').trim();
                  onUpdateMetadata({
                    reportDateKh: formattedKh,
                    signerRightDateLocation: `${loc} ${datePart}`,
                  });
                }}
                title="កាលបរិច្ឆេទរបាយការណ៍ (Report Date) - ជ្រើសរើសពីប្រតិទិន Date Picker"
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Fill by Commune Popup Button */}
            <button
              onClick={onOpenCommunePopup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-normal shadow-xs transition-colors cursor-pointer"
              title={
                lockedCommuneId
                  ? `បើកផ្ទាំង Pop-up បំពេញទិន្នន័យ ${assignedCommuneName}`
                  : 'បើកផ្ទាំង Pop-up បញ្ចូលទិន្នន័យតាមឃុំ'
              }
            >
              {lockedCommuneId ? (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Edit3 className="w-3.5 h-3.5" />
              )}
              <span>
                {lockedCommuneId && assignedCommuneName
                  ? `បំពេញទិន្នន័យ ${assignedCommuneName} (Pop-up)`
                  : 'បញ្ចូលទិន្នន័យតាមឃុំ (Pop-up)'}
              </span>
            </button>

            {/* Send Commune Link Button */}
            <button
              onClick={onOpenShareLinks}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-normal transition-colors cursor-pointer"
              title="ផ្ញើតំណភ្ជាប់ Pop-up ទៅកាន់មន្ត្រីឃុំ"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>ផ្ញើតំណតាមឃុំ (Send Link)</span>
            </button>

            {/* View Mode Toggle: Spreadsheet Grid vs Official Print Document */}
            <button
              onClick={onToggleOfficialView}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${isOfficialView
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" />
              <span>{isOfficialView ? 'មើលតារាង (Grid View)' : 'ទម្រង់ឯកសារផ្លូវការ (Print View)'}</span>
            </button>

            {/* Direct Export to Excel (.xlsx) */}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-normal transition-colors cursor-pointer shadow-2xs"
                title="នាំចេញជាឯកសារ Excel (.xlsx) ដែលមានតែ Header + Table + Sign"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>នាំចេញ Excel</span>
              </button>
            )}

            {/* Print / Save to PDF */}
            {onPrintDocument && (
              <button
                onClick={onPrintDocument}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-normal transition-colors cursor-pointer shadow-xs"
                title="បោះពុម្ព ឬរក្សាទុកជា PDF ដែលមានតែ Header + Table + Sign"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>បោះពុម្ព / PDF</span>
              </button>
            )}

            {/* Google Sheets Status / Actions */}
            {metadata.spreadsheetId ? (
              <>
                <a
                  href={metadata.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-normal hover:bg-emerald-100 transition-colors shadow-2xs"
                  title="ចុចដើម្បីបើកក្នុង Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>បើក Google Sheet</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>

                {/* Real-time Share Collaborators */}
                <button
                  onClick={onOpenCollaborators}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                  title="ចែករំលែកជាមួយមន្ត្រីឃុំ"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>ចែករំលែក (Share List)</span>
                </button>

                {/* Sync to Sheet */}
                <button
                  onClick={onSyncToSheet}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  title="បញ្ជូនទិន្នន័យទៅ Google Sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទៅ Sheet'}</span>
                </button>

                {/* Fetch from Sheet */}
                <button
                  onClick={onFetchFromSheet}
                  disabled={isSyncing}
                  className="p-1.5 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title="ទាញយកទិន្នន័យចុងក្រោយពី Google Sheet"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </>
            ) : (
              <button
                onClick={onCreateSheet}
                disabled={isCreating}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs md:text-sm font-normal shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isCreating ? 'កំពុងបង្កើត Google Sheet...' : 'បង្កើត Google Sheet ថ្មី'}</span>
              </button>
            )}
          </div>
        </div>

        {syncError && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-red-600 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{syncError}</span>
            </span>
            {onOpenOAuthHelp && (
              <button
                onClick={onOpenOAuthHelp}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-normal cursor-pointer transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                <span>វិធីដោះស្រាយ Error 403 / Test Users</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

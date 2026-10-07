import React, { useState } from 'react';
import { Collaborator, CommuneEntry } from '../types/sheet';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Copy,
  Check,
  X,
  ExternalLink,
  Globe,
  Trash2,
} from 'lucide-react';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId: string | undefined;
  spreadsheetUrl: string | undefined;
  collaborators: Collaborator[];
  communes: CommuneEntry[];
  onAddCollaborator: (
    email: string,
    role: 'writer' | 'reader',
    assignedCommune: string,
    sendNotification: boolean
  ) => Promise<void>;
  onRemoveCollaborator: (permissionId: string) => Promise<void>;
  onSetPublicAccess: (role: 'writer' | 'reader') => Promise<void>;
  isLoading: boolean;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  spreadsheetId,
  spreadsheetUrl,
  collaborators,
  communes,
  onAddCollaborator,
  onRemoveCollaborator,
  onSetPublicAccess,
  isLoading,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'writer' | 'reader'>('writer');
  const [assignedCommune, setAssignedCommune] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (spreadsheetUrl) {
      navigator.clipboard.writeText(spreadsheetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await onAddCollaborator(email.trim(), role, assignedCommune, sendNotification);
      setEmail('');
      setStatusMessage(`បានចែករំលែកជាមួយ ${email} ដោយជោគជ័យ!`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`កំហុស៖ ${err.message || 'មិនអាចចែករំលែកបានទេ'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">បញ្ជីអ្នកសហការ Google Sheet (Share List)</h2>
              <p className="text-xs text-slate-400">
                អនុញ្ញាតឱ្យតំណាងតាមឃុំនីមួយៗចូលបំពេញទិន្នន័យជាក់ស្ដែង Real-Time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs md:text-sm">
          {/* Quick Copy Link Bar */}
          {spreadsheetUrl && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="truncate text-xs text-slate-600">
                <span className="font-semibold text-slate-800 block mb-0.5">
                  តំណភ្ជាប់ Google Sheet សម្រាប់ផ្ញើតាម Telegram/Email៖
                </span>
                <span className="truncate block font-mono text-[11px] text-slate-500">
                  {spreadsheetUrl}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">បានចម្លង</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>ចម្លងតំណ</span>
                    </>
                  )}
                </button>
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-blue-600 border border-slate-300 rounded-lg hover:bg-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Add Collaborator Form */}
          <form onSubmit={handleShare} className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-600" />
              បន្ថែមអ្នកទទួលបន្ទុកតាមឃុំ (Add Commune Officer)
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                អ៊ីមែល Google (Gmail Address) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="commune.clerk@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  តួនាទីសិទ្ធិ (Permission)
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'writer' | 'reader')}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                  >
                    <option value="writer">អាចកែប្រែទិន្នន័យបាន (Editor / Writer)</option>
                    <option value="reader">សម្រាប់តែមើលប៉ុណ្ណោះ (Viewer / Reader)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ឃុំដែលទទួលបន្ទុក (Assigned Commune)
                </label>
                <select
                  value={assignedCommune}
                  onChange={(e) => setAssignedCommune(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                >
                  <option value="">ឃុំទាំងអស់ (All Communes)</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.communeName}>
                      {c.communeNumberKh}. {c.communeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>ផ្ញើអ៊ីមែលជូនដំណឹងពី Google Sheets ទៅកាន់អ្នកប្រើប្រាស់</span>
              </label>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                {isLoading ? 'កំពុងចែករំលែក...' : 'ចែករំលែក (Invite)'}
              </button>
            </div>
          </form>

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
              {statusMessage}
            </div>
          )}

          {/* Quick Permission Preset for Team */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-800 text-xs">
                  សិទ្ធិតាមតំណភ្ជាប់សាធារណៈ (Link Sharing)
                </div>
                <div className="text-[11px] text-slate-500">
                  អនុញ្ញាតឱ្យអ្នកមានតំណភ្ជាប់កែប្រែដោយផ្ទាល់
                </div>
              </div>
            </div>
            <button
              onClick={() => onSetPublicAccess('writer')}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              បើកសិទ្ធិ Editor តាមតំណ
            </button>
          </div>

          {/* Active Collaborators List */}
          <div>
            <h4 className="font-semibold text-slate-800 text-xs mb-2">
              បញ្ជីអ្នកមានសិទ្ធិចូលប្រើប្រាស់ ({collaborators.length})
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
              {collaborators.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  មិនទាន់មានអ្នកសហការក្នុងបញ្ជីនៅឡើយទេ។
                </div>
              ) : (
                collaborators.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="flex items-center gap-2.5 truncate">
                      {c.photoLink ? (
                        <img src={c.photoLink} alt={c.displayName} className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {(c.displayName || c.emailAddress || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 text-xs truncate">
                          {c.displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{c.emailAddress}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          c.role === 'owner'
                            ? 'bg-amber-100 text-amber-800'
                            : c.role === 'writer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.role === 'owner' ? 'ម្ចាស់' : c.role === 'writer' ? 'កែប្រែ' : 'មើល'}
                      </span>

                      {c.role !== 'owner' && (
                        <button
                          onClick={() => onRemoveCollaborator(c.id)}
                          title="ដកសិទ្ធិចេញ"
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

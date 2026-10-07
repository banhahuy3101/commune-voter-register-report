import React, { useState } from 'react';
import { CommuneEntry } from '../types/sheet';
import {
  Send,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Share2,
  Building2,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface ShareCommuneLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  communes: CommuneEntry[];
  onOpenCommunePopup: (commune: CommuneEntry) => void;
}

export const ShareCommuneLinksModal: React.FC<ShareCommuneLinksModalProps> = ({
  isOpen,
  onClose,
  communes,
  onOpenCommunePopup,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;

  const getCommuneLink = (communeId: number) => {
    return `${baseUrl}?commune=${communeId}&popup=true`;
  };

  const handleCopy = (commune: CommuneEntry) => {
    const link = getCommuneLink(commune.id);
    navigator.clipboard.writeText(link);
    setCopiedId(commune.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTelegramShare = (commune: CommuneEntry) => {
    const link = getCommuneLink(commune.id);
    const text = `សូមមន្ត្រីទទួលបន្ទុក ${commune.communeName} (ស្រុកជើងព្រៃ) ចូលបំពេញទិន្នន័យការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ២០២៦ តាមតំណភ្ជាប់នេះ (បានចាក់សោសិទ្ធិកែប្រែសម្រាប់តែ ${commune.communeName})៖`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank');
  };

  const filteredCommunes = communes.filter((c) =>
    c.communeName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">ផ្ញើតំណភ្ជាប់តាមឃុំនីមួយៗ (Send Link by Commune)</h2>
              <p className="text-xs text-slate-400">
                មន្ត្រីបើកតំណ នឹងអាចកែប្រែបានតែឃុំរបស់ខ្លួនប៉ុណ្ណោះ (ឃុំផ្សេងទៀតចាក់សោ Read-Only)
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ប្រព័ន្ធការពារសុវត្ថិភាពទិន្នន័យ (Commune Lock Protection)៖</span>
            </div>
            <p className="leading-relaxed">
              ពេលមន្ត្រីបើកតំណភ្ជាប់តាមឃុំរបស់គាត់ ប្រព័ន្ធនឹង <strong>ចាក់សោសិទ្ធិ</strong> ឱ្យគាត់កែប្រែទិន្នន័យបានតែក្នុងជួរដេកនៃឃុំនោះប៉ុណ្ណោះ។
              គាត់មិនអាចចុចកែប្រែដោយដៃ ឬផ្លាស់ប្តូរទិន្នន័យរបស់ឃុំផ្សេងទៀតក្នុងតារាងបានឡើយ។
            </p>
          </div>

          {/* Search bar */}
          <div>
            <input
              type="text"
              placeholder="ស្វែងរកឈ្មោះឃុំ (Search commune)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* List of 10 Communes */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {filteredCommunes.map((commune) => (
              <div
                key={commune.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {commune.communeNumberKh}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{commune.communeName}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        <Lock className="w-2.5 h-2.5" />
                        <span>កែបានតែឃុំនេះ</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
                      {getCommuneLink(commune.id)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Test open popup button */}
                  <button
                    onClick={() => {
                      onOpenCommunePopup(commune);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    title="សាកល្បងបើក Pop-up ឃុំនេះ"
                  >
                    សាកល្បងបើក
                  </button>

                  {/* Telegram Share button */}
                  <button
                    onClick={() => handleTelegramShare(commune)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="ផ្ញើទៅកាន់ Telegram"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => handleCopy(commune)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      copiedId === commune.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {copiedId === commune.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>បានចម្លង</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>ចម្លងតំណ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

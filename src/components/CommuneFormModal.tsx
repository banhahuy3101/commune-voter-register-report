import React, { useState, useEffect } from 'react';
import { CommuneEntry, calculateRowFormulas, formatKhmerNumber } from '../types/sheet';
import {
  X,
  Save,
  Calculator,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CommuneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  communes: CommuneEntry[];
  activeCommuneId: number;
  onSelectCommuneId: (id: number) => void;
  onSaveCommune: (updated: CommuneEntry) => void;
  lockedCommuneId?: number | null;
}

export const CommuneFormModal: React.FC<CommuneFormModalProps> = ({
  isOpen,
  onClose,
  communes,
  activeCommuneId,
  onSelectCommuneId,
  onSaveCommune,
  lockedCommuneId,
}) => {
  const [formData, setFormData] = useState<CommuneEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'all'>('daily');

  // Load the active commune when activeCommuneId changes or modal opens
  useEffect(() => {
    const targetId = lockedCommuneId || activeCommuneId;
    const selected = communes.find((c) => c.id === targetId) || communes[0];
    if (selected) {
      setFormData({ ...selected });
    }
  }, [lockedCommuneId, activeCommuneId, communes, isOpen]);

  if (!isOpen || !formData) return null;

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (lockedCommuneId) return; // Disallow changing commune if locked to 1 commune link
    const newId = Number(e.target.value);
    onSelectCommuneId(newId);
    const target = communes.find((c) => c.id === newId);
    if (target) {
      setFormData({ ...target });
    }
  };

  const handleFieldChange = (field: keyof CommuneEntry, value: string) => {
    const cleanNum = Math.max(0, parseInt(value.replace(/,/g, ''), 10) || 0);
    const updated = {
      ...formData,
      [field]: cleanNum,
    };
    // Recalculate all formulas live
    setFormData(calculateRowFormulas(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      // Security check: if locked to a commune, only that commune can be saved
      if (lockedCommuneId && formData.id !== lockedCommuneId) {
        return;
      }
      onSaveCommune(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-amber-300 font-medium">
                ស្រុកជើងព្រៃ • បញ្ចូលទិន្នន័យតាមឃុំ (Fill by Commune)
              </div>
              <h2 className="text-base md:text-lg font-normal font-moul tracking-wide mt-0.5">
                ទម្រង់បំពេញទិន្នន័យតាមឃុំ
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commune Selector Banner */}
        <div className="bg-slate-100 p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              {lockedCommuneId ? (
                <div>
                  <label className="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-1">
                    ឃុំដែលអ្នកមានសិទ្ធិបំពេញ (Your Assigned Commune):
                  </label>
                  <div className="flex items-center gap-2.5 bg-blue-900 text-white px-3.5 py-2 rounded-xl border border-blue-700 shadow-xs">
                    <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-normal font-moul truncate text-amber-300">
                        {formData.communeNumberKh}. {formData.communeName}
                      </div>
                      <div className="text-[11px] text-blue-200">
                        🔒 បានចាក់សោតាមតំណភ្ជាប់ (មិនអាចប្តូរទៅឃុំផ្សេងបានឡើយ)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-1">
                    ជ្រើសរើសឃុំដែលត្រូវបំពេញ (Select Commune to Fill):
                  </label>
                  <div className="relative">
                    <select
                      value={formData.id}
                      onChange={handleCommuneChange}
                      className="w-full bg-white border-2 border-blue-500 rounded-xl py-2 px-3.5 pr-8 text-sm md:text-base font-normal text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
                    >
                      {communes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.communeNumberKh}. {c.communeName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl self-start sm:self-end">
              <button
                type="button"
                onClick={() => setActiveTab('daily')}
                className={`px-3 py-1.5 text-xs font-normal rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'daily'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ក្នុងគ្រា ថ្ងៃនេះ (Daily)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-normal rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                គ្រប់ក្រឡា (All Fields)
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: ក្នុងគ្រា ថ្ងៃនេះ (Daily Input Focus) */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="font-normal text-blue-950 text-xs md:text-sm uppercase tracking-wide">
                  ទិន្នន័យប្រចាំថ្ងៃ «ក្នុងគ្រា» ថ្ងៃនេះ (Today's Entry)
                </h3>
              </div>
              <span className="text-xs text-blue-700 font-normal bg-blue-100 px-2.5 py-0.5 rounded-full">
                បំពេញក្នុងជួរដេក៖ {formData.communeName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* 1. ចុះឈ្មោះថ្មី ក្នុងគ្រា */}
              <div className="bg-white p-3 rounded-xl border border-teal-300 shadow-2xs space-y-2">
                <div className="text-xs font-normal text-teal-900 flex items-center justify-between">
                  <span>ចុះឈ្មោះថ្មី</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 rounded">ក្នុងគ្រា</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">សរុប (Total)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.newRegCurrentTotal}
                    onChange={(e) => handleFieldChange('newRegCurrentTotal', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-teal-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">CPP</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.newRegCurrentCpp}
                    onChange={(e) => handleFieldChange('newRegCurrentCpp', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-teal-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* 2. លុបឈ្មោះ ក្នុងគ្រា */}
              <div className="bg-white p-3 rounded-xl border border-sky-300 shadow-2xs space-y-2">
                <div className="text-xs font-normal text-sky-900 flex items-center justify-between">
                  <span>លុបឈ្មោះ</span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 rounded">ក្នុងគ្រា</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">សរុប (Total)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deletedCurrentTotal}
                    onChange={(e) => handleFieldChange('deletedCurrentTotal', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-sky-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">CPP</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deletedCurrentCpp}
                    onChange={(e) => handleFieldChange('deletedCurrentCpp', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-sky-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* 3. កែទិន្ន័យ ក្នុងគ្រា */}
              <div className="bg-white p-3 rounded-xl border border-amber-300 shadow-2xs space-y-2">
                <div className="text-xs font-normal text-amber-900 flex items-center justify-between">
                  <span>កែទិន្នន័យ</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded">ក្នុងគ្រា</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">សរុប (Total)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bioCorrectionCurrentTotal}
                    onChange={(e) => handleFieldChange('bioCorrectionCurrentTotal', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-amber-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">CPP</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bioCorrectionCurrentCpp}
                    onChange={(e) => handleFieldChange('bioCorrectionCurrentCpp', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-amber-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 4. ជីវមាត្រ ក្នុងគ្រា */}
              <div className="bg-white p-3 rounded-xl border border-purple-300 shadow-2xs space-y-2">
                <div className="text-xs font-normal text-purple-900 flex items-center justify-between">
                  <span>ជីវមាត្រ</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 rounded">ក្នុងគ្រា</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">សរុប (Total)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.biometricCurrentTotal}
                    onChange={(e) => handleFieldChange('biometricCurrentTotal', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-purple-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">CPP</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.biometricCurrentCpp}
                    onChange={(e) => handleFieldChange('biometricCurrentCpp', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-purple-400 rounded-lg text-sm font-normal text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: ដើមគ្រា & បញ្ជី ២០២៥ (Shown when in 'all' mode or expandable) */}
          {activeTab === 'all' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 2025 List Base */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-normal text-slate-800 text-xs uppercase mb-3">
                  ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៥ (List 2025 Baseline)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">សរុប (Total 2025)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.list2025Total}
                      onChange={(e) => handleFieldChange('list2025Total', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">CPP (2025)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.list2025Cpp}
                      onChange={(e) => handleFieldChange('list2025Cpp', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* ដើមគ្រា (Starting/Prior Base Numbers) */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
                <h4 className="font-normal text-amber-950 text-xs uppercase mb-3">
                  ទិន្នន័យ «ដើមគ្រា» (Beginning of Period Base)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">ចុះថ្មី ដើមគ្រា (សរុប / CPP)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="សរុប"
                        value={formData.newRegStartTotal}
                        onChange={(e) => handleFieldChange('newRegStartTotal', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="CPP"
                        value={formData.newRegStartCpp}
                        onChange={(e) => handleFieldChange('newRegStartCpp', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">លុបឈ្មោះ ដើមគ្រា (សរុប / CPP)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="សរុប"
                        value={formData.deletedStartTotal}
                        onChange={(e) => handleFieldChange('deletedStartTotal', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="CPP"
                        value={formData.deletedStartCpp}
                        onChange={(e) => handleFieldChange('deletedStartCpp', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">កែទិន្នន័យ ដើមគ្រា (សរុប / CPP)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="សរុប"
                        value={formData.bioCorrectionStartTotal}
                        onChange={(e) => handleFieldChange('bioCorrectionStartTotal', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="CPP"
                        value={formData.bioCorrectionStartCpp}
                        onChange={(e) => handleFieldChange('bioCorrectionStartCpp', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">ជីវមាត្រ ដើមគ្រា (សរុប / CPP)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="សរុប"
                        value={formData.biometricStartTotal}
                        onChange={(e) => handleFieldChange('biometricStartTotal', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="CPP"
                        value={formData.biometricStartCpp}
                        onChange={(e) => handleFieldChange('biometricStartCpp', e.target.value)}
                        className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Live Calculation Summary Card */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-normal text-xs uppercase">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>លទ្ធផលគណនាស្វ័យប្រវត្តិនឹងត្រូវបំពេញចូលក្នុងជួរដេក (Auto-Calculation Result)</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                រូបមន្តគណនាភ្លាមៗ Real-Time
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <div className="text-slate-500 text-[11px]">បូកយោង ចុះថ្មី</div>
                <div className="text-base font-normal text-slate-800">
                  {formatKhmerNumber(formData.newRegCumulativeTotal)}
                </div>
                <div className="text-[10px] text-slate-600">
                  CPP: {formatKhmerNumber(formData.newRegCumulativeCpp)}
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <div className="text-slate-500 text-[11px]">បូកយោង លុបឈ្មោះ</div>
                <div className="text-base font-normal text-slate-800">
                  {formatKhmerNumber(formData.deletedCumulativeTotal)}
                </div>
                <div className="text-[10px] text-slate-600">
                  CPP: {formatKhmerNumber(formData.deletedCumulativeCpp)}
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <div className="text-slate-500 text-[11px]">បូកយោង កែទិន្នន័យ</div>
                <div className="text-base font-normal text-slate-800">
                  {formatKhmerNumber(formData.bioCorrectionCumulativeTotal)}
                </div>
                <div className="text-[10px] text-slate-600">
                  CPP: {formatKhmerNumber(formData.bioCorrectionCumulativeCpp)}
                </div>
              </div>

              <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs">
                <div className="text-emerald-100 text-[11px] font-normal">បញ្ជីឆ្នាំ២០២៦ (ចុងក្រោយ)</div>
                <div className="text-base font-normal">
                  {formatKhmerNumber(formData.list2026Total)}
                </div>
                <div className="text-[10px] text-emerald-200">
                  CPP: {formatKhmerNumber(formData.list2026Cpp)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs md:text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>រក្សាទុកចូលក្នុងជួរដេក {formData.communeName}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CommuneEntry,
  calculateDistrictTotal,
  calculateRowFormulas,
  formatKhmerNumber,
} from '../types/sheet';
import { Edit3, Check, Calculator, Filter, ArrowUpDown, Lock, Sparkles, Calendar } from 'lucide-react';

interface SpreadsheetTableProps {
  data: CommuneEntry[];
  onUpdateRow: (rowId: number, field: keyof CommuneEntry, value: number) => void;
  onOpenQuickForm: (commune: CommuneEntry) => void;
  selectedCommuneId: number | null;
  onSelectCommuneId: (id: number | null) => void;
  lockedCommuneId?: number | null;
  reportDateKh?: string;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  data,
  onUpdateRow,
  onOpenQuickForm,
  selectedCommuneId,
  onSelectCommuneId,
  lockedCommuneId,
  reportDateKh,
}) => {
  // Cell editing state
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    field: keyof CommuneEntry;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const districtTotal = calculateDistrictTotal(data);
  const assignedCommune = lockedCommuneId ? data.find((c) => c.id === lockedCommuneId) : null;

  // Filter rows if a commune is selected
  const displayedRows = selectedCommuneId
    ? data.filter((r) => r.id === selectedCommuneId)
    : data;

  const startEdit = (rowId: number, field: keyof CommuneEntry, currentVal: number) => {
    // If locked to a commune, strictly prohibit editing other communes
    if (lockedCommuneId && rowId !== lockedCommuneId) {
      return;
    }
    setEditingCell({ rowId, field });
    setTempValue(String(currentVal));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    if (lockedCommuneId && editingCell.rowId !== lockedCommuneId) {
      setEditingCell(null);
      return;
    }
    const num = Math.max(0, parseInt(tempValue.replace(/,/g, ''), 10) || 0);
    onUpdateRow(editingCell.rowId, editingCell.field, num);
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Helper renderer for editable numeric cell
  const renderCell = (
    entry: CommuneEntry,
    field: keyof CommuneEntry,
    isCalculated: boolean = false,
    customBg: string = ''
  ) => {
    const isEditing = editingCell?.rowId === entry.id && editingCell?.field === field;
    const value = entry[field] as number;
    const isRowLocked = Boolean(lockedCommuneId && entry.id !== lockedCommuneId);
    const isEditable = !isCalculated && !isRowLocked;

    if (isEditing) {
      return (
        <td className="p-1 border border-blue-400 bg-blue-50/50 min-w-[50px] text-center">
          <input
            type="number"
            min="0"
            autoFocus
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-center font-semibold text-blue-900 bg-white border border-blue-500 rounded px-1 py-0.5 text-xs focus:outline-hidden"
          />
        </td>
      );
    }

    if (isRowLocked) {
      return (
        <td
          title={`🔒 បានចាក់សោ (Read-only)៖ អ្នកអាចកែប្រែបានតែ ${assignedCommune?.communeName || 'ឃុំរបស់អ្នក'} ប៉ុណ្ណោះ`}
          className="p-1.5 border border-slate-300 text-xs text-center min-w-[48px] select-none bg-slate-100/60 text-slate-400 cursor-not-allowed opacity-80"
        >
          {formatKhmerNumber(value)}
        </td>
      );
    }

    return (
      <td
        onClick={() => isEditable && startEdit(entry.id, field, value)}
        title={
          isCalculated
            ? 'រូបមន្តគណនាស្វ័យប្រវត្តិ (Auto-calculated formula)'
            : 'ចុចដើម្បីកែប្រែទិន្នន័យ (Click to edit cell)'
        }
        className={`p-1.5 border border-slate-300 text-xs text-center transition-colors min-w-[48px] select-none ${
          isCalculated
            ? `${customBg || 'bg-slate-50/90'} text-slate-700 font-semibold cursor-default`
            : `${customBg} hover:bg-amber-100 hover:ring-1 hover:ring-amber-400 text-slate-900 cursor-pointer font-medium`
        }`}
      >
        {formatKhmerNumber(value)}
      </td>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
      {/* Table Controls / Filter */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">ជ្រើសរើសឃុំ (Filter):</span>
          </div>
          <select
            value={selectedCommuneId || ''}
            onChange={(e) => onSelectCommuneId(e.target.value ? Number(e.target.value) : null)}
            className="text-xs font-medium border border-slate-300 bg-white rounded-lg px-2.5 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="">
              {lockedCommuneId
                ? 'បង្ហាញឃុំទាំង១០ (មើលតែប៉ុណ្ណោះ / Read-Only)'
                : 'ឃុំទាំង១០ នៃស្រុកជើងព្រៃ (All 10 Communes)'}
            </option>
            {data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.communeNumberKh}. {c.communeName}
                {lockedCommuneId === c.id ? ' (✨ ឃុំរបស់អ្នក)' : ''}
              </option>
            ))}
          </select>

          {/* Locked Commune Status Indicator */}
          {assignedCommune && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>
                សិទ្ធិកែប្រែ៖ <strong>{assignedCommune.communeName}</strong> (ឃុំផ្សេងទៀតចាក់សោ Read-Only)
              </span>
            </div>
          )}

          {/* Date Indicator */}
          {reportDateKh && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[260px]">{reportDateKh}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-400"></span>
            <span>ក្រឡាបញ្ចូលដោយដៃ (Manual Entry)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-400"></span>
            <span>គណនាស្វ័យប្រវត្តិ (Formulas =SUM)</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead className="font-moul font-normal text-slate-900">
            {/* Main Section Header Row 1 */}
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 text-[10px] md:text-xs">
              <th
                rowSpan={3}
                className="p-2 border border-slate-300 text-center min-w-[42px] bg-slate-100 font-normal"
              >
                ល.រ
              </th>
              <th
                rowSpan={3}
                className="p-2 border border-slate-300 text-center min-w-[120px] bg-slate-100 font-normal"
              >
                ឃុំ
              </th>

              {/* ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៥ */}
              <th
                colSpan={2}
                rowSpan={2}
                className="p-2 border border-slate-300 text-center bg-slate-200/80 text-slate-800 font-normal"
              >
                ចំនួនក្នុង <br /> បញ្ជីឆ្នាំ២០២៥
              </th>

              {/* ចុះឈ្មោះបោះឆ្នោតថ្មី */}
              <th
                colSpan={6}
                className="p-2 border border-slate-300 text-center bg-teal-100/90 text-teal-900 font-normal"
              >
                ចុះឈ្មោះបោះឆ្នោតថ្មី
              </th>

              {/* លុបឈ្មោះចេញពីបញ្ជី */}
              <th
                colSpan={6}
                className="p-2 border border-slate-300 text-center bg-sky-100/90 text-sky-900 font-normal"
              >
                លុបឈ្មោះចេញពីបញ្ជី
              </th>

              {/* កែទិន្ន័យជីវប្រវត្តិ */}
              <th
                colSpan={6}
                className="p-2 border border-slate-300 text-center bg-amber-100/90 text-amber-900 font-normal"
              >
                កែទិន្ន័យជីវប្រវត្តិ
              </th>

              {/* បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ */}
              <th
                colSpan={6}
                className="p-2 border border-slate-300 text-center bg-purple-100/90 text-purple-900 font-normal"
              >
                បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ
              </th>

              {/* ចំនួនក្នុងបញ្ជី ឆ្នាំ២០២៦ */}
              <th
                colSpan={2}
                rowSpan={2}
                className="p-2 border border-slate-300 text-center bg-slate-200/80 text-slate-800 font-normal"
              >
                ចំនួនក្នុងបញ្ជី <br /> ឆ្នាំ២០២៦
              </th>

              {/* Action Column */}
              <th
                rowSpan={3}
                className="p-2 border border-slate-300 text-center min-w-[70px] bg-slate-100 text-slate-700 font-normal"
              >
                កែប្រែ
              </th>
            </tr>

            {/* Sub-Header Row 2: ដើមគ្រា / ក្នុងគ្រា / បូកយោង */}
            <tr className="text-slate-800 border-b border-slate-300 text-[9px] md:text-[10px]">
              {/* ចុះឈ្មោះថ្មី */}
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-teal-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-teal-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-teal-100 font-normal">
                បូកយោង
              </th>

              {/* លុបឈ្មោះ */}
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-sky-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-sky-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-sky-100 font-normal">
                បូកយោង
              </th>

              {/* កែទិន្ន័យ */}
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-amber-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-amber-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-amber-100 font-normal">
                បូកយោង
              </th>

              {/* ជីវមាត្រ */}
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-purple-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-purple-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-1 border border-slate-300 text-center bg-purple-100 font-normal">
                បូកយោង
              </th>
            </tr>

            {/* Sub-Header Row 3: សរុប / CPP for every pair */}
            <tr className="text-[8.5px] md:text-[9.5px] text-slate-700 bg-slate-50 border-b border-slate-300">
              {/* 2025 */}
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>

              {/* ចុះឈ្មោះថ្មី */}
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center bg-teal-100/60 font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center bg-teal-100/60 font-normal">CPP</th>

              {/* លុបឈ្មោះ */}
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center bg-sky-100/60 font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center bg-sky-100/60 font-normal">CPP</th>

              {/* កែទិន្ន័យ */}
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center bg-amber-100/60 font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center bg-amber-100/60 font-normal">CPP</th>

              {/* ជីវមាត្រ */}
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center font-normal">CPP</th>
              <th className="p-1 border border-slate-300 text-center bg-purple-100/60 font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center bg-purple-100/60 font-normal">CPP</th>

              {/* 2026 */}
              <th className="p-1 border border-slate-300 text-center bg-slate-200/60 font-normal">សរុប</th>
              <th className="p-1 border border-slate-300 text-center bg-slate-200/60 font-normal">CPP</th>
            </tr>
          </thead>

          <tbody>
            {displayedRows.map((row) => {
              const isMyCommune = Boolean(lockedCommuneId && row.id === lockedCommuneId);
              const isOtherLocked = Boolean(lockedCommuneId && row.id !== lockedCommuneId);

              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isMyCommune
                      ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-500 font-semibold'
                      : isOtherLocked
                      ? 'opacity-80 hover:bg-slate-50 bg-slate-50/30'
                      : 'hover:bg-blue-50/30'
                  }`}
                >
                  <td className="p-1.5 border border-slate-300 text-center font-semibold text-slate-800 bg-slate-50/50">
                    {row.communeNumberKh}
                  </td>
                  <td className="p-1.5 border border-slate-300 font-semibold text-slate-900 whitespace-nowrap bg-slate-50/30">
                    <div className="flex items-center justify-between gap-1.5">
                      <span>{row.communeName}</span>
                      {isMyCommune && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-2xs shrink-0">
                          <Sparkles className="w-3 h-3" />
                          <span>ឃុំរបស់អ្នក</span>
                        </span>
                      )}
                      {isOtherLocked && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-normal shrink-0"
                          title="បានចាក់សោ (Read-only) - មិនអាចកែប្រែបានឡើយ"
                        >
                          <Lock className="w-3 h-3" />
                          <span>ចាក់សោ</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 2025 List */}
                  {renderCell(row, 'list2025Total', false, 'bg-slate-50/40')}
                  {renderCell(row, 'list2025Cpp', false, 'bg-slate-50/40')}

                  {/* ចុះឈ្មោះថ្មី */}
                  {renderCell(row, 'newRegStartTotal', false)}
                  {renderCell(row, 'newRegStartCpp', false)}
                  {renderCell(row, 'newRegCurrentTotal', false, 'bg-teal-50/30 font-medium')}
                  {renderCell(row, 'newRegCurrentCpp', false, 'bg-teal-50/30 font-medium')}
                  {renderCell(row, 'newRegCumulativeTotal', true, 'bg-teal-100/40')}
                  {renderCell(row, 'newRegCumulativeCpp', true, 'bg-teal-100/40')}

                  {/* លុបឈ្មោះ */}
                  {renderCell(row, 'deletedStartTotal', false)}
                  {renderCell(row, 'deletedStartCpp', false)}
                  {renderCell(row, 'deletedCurrentTotal', false, 'bg-sky-50/30 font-medium')}
                  {renderCell(row, 'deletedCurrentCpp', false, 'bg-sky-50/30 font-medium')}
                  {renderCell(row, 'deletedCumulativeTotal', true, 'bg-sky-100/40')}
                  {renderCell(row, 'deletedCumulativeCpp', true, 'bg-sky-100/40')}

                  {/* កែទិន្ន័យ */}
                  {renderCell(row, 'bioCorrectionStartTotal', false)}
                  {renderCell(row, 'bioCorrectionStartCpp', false)}
                  {renderCell(row, 'bioCorrectionCurrentTotal', false, 'bg-amber-50/30 font-medium')}
                  {renderCell(row, 'bioCorrectionCurrentCpp', false, 'bg-amber-50/30 font-medium')}
                  {renderCell(row, 'bioCorrectionCumulativeTotal', true, 'bg-amber-100/40')}
                  {renderCell(row, 'bioCorrectionCumulativeCpp', true, 'bg-amber-100/40')}

                  {/* ជីវមាត្រ */}
                  {renderCell(row, 'biometricStartTotal', false)}
                  {renderCell(row, 'biometricStartCpp', false)}
                  {renderCell(row, 'biometricCurrentTotal', false, 'bg-purple-50/30 font-medium')}
                  {renderCell(row, 'biometricCurrentCpp', false, 'bg-purple-50/30 font-medium')}
                  {renderCell(row, 'biometricCumulativeTotal', true, 'bg-purple-100/40')}
                  {renderCell(row, 'biometricCumulativeCpp', true, 'bg-purple-100/40')}

                  {/* 2026 List */}
                  {renderCell(row, 'list2026Total', true, 'bg-slate-200/50')}
                  {renderCell(row, 'list2026Cpp', true, 'bg-slate-200/50')}

                  {/* Quick Edit Action Button / Lock Status */}
                  <td className="p-1 border border-slate-300 text-center bg-slate-50">
                    {isOtherLocked ? (
                      <span
                        title="បានចាក់សោ (Read-only)៖ អ្នកអាចកែប្រែបានតែឃុំរបស់អ្នកប៉ុណ្ណោះ"
                        className="inline-flex items-center justify-center p-1 text-slate-400 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => onOpenQuickForm(row)}
                        title={`បើកទម្រង់កែប្រែ ${row.communeName}`}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isMyCommune
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Total Row (សរុប - Cheung Prey District Summary) */}
            <tr className="bg-amber-100/70 font-bold text-slate-900 border-t-2 border-slate-400">
              <td className="p-2 border border-slate-300 text-center"></td>
              <td className="p-2 border border-slate-300 text-center font-moul text-amber-950">
                សរុប
              </td>

              {/* 2025 */}
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.list2025Total)}
              </td>
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.list2025Cpp)}
              </td>

              {/* ចុះឈ្មោះថ្មី */}
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.newRegStartTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.newRegStartCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-teal-100/60">
                {formatKhmerNumber(districtTotal.newRegCurrentTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-teal-100/60">
                {formatKhmerNumber(districtTotal.newRegCurrentCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-teal-200/60">
                {formatKhmerNumber(districtTotal.newRegCumulativeTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-teal-200/60">
                {formatKhmerNumber(districtTotal.newRegCumulativeCpp)}
              </td>

              {/* លុបឈ្មោះ */}
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.deletedStartTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.deletedStartCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-sky-100/60">
                {formatKhmerNumber(districtTotal.deletedCurrentTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-sky-100/60">
                {formatKhmerNumber(districtTotal.deletedCurrentCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-sky-200/60">
                {formatKhmerNumber(districtTotal.deletedCumulativeTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-sky-200/60">
                {formatKhmerNumber(districtTotal.deletedCumulativeCpp)}
              </td>

              {/* កែទិន្ន័យ */}
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.bioCorrectionStartTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.bioCorrectionStartCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-amber-100/60">
                {formatKhmerNumber(districtTotal.bioCorrectionCurrentTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-amber-100/60">
                {formatKhmerNumber(districtTotal.bioCorrectionCurrentCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-amber-200/60">
                {formatKhmerNumber(districtTotal.bioCorrectionCumulativeTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-amber-200/60">
                {formatKhmerNumber(districtTotal.bioCorrectionCumulativeCpp)}
              </td>

              {/* ជីវមាត្រ */}
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.biometricStartTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center">
                {formatKhmerNumber(districtTotal.biometricStartCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-purple-100/60">
                {formatKhmerNumber(districtTotal.biometricCurrentTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-purple-100/60">
                {formatKhmerNumber(districtTotal.biometricCurrentCpp)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-purple-200/60">
                {formatKhmerNumber(districtTotal.biometricCumulativeTotal)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-purple-200/60">
                {formatKhmerNumber(districtTotal.biometricCumulativeCpp)}
              </td>

              {/* 2026 */}
              <td className="p-2 border border-slate-300 text-center bg-slate-300/70">
                {formatKhmerNumber(districtTotal.list2026Total)}
              </td>
              <td className="p-2 border border-slate-300 text-center bg-slate-300/70">
                {formatKhmerNumber(districtTotal.list2026Cpp)}
              </td>

              <td className="p-2 border border-slate-300 text-center bg-amber-100">
                <Calculator className="w-4 h-4 mx-auto text-amber-800" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

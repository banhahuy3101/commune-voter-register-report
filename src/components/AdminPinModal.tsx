import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X, ShieldAlert, Eye, EyeOff, Unlock } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin?: string;
  assignedCommuneName?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPin = '1234',
  assignedCommuneName,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg('');
      setShowPin(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEntered = pinInput.trim();
    const cleanExpected = (expectedPin || '1234').trim();

    if (!cleanEntered) {
      setErrorMsg('សូមបញ្ចូលលេខកូដ PIN!');
      return;
    }

    if (cleanEntered === cleanExpected) {
      setErrorMsg('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('លេខកូដ PIN មិនត្រឹមត្រូវទេ! សូមព្យាយាមម្តងទៀត។');
      setPinInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-normal text-white">
                ដោះសោរបៀបមន្ត្រីស្រុក (Admin Unlock)
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                បញ្ចូលលេខកូដ PIN ប្រព័ន្ធដើម្បីកែប្រែគ្រប់ឃុំ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {assignedCommuneName && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                បច្ចុប្បន្នអ្នកជាប់សិទ្ធិកែបានតែ <span className="font-normal text-amber-950 underline">{assignedCommuneName}</span> ប៉ុណ្ណោះ។
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-normal text-slate-700 mb-1.5">
              លេខកូដសម្ងាត់ Admin PIN Code *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={12}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="បញ្ចូលលេខកូដ PIN (ឧទាហរណ៍៖ 1234)"
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-base text-slate-900 font-normal tracking-wider bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPin ? 'លាក់ PIN' : 'បង្ហាញ PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg ? (
              <p className="mt-1.5 text-xs text-red-600 font-normal flex items-center gap-1">
                <span>{errorMsg}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-400 font-normal">
                លេខកូដសម្ងាត់លំនាំដើមក្នុងប្រព័ន្ធគឺ <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">1234</code>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-normal text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Unlock className="w-4 h-4" />
              <span>ដោះសោ (Unlock)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

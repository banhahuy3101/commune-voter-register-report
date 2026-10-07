import React from 'react';
import { AlertTriangle, ExternalLink, X, CheckCircle, ShieldAlert, Users, Globe } from 'lucide-react';

interface OAuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  blockedEmail?: string;
}

export const OAuthHelpModal: React.FC<OAuthHelpModalProps> = ({
  isOpen,
  onClose,
  projectId = 'gen-lang-client-0648418690',
  blockedEmail = 'banha.fake@gmail.com',
}) => {
  if (!isOpen) return null;

  const directConsentUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg leading-tight">
                វិធីដោះស្រាយ Error 403: access_denied
              </h3>
              <p className="text-xs text-amber-100 mt-0.5 font-medium">
                Google Verification & Test Users Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-800 text-sm leading-relaxed custom-scrollbar">
          {/* Explanation Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm space-y-1">
              <p className="font-semibold text-amber-950">
                មូលហេតុដែល Google រារាំង (Error 403 / Access blocked)៖
              </p>
              <p>
                គម្រោង Google Cloud របស់អ្នក (<code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-mono text-[11px]">{projectId}</code>) កំពុងស្ថិតក្នុងស្ថានភាព <b>&quot;Testing&quot; (របៀបសាកល្បង)</b>។ ក្នុងដំណាក់កាលនេះ Google អនុញ្ញាតឱ្យតែ Email ណាដែលបានចុះឈ្មោះក្នុងបញ្ជី <b>Test users</b> ប៉ុណ្ណោះដែលអាច Login បាន។
              </p>
            </div>
          </div>

          {/* Solution 1: Add to Test Users */}
          <div className="border border-blue-200 rounded-xl p-4.5 bg-blue-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Users className="w-5 h-5 text-blue-600" />
                <span>វិធីទី ១៖ បន្ថែម Email ទៅក្នុង Test Users (ងាយស្រួល និងលឿនបំផុត)</span>
              </div>
              <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                ណែនាំ
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-gray-700 pl-1">
              <li>
                បើកទៅកាន់ផ្ទាំងកំណត់ Google Cloud OAuth Consent Screen៖
                <div className="mt-1.5 mb-1.5">
                  <a
                    href={directConsentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ចុចទីនេះដើម្បីបើក Google Cloud Console (OAuth Screen)</span>
                  </a>
                </div>
              </li>
              <li>
                អូសចុះមកក្រោមត្រង់ផ្នែក <b>&quot;Test users&quot;</b> រួចចុចលើប៊ូតុង <b>&quot;+ ADD USERS&quot;</b>
              </li>
              <li>
                វាយបញ្ចូល Email របស់អ្នក (ឧទាហរណ៍ <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-blue-700">{blockedEmail}</code>)
              </li>
              <li>
                ចុច <b>SAVE</b>
              </li>
              <li>
                ត្រឡប់មកកាន់កម្មវិធីនេះវិញ រួចចុច <b>&quot;ចូលគណនី Google&quot;</b> ម្តងទៀត នោះនឹងអាច Login បានភ្លាមៗ!
              </li>
            </ol>
          </div>

          {/* Solution 2: Publish App */}
          <div className="border border-emerald-200 rounded-xl p-4.5 bg-emerald-50/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>វិធីទី ២៖ ប្តូរ Publishing status ទៅជា &quot;In Production&quot; (អនុញ្ញាតគ្រប់ Gmail)</span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-xs md:text-sm text-gray-700 pl-1">
              <li>
                ក្នុងទំព័រ{' '}
                <a
                  href={directConsentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold underline hover:text-emerald-900"
                >
                  OAuth consent screen
                </a>{' '}
                ដដែល
              </li>
              <li>
                ត្រង់ផ្នែក <b>Publishing status</b> ដែលកំពុងដាក់ថា <i>Testing</i> ➔ ចុចប៊ូតុង <b>&quot;PUBLISH APP&quot;</b>
              </li>
              <li>ចុច <b>CONFIRM</b></li>
              <li>
                ពេលនេះគ្រប់គណនី Gmail ទាំងអស់អាច Login បានដោយសេរី (ពេល Login ប្រសិនបើ Google បង្ហាញផ្ទាំង <i>&quot;Google hasn&apos;t verified this app&quot;</i> គ្រាន់តែចុច <b>Advanced ➔ Go to ... (unsafe)</b> ជាការស្រេច)។
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3.5 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>អនុវត្តរួចរាល់ អាចចុច Login សាកល្បងឡើងវិញ</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            យល់ព្រម / បិទ
          </button>
        </div>
      </div>
    </div>
  );
};

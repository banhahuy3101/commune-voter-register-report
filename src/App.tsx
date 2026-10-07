/**
 * Cambodian Commune Voter Registration Sheet Manager
 * Synced Real-Time with Google Sheets
 */
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  CommuneEntry,
  SheetMetadata,
  MonthlyRecord,
  Collaborator,
  INITIAL_COMMUNES_DATA,
  calculateRowFormulas,
} from './types/sheet';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  setCachedAccessToken,
} from './services/firebaseAuth';
import {
  createCommuneSpreadsheet,
  syncSpreadsheetData,
  fetchSpreadsheetData,
} from './services/googleSheetsService';
import {
  subscribeToCommunes,
  saveCommuneToFirestore,
  subscribeToDistrictSettings,
  saveDistrictSettingsToFirestore,
  subscribeToMonthlyRecords,
  saveMonthlyRecordToFirestore,
  deleteMonthlyRecordFromFirestore,
} from './services/firestoreService';
import {
  shareSpreadsheetWithEmail,
  listFileCollaborators,
  removeCollaboratorAccess,
  setGeneralLinkAccess,
} from './services/googleDriveService';
import { Header } from './components/Header';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { MonthlySidebar } from './components/MonthlySidebar';
import { CommuneFormModal } from './components/CommuneFormModal';
import { CollaboratorsModal } from './components/CollaboratorsModal';
import { ShareCommuneLinksModal } from './components/ShareCommuneLinksModal';
import { OfficialDocumentView } from './components/OfficialDocumentView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { OAuthHelpModal } from './components/OAuthHelpModal';
import {
  FileSpreadsheet,
  Users,
  RefreshCw,
  Info,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building2,
  AlertCircle,
  Send,
  Edit3,
  Lock,
} from 'lucide-react';

const STORAGE_KEY_METADATA = 'khmer_voter_sheet_metadata_v1';
const STORAGE_KEY_DATA = 'khmer_voter_sheet_data_v1';
const STORAGE_KEY_MONTHS = 'khmer_voter_monthly_records_v1';
const STORAGE_KEY_ACTIVE_MONTH = 'khmer_voter_active_month_v1';

const DEFAULT_INITIAL_MONTHS: MonthlyRecord[] = [
  {
    id: 'month-2026-10',
    monthName: 'ខែតុលា ឆ្នាំ២០២៦',
    reportDateKh: 'ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦',
    signerRightDateLocation: 'ជើងព្រៃ ថ្ងៃទី ៧ ខែតុលា ឆ្នាំ២០២៦',
    communes: INITIAL_COMMUNES_DATA.map((row) => calculateRowFormulas(row)),
    createdAt: '2026-10-07T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'month-2026-09',
    monthName: 'ខែកញ្ញា ឆ្នាំ២០២៦',
    reportDateKh: 'ប្រចាំថ្ងៃទី ៣០ ខែ កញ្ញា ឆ្នាំ ២០២៦',
    signerRightDateLocation: 'ជើងព្រៃ ថ្ងៃទី ៣០ ខែកញ្ញា ឆ្នាំ២០២៦',
    communes: INITIAL_COMMUNES_DATA.map((row) =>
      calculateRowFormulas({
        ...row,
        newRegCurrentTotal: 0,
        newRegCurrentCpp: 0,
        deletedCurrentTotal: 0,
        deletedCurrentCpp: 0,
        bioCorrectionCurrentTotal: 0,
        bioCorrectionCurrentCpp: 0,
        biometricCurrentTotal: 0,
        biometricCurrentCpp: 0,
      })
    ),
    createdAt: '2026-09-30T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Sheet & Commune Data State
  const [metadata, setMetadata] = useState<SheetMetadata>(() => {
    const defaults: SheetMetadata = {
      provinceKh: 'ខេត្តកំពង់ចាម',
      districtKh: 'ស្រុកជើងព្រៃ',
      logoUrl: '/cpp-logo.png',
      reportTitleKh: 'លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦',
      reportDateKh: 'ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦',
      signerLeftTitle: 'បានឃើញ និងឯកភាព / ជ.គណៈអចិន្ត្រៃយ៍ / អនុប្រធានប្រចាំការ',
      signerLeftName: 'ឆាយ វ៉ាន់ស៊ី',
      signerRightDateLocation: 'ជើងព្រៃ ថ្ងៃទី ៧ ខែតុលា ឆ្នាំ២០២៦',
      signerRightTitle: 'អ្នកធ្វើតារាង',
      signerRightName: 'ស៊ីម ល័ក្ខ',
    };
    const saved = localStorage.getItem(STORAGE_KEY_METADATA);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          logoUrl: defaults.logoUrl,
          signerLeftTitle: defaults.signerLeftTitle,
          signerLeftName: defaults.signerLeftName,
          signerRightDateLocation: defaults.signerRightDateLocation,
          signerRightTitle: defaults.signerRightTitle,
          signerRightName: defaults.signerRightName,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return defaults;
  });

  const [communes, setCommunes] = useState<CommuneEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMMUNES_DATA.map((row) => calculateRowFormulas(row));
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCommuneId, setSelectedCommuneId] = useState<number | null>(null);

  // Saved Months State (Left Side Menu)
  const [months, setMonths] = useState<MonthlyRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MONTHS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_INITIAL_MONTHS;
  });

  const [activeMonthId, setActiveMonthId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_MONTH);
    if (saved) return saved;
    return 'month-2026-10';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Commune Link Lock State: When user opens a specific commune link (?commune=X), only their commune is editable
  const [lockedCommuneId, setLockedCommuneId] = useState<number | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const communeParam = params.get('commune');
      if (communeParam) {
        const parsed = parseInt(communeParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // UI / Modal States
  const [isCommunePopupOpen, setIsCommunePopupOpen] = useState(false);
  const [activeCommuneId, setActiveCommuneId] = useState<number>(1);
  const [isShareLinksModalOpen, setIsShareLinksModalOpen] = useState(false);
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false);
  const [isOfficialView, setIsOfficialView] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [isOAuthHelpOpen, setIsOAuthHelpOpen] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState('banha.fake@gmail.com');

  // Assigned commune object
  const assignedCommune = lockedCommuneId
    ? communes.find((c) => c.id === lockedCommuneId)
    : null;

  // Active month object
  const activeMonth = months.find((m) => m.id === activeMonthId) || months[0];

  // Real-time Firestore subscription for Communes, Settings, and Monthly Records
  useEffect(() => {
    // 1. Subscribe to Communes
    const unsubscribeCommunes = subscribeToCommunes(
      (updatedList) => {
        if (updatedList && updatedList.length > 0) {
          setCommunes(updatedList);
          setIsFirebaseLive(true);
        }
      },
      (err) => {
        console.warn('Firestore live listener notice:', err);
      }
    );

    // 2. Subscribe to District Settings
    const unsubscribeSettings = subscribeToDistrictSettings((savedSettings) => {
      if (savedSettings) {
        setMetadata((prev) => ({ ...prev, ...savedSettings }));
      }
    });

    // 3. Subscribe to Monthly Records
    const unsubscribeMonths = subscribeToMonthlyRecords(
      (records) => {
        if (records && records.length > 0) {
          setMonths(records);
        } else {
          // Seed default months in Firestore if empty
          DEFAULT_INITIAL_MONTHS.forEach((m) => {
            saveMonthlyRecordToFirestore(m).catch(console.warn);
          });
        }
      },
      (err) => {
        console.warn('Firestore monthly records notice:', err);
      }
    );

    return () => {
      unsubscribeCommunes();
      unsubscribeSettings();
      unsubscribeMonths();
    };
  }, []);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Check URL parameters on mount for direct commune popup & commune link locking
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const communeParam = params.get('commune');
      const popupParam = params.get('popup') || params.get('fill');

      if (communeParam || popupParam === 'true') {
        let foundId = 1;
        if (communeParam) {
          const parsed = parseInt(communeParam, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
            foundId = parsed;
          } else {
            const match = communes.find((c) => c.communeName.includes(communeParam));
            if (match) foundId = match.id;
          }
          // Strictly lock editing to this commune for link users
          setLockedCommuneId(foundId);
        }
        setActiveCommuneId(foundId);
        setSelectedCommuneId(foundId);
        if (popupParam !== 'false') {
          setIsCommunePopupOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_METADATA, JSON.stringify(metadata));
  }, [metadata]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(communes));
  }, [communes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONTHS, JSON.stringify(months));
  }, [months]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_MONTH, activeMonthId);
  }, [activeMonthId]);

  // Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch collaborators if sheet is connected
  const loadCollaborators = useCallback(
    async (token: string, fileId: string) => {
      try {
        setIsLoadingCollaborators(true);
        const list = await listFileCollaborators(token, fileId);
        setCollaborators(list);
      } catch (e) {
        console.error('Error loading collaborators:', e);
      } finally {
        setIsLoadingCollaborators(false);
      }
    },
    []
  );

  useEffect(() => {
    if (accessToken && metadata.spreadsheetId) {
      loadCollaborators(accessToken, metadata.spreadsheetId);
    }
  }, [accessToken, metadata.spreadsheetId, loadCollaborators]);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setSuccessBanner(`បានចូលគណនី Google ជោគជ័យ៖ ${res.user.email}`);
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = String(err.message || '');
      const code = String(err.code || '');

      // Check if blocked by Google verification / OAuth testing status
      if (
        msg.includes('access_denied') ||
        msg.includes('verification process') ||
        msg.includes('403') ||
        msg.includes('blocked') ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        setSyncError(
          'ការចូលគណនីបានបរាជ័យ (Error 403 / Access Blocked)៖ Google OAuth Consent Screen ត្រូវការបន្ថែម Email របស់អ្នកទៅក្នុង Test Users។'
        );
        setIsOAuthHelpOpen(true);
      } else {
        setSyncError(`ការចូលគណនីបានបរាជ័យ៖ ${err.message || 'Error'}`);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // Monthly Records Actions
  const handleSelectMonth = (monthId: string) => {
    const target = months.find((m) => m.id === monthId);
    if (!target) return;
    setActiveMonthId(monthId);
    setCommunes(target.communes);
    setMetadata((prev) => ({
      ...prev,
      reportDateKh: target.reportDateKh,
      spreadsheetId: target.spreadsheetId || undefined,
      spreadsheetUrl: target.spreadsheetUrl || undefined,
    }));
    setSuccessBanner(`បានប្តូរទៅកាន់៖ ${target.monthName} (${target.reportDateKh})`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleCreateMonth = async (
    monthName: string,
    reportDate: string,
    copyCurrentData: boolean
  ) => {
    const newId = `month-${Date.now()}`;
    const newMonthData: CommuneEntry[] = copyCurrentData
      ? communes.map((c) => ({ ...c }))
      : INITIAL_COMMUNES_DATA.map((c) => calculateRowFormulas(c));

    const newRecord: MonthlyRecord = {
      id: newId,
      monthName,
      reportDateKh: reportDate,
      signerRightDateLocation: `ជើងព្រៃ ${reportDate.replace('ប្រចាំ', '')}`,
      communes: newMonthData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMonths((prev) => [newRecord, ...prev]);
    setActiveMonthId(newId);
    setCommunes(newMonthData);
    setMetadata((prev) => ({
      ...prev,
      reportDateKh: reportDate,
      spreadsheetId: undefined,
      spreadsheetUrl: undefined,
    }));

    try {
      await saveMonthlyRecordToFirestore(newRecord);
      setSuccessBanner(`បានបង្កើត និងរក្សាទុករបាយការណ៍ «${monthName}» ក្នុងបញ្ជីជោគជ័យ!`);
    } catch (e: any) {
      setSuccessBanner(`បានបង្កើត «${monthName}» ក្នុងបញ្ជីរួចរាល់!`);
    }
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleDuplicateMonth = async (monthId: string) => {
    const source = months.find((m) => m.id === monthId);
    if (!source) return;
    const newId = `month-${Date.now()}`;
    const duplicateRecord: MonthlyRecord = {
      ...source,
      id: newId,
      monthName: `ចម្លង - ${source.monthName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      communes: source.communes.map((c) => ({ ...c })),
    };

    setMonths((prev) => [duplicateRecord, ...prev]);
    setActiveMonthId(newId);
    setCommunes(duplicateRecord.communes);
    try {
      await saveMonthlyRecordToFirestore(duplicateRecord);
      setSuccessBanner(`បានចម្លង «${duplicateRecord.monthName}» ជោគជ័យ!`);
    } catch (e) {
      console.warn(e);
    }
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleDeleteMonth = (monthId: string) => {
    if (months.length <= 1) {
      setSyncError('មិនអាចលុបបានទេ ត្រូវតែមានយ៉ាងហោចណាស់១ខែក្នុងបញ្ជី!');
      setTimeout(() => setSyncError(null), 3000);
      return;
    }
    const target = months.find((m) => m.id === monthId);
    setConfirmDialog({
      isOpen: true,
      isDestructive: true,
      title: 'លុបរបាយការណ៍ប្រចាំខែ (Delete Month)',
      message: `តើលោកអ្នកពិតជាចង់លុបរបាយការណ៍ «${target?.monthName || ''}» ចេញពីបញ្ជីមែនទេ?`,
      confirmLabel: 'លុបចេញ',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const remaining = months.filter((m) => m.id !== monthId);
        setMonths(remaining);
        if (activeMonthId === monthId && remaining.length > 0) {
          handleSelectMonth(remaining[0].id);
        }
        try {
          await deleteMonthlyRecordFromFirestore(monthId);
          setSuccessBanner(`បានលុប «${target?.monthName || ''}» ចេញពីបញ្ជីជោគជ័យ!`);
        } catch (e) {
          setSuccessBanner(`បានលុបចេញពីបញ្ជីរួចរាល់!`);
        }
        setTimeout(() => setSuccessBanner(null), 3000);
      },
    });
  };

  // Helper to ensure valid access token before Workspace API calls
  const ensureAuth = async (): Promise<string> => {
    let token = accessToken || (await getAccessToken());
    if (!token) {
      const res = await googleSignIn();
      if (!res?.accessToken) {
        throw new Error('ត្រូវការចូលគណនី Google (Google sign-in required)');
      }
      setUser(res.user);
      setAccessToken(res.accessToken);
      token = res.accessToken;
    }
    return token;
  };

  // Create Google Spreadsheet
  const handleRequestCreateSheet = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'បង្កើត Google Sheet ថ្មី (Create Google Sheet)',
      message:
        'តើអ្នកពិតជាចង់បង្កើតឯកសារ Google Sheet ថ្មីក្នុងគណនី Google Drive របស់អ្នកតាមទម្រង់ផ្លូវការស្រុកជើងព្រៃនេះមែនទេ?\n\nទិន្នន័យឃុំទាំង១០ រួមទាំងរូបមន្ត និងពណ៌ នឹងត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិ។',
      confirmLabel: 'បង្កើត Sheet ឥឡូវនេះ',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setIsCreating(true);
          setSyncError(null);
          const token = await ensureAuth();
          const result = await createCommuneSpreadsheet(token, metadata, communes);

          setMetadata((prev) => {
            const next = {
              ...prev,
              spreadsheetId: result.spreadsheetId,
              spreadsheetUrl: result.spreadsheetUrl,
            };
            saveDistrictSettingsToFirestore(next).catch(console.warn);
            return next;
          });

          // Also attach spreadsheet to active month in months list and Firestore
          setMonths((prev) =>
            prev.map((m) => {
              if (m.id === activeMonthId) {
                const updated = {
                  ...m,
                  spreadsheetId: result.spreadsheetId,
                  spreadsheetUrl: result.spreadsheetUrl,
                  updatedAt: new Date().toISOString(),
                };
                saveMonthlyRecordToFirestore(updated).catch(console.warn);
                return updated;
              }
              return m;
            })
          );

          const now = new Date().toLocaleTimeString();
          setLastSyncedAt(now);
          setSuccessBanner('បានបង្កើត Google Sheet ជោគជ័យ! អ្នកអាចបើក និងចែករំលែកបានហើយ។');
          setTimeout(() => setSuccessBanner(null), 6000);

          await loadCollaborators(token, result.spreadsheetId);
        } catch (err: any) {
          console.error(err);
          setSyncError(`មិនអាចបង្កើត Google Sheet បានទេ៖ ${err.message}`);
        } finally {
          setIsCreating(false);
        }
      },
    });
  };

  // Sync Data to Google Sheet
  const handleRequestSyncToSheet = () => {
    if (!metadata.spreadsheetId) return;

    setConfirmDialog({
      isOpen: true,
      title: 'រក្សាទុកទិន្នន័យទៅ Google Sheet (Sync to Sheet)',
      message:
        'តើអ្នកចង់បញ្ជូនទិន្នន័យដែលបានកែសម្រួលទាំងអស់ក្នុងកម្មវិធីនេះ ទៅជំនួសក្នុង Google Sheet ដែលបានភ្ជាប់មែនទេ?',
      confirmLabel: 'រក្សាទុកទៅ Sheet',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setIsSyncing(true);
          setSyncError(null);
          const token = await ensureAuth();
          await syncSpreadsheetData(token, metadata.spreadsheetId!, communes);

          const now = new Date().toLocaleTimeString();
          setLastSyncedAt(now);
          setSuccessBanner('បានរក្សាទុកទិន្នន័យទៅ Google Sheet ដោយជោគជ័យ!');
          setTimeout(() => setSuccessBanner(null), 4000);
        } catch (err: any) {
          setSyncError(`កំហុសរក្សាទុកទៅ Sheet៖ ${err.message}`);
        } finally {
          setIsSyncing(false);
        }
      },
    });
  };

  // Fetch Data from Google Sheet
  const handleFetchFromSheet = async () => {
    if (!metadata.spreadsheetId) return;
    try {
      setIsSyncing(true);
      setSyncError(null);
      const token = await ensureAuth();
      const latestData = await fetchSpreadsheetData(token, metadata.spreadsheetId);

      if (latestData && latestData.length > 0) {
        setCommunes(latestData);
        const now = new Date().toLocaleTimeString();
        setLastSyncedAt(now);
        setSuccessBanner('បានទាញយកទិន្នន័យចុងក្រោយពី Google Sheet ដោយជោគជ័យ!');
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err: any) {
      setSyncError(`មិនអាចទាញយកទិន្នន័យពី Sheet៖ ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Cell Update handler (Guarded: cannot edit other communes when locked)
  const handleUpdateRowCell = (rowId: number, field: keyof CommuneEntry, value: number) => {
    if (lockedCommuneId !== null && rowId !== lockedCommuneId) {
      setSyncError('បានចាក់សោ៖ លោកអ្នកមានសិទ្ធិកែប្រែទិន្នន័យបានតែឃុំរបស់អ្នកប៉ុណ្ណោះ!');
      setTimeout(() => setSyncError(null), 4000);
      return;
    }

    setCommunes((prev) => {
      const nextCommunes = prev.map((r) => {
        if (r.id === rowId) {
          const updated = calculateRowFormulas({ ...r, [field]: value });
          // Save to Firestore in background for instant live sync across devices
          saveCommuneToFirestore(updated, user?.email || undefined).catch((e) =>
            console.warn('Firestore cell sync error:', e)
          );
          return updated;
        }
        return r;
      });

      // Also persist within active month
      setMonths((prevMonths) =>
        prevMonths.map((m) => {
          if (m.id === activeMonthId) {
            const updatedMonth: MonthlyRecord = {
              ...m,
              communes: nextCommunes,
              updatedAt: new Date().toISOString(),
            };
            saveMonthlyRecordToFirestore(updatedMonth).catch(console.warn);
            return updatedMonth;
          }
          return m;
        })
      );

      return nextCommunes;
    });
  };

  // Save from Commune Modal Form (Guarded: cannot edit other communes when locked)
  const handleSaveCommuneForm = async (updatedEntry: CommuneEntry) => {
    if (lockedCommuneId !== null && updatedEntry.id !== lockedCommuneId) {
      setSyncError('បានចាក់សោ៖ លោកអ្នកមានសិទ្ធិកែប្រែទិន្នន័យបានតែឃុំរបស់អ្នកប៉ុណ្ណោះ!');
      setTimeout(() => setSyncError(null), 4000);
      return;
    }

    const recalculated = calculateRowFormulas(updatedEntry);
    const updatedCommunes = communes.map((r) =>
      r.id === updatedEntry.id ? recalculated : r
    );
    setCommunes(updatedCommunes);
    setSelectedCommuneId(updatedEntry.id);

    // Update active month in months list & Firestore
    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id === activeMonthId) {
          const updatedMonth: MonthlyRecord = {
            ...m,
            communes: updatedCommunes,
            updatedAt: new Date().toISOString(),
          };
          saveMonthlyRecordToFirestore(updatedMonth).catch(console.warn);
          return updatedMonth;
        }
        return m;
      })
    );

    // 1. Instantly broadcast to all devices via Firebase Cloud Firestore
    try {
      await saveCommuneToFirestore(recalculated, user?.email || undefined);
    } catch (e) {
      console.warn('Firestore broadcast error:', e);
    }

    // 2. If connected to Google Sheet and authenticated, attempt auto-sync
    if (metadata.spreadsheetId && accessToken) {
      try {
        await syncSpreadsheetData(accessToken, metadata.spreadsheetId, updatedCommunes);
        const now = new Date().toLocaleTimeString();
        setLastSyncedAt(now);
        setSuccessBanner(
          `បានបញ្ចូលទិន្នន័យក្នុងជួរដេក ${updatedEntry.communeName} រក្សាទុកក្នុង Firebase Real-Time និង Google Sheet ជោគជ័យ!`
        );
      } catch (e: any) {
        console.warn('Google Sheet auto-sync notice:', e);
        setSuccessBanner(
          `បានរក្សាទុកក្នុង Firebase Real-Time សម្រាប់ជួរដេក ${updatedEntry.communeName} (Google Sheet អាចចុច រក្សាទុកពេលក្រោយ)`
        );
      }
    } else {
      setSuccessBanner(
        `បានរក្សាទុកក្នុង Firebase Real-Time សម្រាប់ជួរដេក ${updatedEntry.communeName} រួចរាល់!`
      );
    }
    setTimeout(() => setSuccessBanner(null), 4500);
  };

  // Collaborator: Add
  const handleAddCollaborator = async (
    email: string,
    role: 'writer' | 'reader',
    assignedCommune: string,
    sendNotification: boolean
  ) => {
    if (!metadata.spreadsheetId) {
      throw new Error('សូមបង្កើត Google Sheet ជាមុនសិន');
    }
    const token = await ensureAuth();
    await shareSpreadsheetWithEmail(
      token,
      metadata.spreadsheetId,
      email,
      role,
      sendNotification
    );
    await loadCollaborators(token, metadata.spreadsheetId);
  };

  // Collaborator: Remove
  const handleRemoveCollaborator = async (permissionId: string) => {
    if (!metadata.spreadsheetId) return;
    setConfirmDialog({
      isOpen: true,
      isDestructive: true,
      title: 'ដកសិទ្ធិចេញ (Remove Collaborator)',
      message: 'តើអ្នកប្រាកដជាចង់ដកសិទ្ធិអ្នកសហការនេះចេញពី Google Sheet មែនទេ?',
      confirmLabel: 'ដកសិទ្ធិចេញ',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const token = await ensureAuth();
          await removeCollaboratorAccess(token, metadata.spreadsheetId!, permissionId);
          await loadCollaborators(token, metadata.spreadsheetId!);
          setSuccessBanner('បានដកសិទ្ធិរួចរាល់!');
          setTimeout(() => setSuccessBanner(null), 3000);
        } catch (e: any) {
          setSyncError(`កំហុសដកសិទ្ធិ៖ ${e.message}`);
        }
      },
    });
  };

  // Public Link Access
  const handleSetPublicAccess = async (role: 'writer' | 'reader') => {
    if (!metadata.spreadsheetId) return;
    try {
      const token = await ensureAuth();
      await setGeneralLinkAccess(token, metadata.spreadsheetId, role);
      await loadCollaborators(token, metadata.spreadsheetId);
      setSuccessBanner('បានបើកសិទ្ធិកែប្រែតាមតំណភ្ជាប់សាធារណៈរួចរាល់!');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (e: any) {
      setSyncError(`កំហុសកំណត់សិទ្ធិតំណ៖ ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-kantumruy text-slate-800">
      {/* Top Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        metadata={metadata}
        onUpdateMetadata={(m) => setMetadata((prev) => ({ ...prev, ...m }))}
        onCreateSheet={handleRequestCreateSheet}
        onSyncToSheet={handleRequestSyncToSheet}
        onFetchFromSheet={handleFetchFromSheet}
        onOpenCollaborators={() => setIsCollaboratorsOpen(true)}
        onOpenCommunePopup={() => {
          if (lockedCommuneId) setActiveCommuneId(lockedCommuneId);
          setIsCommunePopupOpen(true);
        }}
        onOpenShareLinks={() => setIsShareLinksModalOpen(true)}
        onToggleOfficialView={() => setIsOfficialView(!isOfficialView)}
        isOfficialView={isOfficialView}
        isSyncing={isSyncing}
        isCreating={isCreating}
        isFirebaseLive={isFirebaseLive}
        lastSyncedAt={lastSyncedAt}
        syncError={syncError}
        lockedCommuneId={lockedCommuneId}
        assignedCommuneName={assignedCommune?.communeName}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        monthsCount={months.length}
        activeMonthName={activeMonth?.monthName}
        onOpenOAuthHelp={() => setIsOAuthHelpOpen(true)}
      />

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successBanner}
            </span>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-100 hover:text-white text-xs px-2 py-0.5 cursor-pointer"
            >
              បិទ
            </button>
          </div>
        </div>
      )}

      {/* App Body with Left Side Menu (Monthly Drawer / Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Menu */}
        <MonthlySidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          months={months}
          activeMonthId={activeMonthId}
          onSelectMonth={handleSelectMonth}
          onCreateMonth={handleCreateMonth}
          onDeleteMonth={handleDeleteMonth}
          onDuplicateMonth={handleDuplicateMonth}
        />

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col custom-scrollbar">
          {/* Main App Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Assigned Commune Link Banner (When accessing via commune-specific link) */}
        {assignedCommune && (
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white p-4.5 rounded-2xl shadow-md border border-blue-600/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-amber-400 text-slate-950 rounded-xl shadow-xs shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    តំណភ្ជាប់ផ្លូវការតាមឃុំ (Assigned Commune Portal)
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    🔒 សុវត្ថិភាពចាក់សោ
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold font-moul text-white mt-0.5">
                  ឃុំរបស់អ្នក៖ {assignedCommune.communeNumberKh}. {assignedCommune.communeName}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  🔒 លោកអ្នកត្រូវបានកំណត់សិទ្ធិកែប្រែទិន្នន័យបានតែក្នុងជួរដេក <strong>{assignedCommune.communeName}</strong> ប៉ុណ្ណោះ។ ឃុំផ្សេងទៀតក្នុងតារាងត្រូវបានចាក់សោ (Read-Only) ដើម្បីការពារការច្រឡំទិន្នន័យ។
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <button
                onClick={() => {
                  setActiveCommuneId(assignedCommune.id);
                  setIsCommunePopupOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>បើក Pop-up បំពេញ {assignedCommune.communeName}</span>
              </button>

              {/* Admin Unlock toggle if district supervisor is testing or administering */}
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'ដោះសោរបៀបមន្ត្រីស្រុក (District Admin Unlock)',
                    message:
                      'តើលោកអ្នកជាមន្ត្រីសម្របសម្រួលស្រុក ឬអភិបាល ដែលចង់ដោះសោដើម្បីកែប្រែគ្រប់ឃុំទាំងអស់ទាំង១០ មែនទេ?',
                    confirmLabel: 'ដោះសោគ្រប់ឃុំ (Admin Mode)',
                    onConfirm: () => {
                      setLockedCommuneId(null);
                      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                      setSuccessBanner('បានដោះសោជា «របៀបមន្ត្រីស្រុក» រួចរាល់! លោកអ្នកអាចកែប្រែគ្រប់ឃុំទាំង១០។');
                      setTimeout(() => setSuccessBanner(null), 4000);
                    },
                  });
                }}
                className="text-[11px] text-slate-300 hover:text-white px-2.5 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
                title="សម្រាប់មន្ត្រីស្រុកកែប្រែគ្រប់ឃុំ"
              >
                ដោះសោ (Admin)
              </button>
            </div>
          </div>
        )}

        {/* Intro Info Banner if Sheet is not yet connected */}
        {!metadata.spreadsheetId && !assignedCommune && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-blue-950">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                ភ្ជាប់ផ្ទាល់ជាមួយ Google Sheets
              </div>
              <h2 className="text-lg md:text-xl font-bold font-moul text-white">
                តារាងពិនិត្យបញ្ជីឈ្មោះ និងចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦
              </h2>
              <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
                លោកអ្នកអាចបញ្ចូលទិន្នន័យដោយផ្ទាល់ក្នុងក្រឡានីមួយៗ (Cell required) តាមឃុំទាំង១០ នៃស្រុកជើងព្រៃ។
                ចុចប៊ូតុង <span className="font-semibold text-amber-300">«បង្កើត Google Sheet ថ្មី»</span> ដើម្បីនាំចេញតារាងផ្លូវការនេះទៅកាន់ Google Drive
                និងចែករំលែកឱ្យមន្ត្រីតាមឃុំចូលបំពេញរួមគ្នាក្នុង Real-Time!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setIsCommunePopupOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer text-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>បញ្ចូលទិន្នន័យតាមឃុំ (Pop-up)</span>
              </button>

              <button
                onClick={handleRequestCreateSheet}
                disabled={isCreating}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isCreating ? 'កំពុងបង្កើត Sheet...' : 'បង្កើត Google Sheet ឥឡូវនេះ'}</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switching: Official Print Document vs Interactive Spreadsheet Grid */}
        {isOfficialView ? (
          <OfficialDocumentView
            data={communes}
            metadata={metadata}
            onBackToGrid={() => setIsOfficialView(false)}
          />
        ) : (
          <div className="space-y-4">
            {/* Quick Actions Bar for Commune Clerks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Commune Quick Selector & Pop-up Trigger */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${assignedCommune ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {assignedCommune ? <Lock className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      {assignedCommune ? 'ឃុំរបស់អ្នក (បានចាក់សោ)' : 'ជ្រើសរើសឃុំបំពេញ'}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {assignedCommune
                        ? assignedCommune.communeName
                        : selectedCommuneId
                        ? communes.find((c) => c.id === selectedCommuneId)?.communeName
                        : 'ឃុំទាំង១០ (ស្រុកជើងព្រៃ)'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const targetId = lockedCommuneId || selectedCommuneId || 1;
                    setActiveCommuneId(targetId);
                    setIsCommunePopupOpen(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer shadow-2xs"
                >
                  បើក Pop-up
                </button>
              </div>

              {/* Card 2: Send Direct Links to Communes */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">ផ្ញើតំណទៅកាន់មន្ត្រី</div>
                    <div className="text-sm font-bold text-slate-800">តាមឃុំនីមួយៗ</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsShareLinksModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer shadow-2xs"
                >
                  ផ្ញើតំណ
                </button>
              </div>

              {/* Card 3: Real-time Collaborators */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">អ្នកសហការ Real-Time</div>
                    <div className="text-sm font-bold text-slate-800">
                      {metadata.spreadsheetId
                        ? `${collaborators.length} នាក់ក្នុងបញ្ជី Share`
                        : 'Google Drive Share'}
                    </div>
                  </div>
                </div>

                {metadata.spreadsheetId && (
                  <button
                    onClick={() => setIsCollaboratorsOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-2xs"
                  >
                    គ្រប់គ្រង
                  </button>
                )}
              </div>

              {/* Card 4: Deep Link to Google Sheet */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Google Sheet ផ្ទាល់</div>
                    <div className="text-sm font-bold text-slate-800 truncate max-w-[110px]">
                      {metadata.spreadsheetId ? 'បានភ្ជាប់ជោគជ័យ' : 'មិនទាន់បង្កើត'}
                    </div>
                  </div>
                </div>

                {metadata.spreadsheetId ? (
                  <a
                    href={metadata.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700"
                  >
                    <span>បើកមើល</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={handleRequestCreateSheet}
                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 cursor-pointer"
                  >
                    បង្កើត
                  </button>
                )}
              </div>
            </div>

            {/* The Main Spreadsheet Table */}
            <SpreadsheetTable
              data={communes}
              onUpdateRow={handleUpdateRowCell}
              onOpenQuickForm={(c) => {
                setActiveCommuneId(c.id);
                setIsCommunePopupOpen(true);
              }}
              selectedCommuneId={selectedCommuneId}
              onSelectCommuneId={(id) => setSelectedCommuneId(id)}
              lockedCommuneId={lockedCommuneId}
              reportDateKh={metadata.reportDateKh}
            />

            {/* Instructions & Help Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Info className="w-4 h-4 text-blue-600" />
                <span>របៀបប្រើប្រាស់ និងការបំពេញទិន្នន័យតាមឃុំ (Instruction Guide):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                <li>
                  <strong className="text-slate-800">ការផ្ញើតំណទៅកាន់មន្ត្រីឃុំ (Send to User):</strong>{' '}
                  ចុចប៊ូតុង <span className="font-semibold text-indigo-700">«ផ្ញើតំណតាមឃុំ (Send Link)»</span> ដើម្បីចម្លងតំណភ្ជាប់ ឬផ្ញើតាម Telegram ទៅកាន់មន្ត្រីតាមឃុំនីមួយៗ។ ពេលពួកគាត់បើកតំណ ផ្ទាំង Pop-up នឹងបង្ហាញឡើងភ្លាមៗជាមួយឈ្មោះឃុំនោះ ហើយប្រព័ន្ធនឹងចាក់សោសុវត្ថិភាព ឱ្យកែប្រែបានតែឃុំរបស់គាត់ប៉ុណ្ណោះ។
                </li>
                <li>
                  <strong className="text-slate-800">ការជ្រើសរើសឃុំ និងបញ្ចូលក្នុង Pop-up:</strong>{' '}
                  ក្នុងផ្ទាំង Pop-up មន្ត្រីបញ្ចូលលេខក្នុងក្រឡាដែលត្រូវបំពេញ (Input fields) ហើយពេលចុច «រក្សាទុក» វានឹងចូលក្នុងជួរដេកនៃឃុំនោះដោយស្វ័យប្រវត្តិ។
                </li>
                <li>
                  <strong className="text-slate-800">ការបំពេញផ្ទាល់ក្នុងក្រឡា (Direct Cell Input):</strong>{' '}
                  លោកអ្នកអាចចុចកែប្រែបានតែក្នុងជួរដេកនៃឃុំរបស់អ្នកប៉ុណ្ណោះ។ ឃុំផ្សេងទៀតក្នុងតារាងគឺសម្រាប់តែមើល (Read-only) ដើម្បីការពារការកែច្រឡំ។
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        គណៈកម្មាធិការស្រុកជើងព្រៃ ខេត្តកំពង់ចាម • ប្រព័ន្ធគ្រប់គ្រងការពិនិត្យបញ្ជីឈ្មោះ និងចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦
      </footer>
        </div>
      </div>

      {/* Commune Entry Form Pop-up Modal */}
      <CommuneFormModal
        isOpen={isCommunePopupOpen}
        onClose={() => setIsCommunePopupOpen(false)}
        communes={communes}
        activeCommuneId={activeCommuneId}
        onSelectCommuneId={(id) => setActiveCommuneId(id)}
        onSaveCommune={handleSaveCommuneForm}
        lockedCommuneId={lockedCommuneId}
      />

      {/* Share Commune Direct Links Modal */}
      <ShareCommuneLinksModal
        isOpen={isShareLinksModalOpen}
        onClose={() => setIsShareLinksModalOpen(false)}
        communes={communes}
        onOpenCommunePopup={(c) => {
          setActiveCommuneId(c.id);
          setIsCommunePopupOpen(true);
        }}
      />

      {/* Share & Collaborators Modal */}
      <CollaboratorsModal
        isOpen={isCollaboratorsOpen}
        onClose={() => setIsCollaboratorsOpen(false)}
        spreadsheetId={metadata.spreadsheetId}
        spreadsheetUrl={metadata.spreadsheetUrl}
        collaborators={collaborators}
        communes={communes}
        onAddCollaborator={handleAddCollaborator}
        onRemoveCollaborator={handleRemoveCollaborator}
        onSetPublicAccess={handleSetPublicAccess}
        isLoading={isLoadingCollaborators}
      />

      {/* Mandatory Confirmation Modal for Workspace Mutating Operations */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Google OAuth & Test Users Help Modal */}
      <OAuthHelpModal
        isOpen={isOAuthHelpOpen}
        onClose={() => setIsOAuthHelpOpen(false)}
        projectId="gen-lang-client-0648418690"
        blockedEmail={blockedEmail}
      />
    </div>
  );
}

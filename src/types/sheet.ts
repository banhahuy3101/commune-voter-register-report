/**
 * Types and Data Models for Cambodian Commune Voter Registration Sheet
 * ស្រុកជើងព្រៃ ខេត្តកំពង់ចាម
 */

export interface CommuneEntry {
  id: number;
  communeName: string; // e.g., "ឃុំខ្នុរដំបង"
  communeNumberKh: string; // e.g., "១"

  // ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៥
  list2025Total: number;
  list2025Cpp: number;

  // ចុះឈ្មោះបោះឆ្នោតថ្មី
  newRegStartTotal: number;
  newRegStartCpp: number;
  newRegCurrentTotal: number;
  newRegCurrentCpp: number;
  // Cumulative (Auto or manual override)
  newRegCumulativeTotal: number;
  newRegCumulativeCpp: number;

  // លុបឈ្មោះចេញពីបញ្ជី
  deletedStartTotal: number;
  deletedStartCpp: number;
  deletedCurrentTotal: number;
  deletedCurrentCpp: number;
  // Cumulative
  deletedCumulativeTotal: number;
  deletedCumulativeCpp: number;

  // កែទិន្នន័យជីវប្រវត្តិ
  bioCorrectionStartTotal: number;
  bioCorrectionStartCpp: number;
  bioCorrectionCurrentTotal: number;
  bioCorrectionCurrentCpp: number;
  // Cumulative
  bioCorrectionCumulativeTotal: number;
  bioCorrectionCumulativeCpp: number;

  // បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ
  biometricStartTotal: number;
  biometricStartCpp: number;
  biometricCurrentTotal: number;
  biometricCurrentCpp: number;
  // Cumulative
  biometricCumulativeTotal: number;
  biometricCumulativeCpp: number;

  // ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៦
  list2026Total: number;
  list2026Cpp: number;

  lastUpdated?: string;
  updatedBy?: string;
}

export interface SheetMetadata {
  id?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetName?: string;
  logoUrl?: string;
  provinceKh: string; // "ខេត្តកំពង់ចាម"
  districtKh: string; // "ស្រុកជើងព្រៃ"
  reportTitleKh: string; // "លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦"
  reportDateKh: string; // "ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
  signerLeftTitle: string; // "បានឃើញ និងឯកភាព / ជ.គណៈអចិន្ត្រៃយ៍ / អនុប្រធានប្រចាំការ"
  signerLeftName: string; // "ឆាយ វ៉ាន់ស៊ី"
  signerRightDateLocation: string; // "ជើងព្រៃ ថ្ងៃទី ០៧ ខែតុលា ឆ្នាំ២០២៦"
  signerRightTitle: string; // "អ្នកធ្វើតារាង"
  signerRightName: string; // "ស៊ីម ល័ក្ខ"
}

export interface MonthlyRecord {
  id: string; // e.g. "month-2026-10"
  monthName: string; // e.g. "ខែតុលា ឆ្នាំ២០២៦"
  reportDateKh: string; // e.g. "ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
  signerRightDateLocation?: string; // e.g. "ជើងព្រៃ ថ្ងៃទី ៧ ខែតុលា ឆ្នាំ២០២៦"
  communes: CommuneEntry[];
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export const CPP_LOGO_URL = '/cpp-logo.png';
export const ONLINE_CPP_LOGO_URL = 'https://www.cpp.org.kh/wp-content/themes/cpptwentyseventeen/assets/images/cpp-logo.png';

export interface Collaborator {
  id: string;
  displayName: string;
  emailAddress: string;
  role: 'owner' | 'writer' | 'reader';
  photoLink?: string;
  assignedCommune?: string;
}

export const INITIAL_COMMUNES_DATA: CommuneEntry[] = [
  {
    id: 1,
    communeNumberKh: '១',
    communeName: 'ឃុំខ្នុរដំបង',
    list2025Total: 5175,
    list2025Cpp: 4727,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 2,
    newRegCurrentCpp: 2,
    newRegCumulativeTotal: 2,
    newRegCumulativeCpp: 2,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 7,
    bioCorrectionCurrentCpp: 7,
    bioCorrectionCumulativeTotal: 7,
    bioCorrectionCumulativeCpp: 7,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 6,
    biometricCurrentCpp: 6,
    biometricCumulativeTotal: 6,
    biometricCumulativeCpp: 6,
    list2026Total: 5177,
    list2026Cpp: 4729,
  },
  {
    id: 2,
    communeNumberKh: '២',
    communeName: 'ឃុំគោករវៀង',
    list2025Total: 3949,
    list2025Cpp: 3665,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 10,
    newRegCurrentCpp: 9,
    newRegCumulativeTotal: 10,
    newRegCumulativeCpp: 9,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 62,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 62,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 4,
    bioCorrectionCurrentCpp: 3,
    bioCorrectionCumulativeTotal: 4,
    bioCorrectionCumulativeCpp: 3,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 2,
    biometricCurrentCpp: 1,
    biometricCumulativeTotal: 2,
    biometricCumulativeCpp: 1,
    list2026Total: 3897,
    list2026Cpp: 3665,
  },
  {
    id: 3,
    communeNumberKh: '៣',
    communeName: 'ឃុំផ្ដៅជុំ',
    list2025Total: 5996,
    list2025Cpp: 5450,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 3,
    newRegCurrentCpp: 2,
    newRegCumulativeTotal: 3,
    newRegCumulativeCpp: 2,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 4,
    bioCorrectionCurrentCpp: 4,
    bioCorrectionCumulativeTotal: 4,
    bioCorrectionCumulativeCpp: 4,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 0,
    biometricCurrentCpp: 0,
    biometricCumulativeTotal: 0,
    biometricCumulativeCpp: 0,
    list2026Total: 5999,
    list2026Cpp: 5450,
  },
  {
    id: 4,
    communeNumberKh: '៤',
    communeName: 'ឃុំព្រៃចារ',
    list2025Total: 5199,
    list2025Cpp: 4864,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 1,
    newRegCurrentCpp: 1,
    newRegCumulativeTotal: 1,
    newRegCumulativeCpp: 1,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 1,
    deletedCurrentCpp: 1,
    deletedCumulativeTotal: 1,
    deletedCumulativeCpp: 1,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 0,
    bioCorrectionCurrentCpp: 0,
    bioCorrectionCumulativeTotal: 0,
    bioCorrectionCumulativeCpp: 0,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 1,
    biometricCurrentCpp: 1,
    biometricCumulativeTotal: 1,
    biometricCumulativeCpp: 1,
    list2026Total: 5199,
    list2026Cpp: 4864,
  },
  {
    id: 5,
    communeNumberKh: '៥',
    communeName: 'ឃុំព្រីងជ្រុំ',
    list2025Total: 4872,
    list2025Cpp: 4440,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 3,
    newRegCurrentCpp: 1,
    newRegCumulativeTotal: 3,
    newRegCumulativeCpp: 1,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 0,
    bioCorrectionCurrentCpp: 0,
    bioCorrectionCumulativeTotal: 0,
    bioCorrectionCumulativeCpp: 0,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 3,
    biometricCurrentCpp: 2,
    biometricCumulativeTotal: 3,
    biometricCumulativeCpp: 2,
    list2026Total: 4875,
    list2026Cpp: 4440,
  },
  {
    id: 6,
    communeNumberKh: '៦',
    communeName: 'ឃុំសំពងជ័យ',
    list2025Total: 11570,
    list2025Cpp: 10732,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 16,
    newRegCurrentCpp: 13,
    newRegCumulativeTotal: 16,
    newRegCumulativeCpp: 13,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 3,
    bioCorrectionCurrentCpp: 3,
    bioCorrectionCumulativeTotal: 3,
    bioCorrectionCumulativeCpp: 3,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 29,
    biometricCurrentCpp: 29,
    biometricCumulativeTotal: 29,
    biometricCumulativeCpp: 29,
    list2026Total: 11586,
    list2026Cpp: 10732,
  },
  {
    id: 7,
    communeNumberKh: '៧',
    communeName: 'ឃុំស្ដើងជ័យ',
    list2025Total: 7916,
    list2025Cpp: 7354,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 6,
    newRegCurrentCpp: 5,
    newRegCumulativeTotal: 6,
    newRegCumulativeCpp: 5,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 1,
    deletedCurrentCpp: 1,
    deletedCumulativeTotal: 1,
    deletedCumulativeCpp: 1,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 1,
    bioCorrectionCurrentCpp: 1,
    bioCorrectionCumulativeTotal: 1,
    bioCorrectionCumulativeCpp: 1,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 1,
    biometricCurrentCpp: 1,
    biometricCumulativeTotal: 1,
    biometricCumulativeCpp: 1,
    list2026Total: 7921,
    list2026Cpp: 7354,
  },
  {
    id: 8,
    communeNumberKh: '៨',
    communeName: 'ឃុំសូទិប',
    list2025Total: 10316,
    list2025Cpp: 9447,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 3,
    newRegCurrentCpp: 3,
    newRegCumulativeTotal: 3,
    newRegCumulativeCpp: 3,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 0,
    bioCorrectionCurrentCpp: 0,
    bioCorrectionCumulativeTotal: 0,
    bioCorrectionCumulativeCpp: 0,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 2,
    biometricCurrentCpp: 2,
    biometricCumulativeTotal: 2,
    biometricCumulativeCpp: 2,
    list2026Total: 10319,
    list2026Cpp: 9447,
  },
  {
    id: 9,
    communeNumberKh: '៩',
    communeName: 'ឃុំស្រម៉រ',
    list2025Total: 5945,
    list2025Cpp: 5474,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 4,
    newRegCurrentCpp: 3,
    newRegCumulativeTotal: 4,
    newRegCumulativeCpp: 3,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 13,
    bioCorrectionCurrentCpp: 5,
    bioCorrectionCumulativeTotal: 13,
    bioCorrectionCumulativeCpp: 5,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 12,
    biometricCurrentCpp: 5,
    biometricCumulativeTotal: 12,
    biometricCumulativeCpp: 5,
    list2026Total: 5949,
    list2026Cpp: 5474,
  },
  {
    id: 10,
    communeNumberKh: '១០',
    communeName: 'ឃុំត្រពាំងគរ',
    list2025Total: 5000,
    list2025Cpp: 4543,
    newRegStartTotal: 0,
    newRegStartCpp: 0,
    newRegCurrentTotal: 11,
    newRegCurrentCpp: 11,
    newRegCumulativeTotal: 11,
    newRegCumulativeCpp: 11,
    deletedStartTotal: 0,
    deletedStartCpp: 0,
    deletedCurrentTotal: 0,
    deletedCurrentCpp: 0,
    deletedCumulativeTotal: 0,
    deletedCumulativeCpp: 0,
    bioCorrectionStartTotal: 0,
    bioCorrectionStartCpp: 0,
    bioCorrectionCurrentTotal: 2,
    bioCorrectionCurrentCpp: 2,
    bioCorrectionCumulativeTotal: 2,
    bioCorrectionCumulativeCpp: 2,
    biometricStartTotal: 0,
    biometricStartCpp: 0,
    biometricCurrentTotal: 2,
    biometricCurrentCpp: 2,
    biometricCumulativeTotal: 2,
    biometricCumulativeCpp: 2,
    list2026Total: 5011,
    list2026Cpp: 4543,
  },
];

/**
 * Calculates row formulas automatically
 */
export function calculateRowFormulas(entry: CommuneEntry): CommuneEntry {
  const newCumulativeTotal = entry.newRegStartTotal + entry.newRegCurrentTotal;
  const newCumulativeCpp = entry.newRegStartCpp + entry.newRegCurrentCpp;

  const deletedCumulativeTotal = entry.deletedStartTotal + entry.deletedCurrentTotal;
  const deletedCumulativeCpp = entry.deletedStartCpp + entry.deletedCurrentCpp;

  const bioCumulativeTotal = entry.bioCorrectionStartTotal + entry.bioCorrectionCurrentTotal;
  const bioCumulativeCpp = entry.bioCorrectionStartCpp + entry.bioCorrectionCurrentCpp;

  const bioMetricCumulativeTotal = entry.biometricStartTotal + entry.biometricCurrentTotal;
  const bioMetricCumulativeCpp = entry.biometricStartCpp + entry.biometricCurrentCpp;

  // 2026 list = 2025 list + new registered - deleted
  const list2026Total = entry.list2025Total + newCumulativeTotal - deletedCumulativeTotal;
  // In official accounting, CPP 2026 also adjusts or maintains according to registered/deleted
  const list2026Cpp = entry.list2025Cpp + newCumulativeCpp - deletedCumulativeCpp;

  return {
    ...entry,
    newRegCumulativeTotal: newCumulativeTotal,
    newRegCumulativeCpp: newCumulativeCpp,
    deletedCumulativeTotal: deletedCumulativeTotal,
    deletedCumulativeCpp: deletedCumulativeCpp,
    bioCorrectionCumulativeTotal: bioCumulativeTotal,
    bioCorrectionCumulativeCpp: bioCumulativeCpp,
    biometricCumulativeTotal: bioMetricCumulativeTotal,
    biometricCumulativeCpp: bioMetricCumulativeCpp,
    list2026Total: list2026Total,
    list2026Cpp: list2026Cpp,
  };
}

/**
 * Calculates district summary (សរុប ស្រុក)
 */
export function calculateDistrictTotal(rows: CommuneEntry[]): CommuneEntry {
  const sum = (fn: (r: CommuneEntry) => number) => rows.reduce((acc, r) => acc + (fn(r) || 0), 0);

  return {
    id: 999,
    communeNumberKh: '',
    communeName: 'សរុប',
    list2025Total: sum(r => r.list2025Total),
    list2025Cpp: sum(r => r.list2025Cpp),

    newRegStartTotal: sum(r => r.newRegStartTotal),
    newRegStartCpp: sum(r => r.newRegStartCpp),
    newRegCurrentTotal: sum(r => r.newRegCurrentTotal),
    newRegCurrentCpp: sum(r => r.newRegCurrentCpp),
    newRegCumulativeTotal: sum(r => r.newRegCumulativeTotal),
    newRegCumulativeCpp: sum(r => r.newRegCumulativeCpp),

    deletedStartTotal: sum(r => r.deletedStartTotal),
    deletedStartCpp: sum(r => r.deletedStartCpp),
    deletedCurrentTotal: sum(r => r.deletedCurrentTotal),
    deletedCurrentCpp: sum(r => r.deletedCurrentCpp),
    deletedCumulativeTotal: sum(r => r.deletedCumulativeTotal),
    deletedCumulativeCpp: sum(r => r.deletedCumulativeCpp),

    bioCorrectionStartTotal: sum(r => r.bioCorrectionStartTotal),
    bioCorrectionStartCpp: sum(r => r.bioCorrectionStartCpp),
    bioCorrectionCurrentTotal: sum(r => r.bioCorrectionCurrentTotal),
    bioCorrectionCurrentCpp: sum(r => r.bioCorrectionCurrentCpp),
    bioCorrectionCumulativeTotal: sum(r => r.bioCorrectionCumulativeTotal),
    bioCorrectionCumulativeCpp: sum(r => r.bioCorrectionCumulativeCpp),

    biometricStartTotal: sum(r => r.biometricStartTotal),
    biometricStartCpp: sum(r => r.biometricStartCpp),
    biometricCurrentTotal: sum(r => r.biometricCurrentTotal),
    biometricCurrentCpp: sum(r => r.biometricCurrentCpp),
    biometricCumulativeTotal: sum(r => r.biometricCumulativeTotal),
    biometricCumulativeCpp: sum(r => r.biometricCumulativeCpp),

    list2026Total: sum(r => r.list2026Total),
    list2026Cpp: sum(r => r.list2026Cpp),
  };
}

export function formatKhmerNumber(num: number | string): string {
  if (num === undefined || num === null || num === '') return '0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) || 0 : num;
  return n.toLocaleString('en-US');
}

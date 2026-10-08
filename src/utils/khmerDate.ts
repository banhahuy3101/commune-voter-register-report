/**
 * Khmer Date & Number Utilities
 * Provides two-way conversion between Javascript Date objects and Khmer Report Date strings
 * e.g. "ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
 */

export const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'] as const;

export const KHMER_MONTHS = [
  'មករា', // 1 - Jan
  'កុម្ភៈ', // 2 - Feb
  'មីនា', // 3 - Mar
  'មេសា', // 4 - Apr
  'ឧសភា', // 5 - May
  'មិថុនា', // 6 - Jun
  'កក្កដា', // 7 - Jul
  'សីហា', // 8 - Aug
  'កញ្ញា', // 9 - Sep
  'តុលា', // 10 - Oct
  'វិច្ឆិកា', // 11 - Nov
  'ធ្នូ', // 12 - Dec
] as const;

/**
 * Converts standard numbers to Khmer numeral string
 * e.g. 7 -> "៧", 2026 -> "២០២៦"
 */
export function toKhmerDigits(num: number | string): string {
  return String(num)
    .split('')
    .map((char) => {
      const parsed = parseInt(char, 10);
      return !isNaN(parsed) && KHMER_DIGITS[parsed] !== undefined
        ? KHMER_DIGITS[parsed]
        : char;
    })
    .join('');
}

/**
 * Converts Khmer numerals back to standard Arabic number
 * e.g. "៧" -> 7, "២០២៦" -> 2026
 */
export function fromKhmerDigits(str: string): number {
  let result = '';
  for (const ch of str) {
    const idx = KHMER_DIGITS.indexOf(ch as any);
    if (idx !== -1) {
      result += idx;
    } else if (/[0-9]/.test(ch)) {
      result += ch;
    }
  }
  const parsed = parseInt(result, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a Date object into official Khmer report date string:
 * "ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
 */
export function formatReportDateKh(date: Date): string {
  const day = toKhmerDigits(date.getDate());
  const month = KHMER_MONTHS[date.getMonth()];
  const year = toKhmerDigits(date.getFullYear());
  return `ប្រចាំថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
}

/**
 * Parses a Khmer report date string back into a JavaScript Date object
 * Handles formats like:
 * - "ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
 * - "ថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
 * - "ប្រចាំថ្ងៃទី ០៧ ខែតុលា ឆ្នាំ២០២៦"
 */
export function parseReportDateKh(str?: string): Date | undefined {
  if (!str || typeof str !== 'string') return undefined;

  const trimmed = str.trim();
  const dayMatch = trimmed.match(/ថ្ងៃទី\s*([០-៩0-9]+)/);
  const yearMatch = trimmed.match(/ឆ្នាំ\s*([០-៩0-9]+)/);

  let monthIdx = -1;
  for (let i = 0; i < KHMER_MONTHS.length; i++) {
    if (trimmed.includes(KHMER_MONTHS[i])) {
      monthIdx = i;
      break;
    }
  }

  if (dayMatch && yearMatch && monthIdx !== -1) {
    const day = fromKhmerDigits(dayMatch[1]);
    const year = fromKhmerDigits(yearMatch[1]);
    if (day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      const d = new Date(year, monthIdx, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Fallback ISO or standard Date parse
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return undefined;
}

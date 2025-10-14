import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  keywords: string[];
  minRating: number;
  minReviews: number;
  maxUpdateAgeDays: number;
  outputDir: string;
  googleSheetsEnabled: boolean;
  googleSheets?: {
    spreadsheetId: string;
    tabName: string;
    credentialsPath: string;
  };
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBool = (value: string | undefined): boolean => {
  if (!value) return false;
  return value.toLowerCase() === 'true' || value === '1';
};

const DEFAULT_KEYWORDS = ['shop', 'fitness', 'community', 'booking', 'delivery'];

const keywords = process.env.KEYWORDS?.split(',')
  .map((kw) => kw.trim())
  .filter((kw) => kw.length > 0) ?? DEFAULT_KEYWORDS;

const minRating = parseNumber(process.env.MIN_RATING, 3.5);
const minReviews = parseNumber(process.env.MIN_REVIEWS, 100);
const maxUpdateAgeDays = parseNumber(process.env.MAX_UPDATE_AGE_DAYS, 365);
const outputDir = process.env.OUTPUT_DIR?.trim() || './out';
const googleSheetsEnabled = parseBool(process.env.GOOGLE_SHEETS_ENABLED);

const googleSheets = googleSheetsEnabled
  ? {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? '',
      tabName: process.env.GOOGLE_SHEETS_TAB_NAME?.trim() || 'leads',
      credentialsPath:
        process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() || ''
    }
  : undefined;

export const config: AppConfig = {
  keywords,
  minRating,
  minReviews,
  maxUpdateAgeDays,
  outputDir,
  googleSheetsEnabled,
  googleSheets
};

export default config;

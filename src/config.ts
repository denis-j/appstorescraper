import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  enabled: boolean;
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
}

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
  email?: EmailConfig;
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

const parseList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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

const emailEnabled = parseBool(process.env.EMAIL_ENABLED);

const email = emailEnabled
  ? {
      enabled: true,
      apiKey: process.env.RESEND_API_KEY?.trim() ?? '',
      from: process.env.EMAIL_FROM?.trim() ?? '',
      to: parseList(process.env.EMAIL_TO),
      subject:
        process.env.EMAIL_SUBJECT?.trim() || 'App Leads Scout Ergebnisse'
    }
  : undefined;

export const config: AppConfig = {
  keywords,
  minRating,
  minReviews,
  maxUpdateAgeDays,
  outputDir,
  googleSheetsEnabled,
  googleSheets,
  email
};

export default config;

import { mkdir } from 'fs/promises';
import { parseISO, differenceInDays, isValid } from 'date-fns';

export interface Lead {
  source_store: 'ios' | 'android';
  app_name: string;
  bundle_id: string;
  developer: string;
  rating: number;
  ratings_count: number;
  last_update: string;
  country: string;
  category: string;
  app_url: string;
  reviews_url: string;
  website: string;
  support_email: string;
  linkedin_guess: string;
  contact_status: string;
  loom_status: string;
  outreach_owner: string;
  date_found: string;
}

/** Erstellt ein Verzeichnis bei Bedarf. */
export const ensureDir = async (path: string): Promise<void> => {
  await mkdir(path, { recursive: true });
};

/** Prüft, ob ein Datum innerhalb des erlaubten Alters liegt. */
export const isFresh = (dateInput: string | Date | null | undefined, maxDays: number): boolean => {
  if (!dateInput) return false;
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return false;
  return differenceInDays(new Date(), date) <= maxDays;
};

/** Entfernt Duplikate anhand eines Schlüssels. */
export const dedupeBy = <T>(arr: T[], keyFn: (item: T) => string): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
};

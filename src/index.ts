import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import { stringify } from 'csv-stringify/sync';
import config from './config.js';
import { ensureDir, isFresh, dedupeBy, Lead } from './util.js';
import { fetchIosLeads } from './ios.js';
import { fetchAndroidLeads } from './android.js';
import { syncLeadsToSheet } from './sheets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const columns: { key: keyof Lead; header: string }[] = [
  { key: 'source_store', header: 'source_store' },
  { key: 'app_name', header: 'app_name' },
  { key: 'bundle_id', header: 'bundle_id' },
  { key: 'developer', header: 'developer' },
  { key: 'rating', header: 'rating' },
  { key: 'ratings_count', header: 'ratings_count' },
  { key: 'last_update', header: 'last_update' },
  { key: 'country', header: 'country' },
  { key: 'category', header: 'category' },
  { key: 'app_url', header: 'app_url' },
  { key: 'reviews_url', header: 'reviews_url' },
  { key: 'website', header: 'website' },
  { key: 'support_email', header: 'support_email' },
  { key: 'linkedin_guess', header: 'linkedin_guess' },
  { key: 'contact_status', header: 'contact_status' },
  { key: 'loom_status', header: 'loom_status' },
  { key: 'outreach_owner', header: 'outreach_owner' },
  { key: 'date_found', header: 'date_found' }
];

const leadsToCsv = (leads: Lead[]): string =>
  stringify(leads, {
    header: true,
    columns: columns.map((c) => ({ key: c.key, header: c.header })),
    quoted: true
  });

const run = async (): Promise<void> => {
  console.log('Starte Lead-Suche ...');
  if (config.keywords.length === 0) {
    console.warn('Keine KEYWORDS gesetzt. Bitte .env konfigurieren.');
  }

  const [iosLeads, androidLeads] = await Promise.all([
    fetchIosLeads(config),
    fetchAndroidLeads(config)
  ]);

  console.log(`iOS-Leads: ${iosLeads.length}`);
  console.log(`Android-Leads: ${androidLeads.length}`);

  const combined = [...iosLeads, ...androidLeads];

  const fresh = combined.filter((lead) =>
    isFresh(lead.last_update, config.maxUpdateAgeDays)
  );

  const deduped = dedupeBy(fresh, (lead) => `${lead.source_store}:${lead.bundle_id}`);

  deduped.sort((a, b) => {
    if (a.rating === b.rating) {
      return b.ratings_count - a.ratings_count;
    }
    return a.rating - b.rating;
  });

  console.log(`Gefilterte Leads: ${deduped.length}`);

  await ensureDir(path.resolve(__dirname, '..', config.outputDir));
  const fileName = `leads_de_lowrating_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
  const filePath = path.resolve(__dirname, '..', config.outputDir, fileName);
  await writeFile(filePath, leadsToCsv(deduped), 'utf-8');
  console.log(`CSV gespeichert unter: ${filePath}`);

  if (config.googleSheetsEnabled && deduped.length > 0) {
    await syncLeadsToSheet(deduped, config);
  }

  console.log('Fertig.');
};

run().catch((error) => {
  console.error('Fehler im Skript:', error);
  process.exitCode = 1;
});

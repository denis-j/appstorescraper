import { createRequire } from 'module';
import { setTimeout as sleep } from 'timers/promises';
import { AppConfig } from './config.js';
import { Lead } from './util.js';

const require = createRequire(import.meta.url);
const gplayModule = require('google-play-scraper') as {
  default?: typeof import('google-play-scraper');
} & typeof import('google-play-scraper');
const gplay = (gplayModule.default ?? gplayModule) as typeof import('google-play-scraper');

const COUNTRY = 'de';
const LANG = 'de';

export const fetchAndroidLeads = async (config: AppConfig): Promise<Lead[]> => {
  const leads: Lead[] = [];

  for (const keyword of config.keywords) {
    console.log(`Android: Suche nach "${keyword}" ...`);
    let apps: Awaited<ReturnType<typeof gplay.search>> = [];
    try {
      apps = await gplay.search({ term: keyword, num: 100, country: COUNTRY, lang: LANG });
    } catch (error) {
      console.warn(`Android: Fehler bei Suche "${keyword}": ${(error as Error).message}`);
      continue;
    }

    for (const app of apps) {
      try {
        await sleep(200);
        const details = await gplay.app({ appId: app.appId, country: COUNTRY, lang: LANG });
        const rating = details.score ?? 0;
        const ratingsCount = details.ratings ?? 0;
        if (rating >= config.minRating) continue;
        if (ratingsCount < config.minReviews) continue;

        const meta = details as unknown as {
          updated?: unknown;
          updatedISO?: unknown;
        };
        const updatedRaw = meta.updated ?? meta.updatedISO ?? null;
        let lastUpdate = '';
        if (updatedRaw instanceof Date) {
          lastUpdate = updatedRaw.toISOString();
        } else if (typeof updatedRaw === 'number') {
          lastUpdate = new Date(updatedRaw).toISOString();
        } else if (typeof updatedRaw === 'string') {
          const parsed = new Date(updatedRaw);
          if (!Number.isNaN(parsed.getTime())) {
            lastUpdate = parsed.toISOString();
          }
        }

        leads.push({
          source_store: 'android',
          app_name: details.title,
          bundle_id: details.appId,
          developer: details.developer,
          rating,
          ratings_count: ratingsCount,
          last_update: lastUpdate,
          country: 'DE',
          category: details.genre ?? '',
          app_url: details.url,
          reviews_url: `https://play.google.com/store/apps/details?id=${details.appId}&hl=de&gl=DE&showAllReviews=true`,
          website: details.developerWebsite ?? '',
          support_email: details.developerEmail ?? '',
          linkedin_guess: '',
          contact_status: '',
          loom_status: '',
          outreach_owner: '',
          date_found: new Date().toISOString()
        });
      } catch (error) {
        console.warn(`Android: Fehler bei ${app.appId}: ${(error as Error).message}`);
      }
    }
  }

  return leads;
};

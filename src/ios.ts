import fetch from 'node-fetch';
import { formatISO } from 'date-fns';
import { AppConfig } from './config.js';
import { Lead } from './util.js';

interface ItunesSearchResult {
  trackId: number;
  trackName: string;
  bundleId: string;
  sellerName: string;
  primaryGenreName?: string;
  averageUserRating?: number;
  userRatingCount?: number;
  trackViewUrl: string;
  sellerUrl?: string;
  currentVersionReleaseDate?: string;
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesSearchResult[];
}

const BASE_URL = 'https://itunes.apple.com/search';

const buildUrl = (keyword: string): string => {
  const params = new URLSearchParams({
    term: keyword,
    country: 'DE',
    entity: 'software',
    limit: '200'
  });
  return `${BASE_URL}?${params.toString()}`;
};

const mapResultToLead = (result: ItunesSearchResult): Lead => {
  const lastUpdate = result.currentVersionReleaseDate
    ? formatISO(new Date(result.currentVersionReleaseDate))
    : '';

  return {
    source_store: 'ios',
    app_name: result.trackName,
    bundle_id: result.bundleId,
    developer: result.sellerName,
    rating: result.averageUserRating ?? 0,
    ratings_count: result.userRatingCount ?? 0,
    last_update: lastUpdate,
    country: 'DE',
    category: result.primaryGenreName ?? '',
    app_url: result.trackViewUrl,
    reviews_url: `https://apps.apple.com/de/app/id${result.trackId}?see-all=reviews`,
    website: result.sellerUrl ?? '',
    support_email: '',
    linkedin_guess: '',
    contact_status: '',
    loom_status: '',
    outreach_owner: '',
    date_found: new Date().toISOString()
  };
};

export const fetchIosLeads = async (config: AppConfig): Promise<Lead[]> => {
  const leads: Lead[] = [];

  for (const keyword of config.keywords) {
    const url = buildUrl(keyword);
    console.log(`iOS: Suche nach "${keyword}" ...`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`iOS: Anfrage fehlgeschlagen (${response.status})`);
        continue;
      }
      const data = (await response.json()) as ItunesSearchResponse;
      for (const result of data.results) {
        const rating = result.averageUserRating ?? 0;
        const ratingsCount = result.userRatingCount ?? 0;
        if (rating >= config.minRating) continue;
        if (ratingsCount < config.minReviews) continue;
        leads.push(mapResultToLead(result));
      }
    } catch (error) {
      console.warn(`iOS: Fehler bei Suchbegriff "${keyword}": ${(error as Error).message}`);
    }
  }

  return leads;
};

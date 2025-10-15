import { google } from 'googleapis';
import { AppConfig } from './config.js';
import { Lead } from './util.js';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

const leadToRow = (lead: Lead): (string | number)[] => [
  lead.source_store,
  lead.app_name,
  lead.bundle_id,
  lead.developer,
  lead.rating,
  lead.ratings_count,
  lead.last_update,
  lead.country,
  lead.category,
  lead.app_url,
  lead.reviews_url,
  lead.website,
  lead.support_email,
  lead.linkedin_guess,
  lead.contact_status,
  lead.loom_status,
  lead.outreach_owner,
  lead.date_found
];

export const syncLeadsToSheet = async (leads: Lead[], config: AppConfig): Promise<void> => {
  if (!config.googleSheetsEnabled || !config.googleSheets) {
    console.log('Google Sheets ist deaktiviert.');
    return;
  }

  const { spreadsheetId, tabName, credentialsPath } = config.googleSheets;

  if (!spreadsheetId) {
    console.warn('Google Sheets: Spreadsheet-ID fehlt.');
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      scopes: [SHEETS_SCOPE],
      ...(credentialsPath ? { keyFile: credentialsPath } : {})
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:R`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: leads.map(leadToRow)
      }
    });

    console.log(`Google Sheets: ${leads.length} Zeilen geschrieben.`);
  } catch (error) {
    console.error(`Google Sheets: Fehler beim Schreiben - ${(error as Error).message}`);
  }
};

# App Leads Scout

Ein Node.js/TypeScript-Skript, das täglich deutschsprachige App-Store-Leads mit schlechter Bewertung sammelt, als CSV speichert und optional in Google Sheets überträgt oder per E-Mail verschickt.

## Schnellstart

1. Repository klonen und Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. `.env` anhand von [.env.example](./.env.example) ausfüllen.
3. Lokalen Lauf starten:
   ```bash
   npm run dev
   ```
   Die CSV wird im in `OUTPUT_DIR` konfigurierten Verzeichnis abgelegt.

## E-Mail-Versand mit Resend

Setze folgende Variablen in deiner `.env` (bzw. in GitHub-Secrets), um den CSV-Export per Mail zu erhalten:

- `EMAIL_ENABLED=true`
- `RESEND_API_KEY` – Resend-API-Key mit Versandrechten.
- `EMAIL_FROM` – verifizierte Absenderadresse bei Resend (z. B. `Leads Scout <reports@deine-domain.de>`).
- `EMAIL_TO` – durch Kommas getrennte Empfänger:innen.
- `EMAIL_SUBJECT` – Betreffzeile (optional).

> Hinweis: Domain bzw. Absender müssen in Resend verifiziert sein, bevor Mails erfolgreich zugestellt werden.

## Automatischer Daily-Run (Mo–Fr, 10:00 Uhr Berlin)

Eine GitHub Action (`.github/workflows/run.yml`) führt das Skript werktags um 08:00 UTC aus. Damit das funktioniert, musst du im Repository folgende Secrets hinterlegen:

- `KEYWORDS`, `MIN_RATING`, `MIN_REVIEWS`, `MAX_UPDATE_AGE_DAYS` (optional, nutzen Standardwerte falls leer)
- `GOOGLE_SHEETS_ENABLED`, `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_TAB_NAME`, `GOOGLE_SERVICE_ACCOUNT_JSON` (nur bei aktivem Sheets-Sync nötig)
- `EMAIL_ENABLED`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_SUBJECT`

Danach genügt es, das Repository auf GitHub zu pushen – die Action läuft automatisch zum geplanten Zeitpunkt. Für Tests kannst du den Workflow auch manuell per "Run workflow" starten.

## Nützliche Skripte

- `npm run dev` – Ausführung im Entwicklungsmodus (TypeScript direkt über `tsx`).
- `npm run build` – Transpiliert nach `dist/`.
- `npm run start` – Startet die gebaute Version.

## Lizenz

MIT

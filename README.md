# CRIMEPULSE — Puducherry command intelligence demo

This is a responsive command-center prototype with a real interactive OpenStreetMap basemap centered on Puducherry, India. Every incident, alert, hotspot, patrol unit and analytical conclusion is synthetic and prominently labeled as such.

## Run locally

```powershell
npm install
cd backend
python -m uvicorn main:app --reload --port 8000

# In a second terminal
cd ..
npm run dev
```

Open the local address printed by the development server. The basemap needs an internet connection to load OpenStreetMap tiles.

The app falls back to the in-browser demo dataset if the API is not running, but running both services gives persistent local case creation through the API.

## Load the supplied datasets

The supplied files are explicitly marked as synthetic/sample records. They have been loaded into the local development database for this workspace. To repeat the operation after resetting the database:

```powershell
cd backend
python load_datasets.py "C:\Users\Koush\Downloads\crimepulse_puducherry_700_records.csv" "C:\Users\Koush\Downloads\Puducherry_Crime_Data_Sample.csv"
```

Dashboard, map, hotspot, and forecast APIs use the imported records. Duplicate case IDs are skipped safely.

## Included interactions

- Real Leaflet/OpenStreetMap Puducherry map, panning and zooming
- Marker popups, severity visual encoding, and analytical-density overlays
- Map category filtering, fit-to-results and recenter actions
- Sidebar navigation across all command-center modules
- Today’s cases register and a validated synthetic new-case flow backed by SQLite in development
- Hotspot, trends, emerging-hotspot, risk, patrol, alert, audit, and CSV-report API endpoints
- Live dashboard figures refresh when a synthetic case is entered
- Working Hotspots, Crime Analytics, Predictive Risk, relationship, patrol simulator, alerts, reports, data-validation, audit, and responsible-AI workspaces

## Production handoff

The API is deliberately a development demo. It persists synthetic records to `backend/crimepulse_demo.db`. Before handling authorized incident records, migrate to PostgreSQL/PostGIS; add migrations, backend-enforced RBAC/JWT, rate limiting, secure imports, encrypted secrets, server-side jobs, and independently validated analytical models. Do not submit personal data or operational police data to this demo.

Map data © OpenStreetMap contributors.

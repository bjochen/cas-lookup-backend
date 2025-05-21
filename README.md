# CAS Lookup Multi-Source API

Express.js-API zur Abfrage von CAS-Nummern aus mehreren Quellen:
- PubChem PUG REST + HTML Scraping (Primary, Related, Deprecated CAS)
- CAS Common Chemistry (HTML Scraping)
- EPA DSSTox (optional via API Key)

## Nutzung

GET /api/cas-lookup?q=<Substanzname>

## Deployment

1. GitHub-Repo erstellen und Code hochladen
2. Render.com Web Service: Build: npm install / Start: npm start
3. (Optional) Set EPA_API_KEY in Environment

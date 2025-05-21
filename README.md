# CAS Lookup Multi-Source API

Dieses Projekt bietet eine Express.js-API zur Abfrage von CAS-Nummern aus mehreren Quellen:
- PubChem JSON (Primary CAS)
- PubChem HTML-Scraping (Related & Deprecated CAS)

## Nutzung

```bash
GET /api/cas-lookup?q=<Substanzname>
```

Beispiel:
https://<dein-domain>.onrender.com/api/cas-lookup?q=benzene

# CAS Lookup API

Einfache Node.js/Express API, um über PubChem CAS-Informationen für chemische Substanzen abzufragen.

## Nutzung (lokal)

```bash
npm install
node server.js
```

API läuft dann unter: `http://localhost:3001/api/cas-lookup?q=aspirin`

## Deployment auf Render.com

1. Repository auf GitHub pushen
2. Auf [https://render.com](https://render.com) einloggen
3. Neues Web Service → Verbinde dein Repository
4. Einstellungen:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Node Version: 18+

API erreichbar unter z. B. `https://cas-lookup-api.onrender.com/api/cas-lookup?q=aspirin`

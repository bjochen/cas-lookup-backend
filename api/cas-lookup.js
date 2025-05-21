const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: "Keine Substanz übergeben." });

  const results = [];
  try {
    // PubChem Primary
    const pubchemApi = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/JSON`;
    const apiResp = await fetch(pubchemApi);
    if (!apiResp.ok) throw new Error(`PubChem API error: ${apiResp.status}`);
    const apiJson = await apiResp.json();
    const compound = apiJson?.PC_Compounds?.[0];
    const cid = compound?.id?.id?.cid;
    const baseLink = cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` : "";

    // Primary CAS
    const primary = compound?.props?.find(p =>
      p.urn?.label === "Registry Number" && p.urn?.name === "CAS"
    )?.value?.sval;
    if (primary) {
      results.push({
        cas: primary,
        type: "primary",
        source: "PubChem",
        comment: "Primary CAS number",
        score: 95,
        link: baseLink
      });
    }

    // Related & Deprecated via HTML
    if (cid) {
      const html = await fetch(baseLink).then(r => r.text());
      const $ = cheerio.load(html);
      const parseSec = (title, type, score) => {
        $(`h2:contains("${title}")`).first().parent().find("a").each((i, el) => {
          const txt = $(el).text().trim();
          const href = $(el).attr("href");
          if (/\d{2,7}-\d{2}-\d/.test(txt)) {
            results.push({
              cas: txt,
              type,
              source: "PubChem",
              comment: type === "related" ? "Related CAS" : "Deprecated CAS",
              score,
              link: href.startsWith("http") ? href : `https://pubchem.ncbi.nlm.nih.gov${href}`
            });
          }
        });
      };
      parseSec("2.3.2 Related CAS", "related", 85);
      parseSec("2.3.3 Deprecated CAS", "deprecated", 30);
    }

    // CAS Common Chemistry
    if (primary) {
      const ccUrl = `https://commonchemistry.cas.org/detail?cas_rn=${primary}`;
      const ccResp = await fetch(ccUrl);
      if (ccResp.ok) {
        results.push({
          cas: primary,
          type: "primary",
          source: "CAS Common Chemistry",
          comment: "Verified on CAS Common Chemistry",
          score: 100,
          link: ccUrl
        });
      }
    }

    // EPA DSSTox (optional)
    if (primary && process.env.EPA_API_KEY) {
      const dsUrl = `https://api.epa.gov/compToxDashboard/data/v1/chemical?casrn=${primary}&api_key=${process.env.EPA_API_KEY}`;
      const dsResp = await fetch(dsUrl);
      if (dsResp.ok) {
        results.push({
          cas: primary,
          type: "other",
          source: "EPA DSSTox",
          comment: "EPA DSSTox record",
          score: 85,
          link: dsUrl
        });
      }
    }

    res.json({ query, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen/Parsen der Daten." });
  }
});

module.exports = router;

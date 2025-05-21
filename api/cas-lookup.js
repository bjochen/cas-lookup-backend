const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: "Keine Substanz übergeben." });

  const results = [];
  try {
    // PubChem JSON for primary CAS
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

    // Scrape HTML for related & deprecated CAS
    if (cid) {
      const htmlResp = await fetch(baseLink);
      const html = await htmlResp.text();
      const $ = cheerio.load(html);

      function parseSection(titleText, type, score) {
        $(`h2:contains("${titleText}")`).first().parent().find("a").each((i, el) => {
          const txt = $(el).text().trim();
          if (/\d{2,7}-\d{2}-\d/.test(txt)) {
            const href = $(el).attr("href");
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
      }
      parseSection("2.3.2 Related CAS", "related", 85);
      parseSection("2.3.3 Deprecated CAS", "deprecated", 30);
    }

    res.json({ query, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen/Parsen der Daten." });
  }
});

module.exports = router;

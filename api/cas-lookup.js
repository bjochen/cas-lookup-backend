const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q?.toLowerCase().trim();
  if (!query) return res.status(400).json({ error: "Keine Substanz übergeben." });

  const results = [];

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/JSON`;
    const response = await fetch(url);
    const json = await response.json();
    const compound = json?.PC_Compounds?.[0];
    const cid = compound?.id?.id?.cid;

    const link = cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` : "";
    const registry = compound?.props?.find(p => p.urn?.label === "Registry Number" && p.urn?.name === "CAS");

    if (registry?.value?.sval) {
      results.push({
        cas: registry.value.sval,
        type: "primary",
        source: "PubChem",
        comment: "Hauptnummer laut PubChem",
        score: 95,
        link
      });
    }

    if (cid) {
      const htmlRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`);
      const html = await htmlRes.text();
      const $ = cheerio.load(html);

      const parseSection = (sectionTitle, type, baseScore) => {
        const section = $(`h2:contains("${sectionTitle}")`).first().parent();
        section.find("a").each((_, el) => {
          const text = $(el).text().trim();
          const href = $(el).attr("href");
          if (/\d{2,7}-\d{2}-\d/.test(text)) {
            results.push({
              cas: text,
              type,
              score: baseScore,
              source: "PubChem",
              comment: type === "related" ? "Verwandte Nummer" : "Veraltet",
              link: href?.startsWith("http") ? href : `https://pubchem.ncbi.nlm.nih.gov${href}`
            });
          }
        });
      };

      parseSection("2.3.2 Related CAS", "related", 85);
      parseSection("2.3.3 Deprecated CAS", "deprecated", 30);
    }

    res.json({ query, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fehler beim Abrufen oder Parsen der Daten." });
  }
});

module.exports = router;

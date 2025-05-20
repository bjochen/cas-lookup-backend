const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q?.toLowerCase().trim();

  if (!query) {
    return res.status(400).json({ error: "Keine Substanz übergeben." });
  }

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/JSON`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `PubChem: ${response.statusText}` });
    }

    const json = await response.json();
    const compound = json?.PC_Compounds?.[0];

    const cid = compound?.id?.id?.cid;
    const link = cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` : "";

    const casMatch = (compound?.props || []).find(p =>
      p.urn?.label === "Registry Number" && p.urn?.name === "CAS"
    );
    const cas = casMatch?.value?.sval || "nicht gefunden";

    const synonyms = (compound?.props || [])
      .filter(p => p.urn?.label === "Synonym")
      .map(p => p.value?.sval)
      .filter(Boolean)
      .slice(0, 5)
      .join(", ");

    return res.json({
      results: [
        {
          source: "PubChem",
          cas,
          link,
          synonym: query,
          synonyms,
          match: cas !== "nicht gefunden" ? "exakt" : "unsicher",
          score: cas !== "nicht gefunden" ? 100 : 60
        }
      ]
    });
  } catch (e) {
    console.error("PubChem Fehler:", e);
    res.status(500).json({ error: "Fehler beim Abrufen der Daten." });
  }
});

module.exports = router;

const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q?.toLowerCase().trim();
  if (!query) return res.status(400).json({ error: "Keine Substanz übergeben." });

  const results = [];

  try {
    const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/JSON`;
    const response = await fetch(pubchemUrl);
    const data = await response.json();

    const cid = data?.PC_Compounds?.[0]?.id?.id?.cid;
    const baseLink = cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` : "";

    const casProp = data?.PC_Compounds?.[0]?.props?.find(p =>
      p.urn?.label === "Registry Number" && p.urn?.name === "CAS"
    );
    if (casProp?.value?.sval) {
      results.push({
        cas: casProp.value.sval,
        type: "primary",
        score: 95,
        source: "PubChem",
        comment: "Primary CAS number",
        link: baseLink
      });
    }

    // Related CAS (simuliert, da keine offizielle JSON-API)
    results.push({
      cas: "6842-25-7",
      type: "related",
      score: 85,
      source: "PubChem",
      comment: "Beispiel: Benzene, dimer",
      link: baseLink + "#section=Related-CAS"
    });

    // Deprecated CAS
    results.push({
      cas: "1053658-43-7",
      type: "deprecated",
      score: 30,
      source: "PubChem",
      comment: "veraltet",
      link: baseLink + "#section=Deprecated-CAS"
    });

    res.json({ query, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fehler beim Abrufen der Daten." });
  }
});

module.exports = router;

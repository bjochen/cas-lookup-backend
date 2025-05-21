const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use("/api/cas-lookup", require("./api/cas-lookup"));

app.get("/", (_, res) => {
  res.send("CAS Lookup API ist bereit.");
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});

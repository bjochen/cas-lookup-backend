const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const casLookup = require("./api/cas-lookup");
app.use("/api/cas-lookup", casLookup);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server läuft unter http://localhost:${PORT}/api/cas-lookup`);
});

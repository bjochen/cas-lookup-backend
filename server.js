const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api/cas-lookup", require("./api/cas-lookup"));

app.get("/", (req, res) => {
  res.send("CAS Lookup Multi-Source API is running.");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

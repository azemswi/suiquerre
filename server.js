const express = require("express");
const bodyParser = require("body-parser");
const SwissQRBill = require("swissqrbill");

const app = express();
app.use(bodyParser.json());

app.post("/api/generate", (req, res) => {
  const bill = req.body;

  try {
    const svg = SwissQRBill.generateSVG(bill);
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Suiquerre SwissQRBill API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

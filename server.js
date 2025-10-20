const express = require("express");
const bodyParser = require("body-parser");
const { QRBill } = require("qrbill");

const app = express();
app.use(bodyParser.json());

app.post("/api/generate", async (req, res) => {
  try {
    const bill = new QRBill({
      account: req.body.account,
      amount: req.body.amount,
      currency: req.body.currency || "CHF",
      creditor: {
        name: req.body.creditor.name,
        address: req.body.creditor.address,
        zip: req.body.creditor.zip,
        city: req.body.creditor.city,
        country: req.body.creditor.country
      },
      reference: req.body.reference,
      additionalInfo: req.body.additionalInfo
    });

    const svg = bill.toSVG();
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Suiquerre QR Swiss API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


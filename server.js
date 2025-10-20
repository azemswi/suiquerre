const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const { SwissQRBill } = require("swissqrbill/pdf");
const sharp = require("sharp");

const app = express();
app.use(bodyParser.json());

app.post("/api/generate", (req, res) => {
  try {
    const data = {
      amount: req.body.amount,
      creditor: {
        account: req.body.account,
        name: req.body.creditor.name,
        address: req.body.creditor.address,
        buildingNumber: req.body.creditor.buildingNumber || "",
        city: req.body.creditor.city,
        zip: req.body.creditor.zip,
        country: req.body.creditor.country
      },
      currency: req.body.currency || "CHF",
      reference: req.body.reference,
      // opzionale: aggiunge ulteriori dati se servono
      debtor: req.body.debtor || {},
      additionalInfo: req.body.additionalInfo || ""
    };

    // Crea PDF con PDFKit e SwissQRBill
    const doc = new PDFDocument({ size: "A6", margin: 10 });
    const qrBill = new SwissQRBill(data);
    qrBill.attachTo(doc);

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        // Converte il PDF in PNG a 300 DPI
        const pngBuffer = await sharp(pdfBuffer, { density: 300 })
          .png()
          .toBuffer();

        res.setHeader("Content-Type", "image/png");
        res.status(200).send(pngBuffer);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    doc.end();
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





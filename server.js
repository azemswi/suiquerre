const express = require("express");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const sharp = require("sharp");
const SwissQRBill = require("swissqrbill").default;

const app = express();
app.use(bodyParser.json());

app.post("/api/generate", async (req, res) => {
  try {
    const {
      account,
      amount,
      currency,
      creditor,
      reference,
      additionalInfo,
      debtor
    } = req.body;

    // 1. Contenuto ISO 20022 per QR puro
    const qrContent = [
      "SPC", "0200", "1",
      account,
      creditor.name,
      creditor.address,
      `${creditor.zip} ${creditor.city}`,
      creditor.country,
      "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      amount.toFixed(2),
      currency,
      reference,
      additionalInfo || ""
    ].join("\n");

    // 2. Genera SVG del solo QR
    const qrSVG = await QRCode.toString(qrContent, { type: "svg" });

    // 3. Crea dati per SwissQRBill (layout + croce)
    const billData = {
      version: "0200",
      codingType: "1",
      account,
      creditor: {
        name: creditor.name,
        address: creditor.address,
        buildingNumber: creditor.buildingNumber || "",
        zip: creditor.zip,
        city: creditor.city,
        country: creditor.country
      },
      amount,
      currency,
      reference,
      additionalInformation: additionalInfo || "",
      debtor: {
        name: debtor?.name || "",
        address: debtor?.address || "",
        buildingNumber: debtor?.buildingNumber || "",
        zip: debtor?.zip || "",
        city: debtor?.city || "",
        country: debtor?.country || ""
      }
    };

    // 4. Genera SVG ufficiale con SwissQRBill
    const svgBill = SwissQRBill(billData, { width: 1050, height: 2100 });

    // 5. Converti l’SVG in PNG
    const pngBuffer = await sharp(Buffer.from(svgBill))
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(pngBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.send("API QR Swiss in esecuzione"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server su port ${PORT}`));






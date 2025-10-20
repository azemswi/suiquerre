const express = require("express");
const bodyParser = require("body-parser");
const sharp = require("sharp");
const { SwissQRBill } = require("swissqrbill");

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

    // Prepara i dati per SwissQRBill
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
      amount: parseFloat(amount),
      currency: currency || "CHF",
      reference: reference || "",
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

    // Genera l’SVG ufficiale (layout + QR + croce)
    const svgBill = SwissQRBill(billData, {
      format: "svg",
      width: 1050,
      height: 2100
    });

    // Converte l’SVG in PNG
    const pngBuffer = await sharp(Buffer.from(svgBill, "utf-8"))
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







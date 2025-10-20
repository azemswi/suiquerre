const express = require("express");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const sharp = require("sharp");

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
      additionalInfo
    } = req.body;

    const qrContent = [
      "SPC", "0200", "1",
      account,
      creditor.name,
      creditor.address,
      creditor.zip + " " + creditor.city,
      creditor.country,
      "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      amount.toFixed(2),
      currency,
      reference,
      additionalInfo || ""
    ].join("\n");

    const qrSVG = await QRCode.toString(qrContent, { type: "svg" });

    // SVG layout completo con croce svizzera
    const layoutSVG = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="20" y="40" font-size="18" font-family="Arial" font-weight="bold">Zahlteil / Section paiement / Ricevuta di pagamento</text>
        <g transform="translate(100,60)">
          ${qrSVG}
          <rect x="85" y="85" width="30" height="30" fill="white"/>
          <path d="M100 90 v20 M90 100 h20" stroke="red" stroke-width="4"/>
        </g>
        <text x="20" y="300" font-size="14" font-family="Arial">IBAN: ${account}</text>
        <text x="20" y="320" font-size="14" font-family="Arial">${creditor.name}</text>
        <text x="20" y="340" font-size="14" font-family="Arial">${creditor.address}</text>
        <text x="20" y="360" font-size="14" font-family="Arial">${creditor.zip} ${creditor.city} ${creditor.country}</text>
        <text x="20" y="400" font-size="14" font-family="Arial">Importo: ${currency} ${amount.toFixed(2)}</text>
        <text x="20" y="420" font-size="14" font-family="Arial">Riferimento: ${reference}</text>
        <text x="20" y="440" font-size="14" font-family="Arial">Info: ${additionalInfo}</text>
      </svg>
    `;

    const pngBuffer = await sharp(Buffer.from(layoutSVG)).png().toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(pngBuffer);
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




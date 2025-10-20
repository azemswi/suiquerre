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

    const svg = await QRCode.toString(qrContent, { type: "svg" });
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

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



import express from "express";
import bodyParser from "body-parser";
import sharp from "sharp";
import { SwissQRBill } from "swissqrbill";

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

    const billData = {
      version: "0200",
      codingType: "1",
      account,
      creditor,
      amount: parseFloat(amount),
      currency: currency || "CHF",
      reference: reference || "",
      additionalInformation: additionalInfo || "",
      debtor
    };

    const svgBill = SwissQRBill(billData, {
      format: "svg",
      width: 1050,
      height: 2100
    });

    const pngBuffer = await sharp(Buffer.from(svgBill, "utf-8"))
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(pngBuffer);
  } catch (err) {
    console.error("Errore generazione:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.send("API QR Swiss in esecuzione ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo su porta ${PORT}`));









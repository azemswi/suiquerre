import express from "express";
import bodyParser from "body-parser";
import sharp from "sharp";
import SwissQRBill from "swissqrbill"; // versione 3.1.0 usa default export
import { google } from "googleapis";

const app = express();
app.use(bodyParser.json());

// Legge le credenziali dall'ambiente
const KEYFILE = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// Inizializza Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: KEYFILE,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = google.drive({ version: "v3", auth });

// ID della cartella condivisa su Drive
const DRIVE_FOLDER_ID = "1OpKlt5UX4hr7nhy5Ifod4Swx1mBKXAlA";

// Endpoint per generare il bollettino QR
app.post("/api/generate-bill", async (req, res) => {
  try {
    const data = req.body;

    // Genera SVG Swiss QR
    const svgBill = new SwissQRBill({
      version: "0200",
      codingType: "1",
      account: data.creditor.account,
      creditor: {
        name: data.creditor.name,
        address: data.creditor.address,
        buildingNumber: data.creditor.buildingNumber || "",
        zip: data.creditor.zip,
        city: data.creditor.city,
        country: data.creditor.country
      },
      amount: parseFloat(data.amount),
      currency: data.currency || "CHF",
      reference: data.reference || "",
      additionalInformation: data.unstructuredMessage || "",
      debtor: {
        name: data.debtor?.name || "",
        address: data.debtor?.address || "",
        buildingNumber: data.debtor?.buildingNumber || "",
        zip: data.debtor?.zip || "",
        city: data.debtor?.city || "CH",
        country: data.debtor?.country || "CH"
      }
    });

    // Converti SVG in PNG
    const pngBuffer = await sharp(Buffer.from(svgBill, "utf-8"))
      .png()
      .toBuffer();

    // Nome del file
    const fileName = `qr-bill-${Date.now()}.png`;

    // Carica su Drive
    const fileMetadata = { name: fileName, parents: [DRIVE_FOLDER_ID] };
    const media = { mimeType: "image/png", body: Buffer.from(pngBuffer) };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink"
    });

    // Link pubblico per Google Sheets
    const fileId = file.data.id;
    const link = `https://drive.google.com/uc?id=${fileId}&export=download`;

    res.json({ success: true, fileId, link });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint test
app.get("/", (req, res) => res.send("API QR Swiss Bill attiva"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su port ${PORT}`));

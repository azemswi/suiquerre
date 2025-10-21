import express from "express";
import bodyParser from "body-parser";
import sharp from "sharp";
import { SwissQRBill } from "swissqrbill";

const app = express();
app.use(bodyParser.json());

app.post("/api/generate-bill", async (req, res) => {
  try {
    const data = req.body;

    const svg = SwissQRBill(data, { format: "svg", width: 1050, height: 2100 });
    const pngBuffer = await sharp(Buffer.from(svg, "utf-8")).png().toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(pngBuffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => res.send("Suiquerre2-0 API QR Swiss attiva!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

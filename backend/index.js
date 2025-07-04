import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import mammoth from "mammoth";
import { PDFDocument, rgb } from "pdf-lib";
import path from "path";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// //////////

app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const result = await mammoth.extractRawText({ buffer: fileBuffer });

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 14;
    const lines = result.value.split("\n");
    let y = height - 50;

    lines.forEach(line => {
      if (y < 50) {
        page = pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 4;
    });

    const pdfBytes = await pdfDoc.save();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=converted.pdf"
    });

    res.send(pdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error converting file.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

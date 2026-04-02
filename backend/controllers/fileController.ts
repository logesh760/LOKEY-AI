import fs from "fs";
import * as pdfModule from "pdf-parse";
// @ts-ignore
const pdf = pdfModule.default || pdfModule;
import mammoth from "mammoth";

export async function handleUpload(req: any, res: any) {
  const file = req.file;
  const { userId } = req.body;

  if (!file || !userId) {
    return res.status(400).json({ error: "File and userId are required." });
  }

  try {
    let text = "";

    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const data = await mammoth.extractRawText({ path: file.path });
      text = data.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload PDF or DOCX." });
    }

    // Clean up file
    fs.unlinkSync(file.path);

    res.json({ fullText: text, preview: text.substring(0, 500) + "..." });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Internal server error during file processing." });
  }
}

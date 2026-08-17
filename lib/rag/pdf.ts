import "server-only";
import { getDocumentProxy, extractText } from "unpdf";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  if (!text.trim()) {
    throw new Error("No extractable text found in this PDF (it may be a scanned image).");
  }

  return text;
}

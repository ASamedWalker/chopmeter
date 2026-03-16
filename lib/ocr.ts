import Tesseract from "tesseract.js";

/**
 * Extract numeric meter reading from an image.
 * Uses Tesseract.js — only accepts 4+ digit numbers to avoid false positives
 * from random text, single digits, dates, etc.
 */
export async function recognizeMeterReading(
  imageSource: string | File | Blob,
  onProgress?: (progress: number) => void
): Promise<{ value: number | null; rawText: string; confidence: number }> {
  try {
    const result = await Tesseract.recognize(imageSource, "eng", {
      logger: (info: { status: string; progress: number }) => {
        if (
          onProgress &&
          info.status === "recognizing text" &&
          typeof info.progress === "number"
        ) {
          onProgress(Math.round(info.progress * 100));
        }
      },
    });

    const rawText = result.data.text.trim();
    const confidence = result.data.confidence;

    // Reject low-confidence results — likely not looking at a meter
    if (confidence < 40) {
      return { value: null, rawText, confidence };
    }

    // Look for 4-7 digit numbers (with optional 1-2 decimal places)
    // This filters out random single digits, dates, short numbers
    const matches = rawText.match(/\b(\d{4,7}(?:\.\d{1,2})?)\b/g);
    if (matches && matches.length > 0) {
      // Pick the longest numeric sequence (most likely the meter reading)
      const longest = matches.sort((a, b) => b.length - a.length)[0];
      const value = parseFloat(longest);
      if (!isNaN(value) && value > 0) {
        return { value, rawText, confidence };
      }
    }

    return { value: null, rawText, confidence };
  } catch (error) {
    console.error("OCR failed:", error);
    return { value: null, rawText: "", confidence: 0 };
  }
}

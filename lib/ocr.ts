import Tesseract from "tesseract.js";

/**
 * Extract numeric meter reading from an image.
 * Uses Tesseract.js with digit-only whitelist for best accuracy on LCD displays.
 */
export async function recognizeMeterReading(
  imageSource: string | File | Blob
): Promise<{ value: number | null; rawText: string; confidence: number }> {
  try {
    const result = await Tesseract.recognize(imageSource, "eng", {
      logger: () => {}, // Suppress verbose logging
    });

    const rawText = result.data.text.trim();
    const confidence = result.data.confidence;

    // Extract numeric value — look for sequences of digits (with optional decimal)
    const matches = rawText.match(/[\d]+\.?[\d]*/g);
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

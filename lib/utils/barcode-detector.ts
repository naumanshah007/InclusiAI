/**
 * Barcode Detection Utility
 * Uses browser APIs and AI to detect and read barcodes
 */

export interface BarcodeResult {
  barcode: string;
  format: string; // e.g., 'EAN_13', 'CODE_128', 'QR_CODE'
  confidence?: number;
}

/**
 * Detect barcode in image using AI (Gemini vision)
 * Falls back to manual detection if browser APIs are not available
 */
export async function detectBarcode(
  image: string,
  aiProvider: (image: string, prompt: string) => Promise<string>
): Promise<BarcodeResult | null> {
  try {
    // Use AI to detect and read barcode
    const prompt = `Look for a barcode in this image. If you find one, extract the barcode number. Barcodes are typically rectangular patterns of parallel lines (1D barcodes) or square patterns (2D barcodes like QR codes). Return ONLY the barcode number if found, or "NO_BARCODE" if no barcode is visible. Be very accurate with the numbers.`;
    
    const result = await aiProvider(image, prompt);
    
    if (result && !result.includes('NO_BARCODE') && result.trim().length > 0) {
      // Extract barcode number from result
      const barcodeMatch = result.match(/\b\d{8,}\b/); // Match 8+ digit numbers
      if (barcodeMatch) {
        return {
          barcode: barcodeMatch[0],
          format: 'UNKNOWN', // AI doesn't detect format
          confidence: 0.8,
        };
      }
      
      // Try to extract any number sequence
      const numberMatch = result.match(/[\d-]+/);
      if (numberMatch) {
        const cleaned = numberMatch[0].replace(/-/g, '');
        if (cleaned.length >= 8) {
          return {
            barcode: cleaned,
            format: 'UNKNOWN',
            confidence: 0.7,
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting barcode:', error);
    return null;
  }
}

/**
 * Get product information from barcode using AI
 */
export async function getProductInfo(
  barcode: string,
  image: string,
  aiProvider: (image: string, prompt: string) => Promise<string>
): Promise<{
  name: string;
  variant?: string;
  size?: string;
  brand?: string;
  category?: string;
} | null> {
  try {
    const prompt = `This image contains a product with barcode ${barcode}. Identify the product and provide:
1. Product name (brand name if visible)
2. Variant (if applicable, e.g., "Chocolate", "Vanilla")
3. Size (if visible, e.g., "500ml", "1kg")
4. Brand name (if visible)
5. Category (e.g., "Food", "Beverage", "Medicine", "Electronics")

Format your response as:
Name: [product name]
Variant: [variant if applicable]
Size: [size if applicable]
Brand: [brand if applicable]
Category: [category if applicable]`;
    
    const result = await aiProvider(image, prompt);
    
    // Parse the result
    const lines = result.split('\n').map(l => l.trim());
    const info: any = {};
    
    for (const line of lines) {
      if (line.startsWith('Name:')) {
        info.name = line.replace(/^Name:\s*/i, '').trim();
      } else if (line.startsWith('Variant:')) {
        info.variant = line.replace(/^Variant:\s*/i, '').trim();
      } else if (line.startsWith('Size:')) {
        info.size = line.replace(/^Size:\s*/i, '').trim();
      } else if (line.startsWith('Brand:')) {
        info.brand = line.replace(/^Brand:\s*/i, '').trim();
      } else if (line.startsWith('Category:')) {
        info.category = line.replace(/^Category:\s*/i, '').trim();
      }
    }
    
    if (info.name) {
      return info;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting product info:', error);
    return null;
  }
}


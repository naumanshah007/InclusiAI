/**
 * Image Quality Detection Utility
 * Detects image quality metrics for OCR and text reading
 */

export interface ImageQualityMetrics {
  blur: number; // 0-1, higher = more blur
  brightness: number; // 0-1, higher = brighter
  contrast: number; // 0-1, higher = more contrast
  textDetected: boolean;
  isReadable: boolean;
  score: number; // 0-1, overall quality score
}

/**
 * Analyze image quality from canvas context
 */
export function analyzeImageQuality(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): ImageQualityMetrics {
  const width = canvas.width;
  const height = canvas.height;
  
  // Sample pixels for analysis
  const sampleSize = Math.min(100, Math.floor(width * height / 1000));
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Calculate brightness
  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalBrightness += (r + g + b) / 3;
  }
  const brightness = totalBrightness / (data.length / 4) / 255;
  
  // Calculate contrast (standard deviation of brightness)
  let variance = 0;
  const mean = totalBrightness / (data.length / 4);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const pixelBrightness = (r + g + b) / 3;
    variance += Math.pow(pixelBrightness - mean, 2);
  }
  const stdDev = Math.sqrt(variance / (data.length / 4));
  const contrast = Math.min(1, stdDev / 128); // Normalize to 0-1
  
  // Estimate blur using Laplacian variance (simplified)
  let laplacianVariance = 0;
  const laplacianValues: number[] = [];
  for (let y = 1; y < height - 1; y += Math.floor(height / 20)) {
    for (let x = 1; x < width - 1; x += Math.floor(width / 20)) {
      const idx = (y * width + x) * 4;
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
      const bottom = (data[(y + 1) * width * 4 + x * 4] + 
                     data[(y + 1) * width * 4 + x * 4 + 1] + 
                     data[(y + 1) * width * 4 + x * 4 + 2]) / 3;
      const laplacian = Math.abs(center * 4 - right - bottom - 
                                 (data[idx - 4] + data[idx - 5] + data[idx - 6]) / 3 -
                                 (data[(y - 1) * width * 4 + x * 4] + 
                                  data[(y - 1) * width * 4 + x * 4 + 1] + 
                                  data[(y - 1) * width * 4 + x * 4 + 2]) / 3);
      laplacianValues.push(laplacian);
    }
  }
  if (laplacianValues.length > 0) {
    const laplacianMean = laplacianValues.reduce((a, b) => a + b, 0) / laplacianValues.length;
    laplacianVariance = laplacianValues.reduce((sum, val) => sum + Math.pow(val - laplacianMean, 2), 0) / laplacianValues.length;
  }
  const blur = Math.max(0, Math.min(1, 1 - laplacianVariance / 1000)); // Lower variance = more blur
  
  // Detect text-like regions (high contrast edges)
  let textLikeRegions = 0;
  for (let y = 0; y < height; y += Math.floor(height / 10)) {
    for (let x = 0; x < width; x += Math.floor(width / 10)) {
      const idx = (y * width + x) * 4;
      if (x < width - 1 && y < height - 1) {
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const bottom = (data[(y + 1) * width * 4 + x * 4] + 
                       data[(y + 1) * width * 4 + x * 4 + 1] + 
                       data[(y + 1) * width * 4 + x * 4 + 2]) / 3;
        const edgeStrength = Math.abs(current - right) + Math.abs(current - bottom);
        if (edgeStrength > 50) { // Threshold for text-like edges
          textLikeRegions++;
        }
      }
    }
  }
  const textDetected = textLikeRegions > 5; // At least 5% of regions have text-like edges
  
  // Calculate overall quality score
  const brightnessScore = brightness > 0.3 && brightness < 0.9 ? 1 : Math.max(0, 1 - Math.abs(brightness - 0.6) * 2);
  const contrastScore = contrast > 0.3 ? 1 : contrast / 0.3;
  const blurScore = 1 - blur;
  const textScore = textDetected ? 1 : 0.5;
  
  const score = (brightnessScore * 0.3 + contrastScore * 0.3 + blurScore * 0.3 + textScore * 0.1);
  const isReadable = score > 0.6 && brightness > 0.2 && brightness < 0.95 && contrast > 0.2 && blur < 0.7;
  
  return {
    blur,
    brightness,
    contrast,
    textDetected,
    isReadable,
    score,
  };
}

/**
 * Get guidance message based on image quality
 */
export function getImageQualityGuidance(metrics: ImageQualityMetrics): string | null {
  if (metrics.isReadable) {
    return null; // Image is good
  }
  
  const issues: string[] = [];
  
  if (metrics.blur > 0.6) {
    issues.push('image is blurry - hold phone steady and move closer');
  }
  
  if (metrics.brightness < 0.3) {
    issues.push('image is too dark - move to brighter area or use flash');
  } else if (metrics.brightness > 0.9) {
    issues.push('image is too bright - reduce glare or move to less bright area');
  }
  
  if (metrics.contrast < 0.3) {
    issues.push('low contrast - ensure text is clear and visible');
  }
  
  if (!metrics.textDetected && metrics.score < 0.5) {
    issues.push('no text detected - point camera at text and move closer');
  }
  
  if (issues.length === 0) {
    return 'adjust camera position for better quality';
  }
  
  return issues.join(', ');
}


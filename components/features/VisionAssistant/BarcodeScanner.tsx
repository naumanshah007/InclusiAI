'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { detectBarcode, getProductInfo } from '@/lib/utils/barcode-detector';
import { useProductStore } from '@/lib/store/product-store';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { addProduct, getProductByBarcode } = useProductStore();

  // AI provider function
  const aiProviderFn = async (image: string, prompt: string): Promise<string> => {
    const response = await callAI(
      {
        type: 'vision',
        data: {
          image,
          context: prompt,
          scenario: 'object',
        },
      },
      {
        apiKey,
        provider: aiProvider,
      }
    );
    return response.result;
  };

  const { mutate: scanBarcode, isPending: isScanning } = useMutation({
    mutationFn: async (image: string) => {
      // Detect barcode
      const barcodeResult = await detectBarcode(image, aiProviderFn);
      
      if (!barcodeResult) {
        throw new Error('No barcode detected. Please ensure the barcode is clearly visible and well-lit.');
      }
      
      setBarcode(barcodeResult.barcode);
      setCurrentImage(image);
      
      // Check if we already have this product
      const existingProduct = getProductByBarcode(barcodeResult.barcode);
      if (existingProduct) {
        setProductInfo({
          name: existingProduct.name,
          variant: existingProduct.variant,
          size: existingProduct.size,
          brand: existingProduct.brand,
          category: existingProduct.category,
        });
        return barcodeResult;
      }
      
      // Get product info from AI
      const info = await getProductInfo(barcodeResult.barcode, image, aiProviderFn);
      if (info) {
        setProductInfo(info);
        
        // Save to store
        addProduct({
          barcode: barcodeResult.barcode,
          ...info,
          image,
        });
      }
      
      return barcodeResult;
    },
    onError: (error) => {
      console.error('Error scanning barcode:', error);
      setBarcode(null);
      setProductInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    scanBarcode(image);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Barcode Scanner</h2>
      <p className="text-sm text-gray-600">
        Point your camera at a barcode to scan and identify the product.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isScanning && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Scanning barcode...</p>
        </div>
      )}
      
      {barcode && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Barcode:</h3>
            <p className="font-mono text-lg text-gray-700">{barcode}</p>
          </div>
          
          {productInfo && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Product Information:</h3>
              <div className="space-y-1 text-sm">
                {productInfo.name && (
                  <p><strong>Name:</strong> {productInfo.name}</p>
                )}
                {productInfo.brand && (
                  <p><strong>Brand:</strong> {productInfo.brand}</p>
                )}
                {productInfo.variant && (
                  <p><strong>Variant:</strong> {productInfo.variant}</p>
                )}
                {productInfo.size && (
                  <p><strong>Size:</strong> {productInfo.size}</p>
                )}
                {productInfo.category && (
                  <p><strong>Category:</strong> {productInfo.category}</p>
                )}
              </div>
              
              <div className="mt-3">
                <TextToSpeech 
                  text={`Product: ${productInfo.name}${productInfo.brand ? `, Brand: ${productInfo.brand}` : ''}${productInfo.size ? `, Size: ${productInfo.size}` : ''}`} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


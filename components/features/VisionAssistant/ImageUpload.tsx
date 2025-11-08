'use client';

import { useState, useRef } from 'react';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from '@/lib/constants';

interface ImageUploadProps {
  onImageSelect: (image: string) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    if (!SUPPORTED_FILE_TYPES.IMAGE.includes(file.type)) {
      setError(
        `Unsupported file type. Please use: ${SUPPORTED_FILE_TYPES.IMAGE.join(
          ', '
        )}`
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE.IMAGE) {
      setError(
        `File too large. Maximum size is ${MAX_FILE_SIZE.IMAGE / 1024 / 1024}MB`
      );
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelect(result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Upload Image</h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image by clicking or dragging"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_FILE_TYPES.IMAGE.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="File input"
        />
        <div className="mb-4 text-4xl">📷</div>
        <p className="mb-2 text-lg font-medium text-gray-700">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-gray-500">
          Supported formats: JPEG, PNG, WebP, GIF (max 10MB)
        </p>
      </div>
      {error && (
        <div
          className="rounded-lg bg-red-50 p-4 text-red-800"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { CameraFeed } from './CameraFeed';
import { ImageDescription } from './ImageDescription';
import { OCRTextExtraction } from './OCRTextExtraction';
import { ContinuousTextReader } from './ContinuousTextReader';
import { BarcodeScanner } from './BarcodeScanner';
import { ObjectFinder } from './ObjectFinder';
import { MoneyReader } from './MoneyReader';
import { CardHelper } from './CardHelper';
import { ColorMatcher } from './ColorMatcher';
import { FormHelper } from './FormHelper';
import { ScreenReader } from './ScreenReader';
import { ObjectTagger } from './ObjectTagger';
import { PeopleAwareness } from './PeopleAwareness';
import { QuickScenarios, type ScenarioType } from './QuickScenarios';
import { HistoryPanel } from './HistoryPanel';

type VisionMode = 'upload' | 'camera' | 'description' | 'ocr' | 'history' | 'continuous-reader' | 'barcode' | 'object-finder' | 'money' | 'card' | 'color' | 'form' | 'screen' | 'tagging' | 'people';

export function VisionAssistant() {
  const [mode, setMode] = useState<VisionMode>('upload');
  const [imageData, setImageData] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('general');

  const handleImageSelect = (image: string) => {
    setImageData(image);
    setDescription(null);
    setExtractedText(null);
    // Auto-switch to description mode when image is selected
    if (mode === 'upload' || mode === 'camera') {
      setMode('description');
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Scenarios - Show when in upload or camera mode */}
      {(mode === 'upload' || mode === 'camera') && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <QuickScenarios
            onScenarioSelect={setSelectedScenario}
            selectedScenario={selectedScenario}
          />
        </div>
      )}

      {/* Mode Selection */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setMode('upload')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'upload'}
        >
          📤 Upload Image
        </button>
        <button
          onClick={() => setMode('camera')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'camera'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'camera'}
        >
          📷 Camera
        </button>
        <button
          onClick={() => setMode('description')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'description'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'description'}
          disabled={!imageData}
        >
          👁️ Describe
        </button>
        <button
          onClick={() => setMode('ocr')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'ocr'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'ocr'}
          disabled={!imageData}
        >
          📝 Extract Text
        </button>
            <button
              onClick={() => setMode('continuous-reader')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'continuous-reader'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'continuous-reader'}
            >
              📖 Continuous Reader
            </button>
            <button
              onClick={() => setMode('barcode')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'barcode'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'barcode'}
            >
              📊 Scan Barcode
            </button>
            <button
              onClick={() => setMode('object-finder')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'object-finder'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'object-finder'}
            >
              🔍 Find Object
            </button>
            <button
              onClick={() => setMode('money')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'money'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'money'}
            >
              💰 Money/Card
            </button>
            <button
              onClick={() => setMode('card')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'card'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'card'}
            >
              💳 Card Helper
            </button>
            <button
              onClick={() => setMode('color')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'color'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'color'}
            >
              🎨 Color Matcher
            </button>
            <button
              onClick={() => setMode('form')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'form'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'form'}
            >
              📋 Form Helper
            </button>
            <button
              onClick={() => setMode('screen')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'screen'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'screen'}
            >
              📺 Screen Reader
            </button>
            <button
              onClick={() => setMode('tagging')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'tagging'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'tagging'}
            >
              🏷️ Tagging
            </button>
            <button
              onClick={() => setMode('people')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'people'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'people'}
            >
              👥 People
            </button>
            <button
              onClick={() => setMode('history')}
              className={`rounded-lg px-5 py-3 font-medium transition-all ${
                mode === 'history'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              aria-pressed={mode === 'history'}
            >
              📚 History
            </button>
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {mode === 'upload' && (
          <ImageUpload onImageSelect={handleImageSelect} />
        )}
        {mode === 'camera' && <CameraFeed onImageCapture={handleImageSelect} />}
        {mode === 'description' && imageData && (
          <ImageDescription 
            image={imageData} 
            scenario={selectedScenario}
            onDescriptionComplete={(desc) => {
              setDescription(desc);
            }}
          />
        )}
            {mode === 'ocr' && imageData && (
              <OCRTextExtraction 
                image={imageData} 
                autoRead={true}
                showQualityFeedback={true}
              />
            )}
            {mode === 'continuous-reader' && (
              <ContinuousTextReader />
            )}
            {mode === 'barcode' && (
              <BarcodeScanner />
            )}
            {mode === 'object-finder' && (
              <ObjectFinder />
            )}
            {mode === 'money' && (
              <MoneyReader />
            )}
            {mode === 'card' && (
              <CardHelper />
            )}
            {mode === 'color' && (
              <ColorMatcher />
            )}
            {mode === 'form' && (
              <FormHelper />
            )}
            {mode === 'screen' && (
              <ScreenReader />
            )}
            {mode === 'tagging' && (
              <ObjectTagger />
            )}
            {mode === 'people' && (
              <PeopleAwareness />
            )}
            {mode === 'history' && (
          <HistoryPanel 
            onSelectScan={(scan) => {
              setImageData(scan.image);
              setDescription(scan.result);
              setMode(scan.type === 'ocr' ? 'ocr' : 'description');
            }}
          />
        )}
      </div>
    </div>
  );
}


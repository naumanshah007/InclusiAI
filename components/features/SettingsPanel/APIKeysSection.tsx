'use client';

import { useState } from 'react';
import { useAPIKeysStore } from '@/lib/store/api-keys-store';

export function APIKeysSection() {
  const { keys, setGeminiKey, setOpenAIKey, setClaudeKey, clearKeys } =
    useAPIKeysStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    gemini: false,
    openai: false,
    claude: false,
  });
  const [tempKeys, setTempKeys] = useState({
    gemini: keys.gemini,
    openai: keys.openai,
    claude: keys.claude,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (provider: 'gemini' | 'openai' | 'claude') => {
    if (provider === 'gemini') {
      setGeminiKey(tempKeys.gemini);
    } else if (provider === 'openai') {
      setOpenAIKey(tempKeys.openai);
    } else if (provider === 'claude') {
      setClaudeKey(tempKeys.claude);
    }
    setMessage({ type: 'success', text: `${provider.toUpperCase()} API key saved successfully!` });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all API keys?')) {
      clearKeys();
      setTempKeys({ gemini: '', openai: '', claude: '' });
      setMessage({ type: 'success', text: 'All API keys cleared' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure your AI provider API keys. Keys are stored locally in your
            browser.
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
        >
          Clear All
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Gemini API Key */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="gemini-key"
              className="text-sm font-medium text-gray-700"
            >
              Gemini API Key
            </label>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              Free Tier
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                id="gemini-key"
                type={showKeys.gemini ? 'text' : 'password'}
                value={tempKeys.gemini}
                onChange={(e) =>
                  setTempKeys({ ...tempKeys, gemini: e.target.value })
                }
                placeholder="Enter your Gemini API key"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => toggleShowKey('gemini')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              aria-label={showKeys.gemini ? 'Hide key' : 'Show key'}
            >
              {showKeys.gemini ? '👁️' : '👁️‍🗨️'}
            </button>
            <button
              onClick={() => handleSave('gemini')}
              disabled={!tempKeys.gemini}
              className="rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Get your free API key from{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        {/* OpenAI API Key */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="openai-key"
              className="text-sm font-medium text-gray-700"
            >
              OpenAI API Key
            </label>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Premium
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                id="openai-key"
                type={showKeys.openai ? 'text' : 'password'}
                value={tempKeys.openai}
                onChange={(e) =>
                  setTempKeys({ ...tempKeys, openai: e.target.value })
                }
                placeholder="Enter your OpenAI API key"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => toggleShowKey('openai')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              aria-label={showKeys.openai ? 'Hide key' : 'Show key'}
            >
              {showKeys.openai ? '👁️' : '👁️‍🗨️'}
            </button>
            <button
              onClick={() => handleSave('openai')}
              disabled={!tempKeys.openai}
              className="rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        {/* Claude API Key */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="claude-key"
              className="text-sm font-medium text-gray-700"
            >
              Claude API Key
            </label>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Premium
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                id="claude-key"
                type={showKeys.claude ? 'text' : 'password'}
                value={tempKeys.claude}
                onChange={(e) =>
                  setTempKeys({ ...tempKeys, claude: e.target.value })
                }
                placeholder="Enter your Claude API key"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => toggleShowKey('claude')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              aria-label={showKeys.claude ? 'Hide key' : 'Show key'}
            >
              {showKeys.claude ? '👁️' : '👁️‍🗨️'}
            </button>
            <button
              onClick={() => handleSave('claude')}
              disabled={!tempKeys.claude}
              className="rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Anthropic Console
            </a>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> API keys are stored locally in your browser and
          never sent to our servers. For production use, consider using a
          backend service to manage API keys securely.
        </p>
      </div>
    </section>
  );
}


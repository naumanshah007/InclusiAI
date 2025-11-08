'use client';

import { useState } from 'react';
import { useVisionHistory, type VisionScan } from '@/lib/store/vision-history';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

interface HistoryPanelProps {
  onSelectScan: (scan: VisionScan) => void;
}

export function HistoryPanel({ onSelectScan }: HistoryPanelProps) {
  const { scans, removeScan, toggleFavorite, clearHistory, getFavorites } = useVisionHistory();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedScans = filter === 'favorites' 
    ? getFavorites()
    : scans;

  const filteredScans = searchQuery
    ? displayedScans.filter(
        (scan) =>
          scan.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scan.scenario?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayedScans;

  const scenarioIcons: Record<string, string> = {
    medicine: '💊',
    sign: '🚏',
    menu: '📋',
    document: '📄',
    object: '🔍',
    color: '🎨',
    general: '👁️',
  };

  if (scans.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">📚</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">No History Yet</h3>
        <p className="text-gray-600">
          Your vision scans will appear here for quick access
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Scan History ({scans.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'favorites'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter === 'all' ? '⭐ Favorites' : '📚 All'}
          </button>
          <button
            onClick={clearHistory}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredScans.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {searchQuery ? 'No results found' : 'No scans in this category'}
          </div>
        ) : (
          filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={scan.image}
                    alt="Scan thumbnail"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">
                      {scan.scenario ? scenarioIcons[scan.scenario] : '👁️'}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      {scan.scenario
                        ? scan.scenario.charAt(0).toUpperCase() + scan.scenario.slice(1)
                        : 'General'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => toggleFavorite(scan.id)}
                      className={`ml-auto text-xl transition-transform hover:scale-110 ${
                        scan.isFavorite ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                      aria-label={scan.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {scan.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-gray-700">
                    {scan.result}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectScan(scan)}
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                    >
                      View
                    </button>
                    <TextToSpeech text={scan.result} />
                    <button
                      onClick={() => navigator.clipboard.writeText(scan.result)}
                      className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => removeScan(scan.id)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


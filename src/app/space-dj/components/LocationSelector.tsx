'use client';

import { useState } from 'react';
import { type TokyoLocation } from '../lib/tokyo-data';

interface LocationSelectorProps {
  locations: Record<string, TokyoLocation>;
  selectedLocations: Map<string, number>;
  onLocationSelect: (locationId: string, weight: number) => void;
  onLocationToggle: (locationId: string) => void;
}

export function LocationSelector({
  locations,
  selectedLocations,
  onLocationSelect,
  onLocationToggle,
}: LocationSelectorProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(
    new Set(Object.values(locations).map((loc) => loc.category))
  );

  const filteredLocations = Object.entries(locations).filter(([_, location]) => {
    if (filterCategory === 'all') return true;
    return location.category === filterCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      district: 'text-purple-400 bg-purple-500/20',
      station: 'text-blue-400 bg-blue-500/20',
      park: 'text-green-400 bg-green-500/20',
      entertainment: 'text-pink-400 bg-pink-500/20',
      temple: 'text-yellow-400 bg-yellow-500/20',
      commercial: 'text-orange-400 bg-orange-500/20',
    };
    return colors[category] || 'text-gray-400 bg-gray-500/20';
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-lg font-semibold text-purple-300">
          Select Locations
        </h2>
      </div>

      {/* Category Filter */}
      <div className="flex-shrink-0 mb-3">
        <select
          title="Category Filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800/70 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Count */}
      <div className="flex-shrink-0 mb-3 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {selectedLocations.size} location{selectedLocations.size !== 1 ? 's' : ''}{' '}
          selected
        </span>
        {selectedLocations.size > 0 && (
          <button
            onClick={() => {
              selectedLocations.forEach((_, id) => onLocationSelect(id, 0));
            }}
            className="text-red-400 hover:text-red-300 transition-colors text-xs"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Location List - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 min-h-0">
        {filteredLocations.map(([id, location]) => {
          const isSelected = selectedLocations.has(id);
          const weight = selectedLocations.get(id) || 1.0;

          return (
            <div
              key={id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <button
                    onClick={() => onLocationToggle(id)}
                    className="text-left w-full group"
                  >
                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'text-purple-300'
                          : 'text-gray-300 group-hover:text-purple-400'
                      }`}
                    >
                      {location.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getCategoryColor(
                        location.category
                      )}`}
                    >
                      {location.category}
                    </span>
                  </button>
                </div>

                {/* Toggle Checkbox */}
                <div className="ml-3">
                  <input
                    title="Toggle Location"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onLocationToggle(id)}
                    className="w-4 h-4 rounded border-purple-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Weight Slider */}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 w-14">
                      Weight:
                    </label>
                    <input
                      title="Weight Slider"
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={weight}
                      onChange={(e) =>
                        onLocationSelect(id, parseFloat(e.target.value))
                      }
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-xs text-purple-300 font-mono w-8">
                      {weight.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Prompts Preview */}
              {isSelected && (
                <div className="mt-2 text-xs text-gray-500">
                  <p className="line-clamp-2">{location.prompts[0]}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredLocations.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No locations found in this category
          </div>
        )}
      </div>
    </div>
  );
}

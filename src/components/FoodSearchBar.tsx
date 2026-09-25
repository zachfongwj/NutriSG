import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, Lightbulb } from 'lucide-react';

interface FoodSearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
  initialQuery?: string;
  activeConditionsCount?: number;
}

const QUICK_SUGGESTIONS = [
  { label: 'Low-GI Diabetic Lunch', query: 'Low GI hawker lunch with high fibre and lean protein' },
  { label: 'High Protein Post-Run', query: 'High protein meal for muscle recovery with moderate carbs' },
  { label: 'Fatty Liver & NAFLD Friendly', query: 'Mediterranean-style Asian meal low in saturated fat and refined sugars' },
  { label: 'Low-Sodium Fish Soup', query: 'Sliced fish soup with bittergourd and tofu, low sodium' },
  { label: 'Heart-Healthy Yong Tau Foo', query: 'Boiled yong tau foo with leafy greens and clear broth' },
  { label: 'Vegetarian High-Fibre', query: 'Plant-based vegetarian high fibre dish without peanuts' }
];

export const FoodSearchBar: React.FC<FoodSearchBarProps> = ({
  onSearch,
  isLoading = false,
  isDarkMode = true,
  initialQuery = '',
  activeConditionsCount = 0
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleQuickSelect = (q: string) => {
    setQuery(q);
    onSearch(q);
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-lg ${
      isDarkMode
        ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/40 text-slate-100'
        : 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800'
    }`}>
      {/* Title & Micro-badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Ask for Food or Meal Suggestions
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Type your craving, goal, or meal preference. NutriSG matches HPB Singapore &amp; USDA nutrition data.
            </p>
          </div>
        </div>

        {activeConditionsCount > 0 && (
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border self-start sm:self-auto ${
            isDarkMode
              ? 'bg-rose-950/50 border-rose-800 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            Grounded with {activeConditionsCount} health factor{activeConditionsCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2">
          <div className={`relative flex-1 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-slate-950/90 border-slate-700 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500'
              : 'bg-slate-50 border-slate-300 focus-within:border-rose-600 focus-within:ring-1 focus-within:ring-rose-600'
          }`}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. What can I eat for lunch that is high protein and suitable for fatty liver & diabetes?"
              className={`w-full pl-10 pr-9 py-3 text-xs sm:text-sm bg-transparent rounded-xl focus:outline-none ${
                isDarkMode 
                  ? 'text-white placeholder-slate-500' 
                  : 'text-slate-900 placeholder-slate-400'
              }`}
            />

            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition shrink-0 ${
              query.trim() && !isLoading
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-600/30'
                : isDarkMode
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center space-x-1.5">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                <span className="hidden sm:inline">Analyzing...</span>
              </span>
            ) : (
              <>
                <span>Suggest Meals</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Suggestion Prompts */}
      <div className="mt-3.5 pt-3 border-t border-dashed flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className={`text-[11px] font-semibold flex items-center space-x-1 mr-1 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Quick Ideas:</span>
        </span>

        {QUICK_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickSelect(item.query)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
              isDarkMode
                ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

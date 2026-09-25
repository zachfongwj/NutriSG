import React from 'react';
import { Sparkles, Utensils, AlertCircle } from 'lucide-react';
import { RecommendationResponse, OrchestrationTrace } from '../types';
import { MealCard } from './MealCard';
import { CalculationsSummary } from './CalculationsSummary';

interface RecommendationsViewProps {
  data: RecommendationResponse;
  trace?: OrchestrationTrace | null;
  onModifySearch: () => void;
  isDarkMode?: boolean;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  data,
  trace,
  onModifySearch,
  isDarkMode = true
}) => {
  const { recommendations, calculatedMetrics, disclaimer } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner with Action to Refine */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-r from-slate-900 to-indigo-950/60 border-indigo-900/40'
          : 'bg-gradient-to-r from-rose-50 via-white to-amber-50/70 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Personalised Singapore Meal Recommendations
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Found {recommendations.length} safety-validated options grounded in HPB references &amp; USDA MCP
            </p>
          </div>
        </div>

        <button
          onClick={onModifySearch}
          className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition self-start sm:self-auto border ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
          }`}
        >
          &larr; Adjust Profile &amp; Activity
        </button>
      </div>

      {/* Deterministic Calculations Summary */}
      {calculatedMetrics && <CalculationsSummary metrics={calculatedMetrics} isDarkMode={isDarkMode} />}

      {/* Recommendations Cards Grid */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recommendations.map((rec, index) => (
            <MealCard key={rec.id} recommendation={rec} rank={index + 1} isDarkMode={isDarkMode} />
          ))}
        </div>
      ) : (
        <div className={`border rounded-2xl p-8 text-center space-y-3 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}>
          <Utensils className={`w-8 h-8 mx-auto ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
          <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            No Suitable Meals Found
          </h3>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            The safety validation layer eliminated candidate foods due to conflicting hard constraints (allergies or severe dietary restrictions). Please consider relaxing some preferences.
          </p>
          <button
            onClick={onModifySearch}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
          >
            Adjust Criteria
          </button>
        </div>
      )}

      {/* Prominent Bottom Medical Disclaimer */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-2.5 transition-colors ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800/80 text-slate-400'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        <div>
          <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
            Professional Healthcare Notice: 
          </span>
          {disclaimer}
        </div>
      </div>
    </div>
  );
};

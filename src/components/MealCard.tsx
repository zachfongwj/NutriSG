import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  Award, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { MealRecommendation } from '../types';

interface MealCardProps {
  recommendation: MealRecommendation;
  rank: number;
  isDarkMode?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({ recommendation, rank, isDarkMode = true }) => {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);

  const {
    mealName,
    localName,
    description,
    suggestedPortion,
    totalNutrition,
    whyThisSuitsYou,
    healthConsiderationsNote,
    safetyValidationNotes,
    dataSource,
    matchType,
    confidence,
    sourceDetails,
    relevantEvidence
  } = recommendation;

  const isSGSource = dataSource === 'HPB Singapore Food Insights Database';
  const isUSDASource = dataSource === 'USDA FoodData Central';

  return (
    <div className={`border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-800 hover:border-slate-700 text-slate-200' 
        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
    }`}>
      <div>
        {/* Top Header & Ranking */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start space-x-3">
            <span className={`w-7 h-7 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              #{rank}
            </span>
            <div>
              <h3 className={`font-bold text-base tracking-tight flex items-center flex-wrap gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <span>{mealName}</span>
                {localName && (
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-md border ${
                    isDarkMode 
                      ? 'text-rose-300/90 bg-rose-950/40 border-rose-800/40' 
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    {localName}
                  </span>
                )}
              </h3>
              <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Portion */}
        <div className={`rounded-lg px-3 py-1.5 mb-4 text-xs flex items-center justify-between ${
          isDarkMode 
            ? 'bg-slate-800/50 text-slate-300' 
            : 'bg-slate-100 text-slate-700'
        }`}>
          <span className={isDarkMode ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>Suggested Serving:</span>
          <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{suggestedPortion}</span>
        </div>

        {/* Nutritional Macronutrient Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div className={`p-2 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/70 border-slate-750' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Calories</div>
            <div className="text-sm font-bold text-amber-500 dark:text-amber-400">{totalNutrition.calories}</div>
            <div className="text-[9px] text-slate-400">kcal</div>
          </div>
          <div className={`p-2 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/70 border-slate-750' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Protein</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalNutrition.proteinGrams}g</div>
            <div className="text-[9px] text-slate-400">macro</div>
          </div>
          <div className={`p-2 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/70 border-slate-750' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Carbs</div>
            <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{totalNutrition.carbohydrateGrams}g</div>
            <div className="text-[9px] text-slate-400">macro</div>
          </div>
          <div className={`p-2 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/70 border-slate-750' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Fat</div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{totalNutrition.fatGrams}g</div>
            <div className="text-[9px] text-slate-400">macro</div>
          </div>
        </div>

        {/* Key Micronutrients (Sodium, Fibre, Potassium) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-4">
          {totalNutrition.sodiumMg !== undefined && (
            <span className={`px-2 py-0.5 rounded-md border font-medium ${
              totalNutrition.sodiumMg <= 600
                ? isDarkMode ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : totalNutrition.sodiumMg <= 850
                ? isDarkMode ? 'bg-amber-950/40 text-amber-300 border-amber-800/50' : 'bg-amber-50 text-amber-800 border-amber-200'
                : isDarkMode ? 'bg-rose-950/40 text-rose-300 border-rose-800/50' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              Sodium: {totalNutrition.sodiumMg} mg
            </span>
          )}

          {totalNutrition.fibreGrams !== undefined && (
            <span className={`px-2 py-0.5 rounded-md border font-medium ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              Fibre: {totalNutrition.fibreGrams} g
            </span>
          )}

          {totalNutrition.potassiumMg !== undefined && (
            <span className={`px-2 py-0.5 rounded-md border font-medium ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              Potassium: {totalNutrition.potassiumMg} mg
            </span>
          )}
        </div>

        {/* Why this may suit you */}
        <div className={`mb-3.5 rounded-xl p-3 border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-800 text-slate-300' 
            : 'bg-indigo-50/60 border-indigo-100 text-slate-700'
        }`}>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-1 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>Why This May Suit You</span>
          </div>
          <p className="text-xs leading-relaxed">
            {whyThisSuitsYou}
          </p>
        </div>

        {/* Health considerations (if applicable) */}
        {healthConsiderationsNote && (
          <div className={`mb-3.5 rounded-xl p-3 border ${
            isDarkMode 
              ? 'bg-amber-950/20 border-amber-800/30 text-amber-200/90' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-300 mb-1 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Health Considerations</span>
            </div>
            <p className="text-xs leading-relaxed">
              {healthConsiderationsNote}
            </p>
          </div>
        )}

        {/* Safety Validation Notes Drawer */}
        {safetyValidationNotes.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setSafetyOpen(!safetyOpen)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety &amp; Constraint Validation ({safetyValidationNotes.length})</span>
              {safetyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {safetyOpen && (
              <ul className={`mt-1.5 p-2.5 rounded-lg border space-y-1 text-[11px] ${
                isDarkMode 
                  ? 'bg-slate-950/60 border-slate-800 text-emerald-300/90' 
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
              }`}>
                {safetyValidationNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer: Provenance & Scientific Evidence */}
      <div className={`pt-3 border-t text-xs ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {/* Provenance Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className={isDarkMode ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'}>Source:</span>
            <span className={`px-2 py-0.5 rounded font-semibold ${
              isSGSource
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                : isUSDASource
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
            }`}>
              {dataSource}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
              matchType === 'exact'
                ? isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : matchType === 'component-estimate'
                ? isDarkMode ? 'bg-amber-950/60 text-amber-400 border-amber-800/40' : 'bg-amber-50 text-amber-700 border-amber-200'
                : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {matchType} match ({confidence} conf)
            </span>
          </div>
        </div>

        {/* Evidence Link / Accordion */}
        {relevantEvidence && relevantEvidence.articles.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setEvidenceOpen(!evidenceOpen)}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scientific Evidence: {relevantEvidence.topic}</span>
              {evidenceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {evidenceOpen && (
              <div className={`mt-2 p-3 rounded-xl border space-y-2.5 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {relevantEvidence.articles.map((art) => (
                  <div key={art.pmid} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        PubMed PMID: {art.pmid}
                      </span>
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-slate-500 hover:text-cyan-500 flex items-center space-x-1 underline"
                      >
                        <span>View on NCBI</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{art.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {art.journal} &bull; {art.publicationDate}
                    </div>
                    {art.keyFinding && (
                      <p className={`text-[11px] italic p-2 rounded border ${
                        isDarkMode ? 'text-slate-300 bg-slate-900 border-slate-800' : 'text-slate-700 bg-white border-slate-200'
                      }`}>
                        &ldquo;{art.keyFinding}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

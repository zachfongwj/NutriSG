import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface DisclaimerBannerProps {
  isDarkMode?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ isDarkMode = true }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b text-xs py-2 px-4 transition-colors ${
      isDarkMode 
        ? 'bg-amber-950/40 border-amber-800/40 text-amber-200/90' 
        : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <div className="flex items-center space-x-2">
          <ShieldAlert className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <span className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-900'}`}>
            Decision-Support &amp; Wellness Notice:
          </span>
          <span className={`hidden md:inline ${isDarkMode ? 'text-amber-200/80' : 'text-amber-800'}`}>
            This tool does not diagnose conditions, prescribe medical treatment, or replace certified doctors or dietitians.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`font-medium underline flex items-center space-x-1 ml-6 sm:ml-0 transition-colors ${
            isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <span>{expanded ? 'Less info' : 'Important clinical disclaimer'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className={`max-w-7xl mx-auto mt-2 pt-2 border-t leading-relaxed text-xs ${
          isDarkMode ? 'border-amber-800/30 text-amber-200/80' : 'border-amber-200 text-amber-800'
        }`}>
          <p>
            NutriSG is designed solely for personalized nutritional decision support. Calorie, macronutrient, and micronutrient values are retrieved from verified Health Promotion Board (HPB) references and USDA FoodData Central MCP endpoints. Biomedical literature citations from NCBI PubMed are provided for informational context only and do not constitute prescriptive clinical guidelines. Individuals with chronic renal, metabolic, cardiovascular, or allergic conditions must review dietary changes with their physician or registered dietitian before implementation.
          </p>
        </div>
      )}
    </div>
  );
};

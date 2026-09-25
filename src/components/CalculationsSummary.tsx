import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Flame, Activity, PieChart, Info } from 'lucide-react';
import { CalculatedEnergyMetrics } from '../types';

interface CalculationsSummaryProps {
  metrics: CalculatedEnergyMetrics;
  isDarkMode?: boolean;
}

export const CalculationsSummary: React.FC<CalculationsSummaryProps> = ({ metrics, isDarkMode = true }) => {
  const [showAssumptions, setShowAssumptions] = useState(false);

  return (
    <div className={`border rounded-xl p-4 shadow-sm mb-6 transition-colors ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-200' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Deterministic Nutritional Calculations
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Validated physiological formulas (No LLM invention)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center space-x-1 font-medium"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showAssumptions ? 'Hide Assumptions' : 'View Formulas & Assumptions'}</span>
          {showAssumptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Grid of Key Calculations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-center sm:text-left">
        <div className={`p-2.5 rounded-lg border transition-colors ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-center sm:justify-start space-x-1.5 text-xs mb-1 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Basal Rate (BMR)</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {metrics.bmrKcal} <span className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>kcal/d</span>
          </div>
          <div className={`text-[10px] truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} title={metrics.bmrFormula}>
            {metrics.bmrFormula}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border transition-colors ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-center sm:justify-start space-x-1.5 text-xs mb-1 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Activity Energy</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            +{metrics.activityEnergyKcal} <span className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>kcal</span>
          </div>
          <div className={`text-[10px] truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} title={metrics.activityFormula}>
            {metrics.activityFormula}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border transition-colors ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-center sm:justify-start space-x-1.5 text-xs mb-1 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Total Daily (TEE)</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {metrics.teeKcal} <span className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>kcal/d</span>
          </div>
          <div className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            BMR × 1.35 + Exercise
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border transition-colors ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-center sm:justify-start space-x-1.5 text-xs mb-1 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <PieChart className="w-3.5 h-3.5 text-cyan-500" />
            <span>Target Meal Budget</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
            ~{metrics.mealTargetKcal} <span className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>kcal</span>
          </div>
          <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            P: {metrics.macronutrientTargets.proteinGramsMin}-{metrics.macronutrientTargets.proteinGramsMax}g &bull; C: {metrics.macronutrientTargets.carbsGramsMin}-{metrics.macronutrientTargets.carbsGramsMax}g &bull; F: {metrics.macronutrientTargets.fatGramsMin}-{metrics.macronutrientTargets.fatGramsMax}g
          </div>
        </div>
      </div>

      {showAssumptions && (
        <div className={`mt-3 pt-3 border-t text-xs space-y-1 p-3 rounded-lg ${
          isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-600 bg-slate-50'
        }`}>
          <div className={`font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
            Calculation Provenance &amp; Assumptions:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {metrics.assumptions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

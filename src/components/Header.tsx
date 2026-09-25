import React from 'react';
import { Terminal, Sun, Moon, Sparkles } from 'lucide-react';
import { SystemStatusData } from '../types';

interface HeaderProps {
  statusData?: SystemStatusData | null;
  onOpenDevPanel: () => void;
  devPanelOpen: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  statusData,
  onOpenDevPanel,
  devPanelOpen,
  isDarkMode,
  onToggleTheme
}) => {
  const connectedCount = (statusData?.mcpServers || []).filter(s => s.status === 'connected').length;

  return (
    <header className={`border-b sticky top-0 z-30 shadow-md transition-colors ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <span className="font-bold text-white text-lg tracking-tight">SG</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`font-extrabold text-lg tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                NutriSG
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                Singapore HPB &bull; MCP
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Health &amp; Wellness Meal Decision Support
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active MCPs status pill */}
          <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs ${
            isDarkMode 
              ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">
              {connectedCount} MCPs Active
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">SG FoodID Ready</span>
          </div>

          {/* Day / Night Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-slate-300">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline text-slate-700">Night</span>
              </>
            )}
          </button>

          {/* Dev / Trace panel toggle button */}
          <button
            onClick={onOpenDevPanel}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              devPanelOpen
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden sm:inline">MCP Dev Panel</span>
            <span className="sm:hidden">Dev</span>
          </button>
        </div>
      </div>
    </header>
  );
};

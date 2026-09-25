import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { FoodSearchBar } from './components/FoodSearchBar';
import { UserProfileForm } from './components/UserProfileForm';
import { RecommendationsView } from './components/RecommendationsView';
import { McpDevPanel } from './components/McpDevPanel';
import { 
  UserProfile, 
  RecommendationResponse, 
  OrchestrationTrace, 
  SystemStatusData 
} from './types';
import { fetchSystemStatus, requestRecommendations } from './services/api';
import { AlertCircle, HeartHandshake, Cpu, Search, Sparkles } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  age: 45,
  sex: 'male',
  heightCm: 172,
  weightKg: 70,
  healthConditions: ['hypertension'],
  customHealthConditions: [],
  queryText: '',
  allergies: [],
  foodIntolerances: [],
  dietaryRestrictions: ['low_sodium'],
  dietaryPreferences: ['chinese', 'singaporean_local'],
  dislikedFoods: [],
  goal: 'blood_pressure_management',
  mealType: 'lunch',
  activityMode: 'manual',
  manualActivity: {
    activity: 'Running',
    startTime: '18:30',
    durationMinutes: 60,
    intensity: 'moderate'
  },
  garminConnected: false
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [recommendationResult, setRecommendationResult] = useState<{
    response: RecommendationResponse;
    trace: OrchestrationTrace;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [statusData, setStatusData] = useState<SystemStatusData | null>(null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);

  // Day / Night Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutrisg-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    } catch {
      return true;
    }
  });

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nutrisg-theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Synchronize <html> root class for tailwind dark mode if needed
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load MCP system status on launch
  const loadStatus = async () => {
    try {
      const data = await fetchSystemStatus();
      setStatusData(data);
    } catch (err: unknown) {
      console.warn('Initial MCP status fetch warning:', err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSuggestMeals = async (submittedProfile: UserProfile) => {
    setProfile(submittedProfile);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestRecommendations(submittedProfile);
      setRecommendationResult(result);
      // Refresh MCP status reports after runs
      loadStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle direct queries from the Food & Meal Suggestions Bar
  const handleSearchBarQuery = (query: string) => {
    let updatedMealType = profile.mealType;
    const qLower = query.toLowerCase();
    if (qLower.includes('breakfast')) updatedMealType = 'breakfast';
    else if (qLower.includes('lunch')) updatedMealType = 'lunch';
    else if (qLower.includes('dinner')) updatedMealType = 'dinner';
    else if (qLower.includes('snack')) updatedMealType = 'snack';

    const updatedProfile: UserProfile = {
      ...profile,
      mealType: updatedMealType,
      queryText: query
    };

    handleSuggestMeals(updatedProfile);
  };

  const totalHealthFactors = (profile.healthConditions?.length || 0) + (profile.customHealthConditions?.length || 0);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-rose-500 selection:text-white ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header with Day/Night Toggle & MCP Controls */}
      <Header
        statusData={statusData}
        onOpenDevPanel={() => setDevPanelOpen(true)}
        devPanelOpen={devPanelOpen}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Medical & Decision-Support Notice Banner */}
      <DisclaimerBanner isDarkMode={isDarkMode} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {errorMessage && (
          <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-xl flex items-start space-x-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-300">Orchestration Error</div>
              <p className="mt-0.5 text-red-300/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Dedicated Bar for Food and Meal Suggestions */}
        <FoodSearchBar
          onSearch={handleSearchBarQuery}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          initialQuery={profile.queryText || ''}
          activeConditionsCount={totalHealthFactors}
        />

        {recommendationResult ? (
          <div className="space-y-6">
            <RecommendationsView
              data={recommendationResult.response}
              trace={recommendationResult.trace}
              onModifySearch={() => setRecommendationResult(null)}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero / Context Introduction */}
            <div className={`border rounded-2xl p-6 transition-colors shadow-sm ${
              isDarkMode
                ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800'
                : 'bg-gradient-to-r from-rose-50/70 via-white to-amber-50/70 border-slate-200 text-slate-800'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-rose-500 font-semibold text-xs tracking-wider uppercase mb-1">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Evidence-Based &bull; Singapore HPB &bull; MCP Connected</span>
                  </div>
                  <h2 className={`text-xl md:text-2xl font-black tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Smart Singapore Meal Planning Engine
                  </h2>
                  <p className={`text-xs md:text-sm mt-1 max-w-2xl leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Personalized nutritional decision support respecting cardiometabolic conditions (diabetes, prediabetes, fatty liver, insulin resistance), food allergies, and physical activities.
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto">
                  <div className={`px-3 py-2 rounded-xl border text-right transition-colors ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Singapore Food Source</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">HPB SG FoodID Ref</div>
                  </div>
                  <div className={`px-3 py-2 rounded-xl border text-right transition-colors ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Evidence Protocol</div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">PubMed MCP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Input Form */}
            <UserProfileForm
              initialProfile={profile}
              onSubmit={handleSuggestMeals}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-xs transition-colors ${
        isDarkMode 
          ? 'border-slate-900 bg-slate-950/90 text-slate-500' 
          : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              NutriSG Health &amp; Wellness Advisor
            </span> &bull; Built with Model Context Protocol (MCP) &bull; Day/Night Active
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDevPanelOpen(true)}
              className="hover:text-indigo-500 flex items-center space-x-1 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Inspect MCP Tools</span>
            </button>
            <span>&bull;</span>
            <span>HPB SG FoodID Reference Dataset</span>
          </div>
        </div>
      </footer>

      {/* Slide-over / Modal MCP Dev Panel */}
      <McpDevPanel
        isOpen={devPanelOpen}
        onClose={() => setDevPanelOpen(false)}
        statusData={statusData}
        onRefreshStatus={loadStatus}
        lastTrace={recommendationResult?.trace}
      />
    </div>
  );
}

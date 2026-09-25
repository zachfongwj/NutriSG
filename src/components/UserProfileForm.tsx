import React, { useState } from 'react';
import { 
  Heart, 
  AlertTriangle, 
  Utensils, 
  Target, 
  Activity, 
  Clock, 
  Sparkles, 
  Check, 
  Watch, 
  User, 
  Flame,
  HelpCircle
} from 'lucide-react';
import { 
  UserProfile, 
  HealthCondition, 
  FoodAllergy, 
  DietaryRestriction, 
  DietaryPreference, 
  WellnessGoal, 
  MealType 
} from '../types';

interface UserProfileFormProps {
  initialProfile: UserProfile;
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
  isDarkMode?: boolean;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialProfile,
  onSubmit,
  isLoading,
  isDarkMode = true
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [dislikedInput, setDislikedInput] = useState('');
  const [customHealthInput, setCustomHealthInput] = useState('');

  // Keep internal profile synced when initialProfile changes (e.g. from search bar query)
  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Toggle helpers
  const toggleCondition = (cond: HealthCondition) => {
    setProfile(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(cond)
        ? prev.healthConditions.filter(c => c !== cond)
        : [...prev.healthConditions, cond]
    }));
  };

  const addCustomHealthCondition = () => {
    const val = customHealthInput.trim();
    if (!val) return;
    const current = profile.customHealthConditions || [];
    if (!current.includes(val)) {
      setProfile(prev => ({
        ...prev,
        customHealthConditions: [...(prev.customHealthConditions || []), val]
      }));
    }
    setCustomHealthInput('');
  };

  const removeCustomHealthCondition = (item: string) => {
    setProfile(prev => ({
      ...prev,
      customHealthConditions: (prev.customHealthConditions || []).filter(c => c !== item)
    }));
  };

  const toggleAllergy = (allergy: FoodAllergy) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const toggleRestriction = (res: DietaryRestriction) => {
    setProfile(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(res)
        ? prev.dietaryRestrictions.filter(r => r !== res)
        : [...prev.dietaryRestrictions, res]
    }));
  };

  const togglePreference = (pref: DietaryPreference) => {
    setProfile(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter(p => p !== pref)
        : [...prev.dietaryPreferences, pref]
    }));
  };

  const addDislikedFood = () => {
    if (!dislikedInput.trim()) return;
    if (!profile.dislikedFoods.includes(dislikedInput.trim())) {
      setProfile(prev => ({
        ...prev,
        dislikedFoods: [...prev.dislikedFoods, dislikedInput.trim()]
      }));
    }
    setDislikedInput('');
  };

  const removeDislikedFood = (food: string) => {
    setProfile(prev => ({
      ...prev,
      dislikedFoods: prev.dislikedFoods.filter(f => f !== food)
    }));
  };

  // Presets matching the prompt's examples
  const loadScenario1 = () => {
    // Section 21 Example: "I have hypertension. I'm going for a 60-minute run at 6:30 PM and prefer Asian food. What could I eat for lunch?"
    setProfile({
      age: 45,
      sex: 'male',
      heightCm: 172,
      weightKg: 70,
      healthConditions: ['hypertension'],
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
    });
  };

  const loadScenario2 = () => {
    // Diabetic Vegetarian Hawker Lunch
    setProfile({
      age: 52,
      sex: 'female',
      heightCm: 160,
      weightKg: 62,
      healthConditions: ['type_2_diabetes', 'high_cholesterol'],
      allergies: [],
      foodIntolerances: [],
      dietaryRestrictions: ['vegetarian', 'low_gi'],
      dietaryPreferences: ['singaporean_local', 'chinese'],
      dislikedFoods: [],
      goal: 'glycemic_control',
      mealType: 'lunch',
      activityMode: 'manual',
      manualActivity: {
        activity: 'Brisk Walking',
        startTime: '17:00',
        durationMinutes: 35,
        intensity: 'low'
      }
    });
  };

  const loadScenario3 = () => {
    // Peanut Allergy + Halal High Protein Dinner after Gym
    setProfile({
      age: 28,
      sex: 'male',
      heightCm: 178,
      weightKg: 75,
      healthConditions: [],
      allergies: ['peanuts', 'shellfish'],
      foodIntolerances: [],
      dietaryRestrictions: ['halal'],
      dietaryPreferences: ['malay', 'high_protein'],
      dislikedFoods: ['bittergourd'],
      goal: 'post_exercise_recovery',
      mealType: 'dinner',
      activityMode: 'garmin',
      garminConnected: true
    });
  };

  const loadScenario4 = () => {
    // Metabolic Syndrome & Fatty Liver (NAFLD) with Open Entry health status
    setProfile({
      age: 48,
      sex: 'male',
      heightCm: 170,
      weightKg: 82,
      healthConditions: ['fatty_liver', 'metabolic_syndrome', 'hypertriglyceridemia', 'insulin_resistance'],
      customHealthConditions: ['Elevated ALT enzymes', 'Mild hyperuricemia'],
      allergies: [],
      foodIntolerances: [],
      dietaryRestrictions: ['low_gi'],
      dietaryPreferences: ['singaporean_local', 'chinese'],
      dislikedFoods: ['fried chicken'],
      goal: 'weight_maintenance',
      mealType: 'lunch',
      activityMode: 'manual',
      manualActivity: {
        activity: 'Cycling',
        startTime: '19:00',
        durationMinutes: 45,
        intensity: 'moderate'
      },
      garminConnected: false
    });
  };

  return (
    <div className={`border rounded-2xl p-6 shadow-xl transition-colors ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-200' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Scenario Presets Quick Bar */}
      <div className={`mb-6 p-3.5 rounded-xl border transition-colors ${
        isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold flex items-center space-x-1.5 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Quick Demo Scenarios:</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadScenario1}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            🏃‍♂️ 1: Hypertension Runner
          </button>
          <button
            type="button"
            onClick={loadScenario2}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            🥗 2: Diabetic Vegetarian (Low GI)
          </button>
          <button
            type="button"
            onClick={loadScenario3}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            🛡️ 3: Peanut Allergy + Halal Garmin
          </button>
          <button
            type="button"
            onClick={loadScenario4}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-800/60' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
            }`}
          >
            🩺 4: Fatty Liver + Metabolic Syndrome
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(profile);
        }}
        className="space-y-6"
      >
        {/* SECTION 1: Health Considerations & Hard Constraints */}
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm mb-3">
            <Heart className="w-4 h-4" />
            <span>1. Health Considerations &amp; Hard Constraints</span>
          </div>

          <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            {/* Health Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Cardiometabolic &amp; Chronic Health Status:
                </label>
                <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Triggers selective PubMed MCP literature synthesis
                </span>
              </div>

              {/* Metabolic & Cardiovascular Health Conditions */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: 'hypertension', label: 'Hypertension (High BP)' },
                  { id: 'type_2_diabetes', label: 'Type 2 Diabetes' },
                  { id: 'prediabetes', label: 'Prediabetes (Impaired Glucose)' },
                  { id: 'metabolic_syndrome', label: 'Metabolic Syndrome' },
                  { id: 'insulin_resistance', label: 'Insulin Resistance' },
                  { id: 'fatty_liver', label: 'Fatty Liver (NAFLD/MASLD)' },
                  { id: 'high_cholesterol', label: 'High Cholesterol (Dyslipidemia)' },
                  { id: 'hypertriglyceridemia', label: 'High Triglycerides' },
                  { id: 'obesity_weight_management', label: 'Weight Management / Adiposity' },
                  { id: 'chronic_kidney_disease', label: 'Chronic Kidney Disease' },
                  { id: 'gout', label: 'Gout / Hyperuricemia' },
                  { id: 'gerd', label: 'Acid Reflux / GERD' }
                ].map((item) => {
                  const active = profile.healthConditions.includes(item.id as HealthCondition);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCondition(item.id as HealthCondition)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        active
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                          : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 inline mr-1" />}
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Open Entry Option for Health Status */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                <label className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Open Entry Health Status / Other Medical Conditions:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customHealthInput}
                    onChange={(e) => setCustomHealthInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomHealthCondition();
                      }
                    }}
                    placeholder="Enter any other health condition (e.g. PCOS, thyroid, post-bariatric, anemia, IBD)..."
                    className={`text-xs px-3 py-2 rounded-lg border flex-1 focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-rose-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addCustomHealthCondition}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
                      isDarkMode
                        ? 'bg-rose-600/80 hover:bg-rose-600 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    }`}
                  >
                    + Add Condition
                  </button>
                </div>

                {/* Quick Add Suggestions for Open Entry */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Quick Add:
                  </span>
                  {[
                    'PCOS (Polycystic Ovary)',
                    'Hypothyroidism',
                    'Elevated ALT Liver Enzymes',
                    'Hyperuricemia / High Uric Acid',
                    'Elevated Fasting Glucose',
                    'Gestational Glycemic Care',
                    'IBS / Sensitive Digestion'
                  ].map((preset) => {
                    const exists = (profile.customHealthConditions || []).includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (exists) {
                            removeCustomHealthCondition(preset);
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              customHealthConditions: [...(prev.customHealthConditions || []), preset]
                            }));
                          }
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                          exists
                            ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                            : isDarkMode
                            ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                            : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300 shadow-2xs'
                        }`}
                      >
                        {exists ? '✓ ' : '+ '}{preset}
                      </button>
                    );
                  })}
                </div>

                {/* Display active custom health conditions */}
                {(profile.customHealthConditions && profile.customHealthConditions.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {profile.customHealthConditions.map((cond) => (
                      <span
                        key={cond}
                        className={`text-xs px-2.5 py-1 rounded-md border flex items-center space-x-1.5 font-medium ${
                          isDarkMode
                            ? 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <span>{cond}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomHealthCondition(cond)}
                          className="hover:text-rose-500 font-bold ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Food Allergies (Strict Hard Constraints) */}
            <div>
              <label className={`block text-xs font-medium mb-2 flex items-center space-x-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  Strict Allergies (Non-negotiable hard elimination):
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'peanuts', label: 'Peanuts' },
                  { id: 'tree_nuts', label: 'Tree Nuts' },
                  { id: 'shellfish', label: 'Shellfish / Crustaceans' },
                  { id: 'dairy', label: 'Dairy / Cow Milk' },
                  { id: 'soy', label: 'Soy' },
                  { id: 'gluten', label: 'Gluten / Wheat' },
                  { id: 'eggs', label: 'Eggs' },
                  { id: 'fish', label: 'Fish' }
                ].map((item) => {
                  const active = profile.allergies.includes(item.id as FoodAllergy);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAllergy(item.id as FoodAllergy)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        active
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400'
                          : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 inline mr-1" />}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Dietary Preferences & Restrictions */}
        <div>
          <div className="flex items-center space-x-2 text-cyan-500 font-bold text-sm mb-3">
            <Utensils className="w-4 h-4" />
            <span>2. Dietary Restrictions &amp; Cuisines</span>
          </div>

          <div className={`space-y-4 p-4 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            {/* Dietary Restrictions */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Dietary Restrictions:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'halal', label: 'Halal Only' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'low_sodium', label: 'Low Sodium (<600mg)' },
                  { id: 'low_gi', label: 'Low Glycemic Index (GI)' }
                ].map((item) => {
                  const active = profile.dietaryRestrictions.includes(item.id as DietaryRestriction);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleRestriction(item.id as DietaryRestriction)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        active
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400'
                          : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 inline mr-1" />}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Food Preferences */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Cuisine / Food Preferences:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'singaporean_local', label: 'Singapore Hawker / Local' },
                  { id: 'chinese', label: 'Chinese' },
                  { id: 'malay', label: 'Malay' },
                  { id: 'indian', label: 'Indian' },
                  { id: 'western', label: 'Western' },
                  { id: 'high_protein', label: 'High Protein' },
                  { id: 'light_meal', label: 'Light / Clear Broth' }
                ].map((item) => {
                  const active = profile.dietaryPreferences.includes(item.id as DietaryPreference);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePreference(item.id as DietaryPreference)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        active
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                          : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 inline mr-1" />}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disliked Foods */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Disliked / Excluded Foods (Optional):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={dislikedInput}
                  onChange={(e) => setDislikedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDislikedFood();
                    }
                  }}
                  placeholder="e.g. mushrooms, bittergourd, coriander"
                  className={`rounded-lg px-3 py-1.5 text-xs border focus:outline-none w-full sm:w-72 transition ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={addDislikedFood}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-2xs'
                  }`}
                >
                  Add
                </button>
              </div>

              {profile.dislikedFoods.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.dislikedFoods.map((f) => (
                    <span
                      key={f}
                      className={`text-xs px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                        isDarkMode
                          ? 'bg-slate-800 text-rose-300 border-slate-700'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => removeDislikedFood(f)}
                        className="hover:text-rose-500 font-bold ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Meal Type & Wellness Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center space-x-2 text-indigo-500 font-bold text-sm mb-3">
              <Clock className="w-4 h-4" />
              <span>Target Meal</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, mealType: meal }))}
                  className={`text-xs py-2 rounded-lg font-semibold capitalize transition ${
                    profile.mealType === meal
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                      : isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center space-x-2 text-emerald-500 font-bold text-sm mb-3">
              <Target className="w-4 h-4" />
              <span>Wellness Goal</span>
            </div>
            <select
              value={profile.goal}
              onChange={(e) => setProfile(prev => ({ ...prev, goal: e.target.value as WellnessGoal }))}
              className={`rounded-lg px-3 py-2 text-xs border focus:outline-none w-full transition ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
              }`}
            >
              <option value="general_healthy_eating">General Healthy Eating</option>
              <option value="pre_exercise_fuel">Meal Before Exercise (Pre-Workout Fuel)</option>
              <option value="post_exercise_recovery">Meal After Exercise (Post-Workout Recovery)</option>
              <option value="blood_pressure_management">Blood Pressure Management (DASH)</option>
              <option value="glycemic_control">Glycemic Control &amp; Satiety</option>
              <option value="weight_maintenance">Weight Maintenance</option>
            </select>
          </div>
        </div>

        {/* SECTION 4: Physical Activity (Garmin Connect MCP or Manual Fallback) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-emerald-500 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>4. Physical Activity &amp; Exercise Context</span>
            </div>

            {/* Toggle Mode */}
            <div className={`flex items-center space-x-1 p-1 rounded-lg border text-xs ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, activityMode: 'manual' }))}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  profile.activityMode === 'manual'
                    ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-2xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, activityMode: 'garmin', garminConnected: true }))}
                className={`px-3 py-1 rounded-md font-medium flex items-center space-x-1.5 transition ${
                  profile.activityMode === 'garmin'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Watch className="w-3.5 h-3.5" />
                <span>Garmin MCP</span>
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            {profile.activityMode === 'garmin' ? (
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border text-xs ${
                isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                    <Watch className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>Garmin Connect MCP Active</div>
                    <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Latest synced activity: Running at 18:30 (60 min, moderate, ~580 kcal)</div>
                  </div>
                </div>
                <span className={`text-[11px] font-mono px-2 py-1 rounded border shrink-0 ${
                  isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-800/60' : 'text-emerald-800 bg-emerald-100 border-emerald-300'
                }`}>
                  Firstbeat Active Sync
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Planned Activity</label>
                  <input
                    type="text"
                    value={profile.manualActivity?.activity || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      manualActivity: {
                        ...(prev.manualActivity || { startTime: '18:30', durationMinutes: 60, intensity: 'moderate' }),
                        activity: e.target.value
                      }
                    }))}
                    placeholder="e.g. Running, Cycling"
                    className={`rounded-lg px-3 py-1.5 w-full border focus:outline-none transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Start Time</label>
                  <input
                    type="time"
                    value={profile.manualActivity?.startTime || '18:30'}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      manualActivity: {
                        ...(prev.manualActivity || { activity: 'Running', durationMinutes: 60, intensity: 'moderate' }),
                        startTime: e.target.value
                      }
                    }))}
                    className={`rounded-lg px-3 py-1.5 w-full border focus:outline-none transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={profile.manualActivity?.durationMinutes || 60}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      manualActivity: {
                        ...(prev.manualActivity || { activity: 'Running', startTime: '18:30', intensity: 'moderate' }),
                        durationMinutes: Number(e.target.value)
                      }
                    }))}
                    className={`rounded-lg px-3 py-1.5 w-full border focus:outline-none transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Intensity</label>
                  <select
                    value={profile.manualActivity?.intensity || 'moderate'}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      manualActivity: {
                        ...(prev.manualActivity || { activity: 'Running', startTime: '18:30', durationMinutes: 60 }),
                        intensity: e.target.value as any
                      }
                    }))}
                    className={`rounded-lg px-3 py-1.5 w-full border focus:outline-none transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                  >
                    <option value="low">Low (Light recovery)</option>
                    <option value="moderate">Moderate (Standard training)</option>
                    <option value="high">High (Race / Vigorous)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Optional Physiological Details for Deterministic Energy Calculations */}
        <div className={`p-3 rounded-xl border text-xs transition-colors ${
          isDarkMode ? 'bg-slate-950/30 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className={`font-semibold mb-2 flex items-center space-x-1.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <User className="w-3.5 h-3.5" />
            <span>Optional Physiological Baseline (for Mifflin-St Jeor Energy Calculation):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={`block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Age</label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="35"
                className={`rounded-lg px-3 py-1 w-full border focus:outline-none transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Sex</label>
              <select
                value={profile.sex || 'unspecified'}
                onChange={(e) => setProfile(prev => ({ ...prev, sex: e.target.value as any }))}
                className={`rounded-lg px-3 py-1 w-full border focus:outline-none transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="unspecified">Unspecified (Median)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className={`block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Height (cm)</label>
              <input
                type="number"
                value={profile.heightCm || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, heightCm: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="168"
                className={`rounded-lg px-3 py-1 w-full border focus:outline-none transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Weight (kg)</label>
              <input
                type="number"
                value={profile.weightKg || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, weightKg: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="68"
                className={`rounded-lg px-3 py-1 w-full border focus:outline-none transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600 hover:from-rose-500 hover:via-amber-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Orchestrating Agents &amp; Querying MCPs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Suggest Meals (Run MCP Orchestrator)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

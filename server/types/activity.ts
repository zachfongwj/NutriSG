export interface ActivityContext {
  activity: string;
  durationMinutes: number;
  startTime: string; // e.g., "18:30"
  intensity: 'low' | 'moderate' | 'high';
  estimatedCaloriesBurned?: number;
  source: 'Garmin' | 'Manual';
  mealTimingContext: 'pre-exercise' | 'post-exercise' | 'general' | 'rest-day';
  hoursUntilOrSinceActivity?: number;
  confidence: 'estimated' | 'measured';
}

export interface GarminActivityRaw {
  activityId?: string;
  activityType: string;
  startTime: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  estimatedCaloriesBurned: number;
  averageHeartRate?: number;
  source: 'Garmin';
}

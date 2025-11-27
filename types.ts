export enum Gender {
  Male = '男',
  Female = '女',
  Other = '其他'
}

export enum ActivityLevel {
  Sedentary = '久坐 (极少运动)',
  LightlyActive = '轻度活动 (每周1-3次轻微运动)',
  ModeratelyActive = '中度活动 (每周3-5次中等强度运动)',
  VeryActive = '高度活动 (每周6-7次高强度运动)',
  ExtraActive = '极度活动 (每日高强度体力工作/训练)'
}

export interface UserProfile {
  // Anthropometrics
  height: number; // cm
  weight: number; // kg
  waistCircumference?: number; // cm
  hipCircumference?: number; // cm
  weightChange1Month?: number; // kg change
  weightChange3Month?: number; // kg change
  weightChange6Month?: number; // kg change
  bodyFatPercentage?: number;
  basalMetabolicRate?: number;

  // Demographics
  age: number;
  gender: Gender;
  occupation?: string;
  location?: string;
  budget?: string; // e.g., Low, Medium, High

  // Female Specific
  isFemale?: boolean;
  menstrualCycle?: string; // Regular, Irregular, Menopause, Pregnant, Breastfeeding
  
  // Dietary Habits
  mealsPerDay: number;
  diningStyle: string; // New: e.g., Cooking, Delivery, Cafeteria
  snackFrequency: string;
  alcoholFrequency: string;
  cookingPreferences: string[]; // e.g., Steaming, Frying
  tastePreferences: string[]; // e.g., Spicy, Salty, Sweet
  foodAllergies: string[];
  dislikedFoods: string[];
  likedFoods: string[];
  dietaryRestrictions: string; // e.g., Vegan, Vegetarian, Halal

  // Lifestyle
  sleepHours: number;
  sleepQuality: string;
  stressLevel: string; // 1-10
  exerciseHabits: string;
  
  // Goal
  dietaryGoal: string; // The text input from user
}

export interface MealItem {
  name: string;
  portion: string;
  calories?: number;
  macros?: string; // Brief description like "20g P / 10g F"
}

export interface DailyPlan {
  day: string; // Monday, Tuesday...
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
  nutritionalSummary: string;
  tips: string;
}

export interface WeeklyMealPlan {
  weekPlan: DailyPlan[];
  generalAdvice: string;
}

export interface LoggedMealItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface DailyLog {
  dayIndex: number; // 0-6
  
  // Meals (Detailed)
  actualBreakfast: LoggedMealItem[];
  actualLunch: LoggedMealItem[];
  actualDinner: LoggedMealItem[];
  actualSnacks: LoggedMealItem[];
  
  // Hydration
  waterIntake: number; // mL
  
  // Exercise
  exerciseActivity?: string;
  exerciseDuration?: number; // minutes
  exerciseIntensity?: string; // Low, Moderate, High

  // Sleep (New)
  sleepHours?: number;
  sleepQuality?: string; // Poor, Average, Good, Excellent

  notes: string;
}

export interface AdjustmentResponse {
  analysis: string;
  suggestions: string;
  updatedNextDayPlan?: DailyPlan; // The re-generated plan for the next day
}
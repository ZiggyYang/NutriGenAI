import React, { useState } from 'react';
import { UserProfile, WeeklyMealPlan, DailyLog, AdjustmentResponse } from './types';
import { generateWeeklyPlan, analyzeAndAdjust } from './services/geminiService';
import { ProfileForm } from './components/ProfileForm';
import { MealPlanView } from './components/MealPlanView';
import { DailyTracker } from './components/DailyTracker';
import { Utensils, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'profile' | 'generating' | 'plan'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  
  // Tracker State
  const [dailyLogs, setDailyLogs] = useState<Record<number, DailyLog>>({});
  const [trackingDayIndex, setTrackingDayIndex] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AdjustmentResponse | null>(null);

  const handleProfileComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    setStep('generating');
    try {
      const plan = await generateWeeklyPlan(profile);
      setMealPlan(plan);
      setStep('plan');
    } catch (error) {
      console.error(error);
      alert("生成计划失败，请检查API Key设置。");
      setStep('profile');
    }
  };

  const handleLogSubmit = async (log: DailyLog) => {
    if (!userProfile || !mealPlan) return;
    
    // Save log locally
    setDailyLogs(prev => ({
      ...prev,
      [log.dayIndex]: log
    }));

    setIsAnalyzing(true);
    try {
      const originalDay = mealPlan.weekPlan[log.dayIndex];
      const result = await analyzeAndAdjust(userProfile, originalDay, log);
      setAnalysisResult(result);
      
      // Real-time Plan Adjustment
      if (result.updatedNextDayPlan) {
        const nextDayIndex = log.dayIndex + 1;
        // Only update if the next day exists in the plan
        if (nextDayIndex < mealPlan.weekPlan.length) {
          const updatedWeekPlan = [...mealPlan.weekPlan];
          // Preserve the Day Name (e.g., "Tuesday") but update the content
          updatedWeekPlan[nextDayIndex] = {
            ...result.updatedNextDayPlan,
            day: updatedWeekPlan[nextDayIndex].day 
          };
          
          setMealPlan({
            ...mealPlan,
            weekPlan: updatedWeekPlan
          });
        }
      }

      setTrackingDayIndex(null); // Close modal
    } catch (e) {
      console.error(e);
      alert("分析失败，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-600">
            <div className="bg-brand-100 p-2 rounded-lg">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">NutriGen<span className="text-brand-600">AI</span> 营养师</span>
          </div>
          {step === 'plan' && (
             <button onClick={() => setStep('profile')} className="text-sm font-medium text-gray-500 hover:text-brand-600">
               修改档案
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        
        {step === 'profile' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">您的私人AI营养专家</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                告诉我们您的身体状况、生活方式和目标。AI将为您量身定制完美的每周膳食计划。
              </p>
            </div>
            <ProfileForm onComplete={handleProfileComplete} initialData={userProfile} />
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">正在生成您的专属计划...</h2>
            <p className="text-gray-500 mt-2">正在分析营养需求和偏好</p>
          </div>
        )}

        {step === 'plan' && mealPlan && (
          <div className="space-y-6">
            {analysisResult && (
               <div className="max-w-6xl mx-auto bg-indigo-50 border border-indigo-200 rounded-xl p-6 relative animate-fade-in shadow-md">
                 <button 
                  onClick={() => setAnalysisResult(null)}
                  className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-800 text-sm font-bold"
                 >关闭</button>
                 <h3 className="text-lg font-bold text-indigo-900 mb-2">每日调整报告</h3>
                 <div className="prose prose-sm text-indigo-800">
                   <p><strong>分析:</strong> {analysisResult.analysis}</p>
                   <p className="mt-2"><strong>建议:</strong> {analysisResult.suggestions}</p>
                   {analysisResult.updatedNextDayPlan && (
                     <p className="mt-2 text-green-700 font-semibold flex items-center">
                       <Utensils className="w-4 h-4 mr-1"/> 
                       为了优化您的效果，明天的食谱已自动更新！
                     </p>
                   )}
                 </div>
               </div>
            )}
            
            <MealPlanView 
              plan={mealPlan} 
              dailyLogs={dailyLogs}
              onLogDay={(idx) => setTrackingDayIndex(idx)}
              onRegenerate={() => handleProfileComplete(userProfile!)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {trackingDayIndex !== null && mealPlan && (
        <DailyTracker 
          dayName={mealPlan.weekPlan[trackingDayIndex].day}
          dayIndex={trackingDayIndex}
          existingLog={dailyLogs[trackingDayIndex]}
          onClose={() => setTrackingDayIndex(null)}
          onSubmit={handleLogSubmit}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};

export default App;
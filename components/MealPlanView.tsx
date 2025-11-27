import React, { useState } from 'react';
import { WeeklyMealPlan, DailyPlan, MealItem, DailyLog } from '../types';
import { Calendar, RefreshCw, CheckCircle, Droplets, Activity } from 'lucide-react';

interface Props {
  plan: WeeklyMealPlan;
  dailyLogs: Record<number, DailyLog>;
  onLogDay: (dayIndex: number) => void;
  onRegenerate: () => void;
}

export const MealPlanView: React.FC<Props> = ({ plan, dailyLogs, onLogDay, onRegenerate }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedDay: DailyPlan = plan.weekPlan[selectedDayIndex];
  const loggedData = dailyLogs[selectedDayIndex];

  const MealCard = ({ title, items, colorClass }: { title: string, items: MealItem[], colorClass: string }) => (
    <div className={`rounded-xl p-5 border ${colorClass} bg-white shadow-sm h-full`}>
      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2 uppercase tracking-wide text-xs">{title}</h4>
      {items.length === 0 ? <p className="text-gray-400 text-sm italic">未指定</p> : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm">
              <div className="font-semibold text-gray-900">{item.name}</div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.portion}</span>
                {item.calories && <span className="text-gray-500">{item.calories} 大卡</span>}
              </div>
              {item.macros && <div className="text-xs text-gray-400 mt-1">{item.macros}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Advice */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
           <Calendar className="mr-2" /> 本周概览与建议
        </h2>
        <p className="opacity-90">{plan.generalAdvice}</p>
        <button onClick={onRegenerate} className="mt-4 flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm">
          <RefreshCw className="w-4 h-4 mr-2" /> 重新生成计划
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {plan.weekPlan.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`flex-shrink-0 px-5 py-3 rounded-xl font-medium transition-all ${
              selectedDayIndex === idx 
                ? 'bg-brand-600 text-white shadow-md scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex flex-col items-center">
              <span>{day.day}</span>
              {dailyLogs[idx] && <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1"></div>}
            </div>
          </button>
        ))}
      </div>

      {/* Daily Content */}
      <div className="bg-gray-50 rounded-2xl p-2 md:p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 px-2 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedDay.day} 菜单</h3>
              <p className="text-brand-600 text-sm font-medium">{selectedDay.nutritionalSummary}</p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {loggedData && loggedData.waterIntake > 0 && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center text-sm font-bold shadow-sm">
                  <Droplets className="w-4 h-4 mr-2" />
                  {loggedData.waterIntake} mL
                </div>
              )}

              {loggedData && (loggedData.exerciseDuration || 0) > 0 && (
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full flex items-center text-sm font-bold shadow-sm">
                  <Activity className="w-4 h-4 mr-2" />
                  {loggedData.exerciseActivity} ({loggedData.exerciseDuration}分钟)
                </div>
              )}
              
              <button 
                onClick={() => onLogDay(selectedDayIndex)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-black flex items-center shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> 
                {loggedData ? '修改打卡' : '打卡 & 调整'}
              </button>
            </div>
        </div>

        {selectedDay.tips && (
           <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg text-sm text-amber-800 italic">
             💡 <strong>每日贴士:</strong> {selectedDay.tips}
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MealCard title="早餐" items={selectedDay.breakfast} colorClass="border-orange-100" />
          <MealCard title="午餐" items={selectedDay.lunch} colorClass="border-green-100" />
          <MealCard title="晚餐" items={selectedDay.dinner} colorClass="border-blue-100" />
          <MealCard title="加餐 / 零食" items={selectedDay.snacks} colorClass="border-purple-100" />
        </div>
      </div>
    </div>
  );
};
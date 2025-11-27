import React, { useState } from 'react';
import { DailyLog, LoggedMealItem } from '../types';
import { X, Send, Droplets, Plus, Minus, Dumbbell, Trash2, Moon } from 'lucide-react';

interface Props {
  dayName: string;
  dayIndex: number;
  onClose: () => void;
  onSubmit: (log: DailyLog) => void;
  isAnalyzing: boolean;
  existingLog?: DailyLog;
}

export const DailyTracker: React.FC<Props> = ({ dayName, dayIndex, onClose, onSubmit, isAnalyzing, existingLog }) => {
  const [log, setLog] = useState<DailyLog>(existingLog || {
    dayIndex,
    actualBreakfast: [],
    actualLunch: [],
    actualDinner: [],
    actualSnacks: [],
    waterIntake: 0,
    exerciseActivity: '',
    exerciseDuration: 0,
    exerciseIntensity: '中等',
    sleepHours: 7,
    sleepQuality: '良好',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(log);
  };

  const adjustWater = (amount: number) => {
    setLog(prev => ({
      ...prev,
      waterIntake: Math.max(0, (prev.waterIntake || 0) + amount)
    }));
  };

  // Helper component for Meal List
  const MealInputSection = ({ 
    title, 
    items, 
    onChange 
  }: { 
    title: string, 
    items: LoggedMealItem[], 
    onChange: (items: LoggedMealItem[]) => void 
  }) => {
    const addItem = () => {
      onChange([...items, { name: '', quantity: 1, unit: '份' }]);
    };

    const updateItem = (index: number, field: keyof LoggedMealItem, value: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      onChange(newItems);
    };

    const removeItem = (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    };

    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</label>
          <button type="button" onClick={addItem} className="text-xs text-brand-600 font-bold hover:text-brand-800 flex items-center">
            <Plus className="w-3 h-3 mr-1" /> 添加项
          </button>
        </div>
        
        {items.length === 0 && (
          <div className="text-sm text-gray-400 italic text-center py-2">暂无记录</div>
        )}

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="食物名称 (如: 燕麦粥)"
                className="flex-grow p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500 outline-none min-w-0"
                value={item.name}
                onChange={e => updateItem(idx, 'name', e.target.value)}
              />
              <input
                type="number"
                placeholder="数量"
                className="w-16 p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                value={item.quantity}
                onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))}
              />
              <input
                type="text"
                placeholder="单位"
                className="w-20 p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                value={item.unit}
                onChange={e => updateItem(idx, 'unit', e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => removeItem(idx)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">每日打卡: {dayName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-gray-500">
            记录你今天的实际饮食和活动。AI 将分析数据（包括睡眠和饮水），并为你调整明天的计划。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Water Tracker */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 col-span-1 md:col-span-2">
              <label className="flex items-center text-sm font-bold text-blue-800 uppercase tracking-wider mb-3">
                <Droplets className="w-4 h-4 mr-2" /> 饮水量
              </label>
              <div className="flex items-center justify-between gap-4">
                <button 
                  type="button" 
                  onClick={() => adjustWater(-250)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-blue-900">{log.waterIntake} <span className="text-sm font-normal text-blue-600">mL</span></div>
                </div>
                <button 
                  type="button" 
                  onClick={() => adjustWater(250)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sleep Tracker */}
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 col-span-1 md:col-span-2">
              <label className="flex items-center text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3">
                <Moon className="w-4 h-4 mr-2" /> 昨夜睡眠
              </label>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-indigo-600 block mb-1">时长 (小时)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={log.sleepHours || ''}
                      onChange={e => setLog({...log, sleepHours: parseFloat(e.target.value)})}
                      className="w-full p-2 border border-indigo-200 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-indigo-600 block mb-1">质量</label>
                    <select 
                      value={log.sleepQuality || 'Good'}
                      onChange={e => setLog({...log, sleepQuality: e.target.value})}
                      className="w-full p-2 border border-indigo-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value="差">差</option>
                      <option value="一般">一般</option>
                      <option value="良好">良好</option>
                      <option value="极佳">极佳</option>
                    </select>
                 </div>
              </div>
            </div>

            {/* Exercise Tracker */}
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 col-span-1 md:col-span-2">
              <label className="flex items-center text-sm font-bold text-orange-800 uppercase tracking-wider mb-3">
                <Dumbbell className="w-4 h-4 mr-2" /> 运动
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-xs text-orange-600 mb-1">运动类型</label>
                  <input
                    type="text"
                    placeholder="如: 跑步"
                    className="w-full p-2 border border-orange-200 rounded text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                    value={log.exerciseActivity || ''}
                    onChange={e => setLog({...log, exerciseActivity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-orange-600 mb-1">时长 (分钟)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full p-2 border border-orange-200 rounded text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                    value={log.exerciseDuration || ''}
                    onChange={e => setLog({...log, exerciseDuration: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-orange-600 mb-1">强度</label>
                  <select
                    className="w-full p-2 border border-orange-200 rounded text-sm bg-white focus:ring-1 focus:ring-orange-500 outline-none"
                    value={log.exerciseIntensity || 'Moderate'}
                    onChange={e => setLog({...log, exerciseIntensity: e.target.value})}
                  >
                    <option value="低">低</option>
                    <option value="中等">中等</option>
                    <option value="高">高</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <MealInputSection 
            title="早餐" 
            items={log.actualBreakfast} 
            onChange={items => setLog({...log, actualBreakfast: items})} 
          />
          <MealInputSection 
            title="午餐" 
            items={log.actualLunch} 
            onChange={items => setLog({...log, actualLunch: items})} 
          />
          <MealInputSection 
            title="晚餐" 
            items={log.actualDinner} 
            onChange={items => setLog({...log, actualDinner: items})} 
          />
          <MealInputSection 
            title="加餐 / 零食" 
            items={log.actualSnacks} 
            onChange={items => setLog({...log, actualSnacks: items})} 
          />

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">其他感受 / 备注</label>
             <textarea 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all h-16 resize-none"
              placeholder="感觉如何？有无不适？"
              value={log.notes}
              onChange={e => setLog({...log, notes: e.target.value})}
            />
          </div>
        </form>

        <div className="p-4 border-t bg-gray-50">
          <button 
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className={`w-full py-3 rounded-xl font-bold text-white flex justify-center items-center shadow-lg transition-all ${isAnalyzing ? 'bg-gray-400' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-xl'}`}
          >
            {isAnalyzing ? (
              <>分析并更新计划中...</>
            ) : (
              <>提交并调整后续计划 <Send className="w-4 h-4 ml-2" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
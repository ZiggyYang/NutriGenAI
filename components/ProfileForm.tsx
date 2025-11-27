import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
  initialData?: UserProfile | null;
}

const STEPS = [
  '基本信息',
  '身体指标',
  '饮食偏好',
  '生活方式',
  '目标设定'
];

export const ProfileForm: React.FC<Props> = ({ onComplete, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {
    mealsPerDay: 3,
    diningStyle: '自己烹饪',
    gender: Gender.Male,
    cookingPreferences: [],
    tastePreferences: [],
    dislikedFoods: [],
    likedFoods: [],
    foodAllergies: []
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'cookingPreferences' | 'tastePreferences', value: string) => {
    const current = (formData[field] as string[]) || [];
    if (current.includes(value)) {
      handleChange(field, current.filter(i => i !== value));
    } else {
      handleChange(field, [...current, value]);
    }
  };

  const nextStep = () => setCurrentStep(p => Math.min(STEPS.length - 1, p + 1));
  const prevStep = () => setCurrentStep(p => Math.max(0, p - 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === STEPS.length - 1) {
      onComplete(formData as UserProfile);
    } else {
      nextStep();
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto border border-gray-100">
      {/* Progress Header */}
      <div className="bg-brand-50 p-6 border-b border-brand-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-brand-900">{STEPS[currentStep]}</h2>
          <span className="text-sm font-medium text-brand-600">步骤 {currentStep + 1} / {STEPS.length}</span>
        </div>
        <div className="w-full bg-brand-200 rounded-full h-2">
          <div 
            className="bg-brand-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 min-h-[400px]">
        
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
              <input type="number" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500"
                value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
              <select className="w-full p-3 border rounded-lg"
                value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {formData.gender === Gender.Female && (
              <div className="md:col-span-2 bg-pink-50 p-4 rounded-lg border border-pink-100">
                <label className="block text-sm font-medium text-pink-800 mb-1">生理周期 / 阶段</label>
                <select className="w-full p-3 border border-pink-200 rounded-lg bg-white"
                  value={formData.menstrualCycle || ''} onChange={e => handleChange('menstrualCycle', e.target.value)}>
                  <option value="">请选择...</option>
                  <option value="规律">规律周期</option>
                  <option value="不规律">周期不规律</option>
                  <option value="经期中">经期中</option>
                  <option value="备孕">备孕/排卵期</option>
                  <option value="怀孕">怀孕期</option>
                  <option value="哺乳">哺乳期</option>
                  <option value="更年期">更年期</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职业</label>
              <input type="text" className="w-full p-3 border rounded-lg" placeholder="例如：办公室职员"
                value={formData.occupation || ''} onChange={e => handleChange('occupation', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">居住地 (气候/饮食习惯)</label>
              <input type="text" className="w-full p-3 border rounded-lg" placeholder="例如：上海、广东"
                value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2: Body Metrics */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm)</label>
                <input type="number" required className="w-full p-3 border rounded-lg"
                  value={formData.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
                <input type="number" required className="w-full p-3 border rounded-lg"
                  value={formData.weight || ''} onChange={e => handleChange('weight', parseFloat(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">腰围 (cm) - 选填</label>
                <input type="number" className="w-full p-3 border rounded-lg"
                  value={formData.waistCircumference || ''} onChange={e => handleChange('waistCircumference', parseFloat(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">臀围 (cm) - 选填</label>
                <input type="number" className="w-full p-3 border rounded-lg"
                  value={formData.hipCircumference || ''} onChange={e => handleChange('hipCircumference', parseFloat(e.target.value))} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">近期体重变化 (kg) - 选填</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">1个月内</label>
                  <input type="number" placeholder="+/- kg" className="w-full p-2 border rounded"
                    value={formData.weightChange1Month || ''} onChange={e => handleChange('weightChange1Month', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">3个月内</label>
                  <input type="number" placeholder="+/- kg" className="w-full p-2 border rounded"
                    value={formData.weightChange3Month || ''} onChange={e => handleChange('weightChange3Month', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">6个月内</label>
                  <input type="number" placeholder="+/- kg" className="w-full p-2 border rounded"
                    value={formData.weightChange6Month || ''} onChange={e => handleChange('weightChange6Month', parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Diet & Taste */}
        {currentStep === 2 && (
          <div className="space-y-6">
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">主要就餐方式</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {['自己烹饪', '公司/学校食堂', '外卖/外食', '混合模式'].map(style => (
                   <button 
                     key={style}
                     type="button" 
                     onClick={() => handleChange('diningStyle', style)}
                     className={`px-3 py-2 text-sm rounded-lg border transition-colors ${formData.diningStyle === style ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                   >
                     {style}
                   </button>
                 ))}
               </div>
             </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">每日餐数</label>
              <div className="flex gap-4">
                {[2, 3, 4, 5].map(num => (
                  <button key={num} type="button"
                    onClick={() => handleChange('mealsPerDay', num)}
                    className={`px-4 py-2 rounded-lg border ${formData.mealsPerDay === num ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300'}`}>
                    {num} 餐
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">烹饪方式偏好</label>
              <div className="flex flex-wrap gap-2">
                {['清蒸', '快炒', '水煮', '烘焙', '烧烤', '凉拌/沙拉', '炖煮', '煎炸'].map(m => (
                  <button key={m} type="button" onClick={() => handleArrayToggle('cookingPreferences', m)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${formData.cookingPreferences?.includes(m) ? 'bg-brand-100 border-brand-500 text-brand-800' : 'bg-white border-gray-200 text-gray-600'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">口味偏好</label>
              <div className="flex flex-wrap gap-2">
                {['辣', '甜', '咸', '酸', '苦', '清淡', '油腻/重口'].map(t => (
                  <button key={t} type="button" onClick={() => handleArrayToggle('tastePreferences', t)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${formData.tastePreferences?.includes(t) ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-white border-gray-200 text-gray-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">忌口 / 过敏源</label>
                 <textarea className="w-full p-3 border rounded-lg h-24" placeholder="例如：花生过敏，不吃香菜"
                   value={formData.foodAllergies?.join(', ')} 
                   onChange={e => handleChange('foodAllergies', e.target.value.split(/[,，]/).map(s => s.trim()))} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">喜欢的食物</label>
                 <textarea className="w-full p-3 border rounded-lg h-24" placeholder="例如：三文鱼，牛油果，米饭"
                   value={formData.likedFoods?.join(', ')} 
                   onChange={e => handleChange('likedFoods', e.target.value.split(/[,，]/).map(s => s.trim()))} />
               </div>
            </div>
          </div>
        )}

        {/* Step 4: Lifestyle */}
        {currentStep === 3 && (
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">日常活动量</label>
               <select className="w-full p-3 border rounded-lg"
                value={formData.exerciseHabits} onChange={e => handleChange('exerciseHabits', e.target.value)}>
                 <option value="">请选择活动等级</option>
                 {Object.values(ActivityLevel).map(l => <option key={l} value={l}>{l}</option>)}
               </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">睡眠时长 (小时)</label>
                 <input type="number" className="w-full p-3 border rounded-lg"
                   value={formData.sleepHours || ''} onChange={e => handleChange('sleepHours', parseFloat(e.target.value))} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">压力水平 (1-10)</label>
                 <input type="number" max="10" min="1" className="w-full p-3 border rounded-lg"
                   value={formData.stressLevel || ''} onChange={e => handleChange('stressLevel', e.target.value)} />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">饮食预算</label>
               <select className="w-full p-3 border rounded-lg"
                 value={formData.budget || ''} onChange={e => handleChange('budget', e.target.value)}>
                   <option value="Low">经济实惠</option>
                   <option value="Medium">中等预算</option>
                   <option value="High">高端/有机食材</option>
               </select>
             </div>
           </div>
        )}

        {/* Step 5: Goals */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-brand-900 mb-2">您的主要目标是什么？</h3>
              <p className="text-gray-500">请尽可能详细描述，我们将根据此生成食谱。</p>
            </div>
            
            <textarea 
              required
              className="w-full p-4 border-2 border-brand-200 rounded-xl focus:border-brand-500 focus:ring-0 text-lg min-h-[150px]"
              placeholder="例如：我想在一个月内减掉2公斤，不要挨饿。我喜欢中餐，早餐希望能快速解决。"
              value={formData.dietaryGoal || ''}
              onChange={e => handleChange('dietaryGoal', e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ChevronLeft className="w-5 h-5 mr-2" /> 上一步
          </button>
          
          <button type="submit"
            className="flex items-center px-8 py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg hover:bg-brand-700 transition-transform transform hover:scale-105">
            {currentStep === STEPS.length - 1 ? (
              <>生成食谱 <Save className="w-5 h-5 ml-2" /></>
            ) : (
              <>下一步 <ChevronRight className="w-5 h-5 ml-2" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
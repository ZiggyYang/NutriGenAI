import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, WeeklyMealPlan, DailyLog, AdjustmentResponse } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Reusable Schemas
const mealItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the dish or food item (in Chinese)" },
    portion: { type: Type.STRING, description: "Portion size (e.g., 200g, 1碗) (in Chinese)" },
    calories: { type: Type.INTEGER, description: "Approximate calories" },
    macros: { type: Type.STRING, description: "Short macro summary (e.g. '20碳水/10脂/30蛋')" }
  },
  required: ["name", "portion"]
};

const dailyPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING, description: "Day of the week (e.g., 周一, 周二)" },
    breakfast: { type: Type.ARRAY, items: mealItemSchema },
    lunch: { type: Type.ARRAY, items: mealItemSchema },
    dinner: { type: Type.ARRAY, items: mealItemSchema },
    snacks: { type: Type.ARRAY, items: mealItemSchema },
    nutritionalSummary: { type: Type.STRING, description: "Brief summary of daily totals (in Chinese)" },
    tips: { type: Type.STRING, description: "Specific cooking or prep tip for the day (in Chinese)" }
  },
  required: ["day", "breakfast", "lunch", "dinner", "nutritionalSummary"]
};

const weeklyPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weekPlan: { type: Type.ARRAY, items: dailyPlanSchema },
    generalAdvice: { type: Type.STRING, description: "Overall advice for the week based on profile (in Chinese)" }
  },
  required: ["weekPlan", "generalAdvice"]
};

export const generateWeeklyPlan = async (profile: UserProfile): Promise<WeeklyMealPlan> => {
  const ai = getClient();
  
  const systemInstruction = `
    你是一位世界级的临床营养师和膳食专家。
    你的目标是根据用户详细的个人档案，制定一份高度个性化的7天膳食计划。
    
    请考虑以下因素：
    1. 人体测量指标（内部计算BMI/代谢需求）。
    2. 文化和地区（${profile.location}，请符合当地饮食习惯）。
    3. 经济状况（${profile.budget}）。
    4. 就餐方式（${profile.diningStyle}）：如果是外卖/食堂，推荐具体的菜色选择；如果是烹饪，提供食材建议。
    5. 饮食偏好和过敏源。
    6. 具体目标：“${profile.dietaryGoal}”。
    
    输出必须是严格符合 Schema 的 JSON 格式。
    所有文本内容（菜名、建议、贴士等）必须使用简体中文。
  `;

  const prompt = `
    用户档案数据:
    ${JSON.stringify(profile, null, 2)}
    
    任务：生成一份为期7天的健康膳食计划（周一至周日），帮助用户实现目标。
    确保食物的多样性和可行性，并符合他们的烹饪偏好。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: weeklyPlanSchema,
        temperature: 0.5, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as WeeklyMealPlan;
    }
    throw new Error("No data returned from model");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeAndAdjust = async (
  profile: UserProfile,
  originalDayPlan: any,
  log: DailyLog
): Promise<AdjustmentResponse> => {
  const ai = getClient();

  const systemInstruction = `
    你是一位充满支持性的动态营养教练。
    用户记录了他们当天的实际饮食、运动、睡眠和饮水情况。
    你的工作是：
    1. 分析他们的实际表现与计划目标的偏差。
    2. 提供即时的改进建议。
    3. 关键：生成*下一天*的修订膳食计划，以补偿或优化今天的情况。
    
    如果吃多了，下一天稍微清淡一点。
    如果运动量大，确保补充足够的恢复燃料。
    如果睡眠不好，建议一些助眠或补充能量的食物。
    
    请全部使用简体中文回答。
  `;

  const prompt = `
    用户目标: ${profile.dietaryGoal}
    
    原定计划（当天）:
    ${JSON.stringify(originalDayPlan)}
    
    用户实际记录 (Log):
    - 早餐: ${JSON.stringify(log.actualBreakfast)}
    - 午餐: ${JSON.stringify(log.actualLunch)}
    - 晚餐: ${JSON.stringify(log.actualDinner)}
    - 零食/加餐: ${JSON.stringify(log.actualSnacks)}
    - 饮水: ${log.waterIntake} mL
    - 睡眠: ${log.sleepHours}小时 (质量: ${log.sleepQuality})
    - 运动: ${log.exerciseActivity || '无'} (${log.exerciseDuration || 0}分钟, 强度: ${log.exerciseIntensity})
    - 备注/感受: ${log.notes}
    
    任务:
    1. 分析偏差。
    2. 提供建议。
    3. 生成下一天（第 ${log.dayIndex + 2} 天）的完整膳食计划对象，以优化结果。
  `;

  const adjustmentSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING, description: "Analysis of the intake vs plan (in Chinese)" },
      suggestions: { type: Type.STRING, description: "Actionable advice (in Chinese)" },
      updatedNextDayPlan: dailyPlanSchema 
    },
    required: ["analysis", "suggestions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: adjustmentSchema
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AdjustmentResponse;
    }
    throw new Error("Failed to generate adjustment");
  } catch (error) {
    console.error("Adjustment API Error:", error);
    throw error;
  }
};
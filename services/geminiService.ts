import { GoogleGenAI, Type } from "@google/genai";
import { UnitAnalysis, AnalysisItem } from "../types";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

/**
 * Generates a detailed Unit Price Analysis (일위대가) for a specific construction task.
 */
export const generateUnitAnalysis = async (taskName: string, preferredCategory?: string): Promise<UnitAnalysis> => {
  if (!process.env.API_KEY) {
    alert("API Key가 설정되지 않았습니다. 환경변수 API_KEY를 확인해주세요.");
    throw new Error("API Key missing");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Act as a professional Quantity Surveyor in Korea. Create a detailed "Unit Price Analysis" (일위대가표) for the construction task: "${taskName}".
      ${preferredCategory ? `The task belongs to the category: "${preferredCategory}".` : ''}
      
      Guidelines:
      1. Breakdown the task into constituent resources: Materials (재료비), Labor (노무비), and Expenses (경비).
      2. Use standard Korean construction estimation standards (표준품셈) for Quantities (품).
      3. Provide realistic market Unit Prices (단가) in KRW (Korean Won).
      4. Define the main Unit of the task (e.g., m2, m3, ton) and ensure all resource quantities are per 1 Unit of the task.
      5. Provide the "Source" or "Basis" for the price (e.g., "물가자료", "시중노임", "표준품셈", "견적") for each item.
      
      Return the data in a structured JSON format matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Task Category" },
            name: { type: Type.STRING, description: "Task Name (e.g., Brick Laying)" },
            specification: { type: Type.STRING, description: "Task Specification (e.g., 1.0B, T15)" },
            unit: { type: Type.STRING, description: "Unit of measure (e.g., m2)" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["MATERIAL", "LABOR", "EXPENSE"], description: "Resource type" },
                  name: { type: Type.STRING, description: "Resource Name" },
                  specification: { type: Type.STRING, description: "Resource Spec" },
                  unit: { type: Type.STRING, description: "Resource Unit (e.g., ea, h, kg)" },
                  quantity: { type: Type.NUMBER, description: "Quantity required per 1 parent unit" },
                  materialUnitPrice: { type: Type.NUMBER, description: "Material unit cost (KRW)" },
                  laborUnitPrice: { type: Type.NUMBER, description: "Labor unit cost (KRW)" },
                  expenseUnitPrice: { type: Type.NUMBER, description: "Expense unit cost (KRW)" },
                  priceSource: { type: Type.STRING, description: "Source/Basis of the unit price (e.g. 2025 Wages)" },
                },
                required: ["type", "name", "unit", "quantity", "materialUnitPrice", "laborUnitPrice", "expenseUnitPrice"]
              }
            }
          },
          required: ["category", "name", "unit", "items"]
        },
      },
    });

    if (!response.text) {
      throw new Error("No data returned from Gemini.");
    }

    const rawData = JSON.parse(response.text);
    
    // Post-process to ensure IDs
    const analysis: UnitAnalysis = {
      id: crypto.randomUUID(),
      category: preferredCategory || rawData.category || "General",
      name: rawData.name,
      specification: rawData.specification || "-",
      unit: rawData.unit,
      createdAt: Date.now(),
      items: rawData.items.map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
        // Ensure numbers
        materialUnitPrice: Number(item.materialUnitPrice) || 0,
        laborUnitPrice: Number(item.laborUnitPrice) || 0,
        expenseUnitPrice: Number(item.expenseUnitPrice) || 0,
        priceSource: item.priceSource || '임의',
      }))
    };

    return analysis;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
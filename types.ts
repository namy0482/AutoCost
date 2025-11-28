
export type ResourceType = 'MATERIAL' | 'LABOR' | 'EXPENSE';

export type ViewMode = 'OVERVIEW' | 'COST_STATEMENT' | 'SUMMARY_SHEET' | 'LIST' | 'ANALYSIS' | 'SOURCE' | 'ESTIMATE';

export interface AnalysisItem {
  id: string;
  type: ResourceType; // 구분 (재료, 노무, 경비)
  name: string;       // 품명
  specification: string; // 규격
  unit: string;       // 단위
  quantity: number;   // 수량 (per parent unit)
  
  // Unit Prices (단가)
  materialUnitPrice: number;
  laborUnitPrice: number;
  expenseUnitPrice: number;

  // Metadata
  priceSource?: string; // 단가 산출 근거 (New)
}

export interface UnitAnalysis {
  id: string;
  category: string;   // 공종 (e.g., 조적공사)
  name: string;       // 공종명 (e.g., 시멘트벽돌 쌓기)
  specification: string; // 규격 (e.g., 1.0B)
  unit: string;       // 단위 (e.g., m2)
  items: AnalysisItem[];
  
  // Metadata
  createdAt: number;
  note?: string;
}

export interface CostSummary {
  totalMaterial: number;
  totalLabor: number;
  totalExpense: number;
  unitPrice: number; // Total per unit
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

// Estimate Types
export type EstimateType = 'CATEGORY' | 'ITEM';

export interface EstimateEntry {
  id: string;
  type: EstimateType;
  name: string;       // Category Name or Item Name
  specification: string;
  unit: string;
  quantity: number;
  quantityFormula?: string;   
  analysisId?: string; // Link to UnitAnalysis
  note?: string;
}

// Client Database Type
export interface Client {
  id: string;
  name: string;           // 발주처명
  contactPerson: string;  // 담당자명
  department: string;     // 담당부서
  mobile: string;         // 휴대전화
  phone: string;          // 일반전화
  email: string;          // 이메일
  memo: string;           // 메모
}

// Company / Contractor Type
export interface Company extends Client {
    businessNumber?: string;
    ownerName?: string;
}

export type Contractor = Company;

// Project Overview Type
export interface ProjectOverview {
  projectName: string;    // 공사명
  classification: string; // 공사구분 (건축, 토목 등)
  client: string;         // 발주처 (Stores name only for now, or could link ID)
  contractor: string;     // 시공사
  location: string;       // 현장위치
  startDate: string;      // 공사시작일
  endDate: string;        // 공사종료일
  description: string;    // 공사개요 설명
}

// Data structure for imported Excel data
export interface ImportedData {
  overview?: ProjectOverview;
  analyses?: UnitAnalysis[];
  estimateItems?: EstimateEntry[];
}
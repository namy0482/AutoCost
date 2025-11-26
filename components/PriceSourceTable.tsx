import React from 'react';
import { AnalysisItem, UnitAnalysis, ResourceType } from '../types';

interface PriceSourceTableProps {
  analysis: UnitAnalysis;
  onUpdateItem: (id: string, field: keyof AnalysisItem, value: any) => void;
}

export const PriceSourceTable: React.FC<PriceSourceTableProps> = ({ 
  analysis, 
  onUpdateItem 
}) => {
  
  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Group items by type
  const getItemsByType = (type: ResourceType) => analysis.items.filter(i => i.type === type);
  
  const renderSection = (type: ResourceType, title: string, colorClass: string) => {
    const items = getItemsByType(type);
    if (items.length === 0) return null;

    return (
      <>
        <tr className="bg-slate-50 border-y border-slate-200">
          <td colSpan={9} className={`px-4 py-1.5 text-xs font-bold ${colorClass} bg-opacity-10`}>
            {title}
          </td>
        </tr>
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50 group transition-colors border-b border-slate-50">
             <td className="px-3 py-2">
               <span className="font-medium text-slate-800 text-sm">{item.name}</span>
             </td>
             <td className="px-3 py-2 text-slate-500 text-xs">
               {item.specification}
             </td>
             <td className="px-3 py-2 text-slate-600 text-center text-sm">
               {item.unit}
             </td>
             
             {/* Material Unit Price */}
             <td className="px-3 py-2 border-r border-slate-100 bg-blue-50/10">
                <input 
                  type="number" 
                  value={item.materialUnitPrice} 
                  onChange={(e) => onUpdateItem(item.id, 'materialUnitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-700 text-sm" 
                />
             </td>

             {/* Labor Unit Price */}
             <td className="px-3 py-2 border-r border-slate-100 bg-emerald-50/10">
                <input 
                  type="number" 
                  value={item.laborUnitPrice} 
                  onChange={(e) => onUpdateItem(item.id, 'laborUnitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-700 text-sm" 
                />
             </td>

             {/* Expense Unit Price */}
             <td className="px-3 py-2 border-r border-slate-100 bg-amber-50/10">
                <input 
                  type="number" 
                  value={item.expenseUnitPrice} 
                  onChange={(e) => onUpdateItem(item.id, 'expenseUnitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-700 text-sm" 
                />
             </td>

             {/* Source/Basis */}
             <td className="px-3 py-2">
               <input 
                  type="text" 
                  value={item.priceSource || ''} 
                  onChange={(e) => onUpdateItem(item.id, 'priceSource', e.target.value)}
                  placeholder="산출근거 입력 (예: 물가자료)"
                  className="w-full bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-200 rounded px-2 py-1 text-xs text-slate-600 focus:ring-2 focus:ring-indigo-50 transition-all"
                />
             </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-slate-800">단가 산출 근거표</h3>
            <p className="text-xs text-slate-500">각 자원의 적용 단가 및 출처를 관리합니다.</p>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-3 py-3 border-b text-xs uppercase w-40 pl-4">품명</th>
              <th className="px-3 py-3 border-b text-xs uppercase w-32">규격</th>
              <th className="px-3 py-3 border-b text-xs uppercase w-16 text-center">단위</th>
              <th className="px-3 py-3 border-b border-r border-slate-200 text-xs uppercase text-center w-28 text-blue-600 bg-blue-50/30">재료비 단가</th>
              <th className="px-3 py-3 border-b border-r border-slate-200 text-xs uppercase text-center w-28 text-emerald-600 bg-emerald-50/30">노무비 단가</th>
              <th className="px-3 py-3 border-b border-r border-slate-200 text-xs uppercase text-center w-28 text-amber-600 bg-amber-50/30">경비 단가</th>
              <th className="px-3 py-3 border-b text-xs uppercase">단가 산출 근거 (Source)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {renderSection('MATERIAL', '재료 (Material)', 'text-blue-600')}
            {renderSection('LABOR', '노무 (Labor)', 'text-emerald-600')}
            {renderSection('EXPENSE', '경비 (Expense)', 'text-amber-600')}
          </tbody>
        </table>
      </div>
    </div>
  );
};
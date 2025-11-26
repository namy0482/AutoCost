import React, { useMemo } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { AnalysisItem, UnitAnalysis, ResourceType } from '../types';

interface CostTableProps {
  analysis: UnitAnalysis;
  onUpdateItem: (id: string, field: keyof AnalysisItem, value: any) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
  onUpdateMeta: (field: keyof UnitAnalysis, value: string) => void;
  onDeleteAnalysis: (id: string) => void;
}

export const CostTable: React.FC<CostTableProps> = ({ 
  analysis, 
  onUpdateItem, 
  onDeleteItem, 
  onAddItem,
  onUpdateMeta,
  onDeleteAnalysis
}) => {
  
  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Calculate Totals
  const totals = useMemo(() => {
    return analysis.items.reduce((acc, item) => {
        const qty = item.quantity || 0;
        acc.mat += (item.materialUnitPrice || 0) * qty;
        acc.lab += (item.laborUnitPrice || 0) * qty;
        acc.exp += (item.expenseUnitPrice || 0) * qty;
        return acc;
    }, { mat: 0, lab: 0, exp: 0 });
  }, [analysis.items]);

  const grandTotal = totals.mat + totals.lab + totals.exp;

  // Group items by type
  const getItemsByType = (type: ResourceType) => analysis.items.filter(i => i.type === type);
  
  const renderSection = (type: ResourceType, title: string, colorClass: string) => {
    const items = getItemsByType(type);
    if (items.length === 0) return null;

    return (
      <>
        <tr className="bg-slate-50 border-y border-slate-200">
          <td colSpan={12} className={`px-4 py-1.5 text-xs font-bold ${colorClass} bg-opacity-10`}>
            {title}
          </td>
        </tr>
        {items.map((item) => {
          const matAmt = item.quantity * item.materialUnitPrice;
          const labAmt = item.quantity * item.laborUnitPrice;
          const expAmt = item.quantity * item.expenseUnitPrice;
          const totalAmt = matAmt + labAmt + expAmt;
          
          return (
            <tr key={item.id} className="hover:bg-indigo-50/30 group transition-colors border-b border-slate-50">
               <td className="px-3 py-2 border-r border-slate-100">
                <input 
                  type="text" 
                  value={item.name} 
                  onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-800 text-sm"
                />
              </td>
              <td className="px-3 py-2 border-r border-slate-100">
                <input 
                  type="text" 
                  value={item.specification} 
                  onChange={(e) => onUpdateItem(item.id, 'specification', e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-500 text-xs"
                />
              </td>
              <td className="px-3 py-2 border-r border-slate-100">
                <input 
                  type="text" 
                  value={item.unit} 
                  onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 text-center text-sm"
                />
              </td>
              <td className="px-3 py-2 bg-yellow-50/50 border-r border-slate-100">
                <input 
                  type="number" 
                  value={item.quantity} 
                  onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right font-semibold text-slate-800 text-sm"
                />
              </td>
              
              {/* Material Group */}
              <td className="px-3 py-2 border-r border-slate-100 bg-blue-50/10">
                <input type="number" value={item.materialUnitPrice} onChange={(e) => onUpdateItem(item.id, 'materialUnitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-600 text-xs" />
              </td>
              <td className="px-3 py-2 border-r border-slate-100 bg-blue-50/20 text-right text-blue-700 text-xs font-medium">
                 {matAmt > 0 ? formatNumber(matAmt) : '-'}
              </td>

              {/* Labor Group */}
              <td className="px-3 py-2 border-r border-slate-100 bg-emerald-50/10">
                <input type="number" value={item.laborUnitPrice} onChange={(e) => onUpdateItem(item.id, 'laborUnitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-600 text-xs" />
              </td>
              <td className="px-3 py-2 border-r border-slate-100 bg-emerald-50/20 text-right text-emerald-700 text-xs font-medium">
                {labAmt > 0 ? formatNumber(labAmt) : '-'}
              </td>

              {/* Expense Group */}
              <td className="px-3 py-2 border-r border-slate-100 bg-amber-50/10">
                <input type="number" value={item.expenseUnitPrice} onChange={(e) => onUpdateItem(item.id, 'expenseUnitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-600 text-xs" />
              </td>
              <td className="px-3 py-2 border-r border-slate-100 bg-amber-50/20 text-right text-amber-700 text-xs font-medium">
                {expAmt > 0 ? formatNumber(expAmt) : '-'}
              </td>
              
              <td className="px-3 py-2 text-right font-bold text-slate-800 text-sm border-r border-slate-200">
                {formatNumber(totalAmt)}
              </td>
              <td className="px-2 py-2 text-center">
                <button onClick={() => onDeleteItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Analysis Header (Metadata) */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">공종명 (Task Name)</label>
            <input 
              type="text" 
              value={analysis.name} 
              onChange={(e) => onUpdateMeta('name', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-2 font-bold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">규격 (Spec)</label>
            <input 
              type="text" 
              value={analysis.specification} 
              onChange={(e) => onUpdateMeta('specification', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-600"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">단위 (Unit)</label>
            <input 
              type="text" 
              value={analysis.unit} 
              onChange={(e) => onUpdateMeta('unit', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm text-center font-medium text-slate-600"
            />
          </div>
        </div>
        
        <button
            onClick={() => onDeleteAnalysis(analysis.id)}
            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors ml-4"
            title="이 일위대가 삭제"
        >
            <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Analysis Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
            <tr>
              <th rowSpan={2} className="px-3 py-3 border-b text-xs uppercase w-40 pl-4 border-r border-slate-200">품명</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-xs uppercase w-24 border-r border-slate-200">규격</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-xs uppercase w-12 text-center border-r border-slate-200">단위</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-xs uppercase w-16 text-right bg-yellow-50 border-r border-slate-200">수량</th>
              
              <th colSpan={2} className="px-3 py-2 border-b border-r border-slate-200 text-xs uppercase text-center text-blue-600 bg-blue-50/30">재료비 (Material)</th>
              <th colSpan={2} className="px-3 py-2 border-b border-r border-slate-200 text-xs uppercase text-center text-emerald-600 bg-emerald-50/30">노무비 (Labor)</th>
              <th colSpan={2} className="px-3 py-2 border-b border-r border-slate-200 text-xs uppercase text-center text-amber-600 bg-amber-50/30">경비 (Expense)</th>
              
              <th rowSpan={2} className="px-3 py-3 border-b text-xs uppercase w-24 text-right border-r border-slate-200">합계</th>
              <th rowSpan={2} className="px-2 py-3 border-b w-8"></th>
            </tr>
            <tr>
              {/* Material */}
              <th className="px-2 py-2 border-b text-xs text-right w-20 text-slate-500 bg-blue-50/10">단가</th>
              <th className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right w-20 text-slate-500 bg-blue-50/10">금액</th>
              
              {/* Labor */}
              <th className="px-2 py-2 border-b text-xs text-right w-20 text-slate-500 bg-emerald-50/10">단가</th>
              <th className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right w-20 text-slate-500 bg-emerald-50/10">금액</th>
              
              {/* Expense */}
              <th className="px-2 py-2 border-b text-xs text-right w-20 text-slate-500 bg-amber-50/10">단가</th>
              <th className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right w-20 text-slate-500 bg-amber-50/10">금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {analysis.items.length === 0 && (
              <tr>
                <td colSpan={12} className="py-10 text-center text-slate-400 flex flex-col items-center justify-center h-40">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p>등록된 자원이 없습니다.</p>
                  <button onClick={onAddItem} className="mt-4 text-indigo-600 hover:underline text-sm">항목 추가하기</button>
                </td>
              </tr>
            )}
            {renderSection('MATERIAL', '재료비 (Materials)', 'text-blue-600')}
            {renderSection('LABOR', '노무비 (Labor)', 'text-emerald-600')}
            {renderSection('EXPENSE', '경비 (Expense)', 'text-amber-600')}
          </tbody>
          <tfoot className="bg-slate-100 font-bold text-slate-700 border-t-2 border-slate-300 sticky bottom-0 shadow-inner">
             <tr>
                <td colSpan={4} className="px-3 py-3 text-center border-r border-slate-200">합 계 (Total)</td>
                
                {/* Material */}
                <td className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right bg-blue-50/10"></td>
                <td className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right text-blue-700 bg-blue-50/10">{formatNumber(totals.mat)}</td>
                
                {/* Labor */}
                <td className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right bg-emerald-50/10"></td>
                <td className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right text-emerald-700 bg-emerald-50/10">{formatNumber(totals.lab)}</td>
                
                {/* Expense */}
                <td className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right bg-amber-50/10"></td>
                <td className="px-2 py-2 border-b border-r border-slate-200 text-xs text-right text-amber-700 bg-amber-50/10">{formatNumber(totals.exp)}</td>
                
                <td className="px-3 py-2 text-right font-bold text-indigo-800 text-sm bg-indigo-50/30 border-r border-slate-200">
                    {formatNumber(grandTotal)}
                </td>
                <td className="px-2 py-3"></td>
             </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0">
        <button 
          onClick={onAddItem}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-dashed border-slate-300 hover:border-indigo-300 rounded-lg transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          자원 추가 (Add Resource)
        </button>
      </div>
    </div>
  );
};
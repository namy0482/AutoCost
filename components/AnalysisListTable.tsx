import React, { useMemo } from 'react';
import { UnitAnalysis } from '../types';
import { FileText, FolderOpen, ChevronRight, CornerDownRight } from 'lucide-react';

interface AnalysisListTableProps {
  analyses: UnitAnalysis[];
  onSelect: (id: string) => void;
}

export const AnalysisListTable: React.FC<AnalysisListTableProps> = ({ analyses, onSelect }) => {
  
  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const calculateTotals = (analysis: UnitAnalysis) => {
    return analysis.items.reduce(
      (acc, item) => {
        acc.mat += item.materialUnitPrice * item.quantity;
        acc.lab += item.laborUnitPrice * item.quantity;
        acc.exp += item.expenseUnitPrice * item.quantity;
        return acc;
      },
      { mat: 0, lab: 0, exp: 0 }
    );
  };

  // Group analyses by category
  const groupedAnalyses = useMemo(() => {
    const groups: Record<string, UnitAnalysis[]> = {};
    
    // Sort analyses by name first for consistent order within groups
    const sortedAnalyses = [...analyses].sort((a, b) => a.name.localeCompare(b.name));

    sortedAnalyses.forEach(analysis => {
      const cat = analysis.category || '기타 (General)';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(analysis);
    });
    return groups;
  }, [analyses]);

  // Get sorted categories
  const categories = useMemo(() => Object.keys(groupedAnalyses).sort(), [groupedAnalyses]);

  const numberColClass = "px-3 py-2 text-right text-xs border-r border-slate-100";
  const headerColClass = "px-3 py-3 border-b border-r border-slate-200 text-xs uppercase font-semibold";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <FileText className="w-5 h-5 text-indigo-600" />
               일위대가 목록표 (Unit Price List)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
               작성된 일위대가의 단가 요약표입니다.
            </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-2 py-3 border-b border-r border-slate-200 text-xs uppercase w-12 text-center font-semibold">No</th>
              <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase min-w-[250px] font-semibold">공종명 (Item Name)</th>
              <th className="px-3 py-3 border-b border-r border-slate-200 text-xs uppercase w-40 font-semibold">규격 (Spec)</th>
              <th className="px-2 py-3 border-b border-r border-slate-200 text-xs uppercase w-16 text-center font-semibold">단위</th>
              
              <th className={`${headerColClass} w-28 text-blue-600 bg-blue-50/30 text-center`}>재료비</th>
              <th className={`${headerColClass} w-28 text-emerald-600 bg-emerald-50/30 text-center`}>노무비</th>
              <th className={`${headerColClass} w-28 text-amber-600 bg-amber-50/30 text-center`}>경비</th>
              
              <th className="px-3 py-3 border-b text-xs uppercase text-right font-bold text-slate-800 w-28 bg-slate-100/50 border-r border-slate-200">합계단가</th>
              <th className="px-2 py-3 border-b text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {analyses.length === 0 && (
                <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                        등록된 일위대가가 없습니다.
                    </td>
                </tr>
            )}
            
            {categories.map((category) => {
                const categoryItems = groupedAnalyses[category];
                
                return (
                    <React.Fragment key={category}>
                        {/* Category Header Row */}
                        <tr className="bg-slate-100 border-y border-slate-200">
                            <td className="px-2 py-2 text-center border-r border-slate-200">
                                <FolderOpen className="w-4 h-4 text-slate-400 mx-auto" />
                            </td>
                            <td colSpan={8} className="px-3 py-2 font-bold text-slate-800 text-sm">
                                {category}
                                <span className="ml-2 text-xs font-normal text-slate-500">({categoryItems.length}개 항목)</span>
                            </td>
                        </tr>

                        {/* Items */}
                        {categoryItems.map((analysis, index) => {
                            const totals = calculateTotals(analysis);
                            const grandTotal = totals.mat + totals.lab + totals.exp;

                            return (
                                <tr 
                                    key={analysis.id} 
                                    onClick={() => onSelect(analysis.id)}
                                    className="hover:bg-indigo-50 group transition-colors cursor-pointer border-b border-slate-50 last:border-none"
                                >
                                    <td className="px-2 py-2 text-center text-slate-400 text-xs border-r border-slate-100">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-slate-700 group-hover:text-indigo-700 border-r border-slate-100 pl-8 relative">
                                        <CornerDownRight className="w-3 h-3 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                        {analysis.name}
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 text-xs border-r border-slate-100">{analysis.specification}</td>
                                    <td className="px-2 py-2 text-center text-slate-600 text-sm border-r border-slate-100">{analysis.unit}</td>
                                    
                                    <td className={`${numberColClass} bg-blue-50/5 group-hover:bg-blue-50/20 text-slate-600`}>{formatNumber(totals.mat)}</td>
                                    <td className={`${numberColClass} bg-emerald-50/5 group-hover:bg-emerald-50/20 text-slate-600`}>{formatNumber(totals.lab)}</td>
                                    <td className={`${numberColClass} bg-amber-50/5 group-hover:bg-amber-50/20 text-slate-600`}>{formatNumber(totals.exp)}</td>
                                    
                                    <td className="px-3 py-2 text-right font-bold text-slate-900 bg-slate-50/30 group-hover:bg-indigo-50/30 border-r border-slate-200 text-sm">
                                        {formatNumber(grandTotal)}
                                    </td>
                                    
                                    <td className="px-2 py-2 text-center">
                                            <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all mx-auto" />
                                    </td>
                                </tr>
                            );
                        })}
                    </React.Fragment>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
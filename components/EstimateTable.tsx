import React, { useState, useRef, useMemo } from 'react';
import { Trash2, FolderPlus, FilePlus, FilePlus2, AlertCircle, ChevronDown, Search, GripVertical, RefreshCw } from 'lucide-react';
import { EstimateEntry, UnitAnalysis } from '../types';
import { CONSTRUCTION_CATEGORIES } from '../constants';

interface EstimateTableProps {
  items: EstimateEntry[];
  analyses: UnitAnalysis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddItem: (type: 'CATEGORY' | 'ITEM') => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof EstimateEntry, value: any) => void;
  onLinkAnalysis: (itemId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onImportAnalyses: () => void;
}

export const EstimateTable: React.FC<EstimateTableProps> = ({ 
  items, 
  analyses, 
  selectedId,
  onSelect,
  onAddItem, 
  onDeleteItem, 
  onUpdateItem,
  onLinkAnalysis,
  onReorder,
  onImportAnalyses
}) => {
  
  const [activeCategoryMenuId, setActiveCategoryMenuId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Helper to calculate cost for a single item
  const calculateItemCost = (item: EstimateEntry) => {
    if (item.type === 'ITEM' && item.analysisId) {
      const analysis = analyses.find(a => a.id === item.analysisId);
      if (analysis) {
        let matUnit = 0, labUnit = 0, expUnit = 0;
        analysis.items.forEach(i => {
          matUnit += i.materialUnitPrice * i.quantity;
          labUnit += i.laborUnitPrice * i.quantity;
          expUnit += i.expenseUnitPrice * i.quantity;
        });
        
        return {
           matUnit, labUnit, expUnit,
           matAmt: matUnit * item.quantity,
           labAmt: labUnit * item.quantity,
           expAmt: expUnit * item.quantity
        };
      }
    }
    return { matUnit: 0, labUnit: 0, expUnit: 0, matAmt: 0, labAmt: 0, expAmt: 0 };
  };

  // Calculate Category Subtotals and Grand Totals
  const { categorySubtotals, totals } = useMemo(() => {
      const sub: Record<string, { mat: number, lab: number, exp: number, total: number }> = {};
      const grand = { totalMat: 0, totalLab: 0, totalExp: 0, grandTotal: 0 };
      
      let currentCategoryId: string | null = null;

      items.forEach(item => {
          if (item.type === 'CATEGORY') {
              currentCategoryId = item.id;
              sub[currentCategoryId] = { mat: 0, lab: 0, exp: 0, total: 0 };
          } else if (item.type === 'ITEM') {
              const costs = calculateItemCost(item);
              
              // Add to Category Subtotal
              if (currentCategoryId && sub[currentCategoryId]) {
                  sub[currentCategoryId].mat += costs.matAmt;
                  sub[currentCategoryId].lab += costs.labAmt;
                  sub[currentCategoryId].exp += costs.expAmt;
                  sub[currentCategoryId].total += (costs.matAmt + costs.labAmt + costs.expAmt);
              }

              // Add to Grand Total
              grand.totalMat += costs.matAmt;
              grand.totalLab += costs.labAmt;
              grand.totalExp += costs.expAmt;
              grand.grandTotal += (costs.matAmt + costs.labAmt + costs.expAmt);
          }
      });

      return { categorySubtotals: sub, totals: grand };
  }, [items, analyses]);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCategorySelect = (e: React.MouseEvent, itemId: string, newName: string) => {
    e.stopPropagation();
    
    const isDuplicate = items.some(i => i.type === 'CATEGORY' && i.id !== itemId && i.name === newName);

    if (isDuplicate) {
        if (window.confirm(`'${newName}' 공종은 이미 존재합니다.\n현재 항목을 삭제하시겠습니까?`)) {
            onDeleteItem(itemId);
        }
    } else {
        onUpdateItem(itemId, 'name', newName);
    }
    setActiveCategoryMenuId(null);
  };

  // Common column classes
  const numberColClass = "w-[5.5rem] px-1 py-2 text-right text-xs";
  const headerColClass = "px-1 py-2 border-b text-xs uppercase text-center border-r border-slate-200";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-slate-800">공사 내역서 (Construction Estimate)</h2>
            <p className="text-sm text-slate-500 mt-1">
               공종을 추가하고 일위대가를 연결하여 상세 내역서를 작성하세요.
            </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onImportAnalyses}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors shadow-sm mr-2"
            title="현재 등록된 일위대가 목록을 기준으로 내역서를 자동 생성합니다."
          >
            <RefreshCw className="w-4 h-4" />
            일위대가 가져오기
          </button>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <button 
            onClick={() => onAddItem('CATEGORY')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            주요공종 추가
          </button>
          <button 
            onClick={() => onAddItem('ITEM')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            <FilePlus2 className="w-4 h-4" />
            세부공종 추가
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1" onDragOver={(e) => e.preventDefault()}>
        <table className="w-full text-sm text-left border-collapse min-w-[1100px]">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
            <tr>
              <th rowSpan={2} className="px-1 py-3 border-b text-xs uppercase w-8 text-center border-r border-slate-200"></th>
              <th rowSpan={2} className="px-1 py-3 border-b text-xs uppercase w-10 text-center border-r border-slate-200">No</th>
              <th rowSpan={2} className="px-3 py-3 border-b text-xs uppercase min-w-[200px] border-r border-slate-200">명칭 (Item Name)</th>
              <th rowSpan={2} className="px-2 py-3 border-b text-xs uppercase w-20 border-r border-slate-200">규격</th>
              <th rowSpan={2} className="px-1 py-3 border-b text-xs uppercase w-12 text-center border-r border-slate-200">단위</th>
              <th rowSpan={2} className="px-2 py-3 border-b text-xs uppercase w-16 text-right bg-yellow-50/50 border-r border-slate-200">수량</th>
              
              <th colSpan={2} className="px-2 py-2 border-b border-r border-slate-200 text-xs uppercase text-center text-blue-600 bg-blue-50/30">재료비 (Material)</th>
              <th colSpan={2} className="px-2 py-2 border-b border-r border-slate-200 text-xs uppercase text-center text-emerald-600 bg-emerald-50/30">노무비 (Labor)</th>
              <th colSpan={2} className="px-2 py-2 border-b border-r border-slate-200 text-xs uppercase text-center text-amber-600 bg-amber-50/30">경비 (Expense)</th>
              
              <th rowSpan={2} className="px-2 py-3 border-b text-xs uppercase w-24 text-right bg-slate-100/50 font-bold border-r border-slate-200">합계금액</th>
              <th rowSpan={2} className="px-1 py-3 border-b text-xs uppercase w-10"></th>
            </tr>
            <tr>
              {/* Material */}
              <th className={`${headerColClass} bg-blue-50/10 w-[5.5rem]`}>단가</th>
              <th className={`${headerColClass} bg-blue-50/10 w-[5.5rem]`}>금액</th>
              {/* Labor */}
              <th className={`${headerColClass} bg-emerald-50/10 w-[5.5rem]`}>단가</th>
              <th className={`${headerColClass} bg-emerald-50/10 w-[5.5rem]`}>금액</th>
              {/* Expense */}
              <th className={`${headerColClass} bg-amber-50/10 w-[5.5rem]`}>단가</th>
              <th className={`${headerColClass} bg-amber-50/10 w-[5.5rem]`}>금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={13} className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
                  <FilePlus className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-base font-medium">내역서 항목이 없습니다.</p>
                  <p className="text-sm mt-1">'일위대가 가져오기' 또는 '항목 추가' 버튼을 사용하세요.</p>
                </td>
              </tr>
            )}
            
            {items.map((item, index) => {
              const isCategory = item.type === 'CATEGORY';
              const isSelected = selectedId === item.id;
              
              // Calculate item costs
              const { matUnit, labUnit, expUnit, matAmt, labAmt, expAmt } = calculateItemCost(item);
              const totalAmt = matAmt + labAmt + expAmt;

              // Get Category Subtotals
              const catSubtotal = isCategory ? categorySubtotals[item.id] : null;

              // Visual feedback for drag over
              let dropStyle = {};
              if (dragOverIndex === index) {
                 const isDraggingDown = draggedIndex !== null && draggedIndex < index;
                 dropStyle = isDraggingDown 
                    ? { borderBottom: '2px solid #4f46e5' } 
                    : { borderTop: '2px solid #4f46e5' };
              }

              return (
                <tr 
                  key={item.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => onSelect(item.id)}
                  style={dropStyle}
                  className={`
                    ${isCategory ? 'bg-slate-100 font-bold' : ''} 
                    ${isSelected ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300' : 'hover:bg-slate-50'}
                    ${draggedIndex === index ? 'opacity-30' : 'opacity-100'}
                    border-b border-slate-50 transition-colors cursor-pointer group
                  `}
                >
                  {/* Drag Handle */}
                  <td className="px-1 py-2 text-center cursor-move border-r border-slate-100">
                     <GripVertical className={`w-3.5 h-3.5 mx-auto ${isSelected ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-500'}`} />
                  </td>

                  <td className="px-1 py-2 text-center text-slate-400 text-xs border-r border-slate-100">
                    {index + 1}
                  </td>
                  
                  {/* Name Input / Selector */}
                  <td className="px-3 py-2 border-r border-slate-100">
                    {isCategory ? (
                       <div className="relative">
                           <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => {
                               e.stopPropagation();
                               setActiveCategoryMenuId(activeCategoryMenuId === item.id ? null : item.id);
                           }}>
                             <FolderPlus className="w-4 h-4 text-slate-500 shrink-0" />
                             <input 
                              type="text" 
                              value={item.name} 
                              onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                              placeholder="공종명 선택 또는 입력"
                              className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-800 cursor-pointer placeholder:font-normal placeholder:text-slate-400"
                              autoComplete="off"
                            />
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                           </div>
                           
                           {activeCategoryMenuId === item.id && (
                            <>
                                <div className="fixed inset-0 z-30 cursor-default" onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryMenuId(null);
                                }} />
                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-40 max-h-60 overflow-y-auto py-1 animate-fadeIn">
                                    <div className="px-3 py-2 text-xs font-bold text-slate-400 bg-slate-50 border-b border-slate-100 sticky top-0">
                                        표준 공종 선택
                                    </div>
                                    {CONSTRUCTION_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.name}
                                            onClick={(e) => handleCategorySelect(e, item.id, cat.name)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm text-slate-700 border-b border-slate-50 last:border-none transition-colors"
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                           )}
                       </div>
                    ) : (
                        <div className="flex items-center gap-2 group/input pl-4">
                             {item.analysisId ? (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLinkAnalysis(item.id);
                                    }} 
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-left font-medium truncate flex-1 flex items-center gap-1"
                                    title="일위대가 변경"
                                >
                                    {item.name}
                                </button>
                             ) : (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLinkAnalysis(item.id);
                                    }}
                                    className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 border border-dashed border-slate-300 hover:border-indigo-400 rounded px-2 py-1 text-xs w-fit transition-colors whitespace-nowrap"
                                >
                                    <Search className="w-3 h-3" />
                                    선택
                                </button>
                             )}
                             {!item.analysisId && (
                                 <input 
                                    type="text" 
                                    value={item.name}
                                    onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                                    placeholder="직접 입력"
                                    className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 flex-1 min-w-[60px]"
                                />
                             )}
                        </div>
                    )}
                  </td>

                  {/* Specification */}
                  <td className="px-2 py-2 border-r border-slate-100">
                     <input 
                        type="text" 
                        value={item.specification} 
                        onChange={(e) => onUpdateItem(item.id, 'specification', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs text-slate-500"
                        readOnly={!!item.analysisId}
                     />
                  </td>

                  {/* Unit */}
                  <td className="px-1 py-2 text-center border-r border-slate-100">
                    <input 
                        type="text" 
                        value={item.unit} 
                        onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-center text-slate-600"
                        readOnly={!!item.analysisId}
                     />
                  </td>

                  {/* Quantity */}
                  <td className="px-2 py-2 border-r border-slate-100 bg-yellow-50/20">
                    <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-right font-semibold text-slate-800 text-sm"
                    />
                  </td>

                  {/* Material: Unit Price & Amount */}
                  <td className={`${numberColClass} bg-blue-50/5 border-r border-slate-100 text-slate-500`}>
                    {isCategory && catSubtotal 
                        ? (catSubtotal.mat > 0 ? formatNumber(catSubtotal.mat) : '-') 
                        : (!isCategory && matUnit > 0 ? formatNumber(matUnit) : '-')}
                  </td>
                  <td className={`${numberColClass} bg-blue-50/10 border-r border-slate-200 ${isCategory ? 'font-bold text-blue-800' : 'text-blue-700 font-medium'}`}>
                    {isCategory && catSubtotal 
                        ? (catSubtotal.mat * item.quantity > 0 ? formatNumber(catSubtotal.mat * item.quantity) : '-') 
                        : (matAmt > 0 ? formatNumber(matAmt) : '-')}
                  </td>

                  {/* Labor: Unit Price & Amount */}
                  <td className={`${numberColClass} bg-emerald-50/5 border-r border-slate-100 text-slate-500`}>
                    {isCategory && catSubtotal 
                        ? (catSubtotal.lab > 0 ? formatNumber(catSubtotal.lab) : '-') 
                        : (!isCategory && labUnit > 0 ? formatNumber(labUnit) : '-')}
                  </td>
                  <td className={`${numberColClass} bg-emerald-50/10 border-r border-slate-200 ${isCategory ? 'font-bold text-emerald-800' : 'text-emerald-700 font-medium'}`}>
                     {isCategory && catSubtotal 
                        ? (catSubtotal.lab * item.quantity > 0 ? formatNumber(catSubtotal.lab * item.quantity) : '-') 
                        : (labAmt > 0 ? formatNumber(labAmt) : '-')}
                  </td>

                  {/* Expense: Unit Price & Amount */}
                  <td className={`${numberColClass} bg-amber-50/5 border-r border-slate-100 text-slate-500`}>
                    {isCategory && catSubtotal 
                        ? (catSubtotal.exp > 0 ? formatNumber(catSubtotal.exp) : '-') 
                        : (!isCategory && expUnit > 0 ? formatNumber(expUnit) : '-')}
                  </td>
                  <td className={`${numberColClass} bg-amber-50/10 border-r border-slate-200 ${isCategory ? 'font-bold text-amber-800' : 'text-amber-700 font-medium'}`}>
                     {isCategory && catSubtotal 
                        ? (catSubtotal.exp * item.quantity > 0 ? formatNumber(catSubtotal.exp * item.quantity) : '-') 
                        : (expAmt > 0 ? formatNumber(expAmt) : '-')}
                  </td>

                  {/* Total Amount */}
                  <td className={`px-2 py-2 text-right border-r border-slate-200 text-xs ${isCategory ? 'bg-slate-200/50 font-extrabold text-slate-900' : 'bg-slate-50/50 font-bold text-slate-800'}`}>
                    {isCategory && catSubtotal 
                        ? (catSubtotal.total * item.quantity > 0 ? formatNumber(catSubtotal.total * item.quantity) : '-') 
                        : (totalAmt > 0 ? formatNumber(totalAmt) : '')}
                  </td>

                  {/* Action */}
                  <td className="px-1 py-2 text-center">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                        }} 
                        className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 sticky bottom-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-20 border-t-2 border-slate-300">
             <tr>
                <td colSpan={6} className="px-6 py-3 text-right font-bold text-slate-600 border-r border-slate-200 text-xs">
                    총 공사비 합계
                </td>
                <td colSpan={2} className="px-2 py-3 text-right font-bold text-blue-700 border-r border-slate-200 text-sm">
                    {formatNumber(totals.totalMat)}
                </td>
                <td colSpan={2} className="px-2 py-3 text-right font-bold text-emerald-700 border-r border-slate-200 text-sm">
                    {formatNumber(totals.totalLab)}
                </td>
                <td colSpan={2} className="px-2 py-3 text-right font-bold text-amber-700 border-r border-slate-200 text-sm">
                    {formatNumber(totals.totalExp)}
                </td>
                <td className="px-2 py-3 text-right font-bold text-indigo-700 text-base bg-indigo-50/50">
                    {formatNumber(totals.grandTotal)}
                </td>
                <td></td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
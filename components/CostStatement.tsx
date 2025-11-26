
import React, { useState, useMemo } from 'react';
import { EstimateEntry, UnitAnalysis } from '../types';
import { ScrollText, Calculator } from 'lucide-react';

interface CostStatementProps {
  items: EstimateEntry[];
  analyses: UnitAnalysis[];
}

export const CostStatement: React.FC<CostStatementProps> = ({ items, analyses }) => {
  
  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // 1. Calculate Direct Costs from Estimate (Matching Summary Sheet Logic)
  // This respects the hierarchy: Category Quantity * Sum(Item Cost * Item Quantity)
  const directCosts = useMemo(() => {
    let totalMat = 0, totalLab = 0, totalExp = 0;
    
    let currentCategory: EstimateEntry | null = null;
    let subtotal = { mat: 0, lab: 0, exp: 0 };

    const pushCategory = (catItem: EstimateEntry | null, sub: typeof subtotal) => {
       if (catItem) {
           const q = catItem.quantity || 1;
           totalMat += sub.mat * q;
           totalLab += sub.lab * q;
           totalExp += sub.exp * q;
       }
    };

    items.forEach(item => {
        if (item.type === 'CATEGORY') {
            // Flush previous category
            pushCategory(currentCategory, subtotal);
            
            // Start new category
            currentCategory = item;
            subtotal = { mat: 0, lab: 0, exp: 0 };

        } else if (item.type === 'ITEM' && item.analysisId) {
             const analysis = analyses.find(a => a.id === item.analysisId);
             if (analysis) {
                let m = 0, l = 0, e = 0;
                analysis.items.forEach(i => {
                    m += i.materialUnitPrice * i.quantity;
                    l += i.laborUnitPrice * i.quantity;
                    e += i.expenseUnitPrice * i.quantity;
                });
                
                // Item cost = Unit Price * Item Quantity
                const q = item.quantity || 0;
                subtotal.mat += m * q;
                subtotal.lab += l * q;
                subtotal.exp += e * q;
             }
        }
    });
    
    // Flush last category
    pushCategory(currentCategory, subtotal);

    return { mat: totalMat, lab: totalLab, exp: totalExp };
  }, [items, analyses]);

  // 2. State for Rates (Default rates approx for 2025)
  const [rates, setRates] = useState({
    indirectLabor: 14.5, // 간접노무비
    employmentIns: 1.15, // 고용보험료
    healthIns: 3.545,    // 건강보험료
    pension: 4.5,        // 국민연금보험료
    seniorCare: 12.95,   // 노인장기요양보험료 (of Health)
    safetyMgmt: 1.81,    // 산업안전보건관리비
    otherExpense: 5.5,   // 기타경비
    genAdmin: 5.0,       // 일반관리비
    profit: 10.0,        // 이윤
    vat: 10.0            // 부가가치세
  });

  const handleRateChange = (key: keyof typeof rates, value: string) => {
    setRates(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // 3. Calculate Derived Costs
  const indirectLabor = Math.floor(directCosts.lab * (rates.indirectLabor / 100));
  const totalLabor = directCosts.lab + indirectLabor;

  const employmentIns = Math.floor(directCosts.lab * (rates.employmentIns / 100));
  const healthIns = Math.floor(directCosts.lab * (rates.healthIns / 100));
  const pension = Math.floor(directCosts.lab * (rates.pension / 100));
  const seniorCare = Math.floor(healthIns * (rates.seniorCare / 100));
  
  // Safety Mgmt is typically % of (Direct Material + Direct Labor)
  const safetyBase = directCosts.mat + directCosts.lab;
  const safetyMgmt = Math.floor(safetyBase * (rates.safetyMgmt / 100));

  // Other Expense is typically % of (Material + Labor)
  const otherExpense = Math.floor((directCosts.mat + totalLabor) * (rates.otherExpense / 100));

  const totalExpense = directCosts.exp + employmentIns + healthIns + pension + seniorCare + safetyMgmt + otherExpense;
  
  const pureCost = directCosts.mat + totalLabor + totalExpense;

  const genAdmin = Math.floor(pureCost * (rates.genAdmin / 100));
  
  const costSum = pureCost + genAdmin;

  // Profit is typically % of (Labor + Expense + GenAdmin) - Excluding Material
  const profitBase = totalLabor + totalExpense + genAdmin;
  const profit = Math.floor(profitBase * (rates.profit / 100));

  const supplyPrice = costSum + profit;
  const vat = Math.floor(supplyPrice * (rates.vat / 100));
  const finalTotal = supplyPrice + vat;

  const renderRow = (title: string, formula: string, rateValue: number | null, amount: number, indent: number = 0, isBold: boolean = false, rateKey?: keyof typeof rates, rateSuffix: string = '%') => (
    <tr className={`hover:bg-slate-50 border-b border-slate-100 ${isBold ? 'bg-slate-50/50' : ''}`}>
      <td className={`px-4 py-3 text-slate-700 ${isBold ? 'font-bold' : ''} border-r border-slate-200`} style={{ paddingLeft: `${indent * 20 + 16}px` }}>
        {title}
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs border-r border-slate-200">
        {formula}
      </td>
      <td className="px-4 py-3 text-right border-r border-slate-200">
        {rateKey ? (
            <div className="flex items-center justify-end gap-1">
                <input 
                    type="number" 
                    value={rateValue || 0}
                    onChange={(e) => handleRateChange(rateKey, e.target.value)}
                    className="w-16 text-right bg-indigo-50/50 border border-indigo-100 focus:border-indigo-500 rounded px-1 py-0.5 text-sm font-medium text-indigo-700"
                    step="0.001"
                />
                <span className="text-slate-400 text-xs">{rateSuffix}</span>
            </div>
        ) : (
            rateValue !== null && <span className="text-slate-600 text-sm">{rateValue}{rateSuffix}</span>
        )}
      </td>
      <td className={`px-4 py-3 text-right border-r border-slate-200 ${isBold ? 'font-bold text-slate-900' : 'text-slate-700 font-medium'}`}>
        {formatNumber(amount)}
      </td>
      <td className="px-4 py-3 text-slate-400 text-xs">
          {/* Remarks */}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full gap-4 min-w-[1000px]">
      <div className="flex gap-4 h-full">
          {/* Main Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-800">공사 원가계산서 (Cost Calculation Sheet)</h2>
               </div>
               <div className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                   ※ 요율은 현장 상황 및 법규에 따라 수정하여 사용하세요. (2025년 기준 예시)
               </div>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 border-b border-r border-slate-200 w-[30%] text-center uppercase font-semibold">비목 (Item)</th>
                            <th className="px-4 py-3 border-b border-r border-slate-200 w-[25%] text-center uppercase font-semibold">산출식 (Formula)</th>
                            <th className="px-4 py-3 border-b border-r border-slate-200 w-[15%] text-center uppercase font-semibold">요율 (Rate)</th>
                            <th className="px-4 py-3 border-b border-r border-slate-200 w-[20%] text-center uppercase font-semibold">금액 (Amount)</th>
                            <th className="px-4 py-3 border-b text-center uppercase font-semibold">비고</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Material */}
                        {renderRow('1. 재료비', '직접재료비', null, directCosts.mat, 0, true)}
                        {renderRow('직접재료비', '공사집계표 합계', null, directCosts.mat, 1)}
                        
                        {/* Labor */}
                        {renderRow('2. 노무비', '직접노무비 + 간접노무비', null, totalLabor, 0, true)}
                        {renderRow('직접노무비', '공사집계표 합계', null, directCosts.lab, 1)}
                        {renderRow('간접노무비', '직접노무비 × 요율', rates.indirectLabor, indirectLabor, 1, false, 'indirectLabor')}

                        {/* Expense */}
                        {renderRow('3. 경비', '직접경비 + 산출경비', null, totalExpense, 0, true)}
                        {renderRow('산출경비 (기계경비 등)', '공사집계표 합계', null, directCosts.exp, 1)}
                        {renderRow('고용보험료', '직접노무비 × 요율', rates.employmentIns, employmentIns, 1, false, 'employmentIns')}
                        {renderRow('국민건강보험료', '직접노무비 × 요율', rates.healthIns, healthIns, 1, false, 'healthIns')}
                        {renderRow('국민연금보험료', '직접노무비 × 요율', rates.pension, pension, 1, false, 'pension')}
                        {renderRow('노인장기요양보험료', '건강보험료 × 요율', rates.seniorCare, seniorCare, 1, false, 'seniorCare')}
                        {renderRow('산업안전보건관리비', '(재료비+직노비) × 요율', rates.safetyMgmt, safetyMgmt, 1, false, 'safetyMgmt')}
                        {renderRow('기타경비', '(재료비+노무비) × 요율', rates.otherExpense, otherExpense, 1, false, 'otherExpense')}

                        {/* Pure Cost */}
                        <tr className="bg-slate-100/80 font-bold border-y border-slate-300">
                            <td className="px-4 py-3 text-slate-800 border-r border-slate-200">4. 순공사원가 (계)</td>
                            <td className="px-4 py-3 text-slate-500 text-xs border-r border-slate-200">재료비 + 노무비 + 경비</td>
                            <td className="px-4 py-3 border-r border-slate-200"></td>
                            <td className="px-4 py-3 text-right text-indigo-900 text-base border-r border-slate-200">{formatNumber(pureCost)}</td>
                            <td></td>
                        </tr>

                        {renderRow('5. 일반관리비', '순공사원가 × 요율', rates.genAdmin, genAdmin, 0, false, 'genAdmin')}
                        
                        <tr className="bg-slate-50 font-semibold border-b border-slate-200">
                            <td className="px-4 py-3 text-slate-800 border-r border-slate-200">6. 총 원가</td>
                            <td className="px-4 py-3 text-slate-500 text-xs border-r border-slate-200">순공사원가 + 일반관리비</td>
                            <td className="px-4 py-3 border-r border-slate-200"></td>
                            <td className="px-4 py-3 text-right text-slate-800 border-r border-slate-200">{formatNumber(costSum)}</td>
                            <td></td>
                        </tr>

                        {renderRow('7. 이윤', '(노+경+일) × 요율', rates.profit, profit, 0, false, 'profit')}

                        <tr className="bg-slate-50 font-semibold border-b border-slate-200">
                            <td className="px-4 py-3 text-slate-800 border-r border-slate-200">8. 공급가액</td>
                            <td className="px-4 py-3 text-slate-500 text-xs border-r border-slate-200">총 원가 + 이윤</td>
                            <td className="px-4 py-3 border-r border-slate-200"></td>
                            <td className="px-4 py-3 text-right text-slate-800 border-r border-slate-200">{formatNumber(supplyPrice)}</td>
                            <td></td>
                        </tr>

                        {renderRow('9. 부가가치세', '공급가액 × 10%', rates.vat, vat, 0, false, 'vat')}
                    </tbody>
                    <tfoot className="bg-indigo-600 text-white sticky bottom-0 shadow-inner">
                        <tr>
                            <td className="px-4 py-4 font-bold text-lg border-r border-indigo-500">10. 총 공사비 (도급액)</td>
                            <td className="px-4 py-4 text-indigo-200 text-sm border-r border-indigo-500">공급가액 + 부가가치세</td>
                            <td className="px-4 py-4 border-r border-indigo-500"></td>
                            <td className="px-4 py-4 text-right font-bold text-xl border-r border-indigo-500">{formatNumber(finalTotal)}</td>
                            <td className="px-4 py-4 text-indigo-200 text-xs text-center">천원단위 절사 가능</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
          </div>
          
          {/* Sidebar Summary */}
          <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col shrink-0">
             <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <Calculator className="w-6 h-6" />
                <span className="font-bold text-lg">금액 요약</span>
             </div>

             <div className="space-y-6 flex-1">
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">순공사원가</div>
                    <div className="text-2xl font-bold text-slate-800">{formatNumber(pureCost)} 원</div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">일반관리비 및 이윤</div>
                    <div className="text-xl font-medium text-slate-700">{formatNumber(genAdmin + profit)} 원</div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">부가가치세 (VAT)</div>
                    <div className="text-xl font-medium text-slate-700">{formatNumber(vat)} 원</div>
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-bold mb-2 text-right">최종 도급 공사비</div>
                <div className="text-3xl font-bold text-indigo-600 text-right">{formatNumber(finalTotal)} 원</div>
             </div>
          </div>
      </div>
    </div>
  );
};

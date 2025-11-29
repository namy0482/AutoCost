import React, { useMemo } from 'react';
import { EstimateEntry, UnitAnalysis } from '../types';
import { ClipboardList, PieChart as PieChartIcon, Calculator } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../constants';

interface SummarySheetProps {
  items: EstimateEntry[];
  analyses: UnitAnalysis[];
}

export const SummarySheet: React.FC<SummarySheetProps> = ({ items, analyses }) => {
  
  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Logic to aggregate costs by Category
  const summaryData = useMemo(() => {
    const categories: { 
      id: string; name: string; quantity: number;
      mat: number; lab: number; exp: number; total: number;
    }[] = [];

    let currentCategory: EstimateEntry | null = null;
    let subtotal = { mat: 0, lab: 0, exp: 0 };

    const pushCategory = (catItem: EstimateEntry | null, sub: typeof subtotal) => {
       if (catItem) {
           const q = catItem.quantity || 1;
           const matTotal = sub.mat * q;
           const labTotal = sub.lab * q;
           const expTotal = sub.exp * q;
           const total = matTotal + labTotal + expTotal;

           if (total > 0 || catItem.name) {
               categories.push({
                   id: catItem.id, name: catItem.name, quantity: q,
                   mat: matTotal, lab: labTotal, exp: expTotal, total: total
               });
           }
       }
    };

    items.forEach(item => {
        if (item.type === 'CATEGORY') {
            if (currentCategory) pushCategory(currentCategory, subtotal);
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
                const q = item.quantity || 0;
                subtotal.mat += m * q;
                subtotal.lab += l * q;
                subtotal.exp += e * q;
            }
        }
    });
    if (currentCategory) pushCategory(currentCategory, subtotal);

    return categories;
  }, [items, analyses]);

  const grandTotal = useMemo(() => 
     summaryData.reduce((acc, curr) => ({
         mat: acc.mat + curr.mat,
         lab: acc.lab + curr.lab,
         exp: acc.exp + curr.exp,
         total: acc.total + curr.total
     }), { mat: 0, lab: 0, exp: 0, total: 0 })
  , [summaryData]);

  // Chart Data
  const pieData = [
      { name: '재료비', value: grandTotal.mat, fill: COLORS.material },
      { name: '노무비', value: grandTotal.lab, fill: COLORS.labor },
      { name: '경비', value: grandTotal.exp, fill: COLORS.expense },
  ].filter(d => d.value > 0);

  return (
    <div className="flex h-full gap-4 min-w-[1000px]">
      
      {/* Left: Main Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
             <ClipboardList className="w-5 h-5 text-indigo-600" />
             <h2 className="font-bold text-slate-800">공사 집계표 (Construction Summary)</h2>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="px-4 py-3 border-b border-r border-slate-200 w-12 text-center text-xs uppercase">No</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase">공종명 (Category)</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right text-blue-600 w-32 bg-blue-50/10">재료비</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right text-emerald-600 w-32 bg-emerald-50/10">노무비</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right text-amber-600 w-32 bg-amber-50/10">경비</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right font-bold text-slate-800 w-40 bg-slate-100/50">합계</th>
                          <th className="px-4 py-3 border-b text-xs uppercase text-center w-20">비율</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {summaryData.length === 0 ? (
                          <tr>
                              <td colSpan={7} className="py-20 text-center text-slate-400">
                                  작성된 내역이 없습니다.
                              </td>
                          </tr>
                      ) : (
                          summaryData.map((item, index) => {
                              const ratio = grandTotal.total > 0 ? (item.total / grandTotal.total) * 100 : 0;
                              return (
                                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-100">{index + 1}</td>
                                      <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-100">{item.name}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatNumber(item.mat)}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatNumber(item.lab)}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatNumber(item.exp)}</td>
                                      <td className="px-4 py-3 text-right font-bold text-indigo-700 bg-indigo-50/5 border-r border-slate-100">{formatNumber(item.total)}</td>
                                      <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                          {ratio.toFixed(1)}%
                                      </td>
                                  </tr>
                              );
                          })
                      )}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold text-slate-700 border-t-2 border-slate-300 sticky bottom-0 shadow-inner">
                      <tr>
                          <td colSpan={2} className="px-4 py-4 text-center border-r border-slate-200">총 계 (Grand Total)</td>
                          <td className="px-4 py-4 text-right text-blue-700 border-r border-slate-200">{formatNumber(grandTotal.mat)}</td>
                          <td className="px-4 py-4 text-right text-emerald-700 border-r border-slate-200">{formatNumber(grandTotal.lab)}</td>
                          <td className="px-4 py-4 text-right text-amber-700 border-r border-slate-200">{formatNumber(grandTotal.exp)}</td>
                          <td className="px-4 py-4 text-right text-indigo-800 text-lg bg-indigo-50/50 border-r border-slate-200">{formatNumber(grandTotal.total)}</td>
                          <td className="px-4 py-4 text-center text-slate-500">100%</td>
                      </tr>
                  </tfoot>
              </table>
          </div>
      </div>

      {/* Right: Summary Info Panel */}
      <aside className="w-80 flex flex-col gap-4 shrink-0">
         
         {/* Total Cost Box */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
             <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <Calculator className="w-5 h-5" />
                <span className="font-bold">총 공사비 요약</span>
             </div>
             <div className="text-right">
                 <div className="text-xs text-slate-500 uppercase font-bold mb-1">Grand Total</div>
                 <div className="text-3xl font-black text-slate-800">{formatNumber(grandTotal.total)} <span className="text-sm font-medium text-slate-400">원</span></div>
             </div>
             <div className="w-full h-px bg-slate-100 my-4"></div>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>재료비</span>
                    <span className="font-bold text-slate-700">{formatNumber(grandTotal.mat)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>노무비</span>
                    <span className="font-bold text-slate-700">{formatNumber(grandTotal.lab)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>경비</span>
                    <span className="font-bold text-slate-700">{formatNumber(grandTotal.exp)}</span>
                </div>
             </div>
         </div>

         {/* Chart Box */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1 flex flex-col min-h-[300px]">
             <div className="flex items-center gap-2 mb-2 text-slate-500">
                <PieChartIcon className="w-4 h-4" />
                <span className="font-bold text-xs uppercase">Cost Composition</span>
             </div>
             <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatNumber(value)} />
                        <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '11px'}} />
                    </PieChart>
                </ResponsiveContainer>
             </div>
         </div>

      </aside>
    </div>
  );
};
import React, { useMemo } from 'react';
import { EstimateEntry, UnitAnalysis } from '../types';
import { ClipboardList, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { COLORS } from '../constants';

interface SummarySheetProps {
  items: EstimateEntry[];
  analyses: UnitAnalysis[];
}

export const SummarySheet: React.FC<SummarySheetProps> = ({ items, analyses }) => {
  
  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Logic to aggregate costs by Category from the Estimate items
  const summaryData = useMemo(() => {
    const categories: { 
      id: string;
      name: string; 
      quantity: number;
      mat: number; 
      lab: number; 
      exp: number; 
      total: number;
    }[] = [];

    let currentCategory: EstimateEntry | null = null;
    let subtotal = { mat: 0, lab: 0, exp: 0 };

    // Helper to finalize a category block and push to array
    const pushCategory = (catItem: EstimateEntry | null, sub: typeof subtotal) => {
       if (catItem) {
           // Total Cost = (Sum of Sub Items) * (Category Quantity)
           // Usually Category Quantity is 1, but we support other values
           const q = catItem.quantity || 1;
           const matTotal = sub.mat * q;
           const labTotal = sub.lab * q;
           const expTotal = sub.exp * q;
           const total = matTotal + labTotal + expTotal;

           // Include if it has value or explicitly named
           if (total > 0 || catItem.name) {
               categories.push({
                   id: catItem.id,
                   name: catItem.name,
                   quantity: q,
                   mat: matTotal,
                   lab: labTotal,
                   exp: expTotal,
                   total: total
               });
           }
       }
    };

    items.forEach(item => {
        if (item.type === 'CATEGORY') {
            // If we were processing a previous category, push it now
            if (currentCategory) {
                pushCategory(currentCategory, subtotal);
            }
            
            // Start tracking new category
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
                
                // Add item total to subtotal bucket (Item Cost * Item Quantity)
                const q = item.quantity || 0;
                subtotal.mat += m * q;
                subtotal.lab += l * q;
                subtotal.exp += e * q;
            }
        }
    });
    
    // Push the very last category
    if (currentCategory) {
        pushCategory(currentCategory, subtotal);
    }

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
    <div className="flex flex-col h-full gap-4 min-w-[1100px]">
      {/* Top Cards & Charts */}
      <div className="flex gap-4 h-72 shrink-0">
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center w-1/4 min-w-[300px]">
             <h3 className="text-slate-500 font-bold uppercase text-xs mb-6">총 공사비 (Grand Total)</h3>
             <div className="text-3xl font-bold text-indigo-700 mb-1">
                {formatNumber(grandTotal.total)} <span className="text-base font-medium text-slate-400">원</span>
             </div>
             <div className="w-full h-px bg-slate-100 my-6"></div>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>재료비</span>
                    <span className="font-medium text-slate-800">{formatNumber(grandTotal.mat)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>노무비</span>
                    <span className="font-medium text-slate-800">{formatNumber(grandTotal.lab)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>경비</span>
                    <span className="font-medium text-slate-800">{formatNumber(grandTotal.exp)}</span>
                </div>
             </div>
          </div>

          {/* Charts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-1 flex gap-4">
             <div className="flex-1 relative flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2 uppercase">
                    <PieChartIcon className="w-3.5 h-3.5" /> 공사비 구성 비율
                </h4>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatNumber(value)} />
                            <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{fontSize: '12px'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
             </div>
             <div className="w-px bg-slate-100 my-4"></div>
             <div className="flex-[2] relative flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2 uppercase">
                    <BarChart3 className="w-3.5 h-3.5" /> 공종별 금액 현황 (Top 10)
                </h4>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={summaryData.sort((a,b) => b.total - a.total).slice(0, 10)} 
                            layout="vertical" 
                            margin={{ left: 50, right: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                formatter={(value: number) => formatNumber(value)} 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                            <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
          </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
             <ClipboardList className="w-5 h-5 text-indigo-600" />
             <h2 className="font-bold text-slate-800">공사 집계표 (Construction Summary)</h2>
          </div>
          
          <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="px-4 py-3 border-b border-r border-slate-200 w-16 text-center text-xs uppercase">No</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase">공종명 (Category)</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right text-blue-600 w-40 bg-blue-50/10">재료비</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right text-emerald-600 w-40 bg-emerald-50/10">노무비</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right text-amber-600 w-40 bg-amber-50/10">경비</th>
                          <th className="px-4 py-3 border-b border-r border-slate-200 text-xs uppercase text-right font-bold text-slate-800 w-48 bg-slate-100/50">합계</th>
                          <th className="px-4 py-3 border-b text-xs uppercase text-center w-32">비율(%)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {summaryData.length === 0 ? (
                          <tr>
                              <td colSpan={7} className="py-20 text-center text-slate-400">
                                  작성된 내역이 없습니다. 공사내역서를 먼저 작성해주세요.
                              </td>
                          </tr>
                      ) : (
                          summaryData.map((item, index) => {
                              const ratio = grandTotal.total > 0 ? (item.total / grandTotal.total) * 100 : 0;
                              return (
                                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-100">{index + 1}</td>
                                      <td className="px-4 py-3 font-bold text-slate-700 border-r border-slate-100">{item.name}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatNumber(item.mat)}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatNumber(item.lab)}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatNumber(item.exp)}</td>
                                      <td className="px-4 py-3 text-right font-bold text-indigo-700 bg-indigo-50/5 border-r border-slate-100">{formatNumber(item.total)}</td>
                                      <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                          <div className="flex items-center gap-2 w-full">
                                              <span className="w-10 text-right">{ratio.toFixed(1)}%</span>
                                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-indigo-500" style={{ width: `${ratio}%` }}></div>
                                              </div>
                                          </div>
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
    </div>
  );
};
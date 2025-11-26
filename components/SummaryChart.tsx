import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostSummary, ChartDataPoint } from '../types';
import { COLORS } from '../constants';

interface SummaryChartProps {
  summary: CostSummary;
}

export const SummaryChart: React.FC<SummaryChartProps> = ({ summary }) => {
  const data: ChartDataPoint[] = [
    { name: '재료비', value: summary.totalMaterial, fill: COLORS.material },
    { name: '노무비', value: summary.totalLabor, fill: COLORS.labor },
    { name: '경비', value: summary.totalExpense, fill: COLORS.expense },
  ];

  // Filter out zero values for cleaner chart
  const activeData = data.filter(d => d.value > 0);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-1">단가 분석 (Unit Price Analysis)</h3>
      <p className="text-xs text-slate-500 mb-6">단위(1 Unit)당 구성 비율</p>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
         <div className="flex justify-between items-center text-sm group">
            <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>재료비</span>
            <span className="font-medium group-hover:text-blue-600 transition-colors">{formatCurrency(summary.totalMaterial)}</span>
         </div>
         <div className="flex justify-between items-center text-sm group">
            <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>노무비</span>
            <span className="font-medium group-hover:text-emerald-600 transition-colors">{formatCurrency(summary.totalLabor)}</span>
         </div>
         <div className="flex justify-between items-center text-sm group">
            <span className="flex items-center gap-2 text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>경비</span>
            <span className="font-medium group-hover:text-amber-600 transition-colors">{formatCurrency(summary.totalExpense)}</span>
         </div>
         <div className="border-t border-slate-200 pt-3 mt-2 flex justify-between items-center">
            <span className="font-bold text-slate-900">합계 단가</span>
            <span className="font-bold text-indigo-600 text-lg">{formatCurrency(summary.unitPrice)}</span>
         </div>
      </div>
    </div>
  );
};
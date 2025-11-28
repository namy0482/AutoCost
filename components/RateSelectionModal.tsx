
import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { COST_MARKET_RATES } from '../constants';

interface RateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateKey: string;
  onSelect: (value: number) => void;
}

export const RateSelectionModal: React.FC<RateSelectionModalProps> = ({
  isOpen,
  onClose,
  rateKey,
  onSelect
}) => {
  const rateData = COST_MARKET_RATES[rateKey];

  if (!isOpen || !rateData) return null;

  // Helper to extract number from string (e.g., "14.5%" -> 14.5)
  const extractRate = (str: string) => {
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const handleRowClick = (cellValue: string) => {
    const rate = extractRate(cellValue);
    if (rate > 0) {
      onSelect(rate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-indigo-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {rateData.title}
          </h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="mb-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            ※ 아래 표에서 해당되는 항목의 요율을 클릭하면 적용됩니다.
          </div>

          <table className="w-full text-sm text-left border-collapse border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                    {rateData.headers.map((header, idx) => (
                        <th key={idx} className="px-4 py-3 border border-slate-200 text-center">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rateData.data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-indigo-50/50 transition-colors">
                        {row.map((cell, colIdx) => {
                            const isRateCell = cell.includes('%');
                            return (
                                <td 
                                    key={colIdx} 
                                    className={`px-4 py-3 border border-slate-200 ${colIdx === 0 ? 'font-medium text-slate-900 bg-slate-50' : 'text-center cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 font-bold text-slate-600'}`}
                                    onClick={() => colIdx > 0 && handleRowClick(cell)}
                                >
                                    {cell}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

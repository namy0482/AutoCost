
import React, { useState, useEffect } from 'react';
import { X, Calculator, Save, RotateCcw, Check } from 'lucide-react';

interface QuantityCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (quantity: number, formula: string) => void;
  initialFormula: string;
  initialQuantity: number;
  itemName: string;
}

export const QuantityCalculatorModal: React.FC<QuantityCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFormula,
  initialQuantity,
  itemName
}) => {
  const [formula, setFormula] = useState('');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormula(initialFormula || (initialQuantity ? initialQuantity.toString() : ''));
      setCalculatedValue(initialQuantity);
    }
  }, [isOpen, initialFormula, initialQuantity]);

  useEffect(() => {
    if (!formula.trim()) {
      setCalculatedValue(0);
      return;
    }

    try {
      if (/[^0-9+\-*/().\s]/.test(formula)) {
        throw new Error("Invalid");
      }
      const result = new Function('return ' + formula)();
      if (typeof result === 'number' && isFinite(result)) {
        setCalculatedValue(result);
      } else {
        setCalculatedValue(null);
      }
    } catch (e) {
      setCalculatedValue(null);
    }
  }, [formula]);

  const handleApply = () => {
    if (calculatedValue !== null) {
      const finalQty = Math.round(calculatedValue * 1000) / 1000;
      onApply(finalQty, formula);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-200" />
            수량 산출 (Quantity Calc)
          </h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">대상 항목</label>
            <div className="text-slate-800 font-bold truncate">{itemName || "공종 없음"}</div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">산출식 (Formula)</label>
                <button onClick={() => setFormula('')} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> 초기화
                </button>
            </div>
            <textarea 
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full p-4 bg-white border border-slate-300 rounded-xl text-lg font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-32 shadow-sm"
                placeholder="예: (5.5 * 3) + 2"
                autoFocus
            />
            <p className="text-xs text-slate-400 mt-2 text-right">
                사용 가능: 숫자, +, -, *, /, ( )
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">결과값 (Result)</label>
            <div className={`w-full p-4 rounded-xl text-2xl font-bold text-right flex items-center justify-end gap-2 ${calculatedValue !== null ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-red-50 text-red-400 border border-red-100'}`}>
                {calculatedValue !== null ? (
                    <>
                        {calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                        <Check className="w-5 h-5 text-indigo-400" />
                    </>
                ) : (
                    <span className="text-sm font-normal">수식 오류</span>
                )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-100 transition-colors">취소</button>
            <button 
                onClick={handleApply}
                disabled={calculatedValue === null}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <Save className="w-4 h-4" />
                적용하기
            </button>
        </div>
      </div>
    </div>
  );
};

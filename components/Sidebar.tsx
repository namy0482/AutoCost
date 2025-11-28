import React, { useRef } from 'react';
import { PlusCircle, ChevronRight, Search, FileSpreadsheet, Upload } from 'lucide-react';
import { UnitAnalysis } from '../types';

interface SidebarProps {
  analyses: UnitAnalysis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
  onExportExcel: () => void;
  onImportExcel: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  analyses, 
  selectedId, 
  onSelect, 
  onAddNew, 
  onDelete,
  onExportExcel,
  onImportExcel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcel(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) e.target.value = '';
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Top Section: Excel Export & Import & New Item */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                title="Excel로 내보내기"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Excel 저장
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
                title="Excel 불러오기"
            >
                <Upload className="w-4 h-4" />
                Excel 열기
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                className="hidden" 
            />
        </div>
        
        <div className="w-full h-px bg-slate-200 my-2"></div>

        <button 
          onClick={onAddNew}
          className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          새 일위대가 만들기
        </button>
      </div>

      <div className="p-3 pb-0">
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="공종 검색..." 
            className="w-full bg-slate-50 border-none rounded-lg py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex justify-between items-center px-2 mb-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">세부 항목 (Details)</div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{analyses.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-4 custom-scrollbar">
        {analyses.map((analysis) => (
          <button
            key={analysis.id}
            onClick={() => onSelect(analysis.id)}
            className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all ${
              selectedId === analysis.id 
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{analysis.name}</div>
              <div className="text-xs opacity-70 mt-0.5 truncate">{analysis.specification}</div>
            </div>
            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedId === analysis.id ? 'text-indigo-500 translate-x-0.5' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      
      <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        AutoCost v1.0
      </div>
    </div>
  );
};
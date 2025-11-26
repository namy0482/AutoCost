import React from 'react';
import { PlusCircle, ChevronRight, Search } from 'lucide-react';
import { UnitAnalysis } from '../types';

interface SidebarProps {
  analyses: UnitAnalysis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ analyses, selectedId, onSelect, onAddNew, onDelete }) => {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-100 space-y-2">
        <button 
          onClick={onAddNew}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
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
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">세부 항목 (Details)</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-4">
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
      
      <div className="p-4 border-t border-slate-100 text-xs text-center text-slate-400">
        {analyses.length}개의 항목이 있습니다.
      </div>
    </div>
  );
};
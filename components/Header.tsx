
import React from 'react';
import { HardHat, Download, Sparkles, List, Table, BookOpen, Calculator, ClipboardList, ScrollText, FileText } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  onOpenAIModal: () => void;
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAIModal, currentView, onViewChange }) => {
  
  const getButtonClass = (mode: ViewMode) => {
    const baseClass = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border";
    if (currentView === mode) {
      return `${baseClass} bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200 shadow-sm z-10`;
    }
    return `${baseClass} bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900`;
  };

  const Separator = () => <div className="w-px h-3 bg-slate-300 mx-0.5"></div>;

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <HardHat className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">AutoCost</h1>
          <span className="text-xs text-slate-500">스마트 건축공사 내역서</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* View Navigation */}
        <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 mr-2">
            <button 
              onClick={() => onViewChange('OVERVIEW')}
              className={getButtonClass('OVERVIEW')}
            >
              <FileText className="w-4 h-4" />
              공사개요
            </button>

            <Separator />

            <button 
              onClick={() => onViewChange('COST_STATEMENT')}
              className={getButtonClass('COST_STATEMENT')}
            >
              <ScrollText className="w-4 h-4" />
              원가계산서
            </button>
            
            <Separator />
            
            <button 
              onClick={() => onViewChange('SUMMARY_SHEET')}
              className={getButtonClass('SUMMARY_SHEET')}
            >
              <ClipboardList className="w-4 h-4" />
              공사집계표
            </button>
            
            <Separator />

            <button 
              onClick={() => onViewChange('ESTIMATE')}
              className={getButtonClass('ESTIMATE')}
            >
              <Calculator className="w-4 h-4" />
              공사내역서
            </button>
            
            <Separator />

            <button 
              onClick={() => onViewChange('LIST')}
              className={getButtonClass('LIST')}
            >
              <List className="w-4 h-4" />
              일위대가 목록표
            </button>
            
            <Separator />

            <button 
              onClick={() => onViewChange('ANALYSIS')}
              className={getButtonClass('ANALYSIS')}
            >
              <Table className="w-4 h-4" />
              일위대가표
            </button>
            
            <Separator />

            <button 
              onClick={() => onViewChange('SOURCE')}
              className={getButtonClass('SOURCE')}
            >
              <BookOpen className="w-4 h-4" />
              단가산출 근거
            </button>
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2">
            <button 
            onClick={onOpenAIModal}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
            <Sparkles className="w-4 h-4" />
            AI 자동 산출
            </button>
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:bg-slate-50">
            <Download className="w-4 h-4" />
            </button>
        </div>
      </div>
    </header>
  );
};

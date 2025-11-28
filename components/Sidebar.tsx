import React, { useRef } from 'react';
import { PlusCircle, ChevronRight, Search, FileSpreadsheet, Upload, Mail, Globe, MapPin, Phone, Smartphone } from 'lucide-react';
import { UnitAnalysis } from '../types';

interface SidebarProps {
  analyses: UnitAnalysis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
  onExportExcel: () => void;
  onImportExcel?: (file: File) => void; // Optional to prevent crash if not passed yet
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
    if (onImportExcel && e.target.files && e.target.files[0]) {
      onImportExcel(e.target.files[0]);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-30 shadow-lg relative">
      
      {/* 1. Top Actions */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/80 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-md hover:-translate-y-0.5"
                title="Excel로 내보내기"
            >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel 저장
            </button>
            
            {onImportExcel && (
                <>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm hover:border-slate-400"
                        title="Excel 불러오기"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Excel 열기
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                    />
                </>
            )}
        </div>

        <div className="w-full h-px bg-slate-200 my-1"></div>

        <button 
          onClick={onAddNew}
          className="w-full bg-white border border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-indigo-500" />
          새 일위대가 만들기
        </button>
      </div>

      {/* 2. Search & Count */}
      <div className="p-3 pb-0">
        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="공종 검색..." 
            className="w-full bg-slate-50 border-none rounded-lg py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex justify-between items-center px-2 mb-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">일위대가 목록</div>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-mono font-bold border border-indigo-100">
                {analyses.length}
            </span>
        </div>
      </div>

      {/* 3. List Area */}
      <div className="flex-1 overflow-y-auto space-y-0.5 px-2 pb-4 custom-scrollbar">
        {analyses.map((analysis) => (
          <button
            key={analysis.id}
            onClick={() => onSelect(analysis.id)}
            className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all border border-transparent ${
              selectedId === analysis.id 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:border-slate-100'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{analysis.name}</div>
              <div className="text-[11px] opacity-70 mt-0.5 truncate font-medium">{analysis.specification}</div>
            </div>
            {selectedId === analysis.id && <ChevronRight className="w-4 h-4 shrink-0 text-indigo-500" />}
          </button>
        ))}
      </div>
      
      {/* 4. Footer Info (Fixed at bottom) */}
      <div className="p-5 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm text-slate-500 shrink-0 text-[11px] leading-relaxed">
        <div className="space-y-3">
            {/* Companies */}
            <div className="space-y-2 border-b border-slate-200/60 pb-3">
                <div>
                    <div className="font-bold text-slate-800">㈜가우건축</div>
                    <div className="text-[10px] text-slate-500">여성기업 / 건축공사</div>
                </div>
                <div>
                    <div className="font-bold text-slate-800">㈜다인기술</div>
                    <div className="text-[10px] text-slate-500">장애인기업 / 도장 / 방수</div>
                </div>
                <div>
                    <div className="font-bold text-slate-800">건축사사무소 가우</div>
                    <div className="text-[10px] text-slate-500">장애인기업</div>
                </div>
            </div>
            
            {/* Contacts */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 group cursor-pointer hover:text-indigo-600 transition-colors">
                    <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate select-all">namy0482@gmail.com</span>
                </div>
                <a 
                    href="https://blog.naver.com/namy0482" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors group"
                >
                    <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">blog.naver.com/namy0482</span>
                </a>
                <div className="flex items-start gap-2 group hover:text-indigo-600 transition-colors">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">제주시 신성로 8길4, 2층</span>
                </div>
                <div className="flex items-center gap-2 group hover:text-indigo-600 transition-colors">
                    <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="select-all">064-723-0433</span>
                </div>
                <div className="flex items-center gap-2 group hover:text-indigo-600 transition-colors">
                    <Smartphone className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="select-all">010-9393-8204</span>
                </div>
            </div>
            
            {/* Version */}
            <div className="pt-2 mt-1 text-[10px] text-center text-slate-400 font-mono">
                AutoCost v1.0.3
            </div>
        </div>
      </div>
    </div>
  );
};
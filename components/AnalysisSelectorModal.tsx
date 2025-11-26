import React, { useState, useMemo } from 'react';
import { X, Search, FolderOpen, Check } from 'lucide-react';
import { UnitAnalysis } from '../types';

interface AnalysisSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyses: UnitAnalysis[];
  onSelect: (analysisId: string) => void;
}

export const AnalysisSelectorModal: React.FC<AnalysisSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  analyses, 
  onSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group analyses by category
  const groupedAnalyses = useMemo(() => {
    const groups: Record<string, UnitAnalysis[]> = {};
    
    analyses.forEach(analysis => {
      // Filter by search
      if (searchQuery && !analysis.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      const cat = analysis.category || '기타';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(analysis);
    });
    return groups;
  }, [analyses, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">일위대가 선택</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="일위대가 명칭 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 custom-scrollbar">
          {Object.keys(groupedAnalyses).length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            (Object.entries(groupedAnalyses) as [string, UnitAnalysis[]][]).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 px-2">
                  <FolderOpen className="w-4 h-4 text-indigo-500" />
                  {category}
                </div>
                <div className="space-y-1">
                  {items.map(analysis => (
                    <button
                      key={analysis.id}
                      onClick={() => onSelect(analysis.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-slate-800 text-sm group-hover:text-indigo-700">{analysis.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{analysis.specification} ({analysis.unit})</div>
                      </div>
                      <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
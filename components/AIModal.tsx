import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Wand2, ChevronRight, List } from 'lucide-react';
import { CONSTRUCTION_CATEGORIES } from '../constants';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (description: string, category: string) => Promise<void>;
  isLoading: boolean;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CONSTRUCTION_CATEGORIES[0].name);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setSelectedCategory(CONSTRUCTION_CATEGORIES[0].name);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onGenerate(prompt, selectedCategory);
    setPrompt('');
  };

  const handleSubCategoryClick = (item: string) => {
    setPrompt(item);
  };

  const activeCategoryData = CONSTRUCTION_CATEGORIES.find(c => c.name === selectedCategory) || CONSTRUCTION_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                AI 일위대가 생성 (New Analysis)
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                공종을 선택하거나 직접 입력하여 새로운 일위대가를 생성하세요.
              </p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
            
          {/* Left: Major Categories */}
          <div className="w-1/3 border-r border-slate-100 bg-slate-50 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="p-3 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">주요 공종 (Major)</div>
            </div>
            <div className="p-2 space-y-0.5">
                {CONSTRUCTION_CATEGORIES.map((cat) => (
                    <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                        selectedCategory === cat.name
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100 z-10 relative'
                        : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                    >
                    {cat.name}
                    {selectedCategory === cat.name && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </button>
                ))}
            </div>
          </div>

          {/* Right: Sub Categories & Input */}
          <div className="w-2/3 flex flex-col bg-white">
             {/* Input Section */}
             <div className="p-5 border-b border-slate-100 shrink-0 bg-slate-50/30">
                <form onSubmit={handleSubmit}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">직접 입력 또는 목록 선택</label>
                    <div className="relative">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="생성할 일위대가 명칭 (예: 1.0B 벽돌쌓기)"
                        className="w-full p-3 pr-12 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base font-medium text-slate-800 placeholder-slate-400 shadow-sm transition-shadow"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !prompt.trim()}
                        className="absolute top-1/2 -translate-y-1/2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg disabled:opacity-50 transition-all flex items-center justify-center shadow-sm"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    </button>
                    </div>
                </form>
             </div>

             {/* Sub Category List Table */}
             <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-4 pb-2 flex items-center gap-2 border-b border-slate-100 bg-white">
                    <List className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800">
                        '{selectedCategory}' 표준 세부 항목
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        {activeCategoryData.items.map((item, index) => (
                            <button
                                key={item}
                                onClick={() => handleSubCategoryClick(item)}
                                className={`w-full text-left px-4 py-3.5 text-sm flex items-center justify-between group transition-colors border-b border-slate-100 last:border-none ${
                                    prompt === item 
                                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-6 text-center text-xs text-slate-400 font-mono">{index + 1}</span>
                                    {item}
                                </span>
                                <Wand2 className={`w-3.5 h-3.5 ${prompt === item ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'} transition-all`} />
                            </button>
                        ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs text-slate-500 leading-relaxed text-center">
                        <p>
                            목록에서 항목을 선택하면 상단 입력창에 자동 입력됩니다.<br/>
                            입력 후 <span className="font-bold text-indigo-600">마술봉 버튼</span>을 누르면 AI가 분석을 시작합니다.
                        </p>
                    </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
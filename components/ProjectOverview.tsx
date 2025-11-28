
import React, { useMemo } from 'react';
import { ProjectOverview } from '../types';
import { FileText, Building2, Calendar, MapPin, Briefcase, UserCircle, Clock, Search } from 'lucide-react';

// Helper Icon component
const HardHat = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/></svg>
);

interface ProjectOverviewProps {
  overview: ProjectOverview;
  onUpdate: (field: keyof ProjectOverview, value: string) => void;
  onClientClick: () => void;
  onContractorClick: () => void;
}

interface InputGroupProps {
  label: string;
  icon: any;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  onClick?: () => void;
}

// Component defined outside to prevent re-mounting on render
const InputGroup: React.FC<InputGroupProps> = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  type = "text", 
  placeholder,
  readOnly = false,
  onClick
}) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
      <Icon className="w-4 h-4 text-indigo-500" />
      {label}
    </label>
    <div className="relative">
        <input
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        onClick={onClick}
        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-[50px] ${readOnly ? 'cursor-pointer hover:bg-indigo-50/50 pr-10 focus:bg-white' : 'focus:bg-white'}`}
        />
        {readOnly && (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
    </div>
  </div>
);

export const ProjectOverviewView: React.FC<ProjectOverviewProps> = ({ overview, onUpdate, onClientClick, onContractorClick }) => {
  
  // Calculate Duration
  const durationDays = useMemo(() => {
    if (!overview.startDate || !overview.endDate) return null;
    
    const start = new Date(overview.startDate);
    const end = new Date(overview.endDate);
    
    // Calculate difference in time
    const diffTime = end.getTime() - start.getTime();
    
    // Calculate difference in days (divide by 1000ms * 60s * 60m * 24h)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Add 1 because dates are usually inclusive in construction (Day 1 to Day 1 is 1 day)
    // Check for valid number
    if (isNaN(diffDays)) return null;
    
    return diffDays >= 0 ? diffDays + 1 : 0;
  }, [overview.startDate, overview.endDate]);

  return (
    <div className="flex flex-col h-full gap-4 min-w-[800px] max-w-[1200px] mx-auto w-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
             <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">공사 개요서 (Project Overview)</h2>
            <p className="text-sm text-slate-500">공사의 기본 정보 및 계약 사항을 입력하세요.</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                
                {/* Main Info Section */}
                <div className="col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        공사명 (Project Title)
                    </label>
                    <input
                        type="text"
                        value={overview.projectName}
                        onChange={(e) => onUpdate('projectName', e.target.value)}
                        placeholder="예: 판교 테크노밸리 오피스 신축공사"
                        className="w-full p-4 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                    />
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">기본 정보</h3>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            공사 구분 (Classification)
                        </label>
                        <select
                            value={overview.classification}
                            onChange={(e) => onUpdate('classification', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all appearance-none h-[50px]"
                        >
                            <option value="건축공사">건축공사</option>
                            <option value="토목공사">토목공사</option>
                            <option value="전기공사">전기공사</option>
                            <option value="통신공사">통신공사</option>
                            <option value="소방공사">소방공사</option>
                            <option value="인테리어">인테리어</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    <InputGroup 
                        label="현장 위치 (Location)" 
                        icon={MapPin} 
                        value={overview.location}
                        onChange={(val) => onUpdate('location', val)}
                        placeholder="예: 경기도 성남시 분당구..." 
                    />
                </div>

                <div className="space-y-6">
                     <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">계약 및 기간</h3>
                    
                    {/* Date Row with Duration Calculation */}
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <InputGroup 
                                label="착공일 (Start)" 
                                icon={Calendar} 
                                value={overview.startDate}
                                onChange={(val) => onUpdate('startDate', val)}
                                type="date" 
                            />
                        </div>
                        <div className="flex-1">
                            <InputGroup 
                                label="준공일 (End)" 
                                icon={Calendar} 
                                value={overview.endDate}
                                onChange={(val) => onUpdate('endDate', val)}
                                type="date" 
                            />
                        </div>
                        {/* Duration Display */}
                        <div className="w-28 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center shrink-0 h-[50px] shadow-sm">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase leading-none mb-0.5">공사 기간</div>
                            <div className="font-bold text-indigo-700 flex items-center gap-1 text-sm">
                                <Clock className="w-3.5 h-3.5" />
                                {durationDays !== null ? `${durationDays}일` : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {/* Modified Client Input to be ReadOnly/Clickable */}
                         <InputGroup 
                            label="발주처 (Client)" 
                            icon={UserCircle} 
                            value={overview.client}
                            placeholder="선택하세요..."
                            readOnly={true}
                            onClick={onClientClick}
                        />
                        <InputGroup 
                            label="시공사 (Contractor)" 
                            icon={HardHat} 
                            value={overview.contractor}
                            placeholder="선택하세요..."
                            readOnly={true}
                            onClick={onContractorClick}
                        />
                    </div>
                </div>

                {/* Description Section */}
                <div className="col-span-2 mt-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        공사 개요 및 특기사항
                    </label>
                    <textarea
                        value={overview.description}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        placeholder="공사 규모, 구조, 층수, 연면적 등 상세 개요를 입력하세요."
                        className="w-full p-4 h-40 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none leading-relaxed"
                    />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

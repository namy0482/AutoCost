
import React, { useState, useMemo } from 'react';
import { X, Search, Plus, User, Phone, Smartphone, Building2, Save, HardHat } from 'lucide-react';
import { Company } from '../types';

interface CompanySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onSelect: (company: Company) => void;
  onAddCompany: (company: Company) => void;
  title: string;
  type: 'CLIENT' | 'CONTRACTOR';
}

export const CompanySelectorModal: React.FC<CompanySelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  companies, 
  onSelect, 
  onAddCompany,
  title,
  type
}) => {
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '', contactPerson: '', department: '', mobile: '', phone: '', email: '', memo: ''
  });

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    return companies.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) return;
    const companyToAdd: Company = {
      id: crypto.randomUUID(),
      name: newCompany.name!,
      contactPerson: newCompany.contactPerson || '',
      department: newCompany.department || '',
      mobile: newCompany.mobile || '',
      phone: newCompany.phone || '',
      email: newCompany.email || '',
      memo: newCompany.memo || ''
    };
    onAddCompany(companyToAdd);
    onSelect(companyToAdd);
    setNewCompany({ name: '', contactPerson: '', department: '', mobile: '', phone: '', email: '', memo: '' });
    setView('LIST');
  };

  if (!isOpen) return null;
  const Icon = type === 'CLIENT' ? User : HardHat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {view === 'LIST' ? <><Icon className="w-5 h-5 text-indigo-600" />{title}</> : <><Plus className="w-5 h-5 text-indigo-600" />신규 등록</>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        {view === 'LIST' ? (
            <>
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {filteredCompanies.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 flex flex-col items-center"><Building2 className="w-10 h-10 mb-3 opacity-20" /><p>내용이 없습니다.</p></div>
                    ) : (
                        filteredCompanies.map(c => (
                            <button key={c.id} onClick={() => onSelect(c)} className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl transition-all group border-b border-slate-50 last:border-none">
                                <div className="font-bold text-slate-800 group-hover:text-indigo-700">{c.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{c.contactPerson} | {c.phone}</div>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button onClick={() => setView('ADD')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" />신규 등록</button>
                </div>
            </>
        ) : (
            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">상호명 *</label><input type="text" required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">담당자</label><input type="text" value={newCompany.contactPerson} onChange={e => setNewCompany({...newCompany, contactPerson: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">연락처</label><input type="text" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button type="button" onClick={() => setView('LIST')} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl">취소</button>
                    <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl"><Save className="w-4 h-4 inline mr-2"/>저장</button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

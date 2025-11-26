
import React, { useState, useMemo } from 'react';
import { X, Search, Plus, User, Phone, Mail, Building2, Smartphone, FileText, Save, ArrowLeft, Check } from 'lucide-react';
import { Client } from '../types';

interface ClientSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSelect: (client: Client) => void;
  onAddClient: (client: Client) => void;
}

export const ClientSelectorModal: React.FC<ClientSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  clients, 
  onSelect, 
  onAddClient 
}) => {
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    contactPerson: '',
    department: '',
    mobile: '',
    phone: '',
    email: '',
    memo: ''
  });

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    const clientToAdd: Client = {
      id: crypto.randomUUID(),
      name: newClient.name!,
      contactPerson: newClient.contactPerson || '',
      department: newClient.department || '',
      mobile: newClient.mobile || '',
      phone: newClient.phone || '',
      email: newClient.email || '',
      memo: newClient.memo || ''
    };

    onAddClient(clientToAdd);
    onSelect(clientToAdd); // Auto select the new client
    resetForm();
  };

  const resetForm = () => {
    setNewClient({
        name: '',
        contactPerson: '',
        department: '',
        mobile: '',
        phone: '',
        email: '',
        memo: ''
    });
    setView('LIST');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {view === 'LIST' ? (
                <>
                    <User className="w-5 h-5 text-indigo-600" />
                    발주처 선택
                </>
            ) : (
                <>
                    <Plus className="w-5 h-5 text-indigo-600" />
                    새 발주처 등록
                </>
            )}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {view === 'LIST' ? (
            <>
                {/* Search */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="발주처명 또는 담당자 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {filteredClients.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                            <Building2 className="w-10 h-10 mb-3 opacity-20" />
                            <p>등록된 발주처가 없습니다.</p>
                        </div>
                    ) : (
                        filteredClients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => onSelect(client)}
                                className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl transition-all group border-b border-slate-50 last:border-none"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-800 group-hover:text-indigo-700">{client.name}</span>
                                    {client.contactPerson && (
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <User className="w-3 h-3" /> {client.contactPerson}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-3 mt-2">
                                    {client.mobile && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {client.mobile}</span>}
                                    {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button 
                        onClick={() => setView('ADD')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        신규 발주처 등록
                    </button>
                </div>
            </>
        ) : (
            /* ADD FORM */
            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">발주처명 (Client Name) <span className="text-red-500">*</span></label>
                        <input 
                            type="text" required
                            value={newClient.name}
                            onChange={e => setNewClient({...newClient, name: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="(주)대한건설"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">담당자명</label>
                            <input 
                                type="text"
                                value={newClient.contactPerson}
                                onChange={e => setNewClient({...newClient, contactPerson: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">담당부서</label>
                            <input 
                                type="text"
                                value={newClient.department}
                                onChange={e => setNewClient({...newClient, department: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">휴대전화</label>
                            <input 
                                type="text"
                                value={newClient.mobile}
                                onChange={e => setNewClient({...newClient, mobile: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">일반전화</label>
                            <input 
                                type="text"
                                value={newClient.phone}
                                onChange={e => setNewClient({...newClient, phone: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="02-000-0000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">이메일</label>
                        <input 
                            type="email"
                            value={newClient.email}
                            onChange={e => setNewClient({...newClient, email: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">메모</label>
                        <textarea 
                            value={newClient.memo}
                            onChange={e => setNewClient({...newClient, memo: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setView('LIST')}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-100 transition-colors"
                    >
                        취소
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        저장하기
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

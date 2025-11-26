
import React, { useState, useMemo, useCallback } from 'react';
import { UnitAnalysis, AnalysisItem, CostSummary, AppState, ViewMode, EstimateEntry, EstimateType, ProjectOverview, Client } from './types';
import { INITIAL_ANALYSES, CONSTRUCTION_CATEGORIES, INITIAL_CLIENTS } from './constants';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CostTable } from './components/CostTable';
import { PriceSourceTable } from './components/PriceSourceTable';
import { SummaryChart } from './components/SummaryChart';
import { AnalysisListTable } from './components/AnalysisListTable';
import { EstimateTable } from './components/EstimateTable';
import { SummarySheet } from './components/SummarySheet';
import { CostStatement } from './components/CostStatement';
import { ProjectOverviewView } from './components/ProjectOverview';
import { AIModal } from './components/AIModal';
import { AnalysisSelectorModal } from './components/AnalysisSelectorModal';
import { ClientSelectorModal } from './components/ClientSelectorModal';
import { generateUnitAnalysis } from './services/geminiService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [analyses, setAnalyses] = useState<UnitAnalysis[]>(INITIAL_ANALYSES);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_ANALYSES[0].id);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Estimate State
  const [estimateItems, setEstimateItems] = useState<EstimateEntry[]>([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [isAnalysisSelectorOpen, setIsAnalysisSelectorOpen] = useState(false);
  const [activeEstimateItemId, setActiveEstimateItemId] = useState<string | null>(null);

  // Client Database State
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Project Overview State
  const [projectOverview, setProjectOverview] = useState<ProjectOverview>({
    projectName: '',
    classification: '건축공사',
    client: '',
    contractor: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  // Main View State
  const [viewMode, setViewMode] = useState<ViewMode>('ANALYSIS');

  // Get currently selected analysis
  const activeAnalysis = useMemo(() => 
    analyses.find(a => a.id === selectedId) || null
  , [analyses, selectedId]);

  // Calculate totals for the active analysis
  const summary: CostSummary = useMemo(() => {
    if (!activeAnalysis) return { totalMaterial: 0, totalLabor: 0, totalExpense: 0, unitPrice: 0 };

    const result = activeAnalysis.items.reduce(
      (acc, item) => {
        acc.totalMaterial += item.materialUnitPrice * item.quantity;
        acc.totalLabor += item.laborUnitPrice * item.quantity;
        acc.totalExpense += item.expenseUnitPrice * item.quantity;
        return acc;
      },
      { totalMaterial: 0, totalLabor: 0, totalExpense: 0, unitPrice: 0 }
    );
    result.unitPrice = result.totalMaterial + result.totalLabor + result.totalExpense;
    return result;
  }, [activeAnalysis]);

  // Handlers for Analysis
  const handleUpdateItem = (id: string, field: keyof AnalysisItem, value: any) => {
    if (!activeAnalysis) return;
    
    const updatedItems = activeAnalysis.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    
    setAnalyses(prev => prev.map(a => 
      a.id === activeAnalysis.id ? { ...a, items: updatedItems } : a
    ));
  };

  const handleUpdateMeta = (field: keyof UnitAnalysis, value: string) => {
    if (!activeAnalysis) return;
    setAnalyses(prev => prev.map(a => 
      a.id === activeAnalysis.id ? { ...a, [field]: value } : a
    ));
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeAnalysis) return;
    const updatedItems = activeAnalysis.items.filter(item => item.id !== itemId);
    setAnalyses(prev => prev.map(a => 
      a.id === activeAnalysis.id ? { ...a, items: updatedItems } : a
    ));
  };

  const handleAddItem = () => {
    if (!activeAnalysis) return;
    const newItem: AnalysisItem = {
      id: crypto.randomUUID(),
      type: 'MATERIAL',
      name: '새 자원',
      specification: '',
      unit: 'ea',
      quantity: 1,
      materialUnitPrice: 0,
      laborUnitPrice: 0,
      expenseUnitPrice: 0,
      priceSource: '',
    };
    setAnalyses(prev => prev.map(a => 
      a.id === activeAnalysis.id ? { ...a, items: [...a.items, newItem] } : a
    ));
  };

  // Delete Analysis Logic
  const handleDeleteAnalysis = (id: string) => {
    if (window.confirm("정말로 이 일위대가를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) {
      setAnalyses(prev => prev.filter(a => a.id !== id));
      
      // If the deleted analysis was selected, clear selection
      if (selectedId === id) {
        setSelectedId(null);
      }
      
      // Remove links from Estimate
      setEstimateItems(prev => prev.map(item => 
        item.analysisId === id ? { ...item, analysisId: undefined } : item
      ));
    }
  };

  // Handlers for Estimate
  const handleImportAnalysesToEstimate = () => {
    if (estimateItems.length > 0) {
        if (!window.confirm("기존 내역이 초기화되고 현재 일위대가 목록 기준으로 재작성됩니다. 계속하시겠습니까?")) {
            return;
        }
    }

    const newItems: EstimateEntry[] = [];
    
    // Group analyses by category
    const grouped: Record<string, UnitAnalysis[]> = {};
    analyses.forEach(a => {
        const cat = a.category || '기타';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(a);
    });

    // Sort categories based on CONSTRUCTION_CATEGORIES order
    const categoryOrder = CONSTRUCTION_CATEGORIES.map(c => c.name);
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const idxA = categoryOrder.indexOf(a);
        const idxB = categoryOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    sortedCategories.forEach(catName => {
        // Add Category Row
        newItems.push({
            id: crypto.randomUUID(),
            type: 'CATEGORY',
            name: catName,
            specification: '',
            unit: '',
            quantity: 1 
        });

        // Add Analysis Items
        grouped[catName].forEach(analysis => {
            newItems.push({
                id: crypto.randomUUID(),
                type: 'ITEM',
                name: analysis.name,
                specification: analysis.specification,
                unit: analysis.unit,
                quantity: 1, // Default to 1
                analysisId: analysis.id
            });
        });
    });

    setEstimateItems(newItems);
    setSelectedEstimateId(null);
  };

  const handleAddEstimateItem = (type: EstimateType) => {
    const newItem: EstimateEntry = {
      id: crypto.randomUUID(),
      type,
      name: type === 'CATEGORY' ? '새 공종' : '',
      specification: '',
      unit: '',
      quantity: 1, 
    };

    setEstimateItems(prev => {
      // If an item is selected, insert after it
      if (selectedEstimateId) {
        const index = prev.findIndex(item => item.id === selectedEstimateId);
        if (index !== -1) {
          const newItems = [...prev];
          newItems.splice(index + 1, 0, newItem);
          return newItems;
        }
      }
      // Otherwise add to end
      return [...prev, newItem];
    });

    setSelectedEstimateId(newItem.id);
  };

  const handleDeleteEstimateItem = (id: string) => {
    setEstimateItems(prev => prev.filter(item => item.id !== id));
    if (selectedEstimateId === id) setSelectedEstimateId(null);
  };

  const handleUpdateEstimateItem = (id: string, field: keyof EstimateEntry, value: any) => {
    setEstimateItems(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleReorderEstimateItems = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setEstimateItems(prev => {
      const items = [...prev];
      const movedItem = items[fromIndex];

      // Logic for moving a Category (Major) -> Move it along with its children
      if (movedItem.type === 'CATEGORY') {
        let countToMove = 1;
        for (let i = fromIndex + 1; i < items.length; i++) {
          if (items[i].type === 'CATEGORY') break;
          countToMove++;
        }
        const movedGroup = items.splice(fromIndex, countToMove);
        items.splice(toIndex, 0, ...movedGroup);
        return items;

      } else {
        // Normal Item Move
        const [removed] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, removed);
        return items;
      }
    });
  };

  // Overview Handler
  const handleUpdateOverview = (field: keyof ProjectOverview, value: string) => {
    setProjectOverview(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (client: Client) => {
    setProjectOverview(prev => ({ ...prev, client: client.name }));
    setIsClientModalOpen(false);
  };

  const handleAddClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  const openAnalysisSelector = (itemId: string) => {
    setActiveEstimateItemId(itemId);
    setIsAnalysisSelectorOpen(true);
  };

  const handleSelectAnalysisForEstimate = (analysisId: string) => {
    if (!activeEstimateItemId) return;
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
        setEstimateItems(prev => prev.map(item => 
            item.id === activeEstimateItemId ? {
                ...item,
                name: analysis.name,
                specification: analysis.specification,
                unit: analysis.unit,
                analysisId: analysis.id
            } : item
        ));
    }
    setIsAnalysisSelectorOpen(false);
    setActiveEstimateItemId(null);
  };

  const handleGenerate = useCallback(async (taskName: string, category: string) => {
    setAppState(AppState.LOADING);
    try {
      const newAnalysis = await generateUnitAnalysis(taskName, category);
      setAnalyses(prev => [newAnalysis, ...prev]);
      setSelectedId(newAnalysis.id);
      setAppState(AppState.SUCCESS);
      setIsAIModalOpen(false);
      setViewMode('ANALYSIS'); 
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      alert("AI 일위대가 생성 중 오류가 발생했습니다.");
    } finally {
      setAppState(AppState.IDLE);
    }
  }, []);

  const handleSidebarSelect = (id: string) => {
    setSelectedId(id);
    if (viewMode === 'LIST' || viewMode === 'ESTIMATE' || viewMode === 'SUMMARY_SHEET' || viewMode === 'COST_STATEMENT' || viewMode === 'OVERVIEW') {
        setViewMode('ANALYSIS');
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    if ((mode === 'ANALYSIS' || mode === 'SOURCE') && !selectedId && analyses.length > 0) {
        setSelectedId(analyses[0].id);
    }
    setViewMode(mode);
  };

  const renderContent = () => {
    if (viewMode === 'OVERVIEW') {
        return (
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <ProjectOverviewView
                    overview={projectOverview}
                    onUpdate={handleUpdateOverview}
                    onClientClick={() => setIsClientModalOpen(true)}
                />
            </div>
        );
    }

    if (viewMode === 'COST_STATEMENT') {
        return (
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <CostStatement 
                    items={estimateItems}
                    analyses={analyses}
                />
            </div>
        );
    }

    if (viewMode === 'SUMMARY_SHEET') {
        return (
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <SummarySheet 
                    items={estimateItems}
                    analyses={analyses}
                />
            </div>
        );
    }

    if (viewMode === 'LIST') {
        return (
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <AnalysisListTable 
                    analyses={analyses} 
                    onSelect={(id) => {
                        setSelectedId(id);
                        setViewMode('ANALYSIS');
                    }}
                    onDelete={handleDeleteAnalysis}
                />
            </div>
        );
    }

    if (viewMode === 'ESTIMATE') {
        return (
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <EstimateTable 
                    items={estimateItems}
                    analyses={analyses}
                    selectedId={selectedEstimateId}
                    onSelect={setSelectedEstimateId}
                    onAddItem={handleAddEstimateItem}
                    onDeleteItem={handleDeleteEstimateItem}
                    onUpdateItem={handleUpdateEstimateItem}
                    onLinkAnalysis={openAnalysisSelector}
                    onReorder={handleReorderEstimateItems}
                    onImportAnalyses={handleImportAnalysesToEstimate}
                />
            </div>
        );
    }

    if (!activeAnalysis) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
              <Loader2 className="w-10 h-10 animate-spin opacity-20" />
              <p>일위대가를 선택하거나 새로 만드세요.</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex-[3] flex flex-col min-w-0 h-full">
                {viewMode === 'ANALYSIS' && (
                    <CostTable 
                        analysis={activeAnalysis} 
                        onUpdateItem={handleUpdateItem} 
                        onDeleteItem={handleDeleteItem} 
                        onAddItem={handleAddItem}
                        onUpdateMeta={handleUpdateMeta}
                        onDeleteAnalysis={handleDeleteAnalysis}
                    />
                )}
                {viewMode === 'SOURCE' && (
                    <PriceSourceTable 
                        analysis={activeAnalysis}
                        onUpdateItem={handleUpdateItem}
                    />
                )}
            </div>
            
            <aside className="flex-1 min-w-[320px] max-w-[400px] flex flex-col gap-4 h-full">
                <div className="flex-1 max-h-[500px]">
                    <SummaryChart summary={summary} />
                </div>
                
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-sm text-slate-600 flex flex-col gap-3">
                    <h4 className="font-bold text-slate-800">도움말</h4>
                    {viewMode === 'SOURCE' ? (
                        <p className="text-xs leading-relaxed text-slate-500">
                            정확한 내역서 작성을 위해 <span className="text-indigo-600 font-medium">물가자료, 유통물가, 거래가격</span> 등 공신력 있는 단가 출처를 기재하세요. 노무비는 상반기/하반기 시중노임을 기준으로 합니다.
                        </p>
                    ) : (
                        <p className="text-xs leading-relaxed text-slate-500">
                            각 항목의 수량은 1단위(m², m³ 등) 시공에 소요되는 <span className="text-indigo-600 font-medium">표준품셈</span> 기준 수량을 입력하세요. 재료비, 노무비, 경비 합계가 자동으로 계산됩니다.
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <Header 
        onOpenAIModal={() => setIsAIModalOpen(true)} 
        currentView={viewMode}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          analyses={analyses} 
          selectedId={selectedId} 
          onSelect={handleSidebarSelect}
          onAddNew={() => setIsAIModalOpen(true)}
          onDelete={handleDeleteAnalysis}
        />

        <main className="flex-1 flex overflow-hidden p-4 gap-4 bg-slate-100/50">
           {renderContent()}
        </main>
      </div>

      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => appState !== AppState.LOADING && setIsAIModalOpen(false)} 
        onGenerate={handleGenerate}
        isLoading={appState === AppState.LOADING}
      />

      <AnalysisSelectorModal
        isOpen={isAnalysisSelectorOpen}
        onClose={() => setIsAnalysisSelectorOpen(false)}
        analyses={analyses}
        onSelect={handleSelectAnalysisForEstimate}
      />

      <ClientSelectorModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clients={clients}
        onSelect={handleClientSelect}
        onAddClient={handleAddClient}
      />
    </div>
  );
};

export default App;

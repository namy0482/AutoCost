
import * as XLSX from 'xlsx';
import { ProjectOverview, UnitAnalysis, EstimateEntry, AnalysisItem, ImportedData } from '../types';

export const importFromExcel = async (file: File): Promise<ImportedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const result: ImportedData = {};

        // 1. Parse Overview
        const overviewSheetName = workbook.SheetNames.find(name => name.includes('개요'));
        if (overviewSheetName) {
          const ws = workbook.Sheets[overviewSheetName];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          const overview: Partial<ProjectOverview> = {};
          jsonData.forEach(row => {
            if (row.length < 2) return;
            const key = row[0]?.toString().trim();
            const val = row[1]?.toString().trim();
            
            if (key === '공사명') overview.projectName = val;
            else if (key === '공사구분') overview.classification = val;
            else if (key === '현장위치') overview.location = val;
            else if (key === '발주처') overview.client = val;
            else if (key === '시공사') overview.contractor = val;
            else if (key === '비고') overview.description = val;
            else if (key === '공사기간') {
               const dates = val.split('~').map((s: string) => s.trim());
               if (dates.length >= 1) overview.startDate = dates[0];
               if (dates.length >= 2) overview.endDate = dates[1];
            }
          });
          
          result.overview = {
            projectName: overview.projectName || '',
            classification: overview.classification || '건축공사',
            client: overview.client || '',
            contractor: overview.contractor || '',
            location: overview.location || '',
            startDate: overview.startDate || '',
            endDate: overview.endDate || '',
            description: overview.description || ''
          };
        }

        // 2. Parse Analysis (Detailed)
        const analysisSheetName = workbook.SheetNames.find(name => name.includes('일위대가표') || name.includes('일위대가상세'));
        if (analysisSheetName) {
          const ws = workbook.Sheets[analysisSheetName];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          const analyses: UnitAnalysis[] = [];
          let currentAnalysis: UnitAnalysis | null = null;

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[0]?.toString().startsWith('[')) {
                if (currentAnalysis) analyses.push(currentAnalysis);

                const namePart = row[0].toString();
                const name = namePart.substring(namePart.indexOf(']') + 1).trim();
                const spec = row[3]?.toString().replace('규격:', '').trim() || '';
                const unit = row[5]?.toString().replace('단위:', '').trim() || '';

                currentAnalysis = {
                    id: crypto.randomUUID(),
                    category: '불러온 항목',
                    name: name,
                    specification: spec,
                    unit: unit,
                    items: [],
                    createdAt: Date.now()
                };
                i++; 
                continue;
            }

            if (currentAnalysis && row.length > 1) {
                const typeMap: Record<string, 'MATERIAL' | 'LABOR' | 'EXPENSE'> = {
                    '재료': 'MATERIAL', 'MATERIAL': 'MATERIAL',
                    '노무': 'LABOR', 'LABOR': 'LABOR',
                    '경비': 'EXPENSE', 'EXPENSE': 'EXPENSE'
                };
                const rowType = row[0]?.toString().trim();
                
                if (rowType === '소계' || rowType === '합계' || !typeMap[rowType]) continue;

                const type = typeMap[rowType];
                if (type) {
                    const item: AnalysisItem = {
                        id: crypto.randomUUID(),
                        type: type,
                        name: row[1]?.toString() || '',
                        specification: row[2]?.toString() || '',
                        unit: row[3]?.toString() || '',
                        quantity: parseFloat(row[4]) || 0,
                        materialUnitPrice: parseFloat(row[5]) || 0,
                        laborUnitPrice: parseFloat(row[7]) || 0,
                        expenseUnitPrice: parseFloat(row[9]) || 0,
                        priceSource: row[12]?.toString() || ''
                    };
                    currentAnalysis.items.push(item);
                }
            }
          }
          if (currentAnalysis) analyses.push(currentAnalysis);
          
          if (analyses.length > 0) {
              result.analyses = analyses;
          }
        }

        // 3. Parse Estimate
        const estimateSheetName = workbook.SheetNames.find(name => name.includes('내역서'));
        if (estimateSheetName) {
             const ws = workbook.Sheets[estimateSheetName];
             const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
             
             const estimateItems: EstimateEntry[] = [];
             
             for (let i = 2; i < jsonData.length; i++) {
                 const row = jsonData[i];
                 const typeStr = row[0]?.toString().trim();
                 if (!typeStr || typeStr === '총 계') continue;

                 const isCat = typeStr === '공종' || typeStr === 'CATEGORY';
                 const name = row[1]?.toString() || '';
                 const spec = row[2]?.toString() || '';
                 const unit = row[3]?.toString() || '';
                 const qty = parseFloat(row[4]) || 0;
                 const note = row[12]?.toString() || '';

                 let analysisId: string | undefined;
                 if (!isCat && result.analyses) {
                     const match = result.analyses.find(a => a.name === name && a.specification === spec);
                     if (match) analysisId = match.id;
                 }

                 estimateItems.push({
                     id: crypto.randomUUID(),
                     type: isCat ? 'CATEGORY' : 'ITEM',
                     name,
                     specification: spec,
                     unit,
                     quantity: qty,
                     analysisId,
                     note
                 });
             }
             result.estimateItems = estimateItems;
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

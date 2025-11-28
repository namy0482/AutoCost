
import * as XLSX from 'xlsx';
import { ProjectOverview, EstimateEntry, UnitAnalysis } from '../types';

// Helper: Cell with value, formula, and number format
const c = (v: number | string | null, f?: string, format: string = "#,##0") => {
  if (v === null || v === undefined) return { v: "" };
  const cell: any = { v: v };
  if (typeof v === 'number') {
      cell.t = 'n';
      cell.z = format; // Number format
  }
  if (f) {
    cell.t = 'n';
    cell.f = f;
  }
  return cell;
};

// Helper: String cell
const s = (v: string) => ({ t: 's', v: v });

// Helper: Set A4 Landscape
const setA4Landscape = (ws: XLSX.WorkSheet) => {
  ws['!pageSetup'] = { 
      paperSize: 9, // A4
      orientation: 'landscape', 
      fitToWidth: 1, 
      fitToHeight: 0 
  };
  ws['!margins'] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
};

export const exportToExcel = (
  overview: ProjectOverview,
  estimateItems: EstimateEntry[],
  analyses: UnitAnalysis[]
) => {
  const wb = XLSX.utils.book_new();

  // ==================================================================================
  // 1. 데이터 준비
  // ==================================================================================
  
  let totalMat = 0, totalLab = 0, totalExp = 0;
  const categorySummaries: Record<string, {mat: number, lab: number, exp: number, total: number}> = {};
  
  // 공사내역서 계산
  const calculatedEstimate = estimateItems.map(item => {
    let mUnit = 0, lUnit = 0, eUnit = 0;
    if (item.type === 'ITEM' && item.analysisId) {
      const analysis = analyses.find(a => a.id === item.analysisId);
      if (analysis) {
        analysis.items.forEach(i => {
          mUnit += i.materialUnitPrice * i.quantity;
          lUnit += i.laborUnitPrice * i.quantity;
          eUnit += i.expenseUnitPrice * i.quantity;
        });
      }
    }

    const qty = item.quantity || 0;
    const mAmt = Math.floor(mUnit * qty);
    const lAmt = Math.floor(lUnit * qty);
    const eAmt = Math.floor(eUnit * qty);
    
    return { ...item, mUnit, lUnit, eUnit, mAmt, lAmt, eAmt };
  });

  // 공종별 집계
  let currentCatName = "기타";
  calculatedEstimate.forEach(item => {
      if (item.type === 'CATEGORY') {
          currentCatName = item.name;
          if (!categorySummaries[currentCatName]) {
              categorySummaries[currentCatName] = { mat: 0, lab: 0, exp: 0, total: 0 };
          }
      } else {
          if (!categorySummaries[currentCatName]) {
              categorySummaries[currentCatName] = { mat: 0, lab: 0, exp: 0, total: 0 };
          }
          categorySummaries[currentCatName].mat += item.mAmt;
          categorySummaries[currentCatName].lab += item.lAmt;
          categorySummaries[currentCatName].exp += item.eAmt;
          
          totalMat += item.mAmt;
          totalLab += item.lAmt;
          totalExp += item.eAmt;
      }
  });
  
  Object.keys(categorySummaries).forEach(key => {
      const c = categorySummaries[key];
      c.total = c.mat + c.lab + c.exp;
  });


  // ==================================================================================
  // Sheet 1: 공사개요
  // ==================================================================================
  const overviewData = [
    ['[ 공 사 개 요 서 ]'],
    [''],
    ['1. 공 사 명', overview.projectName],
    ['2. 공사구분', overview.classification],
    ['3. 현장위치', overview.location],
    ['4. 발 주 처', overview.client],
    ['5. 시 공 사', overview.contractor],
    ['6. 공사기간', `${overview.startDate} ~ ${overview.endDate}`],
    ['7. 특기사항', overview.description],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  wsOverview['!cols'] = [{ wch: 15 }, { wch: 60 }];
  setA4Landscape(wsOverview);
  XLSX.utils.book_append_sheet(wb, wsOverview, "공사개요");


  // ==================================================================================
  // Sheet 3: 공사내역서 & 집계표 (행 번호 확보용)
  // ==================================================================================
  const estDataStartRow = 4;
  const estRows: any[][] = [
    ['[ 공 사 내 역 서 ]'],
    [''],
    ['품명', '규격', '단위', '수량', '재료비', '', '노무비', '', '경비', '', '합계', '비고'],
    ['', '', '', '', '단가', '금액', '단가', '금액', '단가', '금액', '', '']
  ];
  const estMerges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } }, { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
    { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } }, { s: { r: 2, c: 3 }, e: { r: 3, c: 3 } },
    { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } }, { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } },
    { s: { r: 2, c: 8 }, e: { r: 2, c: 9 } }, { s: { r: 2, c: 10 }, e: { r: 3, c: 10 } },
    { s: { r: 2, c: 11 }, e: { r: 3, c: 11 } }
  ];

  let currentRow = estDataStartRow;
  estimateItems.forEach(item => {
    const r = currentRow + 1;
    if (item.type === 'CATEGORY') {
        estRows.push([item.name, '', '', '', '', '', '', '', '', '', '', '']);
    } else {
        let mUnit = 0, lUnit = 0, eUnit = 0;
        if (item.analysisId) {
          const analysis = analyses.find(a => a.id === item.analysisId);
          if (analysis) {
            analysis.items.forEach(i => {
              mUnit += i.materialUnitPrice * i.quantity;
              lUnit += i.laborUnitPrice * i.quantity;
              eUnit += i.expenseUnitPrice * i.quantity;
            });
          }
        }
        const qty = item.quantity || 0;
        estRows.push([
            item.name, item.specification, item.unit,
            c(qty, undefined, "#,##0.00"),
            c(mUnit), c(0, `E${r}*F${r}`),
            c(lUnit), c(0, `E${r}*H${r}`),
            c(eUnit), c(0, `E${r}*J${r}`),
            c(0, `G${r}+I${r}+K${r}`),
            item.note || ''
        ]);
    }
    currentRow++;
  });

  const startRef = estDataStartRow + 1;
  const endRef = currentRow;
  const totalRowIdx = currentRow + 1;
  
  estRows.push([
      '총  계', '', '', '', 
      '', c(0, `SUM(G${startRef}:G${endRef})`), 
      '', c(0, `SUM(I${startRef}:I${endRef})`), 
      '', c(0, `SUM(K${startRef}:K${endRef})`), 
      c(0, `SUM(L${startRef}:L${endRef})`), ''
  ]);

  const wsEstimate = XLSX.utils.aoa_to_sheet(estRows);
  wsEstimate['!cols'] = [{wch:25}, {wch:20}, {wch:8}, {wch:10}, {wch:12}, {wch:14}, {wch:12}, {wch:14}, {wch:12}, {wch:14}, {wch:15}, {wch:15}];
  wsEstimate['!merges'] = estMerges;
  setA4Landscape(wsEstimate);


  // ==================================================================================
  // Sheet 3: 공사집계표 (Summary)
  // ==================================================================================
  const sumRows: any[][] = [
      ['[ 공 사 집 계 표 ]'],
      [''],
      ['공종명', '재료비', '노무비', '경비', '합계', '구성비']
  ];
  
  const refEstMat = `'공사내역서'!G${totalRowIdx}`;
  const refEstLab = `'공사내역서'!I${totalRowIdx}`;
  const refEstExp = `'공사내역서'!K${totalRowIdx}`;
  const refEstTot = `'공사내역서'!L${totalRowIdx}`;

  sumRows.push(['', '', '', '', '', '']);
  const sumTotalRow = sumRows.length + 1;
  sumRows.push([
      '총  계', 
      c(0, refEstMat),
      c(0, refEstLab),
      c(0, refEstExp),
      c(0, refEstTot),
      '100%'
  ]);
  
  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
  setA4Landscape(wsSummary);


  // ==================================================================================
  // Sheet 2: 원가계산서 (Cost Statement)
  // ==================================================================================
  const refSumMat = `'공사집계표'!B${sumTotalRow}`;
  const refSumLab = `'공사집계표'!C${sumTotalRow}`;
  const refSumExp = `'공사집계표'!D${sumTotalRow}`;

  // Standard Rates
  const rates = {
    indirectLabor: 14.5, employmentIns: 1.03, indAccident: 3.70,
    healthIns: 3.545, seniorCare: 12.95, pension: 4.50, retire: 2.30,
    safetyMgmt: 1.86, envCons: 0.50, machineGuarantee: 0.07,
    subGuarantee: 0.081, perfGuarantee: 0.10, otherExpense: 5.5,
    genAdmin: 6.0, profit: 15.0, vat: 10.0
  };

  // Excel Row Mapping:
  // 1: Title, 2: Spacer, 3: Header
  // 4: 재료비, 5: 직접재료비
  // 6: 노무비, 7: 직접노무비, 8: 간접노무비
  // 9: 경비(계) -> SUM(B10:B22)
  // 10: 산출경비, 11: 고용, 12: 산재, 13: 건강, 14: 노인, 15: 연금, 16: 퇴직
  // 17: 산업안전, 18: 환경보전, 19: 건설기계보증, 20: 하도급보증, 21: 공사이행보증, 22: 기타경비
  // 23: 순공사원가 (B4+B6+B9)

  const costRows: any[][] = [
    ['[ 공 사 원가계산서 ]'],
    [''],
    ['비목', '금액', '요율', '비고 (산출근거)'],
    
    // Material
    ['1. 재료비', c(0, 'B5'), '', ''], 
    ['   직접재료비', c(0, refSumMat), '', '공사집계표'],
    
    // Labor
    ['2. 노무비', c(0, 'B7+B8'), '', ''],
    ['   직접노무비', c(0, refSumLab), '', '공사집계표'],
    ['   간접노무비', c(0, `B7*${rates.indirectLabor/100}`), `${rates.indirectLabor}%`, '직접노무비 × 요율 (50억 미만)'],
    
    // Expense (Detailed 13 items as requested)
    ['3. 경비', c(0, 'SUM(B10:B22)'), '', ''], 
    ['   산출경비(기계경비)', c(0, refSumExp), '', '공사집계표'],
    ['   고용보험료', c(0, `B7*${rates.employmentIns/100}`), `${rates.employmentIns}%`, '직접노무비 × 요율 (등급별 차등)'],
    ['   산재보험료', c(0, `B7*${rates.indAccident/100}`), `${rates.indAccident}%`, '직접노무비 × 요율 (3.7%)'],
    ['   국민건강보험료', c(0, `B7*${rates.healthIns/100}`), `${rates.healthIns}%`, '직접노무비 × 요율 (3.545%)'],
    ['   노인장기요양보험료', c(0, `B13*${rates.seniorCare/100}`), `${rates.seniorCare}%`, '건강보험료 × 요율 (12.95%)'],
    ['   국민연금보험료', c(0, `B7*${rates.pension/100}`), `${rates.pension}%`, '직접노무비 × 요율 (4.5%)'],
    ['   퇴직공제부금비', c(0, `B7*${rates.retire/100}`), `${rates.retire}%`, '직접노무비 × 요율 (2.3%)'],
    ['   산업안전보건관리비', c(0, `(B4+B7)*${rates.safetyMgmt/100}`), `${rates.safetyMgmt}%`, '(재료+직노) × 요율 (1.86%)'],
    ['   환경보전비', c(0, `(B4+B7+B10)*${rates.envCons/100}`), `${rates.envCons}%`, '(재+직노+산출) × 요율 (0.5%)'],
    ['   건설기계대여금지급보증액발급금액', c(0, `(B4+B7+B10)*${rates.machineGuarantee/100}`), `${rates.machineGuarantee}%`, '(재+직노+산출) × 요율 (0.07%)'],
    ['   건설하도급대금지급보증서발급수수료', c(0, `(B4+B7)*${rates.subGuarantee/100}`), `${rates.subGuarantee}%`, '(재료+직노) × 요율 (0.081%)'],
    ['   공사이행보증수수료', c(0, `(B4+B7)*${rates.perfGuarantee/100}`), `${rates.perfGuarantee}%`, '(재료+직노) × 요율 (0.10%)'],
    ['   기타경비', c(0, `(B4+B6)*${rates.otherExpense/100}`), `${rates.otherExpense}%`, '(재료+노무) × 요율 (5.5%)'],

    // Total
    ['4. 순공사원가', c(0, 'B4+B6+B9'), '', '1+2+3'],
    ['5. 일반관리비', c(0, `B23*${rates.genAdmin/100}`), `${rates.genAdmin}%`, '순공사원가 × 요율 (6.0%)'],
    ['6. 총 원가', c(0, 'B23+B24'), '', '4+5'],
    ['7. 이윤', c(0, `(B6+B9+B24)*${rates.profit/100}`), `${rates.profit}%`, '(노+경+일반) × 요율 (15%)'],
    ['8. 공급가액', c(0, 'B25+B26'), '', '6+7'],
    ['9. 부가가치세', c(0, 'B27*0.1'), '10%', '공급가액 × 10%'],
    ['10. 총 공사비', c(0, 'B27+B28'), '', '8+9'],
  ];

  const wsCost = XLSX.utils.aoa_to_sheet(costRows);
  wsCost['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 40 }];
  setA4Landscape(wsCost);

  // ==========================================
  // Sheets 5, 6, 7 (Analysis List, Detail, Source)
  // ==========================================
  
  // Analysis List
  const listRows: any[][] = [['[ 일 위 대 가   목 록 표 ]'], ['']];
  listRows.push(['번호', '공종', '명칭', '규격', '단위', '재료비', '노무비', '경비', '합계', '비고']);
  analyses.forEach((analysis, idx) => {
      let m = 0, l = 0, e = 0;
      analysis.items.forEach(i => {
          m += i.materialUnitPrice * i.quantity;
          l += i.laborUnitPrice * i.quantity;
          e += i.expenseUnitPrice * i.quantity;
      });
      listRows.push([idx + 1, analysis.category, analysis.name, analysis.specification, analysis.unit, m, l, e, m + l + e, '']);
  });
  const wsList = XLSX.utils.aoa_to_sheet(listRows);
  wsList['!cols'] = [{wch:6},{wch:15},{wch:30},{wch:20},{wch:8},{wch:12},{wch:12},{wch:12},{wch:15}];
  setA4Landscape(wsList);

  // Analysis Detail
  const detailRows: any[][] = [['[ 일 위 대 가   상 세 표 ]']];
  analyses.forEach((analysis, idx) => {
    detailRows.push([]); 
    detailRows.push([`[${idx + 1}] ${analysis.name}`, '', '', `규격: ${analysis.specification}`, '', `단위: ${analysis.unit}`]);
    detailRows.push(['구분', '품명', '규격', '단위', '수량', '재료비단가', '재료비금액', '노무비단가', '노무비금액', '경비단가', '경비금액', '합계', '비고']);
    const startRow = detailRows.length + 1; 
    analysis.items.forEach(item => {
      const r = detailRows.length + 1;
      const q = item.quantity;
      detailRows.push([
        item.type, item.name, item.specification, item.unit, q,
        item.materialUnitPrice, c(0, `E${r}*F${r}`),
        item.laborUnitPrice, c(0, `E${r}*H${r}`),
        item.expenseUnitPrice, c(0, `E${r}*J${r}`),
        c(0, `G${r}+I${r}+K${r}`),
        item.priceSource || ''
      ]);
    });
    const endRow = detailRows.length;
    detailRows.push([
        '소계', '', '', '', '', 
        '', c(0, `SUM(G${startRow}:G${endRow})`),
        '', c(0, `SUM(I${startRow}:I${endRow})`),
        '', c(0, `SUM(K${startRow}:K${endRow})`),
        c(0, `SUM(L${startRow}:L${endRow})`), ''
    ]);
  });
  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  wsDetail['!cols'] = [{wch:10},{wch:25},{wch:20},{wch:8},{wch:10},{wch:12},{wch:14},{wch:12},{wch:14},{wch:12},{wch:14},{wch:15},{wch:10}];
  setA4Landscape(wsDetail);

  // Price Source
  const sourceRows: any[][] = [['[ 단 가   산 출   근 거 표 ]'], ['']];
  sourceRows.push(['공종명', '자원명', '규격', '단위', '재료비', '노무비', '경비', '산출근거']);
  analyses.forEach(analysis => {
      analysis.items.forEach(item => {
          if (item.priceSource) {
              sourceRows.push([analysis.name, item.name, item.specification, item.unit, item.materialUnitPrice, item.laborUnitPrice, item.expenseUnitPrice, item.priceSource]);
          }
      });
  });
  const wsSource = XLSX.utils.aoa_to_sheet(sourceRows);
  wsSource['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];
  setA4Landscape(wsSource);

  // Save File
  XLSX.utils.book_append_sheet(wb, wsOverview, "공사개요");
  XLSX.utils.book_append_sheet(wb, wsCost, "원가계산서");
  XLSX.utils.book_append_sheet(wb, wsSummary, "공사집계표");
  XLSX.utils.book_append_sheet(wb, wsEstimate, "공사내역서");
  XLSX.utils.book_append_sheet(wb, wsList, "일위대가목록");
  XLSX.utils.book_append_sheet(wb, wsDetail, "일위대가표");
  XLSX.utils.book_append_sheet(wb, wsSource, "단가산출근거");

  const fileName = `${overview.projectName || '공사내역서'}_Full_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

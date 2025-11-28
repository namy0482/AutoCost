
import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { importFromExcel } from '../utils/excelImport';
import { ImportedData } from '../types';

interface ExcelImportViewProps {
  onImportConfirmed: (data: ImportedData) => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({ onImportConfirmed }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    try {
      const data = await importFromExcel(file);
      setImportedData(data);
    } catch (err) {
      console.error(err);
      setError("파일을 처리하는 중 오류가 발생했습니다. 올바른 형식의 엑셀 파일인지 확인해주세요.");
      setImportedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (importedData) {
      if (window.confirm("현재 프로젝트의 모든 데이터가 덮어씌워집니다. 계속하시겠습니까?")) {
        onImportConfirmed(importedData);
      }
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-slate-50/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
            <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
            엑셀 파일 불러오기
          </h2>
          <p className="text-slate-400 text-sm">
            기존에 저장된 엑셀 파일을 불러와 프로젝트를 복원합니다.
          </p>
        </div>

        <div className="p-8">
          {/* Upload Area */}
          {!importedData ? (
            <div
              className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleChange}
              />
              
              {isProcessing ? (
                <div className="flex flex-col items-center animate-pulse">
                  <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <p className="text-lg font-medium text-slate-700">파일 분석 중...</p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Upload className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-700 mb-2">
                    여기를 클릭하거나 파일을 드래그하세요
                  </p>
                  <p className="text-sm text-slate-400">
                    지원 형식: .xlsx, .xls
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Preview Area */
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-1">파일 분석 완료!</h3>
                  <p className="text-sm text-emerald-600">
                    다음 데이터를 불러올 준비가 되었습니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">공사명</div>
                  <div className="font-medium text-slate-800 truncate">
                    {importedData.overview?.projectName || "(공사명 없음)"}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">일위대가 항목</div>
                  <div className="font-bold text-indigo-600 text-xl">
                    {importedData.analyses?.length || 0} <span className="text-sm font-normal text-slate-500">개</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">내역서 항목</div>
                  <div className="font-bold text-indigo-600 text-xl">
                    {importedData.estimateItems?.length || 0} <span className="text-sm font-normal text-slate-500">개</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">발주처</div>
                  <div className="font-medium text-slate-800 truncate">
                    {importedData.overview?.client || "-"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setImportedData(null)}
                  className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  다시 선택
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  프로젝트에 적용하기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

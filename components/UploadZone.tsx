"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, AlertCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UPLOAD_CONFIG } from "@/lib/constants";

interface UploadZoneProps {
  onAnalyze: (data: FormData | string, targetJob?: string) => void;
  isLoading: boolean;
}

export function UploadZone({ onAnalyze, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [fileError, setFileError] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileError("");
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      setFileError("檔案大小超過 5MB 限制");
      return;
    }
    try {
      const header = await file.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(header);
      const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
      if (!isPDF) {
        setFileError("檔案不是有效的 PDF，請重新選擇");
        return;
      }
    } catch {
      setFileError("無法讀取檔案，請重試");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSubmitPDF = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    onAnalyze(formData, targetJob.trim() || undefined);
  };

  const handleSubmitText = () => {
    if (!textContent.trim()) return;
    onAnalyze(textContent.trim(), targetJob.trim() || undefined);
  };

  // 目標職位輸入框（兩個 tab 共用）
  const TargetJobInput = () => (
    <div className="mb-5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        <Briefcase className="w-3.5 h-3.5" />
        目標職稱 / 產業
        <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">（選填，填入後診斷更精準）</span>
      </label>
      <input
        type="text"
        value={targetJob}
        onChange={(e) => setTargetJob(e.target.value)}
        placeholder="例如：軟體工程師、財務分析師、B2B 業務、電子製造業製程工程師..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );

  return (
    <Tabs defaultValue="pdf" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="pdf" className="gap-2">
          <Upload className="w-4 h-4" />
          上傳 PDF
        </TabsTrigger>
        <TabsTrigger value="text" className="gap-2">
          <FileText className="w-4 h-4" />
          貼上文字
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pdf">
        <TargetJobInput />
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 min-h-[200px]",
            isDragging
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : selectedFile
              ? "border-green-400 bg-green-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {selectedFile ? (
            <>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB — 點擊更換檔案
              </p>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors",
                  isDragging ? "bg-blue-100" : "bg-slate-100"
                )}
              >
                <Upload
                  className={cn(
                    "w-7 h-7 transition-colors",
                    isDragging ? "text-blue-600" : "text-slate-400"
                  )}
                />
              </div>
              <p className="font-semibold text-slate-700 text-base">
                {isDragging ? "放開以上傳" : "拖曳 PDF 至此，或點擊選擇"}
              </p>
              <p className="text-sm text-slate-400 mt-1">支援 PDF 格式，最大 5MB</p>
            </>
          )}
        </div>

        {fileError && (
          <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {fileError}
          </div>
        )}

        <Button
          onClick={handleSubmitPDF}
          disabled={!selectedFile || isLoading}
          size="lg"
          className="w-full mt-4"
        >
          {isLoading ? "分析中..." : "開始 AI 診斷"}
        </Button>
      </TabsContent>

      <TabsContent value="text">
        <TargetJobInput />
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="將您的履歷文字貼上至此處...&#10;&#10;例如：&#10;姓名：王小明&#10;現職：軟體工程師 @ XX 公司&#10;技能：React, TypeScript, Node.js..."
          className="w-full min-h-[220px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all"
        />
        <p className="text-xs text-slate-400 mt-2">
          已輸入 {textContent.length} 字元（建議至少 100 字以獲得準確診斷）
        </p>
        <Button
          onClick={handleSubmitText}
          disabled={textContent.trim().length < UPLOAD_CONFIG.MIN_TEXT_LENGTH || isLoading}
          size="lg"
          className="w-full mt-4"
        >
          {isLoading ? "分析中..." : "開始 AI 診斷"}
        </Button>
      </TabsContent>
    </Tabs>
  );
}

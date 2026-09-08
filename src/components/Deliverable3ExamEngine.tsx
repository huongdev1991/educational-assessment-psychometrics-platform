import React, { useState } from 'react';
import { Cpu, Shuffle, Lock, Unlock, CheckCircle, RefreshCw, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { INITIAL_BLUEPRINT_MATRIX, SAMPLE_QUESTIONS_POOL } from '../core/mock-data';
import { AssessmentBlueprintAggregate, ExamGenerationEngine, BlueprintRuleValueObject, IQuestionCandidatePoolPort } from '../core/exam-engine';
import { CognitiveLevel, COGNITIVE_LEVEL_LABELS, ExamVariant } from '../core/types';
import { CodeBlock } from './CodeBlock';

export const Deliverable3ExamEngine: React.FC = () => {
  const [matrix, setMatrix] = useState(INITIAL_BLUEPRINT_MATRIX);
  const [generatedVariants, setGeneratedVariants] = useState<ExamVariant[] | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [activeVariantTab, setActiveVariantTab] = useState('101');
  const [seed, setSeed] = useState(2026);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Mock Question Pool Port implementation
  const mockPoolPort: IQuestionCandidatePoolPort = {
    async fetchEligibleCandidates(nodeId: string, level: CognitiveLevel) {
      return SAMPLE_QUESTIONS_POOL.filter(
        q => q.knowledgeNodeIds.includes(nodeId) && q.cognitiveLevel === level && q.status === 'PUBLISHED'
      );
    }
  };

  const handleGenerate = async () => {
    if (isPublished) {
      setStatusMessage('LỖI: Đề thi đã PUBLISHED - Khóa bất biến, không thể sinh lại!');
      return;
    }

    try {
      // Build rules from matrix
      const rules: BlueprintRuleValueObject[] = [];
      matrix.forEach(cell => {
        (Object.keys(cell.quotas) as CognitiveLevel[]).forEach(level => {
          const count = cell.quotas[level];
          if (count > 0) {
            rules.push({
              knowledgeNodeId: cell.nodeId,
              knowledgeNodeName: cell.nodeName,
              cognitiveLevel: level,
              requiredCount: count,
              pointsPerQuestion: cell.pointsPerQuestion[level]
            });
          }
        });
      });

      const blueprint = new AssessmentBlueprintAggregate(
        'bp-math-g12-midterm',
        'Ma trận Đề kiểm tra Giữa kỳ II - Toán 12',
        'sub-math-12',
        rules,
        90,
        5.0
      );

      const engine = new ExamGenerationEngine(mockPoolPort);
      const variants = await engine.generateExamVariants(blueprint, ['101', '102', '103', '104'], seed);
      setGeneratedVariants(variants);
      setStatusMessage(`Đã sinh thành công 4 mã đề (101, 102, 103, 104) với ${variants[0].items.length} câu hỏi mỗi đề!`);
    } catch (err: any) {
      setStatusMessage(`Lỗi sinh đề: ${err.message}`);
    }
  };

  const handleTogglePublish = () => {
    if (!generatedVariants) {
      setStatusMessage('Vui lòng sinh mã đề trước khi Publish!');
      return;
    }
    if (!isPublished) {
      setIsPublished(true);
      setStatusMessage('ĐÃ PUBLISH: Đề thi đã chuyển sang trạng thái BẤT BIẾN (Read-Only). Khóa cứng toàn bộ thao tác sửa/xáo trộn.');
    }
  };

  const currentVariant = generatedVariants?.find(v => v.variantCode === activeVariantTab) || generatedVariants?.[0];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">3. Exam Generation Engine &amp; Domain Model</h2>
              <p className="text-sm text-slate-500">Thuật toán sinh đề theo Ma trận Blueprint, Xáo trộn mã đề (Question &amp; Option Permutation) &amp; Quy tắc Bất biến (Immutable Rule)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPublished ? (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <Lock className="w-3.5 h-3.5" />
                IMMUTABLE (Đã Publish)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Unlock className="w-3.5 h-3.5" />
                DRAFT / CAN RE-SHUFFLE
              </span>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
            statusMessage.includes('LỖI')
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Blueprint Matrix Interactive Table */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Ma trận Kiến thức x Mức độ nhận thức (Assessment Blueprint)</h3>
            <span className="text-xs text-slate-500">Thang nhận thức Bloom: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao</span>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã Node &amp; Tên Đơn vị Kiến thức</th>
                  <th className="p-3 text-center bg-blue-50/70 text-blue-800">Nhận biết</th>
                  <th className="p-3 text-center bg-emerald-50/70 text-emerald-800">Thông hiểu</th>
                  <th className="p-3 text-center bg-amber-50/70 text-amber-800">Vận dụng</th>
                  <th className="p-3 text-center bg-purple-50/70 text-purple-800">Vận dụng cao</th>
                  <th className="p-3 text-center">Tổng câu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {matrix.map((row) => {
                  const totalRow = (Object.values(row.quotas) as number[]).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={row.nodeId} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <span className="font-mono font-semibold text-slate-800 mr-2">{row.nodeCode}</span>
                        <span>{row.nodeName}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/30">{row.quotas.REMEMBER}</td>
                      <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">{row.quotas.UNDERSTAND}</td>
                      <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/30">{row.quotas.APPLY}</td>
                      <td className="p-3 text-center font-bold text-purple-700 bg-purple-50/30">{row.quotas.HIGHER_ORDER}</td>
                      <td className="p-3 text-center font-bold bg-slate-50">{totalRow}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engine Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Base Seed:</label>
            <input
              type="number"
              value={seed}
              disabled={isPublished}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 1)}
              className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono disabled:opacity-50"
            />
            <span className="text-xs text-slate-400">(Thuật toán PRNG Mulberry32 đảm bảo tính tái lập 100%)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isPublished}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>Chạy Sinh 4 Mã Đề (101, 102, 103, 104)</span>
            </button>

            {!isPublished ? (
              <button
                onClick={handleTogglePublish}
                disabled={!generatedVariants}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Publish Đề Thi (Khóa Bất Biến)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Đề đã Publish - Read Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Variants Preview */}
      {generatedVariants && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Kết Quả Xáo Trộn Các Mã Đề Thi</span>
            </div>

            {/* Variant Switcher */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              {generatedVariants.map(v => (
                <button
                  key={v.variantCode}
                  onClick={() => setActiveVariantTab(v.variantCode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    activeVariantTab === v.variantCode
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mã đề {v.variantCode}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-600 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <strong>Nguyên tắc Hoán vị &amp; Ánh xạ:</strong> Thứ tự câu hỏi và thứ tự các đáp án A, B, C, D được xáo trộn độc lập bằng thuật toán Fisher-Yates. Thuộc tính <code className="bg-purple-200 px-1 py-0.5 rounded text-purple-900 font-mono">originalKey</code> được lưu trữ ngầm, giúp Grading Engine chấm điểm tự động chính xác tuyệt đối mà không cần tạo 4 bảng đáp án riêng biệt!
          </div>

          {currentVariant && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>MÃ ĐỀ: <strong>{currentVariant.variantCode}</strong></span>
                <span>SEEDS: {currentVariant.seed}</span>
                <span>TỔNG SỐ CÂU: {currentVariant.items.length} câu</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentVariant.items.map((item) => {
                  const levelInfo = COGNITIVE_LEVEL_LABELS[item.cognitiveLevel];
                  return (
                    <div key={item.questionId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 text-xs">
                          Câu {item.orderIndex} <span className="text-slate-400 font-mono">({item.questionId})</span>
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${levelInfo.badge}`}>
                          {levelInfo.vi}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 font-medium">{item.content}</p>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {item.options.map((opt) => (
                          <div
                            key={opt.key}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                              opt.isCorrect
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-slate-200/80 flex items-center justify-center font-bold text-[11px] text-slate-800">
                                {opt.key}
                              </span>
                              <span>{opt.content}</span>
                            </div>
                            {opt.isCorrect && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded font-mono">
                                Đúng (Gốc: {opt.originalKey})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

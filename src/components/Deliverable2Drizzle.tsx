import React, { useState } from 'react';
import { Database, KeyRound, History, Search, GitBranch, CheckCircle2 } from 'lucide-react';
import { KNOWLEDGE_SERVICE_DRIZZLE_CODE, QUESTION_SERVICE_DRIZZLE_CODE, VERSIONING_STRATEGY_ANALYSIS } from '../core/drizzle-schemas';
import { CodeBlock } from './CodeBlock';

export const Deliverable2Drizzle: React.FC = () => {
  const [selectedSchema, setSelectedSchema] = useState<'question' | 'knowledge'>('question');

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">2. Drizzle Database Schemas & Versioning Strategy</h2>
              <p className="text-sm text-slate-500">Database-per-service (PostgreSQL riêng biệt) cho Knowledge Service & Question Service</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Drizzle ORM
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              PostgreSQL
            </span>
          </div>
        </div>

        {/* Versioning Strategy Highlights */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 my-4">
          <div className="flex items-center gap-2 font-bold text-amber-400 mb-2 text-sm">
            <History className="w-4 h-4" />
            <span>Chiến Lược Quản Lý Phiên Bản: {VERSIONING_STRATEGY_ANALYSIS.philosophy}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {VERSIONING_STRATEGY_ANALYSIS.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Indexing Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2 text-xs">
              <KeyRound className="w-4 h-4" />
              <span>1. Composite Unique Index</span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              <code className="text-blue-800 bg-blue-50 px-1 py-0.5 rounded font-mono">UNIQUE(question_id, version)</code>
            </p>
            <p className="text-xs text-slate-500">
              Đảm bảo 100% tính toàn vẹn phiên bản, không cho phép hai row trùng version trên cùng một câu hỏi.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2 text-xs">
              <Search className="w-4 h-4" />
              <span>2. Candidate Pool Filter Index</span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              <code className="text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded font-mono">INDEX(cognitive_level, status)</code>
            </p>
            <p className="text-xs text-slate-500">
              Tối ưu cho Exam Generation Engine quét nhanh hàng triệu câu hỏi theo Mức độ nhận thức (Nhận biết/Vận dụng) &amp; Status=PUBLISHED.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2 text-xs">
              <GitBranch className="w-4 h-4" />
              <span>3. Knowledge Subtree Index</span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">INDEX(knowledge_node_id, question_id)</code>
            </p>
            <p className="text-xs text-slate-500">
              Tra cứu thần tốc toàn bộ câu hỏi liên kết với một đơn vị kiến thức hoặc cây thư mục con (materialized path).
            </p>
          </div>
        </div>
      </div>

      {/* Schema View Switcher & Code */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800">Chọn Dịch Vụ Cần Xem Schema:</span>
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setSelectedSchema('question')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  selectedSchema === 'question'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Question Service (4 Tables + Versioning)
              </button>
              <button
                onClick={() => setSelectedSchema('knowledge')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  selectedSchema === 'knowledge'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Knowledge Service (4 Tables + Hierarchy)
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {selectedSchema === 'question' ? 'Database: educational_question_db' : 'Database: educational_knowledge_db'}
          </span>
        </div>

        {selectedSchema === 'question' ? (
          <div>
            <div className="text-xs text-slate-600 mb-2">
              Bao gồm: <strong className="text-slate-900">questions</strong> (gốc), <strong className="text-slate-900">question_versions</strong> (nội dung/LaTeX/mức nhận thức - Bất biến), <strong className="text-slate-900">question_options</strong> (A, B, C, D), và <strong className="text-slate-900">question_knowledge_mappings</strong>.
            </div>
            <CodeBlock code={QUESTION_SERVICE_DRIZZLE_CODE} filename="question-service.schema.ts" maxHeight="max-h-[500px]" />
          </div>
        ) : (
          <div>
            <div className="text-xs text-slate-600 mb-2">
              Bao gồm: <strong className="text-slate-900">curriculums</strong> (Chương trình), <strong className="text-slate-900">subjects</strong> (Môn học), <strong className="text-slate-900">topics</strong> (Chủ đề phân cấp), và <strong className="text-slate-900">knowledge_nodes</strong> (YCCĐ/Năng lực có Materialized Path).
            </div>
            <CodeBlock code={KNOWLEDGE_SERVICE_DRIZZLE_CODE} filename="knowledge-service.schema.ts" maxHeight="max-h-[500px]" />
          </div>
        )}
      </div>
    </div>
  );
};

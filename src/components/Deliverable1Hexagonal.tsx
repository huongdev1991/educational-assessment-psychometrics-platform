import React, { useState } from 'react';
import { Layers, Box, Cpu, ArrowRightLeft, Database, Terminal, ShieldCheck, FolderTree } from 'lucide-react';
import { QUESTION_SERVICE_TREE, CODE_SAMPLES } from '../core/hexagonal-spec';
import { CodeBlock } from './CodeBlock';

export const Deliverable1Hexagonal: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'aggregate' | 'ports' | 'drizzle' | 'controller'>('aggregate');

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Hexagonal Architecture + DDD (Question Service)</h2>
              <p className="text-sm text-slate-500">Mô hình Ports & Adapters kết hợp Bounded Context cho dịch vụ Quản lý Kho câu hỏi</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            TypeScript Full-Stack
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
              <Cpu className="w-4 h-4" />
              <span>Layer 1: Domain Core</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Pure TypeScript</strong>. Chứa Entities, Value Objects, Domain Events, Aggregate Root (<code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">QuestionAggregate</code>). Hoàn toàn <strong>KHÔNG</strong> phụ thuộc Express, Fastify, Drizzle hay TypeORM.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Layer 2: Ports (Interfaces)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Driving Ports (In)</strong>: Use Cases (<code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">ICreateQuestionUseCase</code>).<br />
              <strong>Driven Ports (Out)</strong>: Interfaces cho Database (<code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">IQuestionRepositoryPort</code>) và Message Broker (<code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">IEventPublisherPort</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
              <Database className="w-4 h-4" />
              <span>Layer 3: Adapters</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Inbound</strong>: HTTP REST Controller (Express/Fastify + Zod validation), gRPC Server.<br />
              <strong>Outbound</strong>: Drizzle ORM Repository, Kafka Producer, gRPC Knowledge Service Client.
            </p>
          </div>
        </div>

        {/* Visual Hexagonal Flow */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Luồng thực thi Độc lập (Dependency Inversion Principle)</span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs gap-2 py-2">
            <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-slate-400">Inbound Adapter</div>
              <div className="font-semibold text-blue-400">HTTP/gRPC Controller</div>
            </div>
            <span className="text-slate-500 font-mono">──(calls)──▶</span>
            <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-slate-400">Driving Port (In)</div>
              <div className="font-semibold text-cyan-400">Use Case Interface</div>
            </div>
            <span className="text-slate-500 font-mono">──(executes)──▶</span>
            <div className="bg-indigo-950 px-4 py-2 rounded-lg border border-indigo-500/50 text-center ring-2 ring-indigo-500/20">
              <div className="text-indigo-300 font-bold uppercase">Domain Core</div>
              <div className="font-semibold text-white">Question Aggregate</div>
            </div>
            <span className="text-slate-500 font-mono">──(invokes)──▶</span>
            <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-slate-400">Driven Port (Out)</div>
              <div className="font-semibold text-amber-400">IRepository Port</div>
            </div>
            <span className="text-slate-500 font-mono">──(implements)──▶</span>
            <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-slate-400">Outbound Adapter</div>
              <div className="font-semibold text-emerald-400">Drizzle ORM / Kafka</div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Structure & Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Folder Tree */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            <span>Folder Structure Mẫu (Question Service)</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Cấu trúc phân tách chặt chẽ theo Bounded Context của Domain-Driven Design (DDD).
          </p>
          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto max-h-[520px]">
            <pre><code>{QUESTION_SERVICE_TREE}</code></pre>
          </div>
        </div>

        {/* Right: Code Sample Tabs */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Terminal className="w-5 h-5 text-blue-600" />
              <span>Mã Nguồn Chi Tiết Theo Layer</span>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveCodeTab('aggregate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'aggregate'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Domain Aggregate (Core)
            </button>
            <button
              onClick={() => setActiveCodeTab('ports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'ports'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Ports (Driving & Driven)
            </button>
            <button
              onClick={() => setActiveCodeTab('drizzle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'drizzle'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. Drizzle Adapter (Outbound)
            </button>
            <button
              onClick={() => setActiveCodeTab('controller')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'controller'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              4. HTTP Controller + Zod (Inbound)
            </button>
          </div>

          {/* Active Code Tab Content */}
          {activeCodeTab === 'aggregate' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                <span className="font-semibold text-indigo-700">src/domain/aggregates/question.aggregate.ts</span>:
                Bảo đảm tính toàn vẹn (Invariants), quản lý danh sách Version và tự động phát sinh Domain Events.
              </div>
              <CodeBlock code={CODE_SAMPLES.domainAggregate} filename="question.aggregate.ts" maxHeight="max-h-[440px]" />
            </div>
          )}

          {activeCodeTab === 'ports' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                <span className="font-semibold text-blue-700">src/application/ports/</span>:
                Định nghĩa các Hợp đồng (Interfaces) độc lập với công nghệ DB hay Web Framework.
              </div>
              <CodeBlock code={CODE_SAMPLES.ports} filename="ports.interface.ts" maxHeight="max-h-[440px]" />
            </div>
          )}

          {activeCodeTab === 'drizzle' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                <span className="font-semibold text-emerald-700">src/infrastructure/adapters/out/persistence/drizzle-question.repository.ts</span>:
                Adapter thứ cấp triển khai <code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">IQuestionRepositoryPort</code> thông qua Drizzle ORM.
              </div>
              <CodeBlock code={CODE_SAMPLES.drizzleAdapter} filename="drizzle-question.repository.ts" maxHeight="max-h-[440px]" />
            </div>
          )}

          {activeCodeTab === 'controller' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                <span className="font-semibold text-amber-700">src/infrastructure/adapters/in/http/question.controller.ts</span>:
                Primary Adapter nhận request HTTP, validate bằng Zod Schema rồi chuyển giao cho Use Case.
              </div>
              <CodeBlock code={CODE_SAMPLES.httpController} filename="question.controller.ts" maxHeight="max-h-[440px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

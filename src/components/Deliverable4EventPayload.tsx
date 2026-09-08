import React, { useState } from 'react';
import { Radio, Zap, Send, CheckCircle2, Server, ArrowRight, ShieldCheck } from 'lucide-react';
import { SAMPLE_ATTEMPT_COMPLETED_EVENT_JSON, EVENT_SPECIFICATION, AttemptCompletedEventSchema } from '../core/attempt-event';
import { CodeBlock } from './CodeBlock';

export const Deliverable4EventPayload: React.FC = () => {
  const [eventPayload, setEventPayload] = useState(SAMPLE_ATTEMPT_COMPLETED_EVENT_JSON);
  const [validationStatus, setValidationStatus] = useState<'VALID' | 'INVALID' | null>(null);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSimulateDispatch = () => {
    setIsPublishing(true);
    setSimulatedLogs([]);

    // 1. Zod Validation
    const validation = AttemptCompletedEventSchema.safeParse(eventPayload);
    if (!validation.success) {
      setValidationStatus('INVALID');
      setIsPublishing(false);
      return;
    }
    setValidationStatus('VALID');

    // Simulate async message broker pipeline
    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        `[Attempt Service] 📤 Dispatched AttemptCompletedEvent (eventId: ${eventPayload.eventId.slice(0, 8)}...) to Kafka Topic '${EVENT_SPECIFICATION.kafkaTopic}'. Partition key: '${eventPayload.payload.examId.slice(0, 8)}'`
      ]);
    }, 300);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        `[Kafka Broker] ⚡ Event acknowledged with offset #14092. Replicating across ISR brokers...`
      ]);
    }, 700);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        `[Analytics Service] 📥 Consumed AttemptCompletedEvent. Computing Item Difficulty (P) & Discrimination (D) for ${eventPayload.payload.itemResponses.length} questions...`
      ]);
    }, 1200);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        `[Analytics Service] ✅ Psychometrics updated! Score histogram bucketed, Cronbach's Alpha recalibrated.`
      ]);
      setIsPublishing(false);
    }, 1700);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">4. Event Payload: AttemptCompletedEvent (EDA)</h2>
              <p className="text-sm text-slate-500">Mô hình Event-Driven Asynchronous Messaging (Kafka / RabbitMQ) giữa Attempt Service và Analytics Service</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Event-Driven Architecture
          </span>
        </div>

        {/* Messaging Topology */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kafka Topic</div>
            <div className="font-mono text-xs font-bold text-slate-800">{EVENT_SPECIFICATION.kafkaTopic}</div>
            <p className="text-xs text-slate-500 mt-2">Append-Only, retention 30 days. Không bao giờ sửa đè lịch sử.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Partition Key Strategy</div>
            <div className="font-mono text-xs font-bold text-slate-800">payload.examId</div>
            <p className="text-xs text-slate-500 mt-2">Đảm bảo toàn bộ bài thi cùng một kỳ thi được gửi tuần tự vào cùng 1 Kafka Partition.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Schema Validation</div>
            <div className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Zod Type-Safe Schema</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Xác thực runtime ở cả Producer (Attempt Service) và Consumer (Analytics Service).</p>
          </div>
        </div>

        {/* Dispatch Simulator Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white mt-6">
          <div>
            <div className="font-bold text-sm text-slate-100">Trình Mô Phỏng Phát Sự Kiện (Event Bus Simulator)</div>
            <div className="text-xs text-slate-400">Kiểm tra tính hợp lệ của Schema Zod và theo dõi luồng nhận tin bất đồng bộ của Analytics Service</div>
          </div>
          <button
            onClick={handleSimulateDispatch}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? 'Đang phát...' : 'Phát Sự Kiện (Dispatch Event)'}</span>
          </button>
        </div>

        {/* Real-time Simulated Pipeline Logs */}
        {simulatedLogs.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1.5">
              Kafka Consumer Group Log Stream
            </div>
            {simulatedLogs.map((log, idx) => (
              <div key={idx} className="text-slate-300 leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSON Payload & Consumer Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: JSON Schema */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Chuẩn Hóa Event Payload (JSON Schema)</h3>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              CloudEvents Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Chứa đầy đủ metadata phiên thi, hành vi thí sinh (blur window, thời gian từng câu) và danh sách đáp án phục vụ thống kê Psychometrics.
          </p>
          <CodeBlock
            code={JSON.stringify(eventPayload, null, 2)}
            language="json"
            filename="attempt-completed.event.json"
            maxHeight="max-h-[480px]"
          />
        </div>

        {/* Right: Consumers Contract */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Hợp Đồng Tiêu Thụ Sự Kiện (Consumers)</h3>
          
          <div className="space-y-3">
            {EVENT_SPECIFICATION.consumers.map((c, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-900">{c.service}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">Consumer Group</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.purpose}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="font-semibold">Chính sách xử lý lỗi:</span> {c.retryPolicy}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <strong>Nguyên tắc Bất đồng bộ (Async Decoupling):</strong> Attempt Service trả về phản hồi <em>"Nộp bài thành công"</em> cho thí sinh ngay lập tức trong vòng &lt; 50ms mà không phải chờ Analytics Service tính toán hàng loạt công thức Psychometrics phức tạp.
          </div>
        </div>
      </div>
    </div>
  );
};

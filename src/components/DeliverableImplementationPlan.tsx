import React, { useState } from 'react';
import { 
  Milestone, 
  Layers, 
  GitBranch, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Server, 
  Zap, 
  AlertTriangle, 
  Database, 
  Radio, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Terminal,
  FileCode2,
  Lock,
  Cpu
} from 'lucide-react';

interface PlanDocMeta {
  id: string;
  title: string;
  filename: string;
  badge: string;
  desc: string;
}

export const DeliverableImplementationPlan: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string>('overview');

  const planDocs: PlanDocMeta[] = [
    {
      id: 'overview',
      title: 'Tổng Quan Kế Hoạch',
      filename: '/plan/README.md',
      badge: 'Master Roadmap',
      desc: 'Chiến lược tổng thể, phạm vi 7 microservices, nguyên tắc quản trị và 7 mốc nghiệm thu (M0 - M6).'
    },
    {
      id: 'order',
      title: 'Thứ Tự Triển Khai (DAG)',
      filename: '/plan/01-service-dependency-order.md',
      badge: 'Dependency Graph',
      desc: 'Đồ thị phụ thuộc bắt buộc: 0.IAM -> 1.Knowledge -> 2.Question -> 3.Assessment -> 4.Exam -> 5.Attempt -> 6.Analytics.'
    },
    {
      id: 'phases',
      title: 'Các Giai Đoạn Chi Tiết',
      filename: '/plan/02-implementation-phases.md',
      badge: '7 Phases (19 Weeks)',
      desc: 'Chi tiết phân kỳ 19 tuần: Hạ tầng, lõi học thuật, ngân hàng câu hỏi, PRNG generator, phòng thi & tâm trắc học.'
    },
    {
      id: 'technical',
      title: 'Các Bước Kỹ Thuật',
      filename: '/plan/03-technical-execution-steps.md',
      badge: 'Deep Tech & Specs',
      desc: 'Database partitioning cho bảng attempts, gRPC protobuf contracts, Kafka acks=all, Redis 2-tier cache & offline queue.'
    },
    {
      id: 'qa-security',
      title: 'Kiểm Thử & Cổng Bảo Mật',
      filename: '/plan/04-testing-qa-security-gates.md',
      badge: 'k6 Stress & QA DoD',
      desc: 'Tháp kiểm thử 4 tầng, kịch bản k6 nộp bài 100k thí sinh trong 15 phút, chống lộ đáp án (Sanitizer) & Definition of Done.'
    },
    {
      id: 'risk-dr',
      title: 'Ma Trận Rủi Ro & Runbooks',
      filename: '/plan/05-risk-matrix-contingency.md',
      badge: 'RPO=0 / RTO<2m',
      desc: 'Kế hoạch ứng phó rớt mạng thi, quá tải DB connection pool, sập broker Kafka và chiến lược Zero-Downtime Canary.'
    }
  ];

  const milestones = [
    { id: 'M0', title: 'Infra & DevOps', weeks: 'Tuần 1-2', status: 'Sẵn sàng', color: 'border-blue-500 bg-blue-50 text-blue-700' },
    { id: 'M1', title: 'IAM & Knowledge', weeks: 'Tuần 3-5', status: 'Chuẩn hóa', color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
    { id: 'M2', title: 'Question Bank', weeks: 'Tuần 6-8', status: 'Phiên bản bất biến', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
    { id: 'M3', title: 'Assessment & Engine', weeks: 'Tuần 9-11', status: 'Mulberry32 PRNG', color: 'border-amber-500 bg-amber-50 text-amber-700' },
    { id: 'M4', title: 'Attempt & Delivery', weeks: 'Tuần 12-14', status: 'Offline Resilience', color: 'border-purple-500 bg-purple-50 text-purple-700' },
    { id: 'M5', title: 'Analytics & Kelly 27%', weeks: 'Tuần 15-16', status: 'Psychometrics', color: 'border-rose-500 bg-rose-50 text-rose-700' },
    { id: 'M6', title: 'Stress Test & Go-Live', weeks: 'Tuần 17-19', status: '100k CCU Launch', color: 'border-teal-500 bg-teal-50 text-teal-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Milestone className="w-3.5 h-3.5" />
              Thư Mục Kế Hoạch Đã Khởi Tạo: /plan/
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Kế Hoạch Triển Khai &amp; Lộ Trình 7 Microservices
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Kế hoạch kỹ thuật chi tiết dành cho nền tảng khảo thí chuẩn hóa và tâm trắc học giáo dục quy mô lớn. 
              Tài liệu xác định rõ thứ tự phụ thuộc, tiến trình 19 tuần (Phases 0 - 6), tiêu chuẩn kiểm thử tải 100,000 thí sinh nộp bài và các phương án dự phòng khẩn cấp.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-2xl font-black text-indigo-600">19 Tuần</div>
              <div className="text-xs text-slate-500 font-medium">Toàn bộ lộ trình</div>
            </div>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-2xl font-black text-emerald-600">7 Dịch Vụ</div>
              <div className="text-xs text-slate-500 font-medium">Độc lập Bounded Context</div>
            </div>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-2xl font-black text-amber-600">RPO = 0</div>
              <div className="text-xs text-slate-500 font-medium">Không mất bài thi</div>
            </div>
          </div>
        </div>

        {/* Milestone Tracker Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tiến Trình 7 Cột Mốc Nghiệm Thu (Milestone Gates M0 — M6)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Quy chuẩn bàn giao Definition of Done (DoD)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {milestones.map((m) => (
              <div key={m.id} className={`p-3 rounded-xl border ${m.color} transition-all`}>
                <div className="flex items-center justify-between text-xs font-black">
                  <span>{m.id}</span>
                  <span className="font-normal text-[11px] opacity-80">{m.weeks}</span>
                </div>
                <div className="mt-1 text-xs font-semibold truncate">{m.title}</div>
                <div className="text-[10px] mt-0.5 opacity-75">{m.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Tabs for Plan Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of 6 Plan Documents */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Danh Mục Tài Liệu Kỹ Thuật (/plan/)
          </h3>
          {planDocs.map((doc) => {
            const isSelected = selectedDoc === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  isSelected 
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {doc.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{doc.filename}</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">{doc.title}</div>
                <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{doc.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Document Visualizer */}
        <div className="lg:col-span-2">
          {selectedDoc === 'overview' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">/plan/README.md</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Kế Hoạch Tổng Thể &amp; Nguyên Tắc Quản Trị</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Master Specification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Không Đi Tắt Đón Đầu (No Skipping)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Không thể phát triển Exam Service khi Blueprint chưa ổn định; không thể soạn Blueprint khi ngân hàng câu hỏi chưa có quy trình kiểm duyệt phiên bản.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Database-per-Service Cách Ly
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    7 microservices sở hữu 7 database riêng biệt. Mọi truy vấn dữ liệu chéo phải đi qua gRPC hợp đồng hoặc sự kiện Kafka, không bao giờ JOIN chéo bảng.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Bất Biến Cho Học Thuật (Immutability)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Khi câu hỏi hay đề thi đã ở trạng thái PUBLISHED, hệ thống khóa cứng (Lock), mọi thay đổi bắt buộc tạo version mới để bảo toàn tính toàn vẹn pháp lý.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Thí Sinh Là Ưu Tiên Số 1
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Toàn bộ kiến trúc phòng thi được tối ưu sao cho dù mạng chập chờn hay downstream analytics chậm, thao tác làm bài của thí sinh vẫn diễn ra 100% trơn tru.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  File nguồn trên đĩa máy chủ:
                </div>
                <code className="block bg-white p-2.5 rounded-lg border border-indigo-200 font-mono text-[11px] text-slate-700">
                  /plan/README.md
                </code>
              </div>
            </div>
          )}

          {selectedDoc === 'order' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">/plan/01-service-dependency-order.md</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Đồ Thị Phụ Thuộc Hướng (DAG) &amp; Thứ Tự Triển Khai</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Dependency Sequence
                </span>
              </div>

              {/* Visual Sequence Chain */}
              <div className="space-y-3">
                {[
                  { step: '0', name: 'IAM Service', role: 'Headless Identity, RS256, JWKS endpoint, ext_ctx', color: 'bg-slate-900 text-white' },
                  { step: '1', name: 'Knowledge Service', role: 'Cây tri thức phân cấp, Materialized Path (1.3.12), Learning Outcomes', color: 'bg-indigo-600 text-white' },
                  { step: '2', name: 'Question Service', role: 'Ngân hàng câu hỏi Bloom 4 mức, LaTeX, RichText, Versioning bất biến', color: 'bg-blue-600 text-white' },
                  { step: '3', name: 'Assessment Service', role: 'Ma trận đề Blueprint 2 chiều, Inventory Feasibility Pre-flight', color: 'bg-cyan-700 text-white' },
                  { step: '4', name: 'Exam Service', role: 'Mulberry32 PRNG xác định, Fisher-Yates, Variants 101-104, Lock bất biến', color: 'bg-emerald-600 text-white' },
                  { step: '5', name: 'Attempt Service', role: 'Phòng thi thời gian thực, LocalStorage đệm, Auto-grading <10ms, Kafka Event', color: 'bg-amber-600 text-white' },
                  { step: '6', name: 'Analytics Service', role: 'Tâm trắc học Kelly 27%, P & D index, Distractor analysis, Đồ thị Gaussian', color: 'bg-rose-600 text-white' },
                ].map((s, idx) => (
                  <div key={s.step} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${s.color}`}>
                      {s.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">{s.name}</div>
                      <div className="text-slate-500 text-xs truncate">{s.role}</div>
                    </div>
                    {idx < 6 && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong>Nguyên lý then chốt:</strong> Không có vòng lặp phụ thuộc (Acyclic). Tất cả downstream services chỉ đọc token từ bộ đệm JWKS trong RAM với SLA &lt; 1ms, hoàn toàn không gọi ngược về IAM khi kiểm tra quyền.
              </div>
            </div>
          )}

          {selectedDoc === 'phases' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">/plan/02-implementation-phases.md</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Lộ Trình Phân Kỳ 19 Tuần (Phases 0 — 6)</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  19 Weeks Plan
                </span>
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-blue-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 0: Hạ tầng, DevOps &amp; Quan sát (Tuần 1 - 2)</div>
                  <div className="text-xs text-slate-600 mt-1">Cụm K8s, 7 database PostgreSQL độc lập, cụm Kafka 3-broker, OpenTelemetry Tracing và CI/CD tự động.</div>
                </div>

                <div className="border-l-2 border-indigo-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 1: IAM Headless &amp; Cây Tri Thức (Tuần 3 - 5)</div>
                  <div className="text-xs text-slate-600 mt-1">Cấp JWT RS256, chuẩn hóa JWKS RFC 7517, gRPC server cây tri thức và tối ưu chỉ mục Materialized Path.</div>
                </div>

                <div className="border-l-2 border-emerald-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 2: Ngân Hàng Câu Hỏi &amp; Ma Trận Đề (Tuần 6 - 8)</div>
                  <div className="text-xs text-slate-600 mt-1">Ngân hàng Bloom 4 mức, LaTeX formula renderer, quy trình duyệt phiên bản chốt và ma trận Blueprint 2 chiều.</div>
                </div>

                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 3: Engine Sinh Đề Xác Định &amp; Lock Bất Biến (Tuần 9 - 11)</div>
                  <div className="text-xs text-slate-600 mt-1">Thuật toán PRNG Mulberry32 + Fisher-Yates xáo trộn mã đề 101-104, bảo toàn ánh xạ originalKey và chốt khóa đề.</div>
                </div>

                <div className="border-l-2 border-purple-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 4: Phòng Thi Thời Gian Thực &amp; Chấm Tự Động (Tuần 12 - 14)</div>
                  <div className="text-xs text-slate-600 mt-1">Đệm đáp án LocalStorage chống mất mạng, anti-cheat tab-blur tracker, tự chấm điểm &lt; 10ms và phát CloudEvents.</div>
                </div>

                <div className="border-l-2 border-rose-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 5: Tâm Trắc Học Kelly 27% &amp; Phổ Điểm (Tuần 15 - 16)</div>
                  <div className="text-xs text-slate-600 mt-1">Kafka Consumer chống trùng lặp, tính độ khó P, độ phân hóa D theo quy tắc Kelly 27% và phân tích phương án nhiễu.</div>
                </div>

                <div className="border-l-2 border-teal-500 pl-4 py-1">
                  <div className="font-bold text-slate-900 text-sm">Phase 6: Kiểm Thử Tải 100k CCU &amp; Go-Live (Tuần 17 - 19)</div>
                  <div className="text-xs text-slate-600 mt-1">Stress test k6 kịch bản 100k thí sinh nộp bài trong 15 phút, diễn tập sự cố (Chaos test) và triển khai Canary.</div>
                </div>
              </div>
            </div>
          )}

          {selectedDoc === 'technical' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">/plan/03-technical-execution-steps.md</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Chi Tiết Kỹ Thuật &amp; Code Snippets</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Engineering Deep Dive
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono">
                  <div className="text-slate-400 mb-2">// 1. Partitioning bảng candidate_attempts theo created_at</div>
                  <div className="text-emerald-400">CREATE TABLE candidate_attempts (...) PARTITION BY RANGE (created_at);</div>
                  <div className="text-slate-400 mt-1">// 2. Kafka Producer chuẩn acks=all và idempotent=true</div>
                  <div className="text-sky-300">{"const producer = kafka.producer({ idempotent: true, maxInFlightRequests: 1 });"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800 text-xs">gRPC Protobuf Contracts</div>
                    <div className="text-slate-500 text-[11px] mt-1">Tra cứu ngân hàng câu hỏi candidate pool bằng HTTP/2 nhị phân siêu tốc giữa Exam và Question Service.</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800 text-xs">Zustand Offline Sync Queue</div>
                    <div className="text-slate-500 text-[11px] mt-1">Trình duyệt thí sinh tự động lưu đệm mọi câu trả lời vào IndexedDB, tự động sync khi mạng khôi phục.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDoc === 'qa-security' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">/plan/04-testing-qa-security-gates.md</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Tháp Kiểm Thử, Stress Test k6 &amp; Cổng Bảo Mật</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  QA &amp; Security Gates
                </span>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs">
                <div className="text-emerald-400 font-bold mb-1">// k6 Stress Scenario: 100,000 Thí Sinh Nộp Bài Trong 15 Phút</div>
                <div className="text-slate-400">{"export const options = {"}</div>
                <div className="text-slate-300 pl-4">{"scenarios: { submission_rush: { target: 10000 / sec } },"}</div>
                <div className="text-slate-300 pl-4">{"thresholds: { 'http_req_failed': ['rate==0.00'], 'p(95)': ['<150ms'] }"}</div>
                <div className="text-slate-400">{"};"}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="font-bold text-emerald-800">Chống Rò Rỉ Đáp Án (Sanitizer)</div>
                  <div className="text-emerald-700 text-[11px] mt-1">Payload đề thi gửi cho thí sinh bị loại bỏ hoàn toàn các trường is_correct và originalKey.</div>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="font-bold text-indigo-800">Definition of Done (DoD)</div>
                  <div className="text-indigo-700 text-[11px] mt-1">Mỗi PR phải đạt 85%+ coverage, có Drizzle migration, có OpenTelemetry trace và vượt qua 2 Senior reviews.</div>
                </div>
              </div>
            </div>
          )}

          {selectedDoc === 'risk-dr' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">/plan/05-risk-matrix-contingency.md</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Ma Trận Rủi Ro Trọng Yếu &amp; Ứng Phó Sự Cố (Runbooks)</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Risk &amp; DR
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900 text-xs sm:text-sm">R-01: Rớt Mạng Internet Điểm Thi</div>
                    <div className="text-rose-800 text-xs mt-0.5">Tự lưu 2 tầng (IndexedDB / LocalStorage). Web Worker gửi bù khi có mạng. RPO = 0.</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-900 text-xs sm:text-sm">R-02: DB Connection Saturation Giờ Cao Điểm</div>
                    <div className="text-amber-800 text-xs mt-0.5">Circuit breaker tự động chuyển sang chỉ ghi vào Redis và Kafka, trả về HTTP 202 Accepted ngay lập tức.</div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-900 text-xs sm:text-sm">R-04: Sập Node PostgreSQL / Kafka Broker</div>
                    <div className="text-blue-800 text-xs mt-0.5">PostgreSQL Primary-Standby Patroni tự failover trong 30s. Kafka Replication Factor 3 không mất dữ liệu.</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Cam Kết Khôi Phục Sự Cố:</span>
                  <span className="text-slate-600 ml-2">RPO = 0 (Không mất bài thi) | RTO &lt; 2 phút (Failover tự động)</span>
                </div>
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

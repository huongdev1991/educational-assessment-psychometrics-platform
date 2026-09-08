import React, { useState, useMemo } from 'react';
import { BarChart3, Activity, Users, Award, Percent, RefreshCw, HelpCircle, Network, ArrowRight } from 'lucide-react';
import { generateSimulatedAttempts, computePsychometrics } from '../core/psychometrics-engine';
import { SAMPLE_QUESTIONS_POOL } from '../core/mock-data';

export const LivePsychometricsLab: React.FC = () => {
  const [examineeCount, setExamineeCount] = useState(120);
  const [simulationSeed, setSimulationSeed] = useState(1);
  const [selectedQuestionId, setSelectedQuestionId] = useState('q-math-008');

  // Compute psychometrics
  const questionIds = useMemo(() => SAMPLE_QUESTIONS_POOL.map(q => q.questionId), []);
  
  const simulationResults = useMemo(() => {
    const attempts = generateSimulatedAttempts(questionIds, examineeCount);
    return computePsychometrics(questionIds, attempts);
  }, [questionIds, examineeCount, simulationSeed]);

  const selectedItem = simulationResults.items.find(i => i.questionId === selectedQuestionId) || simulationResults.items[0];
  const questionDetail = SAMPLE_QUESTIONS_POOL.find(q => q.questionId === selectedQuestionId);

  return (
    <div className="space-y-6">
      {/* Topology Map */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Kiến Trúc Tổng Thể: 7 Microservices Bounded Contexts</h2>
              <p className="text-sm text-slate-500">Mô hình Database-per-service kết hợp Headless IAM (RS256/JWKS), Sync REST/gRPC và Async Kafka Broker</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-3 text-xs">
          {/* Service 0: IAM */}
          <div className="p-4 rounded-xl border border-slate-200 bg-violet-50/40 hover:bg-violet-50/70 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-violet-700">0. IAM Service (Headless)</span>
              <span className="font-mono text-[10px] bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded">PostgreSQL DB</span>
            </div>
            <p className="text-slate-600 mb-2">Định danh User tối giản, JWT RS256, JWKS endpoint, Fine-grained Scopes, Stateless ext_ctx.</p>
            <div className="text-slate-400 text-[11px] font-mono">OAuth2 / JWKS | Asymmetric RS256</div>
          </div>

          {/* Service 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-blue-700">1. Knowledge Service</span>
              <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">PostgreSQL DB</span>
            </div>
            <p className="text-slate-600 mb-2">Cây tri thức phân cấp (Chương trình → Môn → Chủ đề → YCCĐ), Quản lý Versioning cây tri thức.</p>
            <div className="text-slate-400 text-[11px] font-mono">Sync gRPC Server | Event Listener</div>
          </div>

          {/* Service 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-indigo-700">2. Question Service</span>
              <span className="font-mono text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">PostgreSQL DB</span>
            </div>
            <p className="text-slate-600 mb-2">Kho câu hỏi RichText/LaTeX, Phân loại nhận thức Bloom, Versioning bất biến (v1, v2).</p>
            <div className="text-slate-400 text-[11px] font-mono">REST Controller | gRPC Candidate Pool</div>
          </div>

          {/* Service 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-purple-700">3. Assessment Service</span>
              <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">PostgreSQL DB</span>
            </div>
            <p className="text-slate-600 mb-2">Quản lý Ma trận Blueprint (Tỷ lệ Kiến thức x Bloom taxonomy), Thiết lập Scoring Rules.</p>
            <div className="text-slate-400 text-[11px] font-mono">REST API | Blueprint Validator</div>
          </div>

          {/* Service 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-rose-700">4. Exam Service</span>
              <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">PostgreSQL DB</span>
            </div>
            <p className="text-slate-600 mb-2">Engine sinh đề thi &amp; Xáo trộn câu/đáp án nhiều mã đề. Khóa Bất biến (Immutable) khi Publish.</p>
            <div className="text-slate-400 text-[11px] font-mono">Seeded PRNG Engine | Delivery API</div>
          </div>

          {/* Service 5 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-amber-700">5. Attempt Service</span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">PostgreSQL DB</span>
            </div>
            <p className="text-slate-600 mb-2">Phiên thi real-time, lưu vết câu trả lời, Grading Engine, Phát sự kiện AttemptCompletedEvent.</p>
            <div className="text-slate-400 text-[11px] font-mono">Kafka Producer (Async)</div>
          </div>

          {/* Service 6 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="text-emerald-700">6. Analytics Service</span>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">ClickHouse/Postgres</span>
            </div>
            <p className="text-slate-600 mb-2">Lắng nghe sự kiện qua Kafka. Tính toán chỉ số Psychometrics (Độ khó P, Độ phân hóa D, Phổ điểm).</p>
            <div className="text-slate-400 text-[11px] font-mono">Kafka Consumer | Item Response Engine</div>
          </div>
        </div>
      </div>

      {/* Psychometrics Engine Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Psychometrics Analytics Engine (Mô Phỏng Thực Tế)</h2>
              <p className="text-sm text-slate-500">
                Tính toán Chỉ số Độ khó (Item Difficulty - P) và Chỉ số Phân hóa (Discrimination Index - D theo quy tắc Kelly 27%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-600 font-semibold">Số lượng thí sinh:</span>
              <select
                value={examineeCount}
                onChange={(e) => setExamineeCount(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value={60}>60 Thí sinh</option>
                <option value={120}>120 Thí sinh</option>
                <option value={300}>300 Thí sinh</option>
                <option value={1000}>1,000 Thí sinh</option>
              </select>
            </div>

            <button
              onClick={() => setSimulationSeed(s => s + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Chạy lại kỳ thi</span>
            </button>
          </div>
        </div>

        {/* Exam Overall Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Tổng bài thi</div>
            <div className="text-lg font-bold text-slate-900">{simulationResults.distribution.totalAttempts}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Điểm trung bình</div>
            <div className="text-lg font-bold text-indigo-700">{simulationResults.distribution.meanScore} / 10</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Trung vị (Median)</div>
            <div className="text-lg font-bold text-blue-700">{simulationResults.distribution.medianScore}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Độ lệch chuẩn (SD)</div>
            <div className="text-lg font-bold text-amber-700">±{simulationResults.distribution.stdDeviation}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Điểm cao nhất</div>
            <div className="text-lg font-bold text-emerald-700">{simulationResults.distribution.highestScore}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Tỷ lệ đạt (&ge;5.0)</div>
            <div className="text-lg font-bold text-purple-700">{simulationResults.distribution.passRate}%</div>
          </div>
        </div>

        {/* Score Distribution Histogram */}
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800">Phổ Điểm Toàn Kỳ Thi (Score Distribution Histogram)</span>
            <span className="text-[11px] text-slate-500">Mô hình phân phối chuẩn (Gaussian Bell Curve)</span>
          </div>

          <div className="grid grid-cols-5 gap-2 h-28 items-end pt-4 pb-2 border-b border-slate-200">
            {simulationResults.distribution.histogram.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-700">{bar.count} ({bar.percentage}%)</span>
                <div
                  className="w-full bg-indigo-500/80 hover:bg-indigo-600 rounded-t-md transition-all"
                  style={{ height: `${Math.max(8, bar.percentage * 2)}%` }}
                ></div>
                <span className="text-[10px] font-mono text-slate-600 truncate">{bar.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Analysis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Questions Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Bảng Chỉ Số Psychometrics Từng Câu Hỏi</h3>
            <span className="text-xs text-slate-500 font-mono">Quy tắc Kelly 27% (Nhóm cao vs Nhóm thấp)</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Mã câu</th>
                  <th className="p-2.5 text-center">Độ khó (P)</th>
                  <th className="p-2.5 text-center">Độ phân hóa (D)</th>
                  <th className="p-2.5 text-center">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {simulationResults.items.map((item) => {
                  const isSelected = item.questionId === selectedQuestionId;
                  return (
                    <tr
                      key={item.questionId}
                      onClick={() => setSelectedQuestionId(item.questionId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 font-mono">
                        <span className="text-indigo-700">{item.questionId}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="font-mono font-bold">{item.difficultyIndex}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`font-mono font-bold ${
                          item.discriminationIndex >= 0.3 ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {item.discriminationIndex}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.discriminationEvaluation.color}`}>
                          {item.discriminationEvaluation.label.split('(')[0]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Question Deep Dive */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Chi Tiết Câu Hỏi &amp; Phương Án Nhiễu</h3>
            <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {selectedItem.questionId}
            </span>
          </div>

          {questionDetail && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 space-y-2 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Nội dung câu hỏi:</div>
              <div className="font-medium leading-relaxed">{questionDetail.content}</div>
            </div>
          )}

          {/* Indices Gauge */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="text-[11px] text-slate-500 font-semibold mb-1">Độ khó P (P-Value)</div>
              <div className="text-xl font-black text-slate-900 font-mono">{selectedItem.difficultyIndex}</div>
              <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border inline-block ${selectedItem.difficultyEvaluation.color}`}>
                {selectedItem.difficultyEvaluation.label}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="text-[11px] text-slate-500 font-semibold mb-1">Độ phân hóa D (D-Value)</div>
              <div className="text-xl font-black text-slate-900 font-mono">{selectedItem.discriminationIndex}</div>
              <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border inline-block ${selectedItem.discriminationEvaluation.color}`}>
                {selectedItem.discriminationEvaluation.label}
              </div>
            </div>
          </div>

          {/* Distractor Analysis Table */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2">Phân Tích Phương Án Nhiễu (Distractor Analysis)</div>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Lựa chọn</th>
                    <th className="p-2 text-center">Tổng chọn</th>
                    <th className="p-2 text-center">Tỷ lệ %</th>
                    <th className="p-2 text-center">Nhóm cao (27%)</th>
                    <th className="p-2 text-center">Nhóm thấp (27%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectedItem.distractorBreakdown.map((opt) => (
                    <tr key={opt.optionKey} className={opt.isKey ? 'bg-emerald-50/70 font-semibold' : ''}>
                      <td className="p-2">
                        <span className={`w-5 h-5 rounded inline-flex items-center justify-center font-bold text-xs mr-1 ${
                          opt.isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {opt.optionKey}
                        </span>
                        {opt.isKey && <span className="text-[10px] text-emerald-800">(Đáp án đúng)</span>}
                      </td>
                      <td className="p-2 text-center font-mono">{opt.totalChosen}</td>
                      <td className="p-2 text-center font-mono">{opt.percentage}%</td>
                      <td className="p-2 text-center font-mono text-blue-700 font-semibold">{opt.upperGroupChosen}</td>
                      <td className="p-2 text-center font-mono text-rose-700 font-semibold">{opt.lowerGroupChosen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              * Phương án nhiễu hoạt động tốt khi thu hút nhiều học sinh thuộc nhóm thấp (&lt;27%) hơn nhóm cao (&gt;27%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Layout, FolderKanban, Layers, Sparkles, Code2, Database } from 'lucide-react';
import { FRONTEND_FOLDER_STRUCTURE, FRONTEND_ARCHITECTURE_PATTERNS } from '../core/frontend-structure';
import { CodeBlock } from './CodeBlock';

export const Deliverable5Frontend: React.FC = () => {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'zustand' | 'query' | 'latex'>('zustand');

  const ZUSTAND_CODE = `// File: src/features/5-attempt-delivery/stores/exam-session.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CandidateAnswer {
  questionId: string;
  selectedKey: 'A' | 'B' | 'C' | 'D';
  timeSpentSeconds: number;
  changedCount: number;
}

interface ExamSessionState {
  attemptId: string | null;
  examId: string | null;
  variantCode: string | null;
  timeRemainingSeconds: number;
  answers: Record<string, CandidateAnswer>;
  isSubmitting: boolean;

  // Actions
  initSession: (attemptId: string, examId: string, variantCode: string, durationSeconds: number) => void;
  selectOption: (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => void;
  decrementTimer: () => void;
  clearSession: () => void;
}

// Persist in localStorage để bảo vệ quyền lợi thí sinh nếu lỡ tay F5 hoặc mất mạng!
export const useExamSessionStore = create<ExamSessionState>()(
  persist(
    (set, get) => ({
      attemptId: null,
      examId: null,
      variantCode: null,
      timeRemainingSeconds: 0,
      answers: {},
      isSubmitting: false,

      initSession: (attemptId, examId, variantCode, durationSeconds) =>
        set({ attemptId, examId, variantCode, timeRemainingSeconds: durationSeconds, answers: {} }),

      selectOption: (questionId, optionKey) => {
        const current = get().answers[questionId];
        const changedCount = current ? current.changedCount + 1 : 0;
        set({
          answers: {
            ...get().answers,
            [questionId]: {
              questionId,
              selectedKey: optionKey,
              timeSpentSeconds: (current?.timeSpentSeconds || 0) + 1,
              changedCount
            }
          }
        });
      },

      decrementTimer: () =>
        set((state) => ({
          timeRemainingSeconds: Math.max(0, state.timeRemainingSeconds - 1)
        })),

      clearSession: () => set({ attemptId: null, examId: null, answers: {}, timeRemainingSeconds: 0 })
    }),
    {
      name: 'edu-active-exam-session-v1',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
`;

  const QUERY_HOOK_CODE = `// File: src/features/2-question-bank/api/use-questions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/api-client';

export interface QuestionFilter {
  knowledgeNodeId?: string;
  cognitiveLevel?: string;
  status?: string;
  page?: number;
}

export function useQuestions(filter: QuestionFilter) {
  return useQuery({
    queryKey: ['questions', filter],
    queryFn: async () => {
      const res = await apiClient.get('/api/questions', { params: filter });
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // Caching 5 phút cho câu hỏi ít biến động
    placeholderData: (previousData) => previousData
  });
}

export function useCreateQuestionVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { questionId: string; content: string; options: any[] }) => {
      const res = await apiClient.post(\`/api/questions/\${payload.questionId}/versions\`, payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Làm mới cache danh sách và chi tiết câu hỏi
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-detail', variables.questionId] });
    }
  });
}
`;

  const LATEX_COMPONENT_CODE = `// File: src/shared/components/math-renderer.tsx
import React from 'react';

interface MathRendererProps {
  content: string; // Hỗ trợ cú pháp $E = mc^2$ hoặc $$\\int_a^b f(x) dx$$
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  // Trong ứng dụng thực tế tích hợp KaTeX (katex/dist/katex.min.css)
  // hoặc MathJax để render mượt mà các biểu thức giải tích, hình học.
  return (
    <div className={\`inline-block font-serif text-slate-900 leading-relaxed \${className}\`}>
      {content}
    </div>
  );
};
`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">5. React 19 + Tailwind CSS Frontend Architecture</h2>
              <p className="text-sm text-slate-500">Cấu trúc thư mục Feature-Based (Vertical Slices) ánh xạ trực tiếp 6 Bounded Contexts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              React 19
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Tailwind CSS
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Zustand + TanStack Query
            </span>
          </div>
        </div>

        {/* Feature Mapping Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2 text-xs">
              <Layers className="w-4 h-4" />
              <span>Vertical Slices (Features)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi tính năng là 1 folder khép kín (<code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">features/1-knowledge</code>, <code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">features/2-question-bank</code>...) có đủ components, stores, hooks và types riêng biệt.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2 text-xs">
              <Database className="w-4 h-4" />
              <span>State Management Phân Tầng</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Server State:</strong> TanStack Query v5 đảm nhiệm caching, stale-while-revalidate.<br />
              <strong>Client Session State:</strong> Zustand đảm nhiệm bộ nhớ đệm bài thi thí sinh (offline buffer).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-purple-700 font-bold mb-2 text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Tối Ưu Bài Thi &amp; LaTeX</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hỗ trợ công thức Toán/Lý/Hóa mượt mà với KaTeX/MathJax. Đồng hồ thi đếm ngược chống giật lag và tự động khôi phục nếu ngắt kết nối.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Tree & Code Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Folder Structure */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
            <FolderKanban className="w-5 h-5 text-cyan-600" />
            <span>Folder Structure Mẫu (Frontend)</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Phân định rõ ràng theo 6 Bounded Contexts đã thiết kế ở Backend.
          </p>
          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto max-h-[520px]">
            <pre><code>{FRONTEND_FOLDER_STRUCTURE}</code></pre>
          </div>
        </div>

        {/* Right: Code Patterns */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>Frontend Implementation Patterns</span>
            </div>
          </div>

          {/* Snippet Tab Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveSnippetTab('zustand')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSnippetTab === 'zustand'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Zustand Exam Session Store
            </button>
            <button
              onClick={() => setActiveSnippetTab('query')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSnippetTab === 'query'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. TanStack Query API Hook
            </button>
            <button
              onClick={() => setActiveSnippetTab('latex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSnippetTab === 'latex'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. LaTeX / KaTeX Renderer
            </button>
          </div>

          {activeSnippetTab === 'zustand' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                Quản lý trạng thái phiên làm bài thi: Lưu đệm câu trả lời vào LocalStorage chống mất bài khi rớt mạng.
              </div>
              <CodeBlock code={ZUSTAND_CODE} filename="exam-session.store.ts" maxHeight="max-h-[440px]" />
            </div>
          )}

          {activeSnippetTab === 'query' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                Custom Hook quản lý Server Cache danh sách câu hỏi &amp; tự động Invalidate cache khi tạo Version mới.
              </div>
              <CodeBlock code={QUERY_HOOK_CODE} filename="use-questions.ts" maxHeight="max-h-[440px]" />
            </div>
          )}

          {activeSnippetTab === 'latex' && (
            <div>
              <div className="text-xs text-slate-600 mb-2">
                Shared component hiển thị biểu thức toán học và phân tách nội dung RichText an toàn.
              </div>
              <CodeBlock code={LATEX_COMPONENT_CODE} filename="math-renderer.tsx" maxHeight="max-h-[440px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * DELIVERABLE 5: ĐỀ XUẤT FOLDER STRUCTURE CHO REACT 19 + TAILWIND CSS FRONTEND
 * Feature-Based Architecture tương ứng với 6 Bounded Contexts
 */

export const FRONTEND_FOLDER_STRUCTURE = `
frontend-assessment-web/
├── public/
│   ├── favicon.ico
│   └── fonts/
├── src/
│   ├── app/                                  # Application Root & Providers
│   │   ├── providers/                        # QueryClientProvider, ThemeProvider, ToastProvider
│   │   │   ├── query-provider.tsx
│   │   │   └── auth-provider.tsx
│   │   ├── routes/                           # App Router (React Router v7 or TanStack Router)
│   │   │   ├── app.routes.tsx
│   │   │   └── guarded-route.tsx
│   │   ├── App.tsx                           # Main entry shell
│   │   ├── main.tsx                          # React 19 createRoot
│   │   └── index.css                         # Tailwind CSS imports & theme definitions
│   │
│   ├── features/                             # [FEATURE-BASED BOUNDED CONTEXTS]
│   │   │
│   │   ├── 1-knowledge/                      # BOUNDED CONTEXT 1: Knowledge Service
│   │   │   ├── api/                          # TanStack Query hooks for Knowledge APIs
│   │   │   │   ├── use-knowledge-tree.ts
│   │   │   │   └── use-create-knowledge-node.ts
│   │   │   ├── components/
│   │   │   │   ├── knowledge-tree-view.tsx   # Recursive visual node hierarchy
│   │   │   │   ├── node-details-panel.tsx
│   │   │   │   └── node-version-history.tsx  # Version comparison view
│   │   │   ├── stores/                       # Zustand store for selected nodes & expand state
│   │   │   │   └── knowledge-selection.store.ts
│   │   │   ├── types/
│   │   │   │   └── knowledge.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 2-question-bank/                  # BOUNDED CONTEXT 2: Question Service
│   │   │   ├── api/
│   │   │   │   ├── use-questions.ts
│   │   │   │   ├── use-create-question.ts
│   │   │   │   └── use-question-versions.ts
│   │   │   ├── components/
│   │   │   │   ├── question-list-table.tsx
│   │   │   │   ├── latex-preview.tsx         # KaTeX/MathJax live preview
│   │   │   │   ├── question-editor-form.tsx  # RichText editor with LaTeX & Options builder
│   │   │   │   ├── cognitive-badge.tsx       # Nhận biết / Thông hiểu / Vận dụng / VDC
│   │   │   │   └── version-diff-modal.tsx    # So sánh phiên bản v1 vs v2
│   │   │   ├── stores/
│   │   │   │   └── question-editor.store.ts  # Zustand draft question state
│   │   │   └── types/
│   │   │
│   │   ├── 3-assessment-blueprint/           # BOUNDED CONTEXT 3: Assessment Service
│   │   │   ├── api/
│   │   │   │   ├── use-blueprints.ts
│   │   │   │   └── use-save-blueprint.ts
│   │   │   ├── components/
│   │   │   │   ├── blueprint-matrix-grid.tsx # Ma trận Kiến thức x Mức độ nhận thức
│   │   │   │   ├── quota-summary-card.tsx    # Tổng số câu, điểm số, tỷ lệ %
│   │   │   │   └── scoring-rules-editor.tsx  # Điểm từng mức nhận thức
│   │   │   ├── stores/
│   │   │   │   └── blueprint-matrix.store.ts
│   │   │   └── types/
│   │   │
│   │   ├── 4-exam-engine/                    # BOUNDED CONTEXT 4: Exam Service
│   │   │   ├── api/
│   │   │   │   ├── use-generate-exam.ts
│   │   │   │   ├── use-publish-exam.ts
│   │   │   │   └── use-exam-variants.ts
│   │   │   ├── components/
│   │   │   │   ├── generator-panel.tsx       # Run generator with seed & variant count
│   │   │   │   ├── variant-comparer.tsx      # So sánh mã đề 101, 102 (đối chiếu thứ tự câu/đáp án)
│   │   │   │   ├── immutable-lock-banner.tsx # Cảnh báo đề đã Publish là bất biến
│   │   │   │   └── export-exam-modal.tsx     # Xuất PDF đề thi / Phiếu trả lời trắc nghiệm
│   │   │   └── types/
│   │   │
│   │   ├── 5-attempt-delivery/               # BOUNDED CONTEXT 5: Attempt Service
│   │   │   ├── api/
│   │   │   │   ├── use-start-attempt.ts
│   │   │   │   ├── use-save-response.ts      # Debounced heartbeat response sync
│   │   │   │   └── use-submit-attempt.ts
│   │   │   ├── components/
│   │   │   │   ├── exam-countdown-timer.tsx  # Đồng hồ đếm ngược chính xác
│   │   │   │   ├── question-sheet-nav.tsx    # Thanh điều hướng câu 1 -> 40
│   │   │   │   ├── active-question-card.tsx  # Thẻ làm câu hỏi hiện tại
│   │   │   │   └── submission-dialog.tsx
│   │   │   ├── stores/
│   │   │   │   └── exam-session.store.ts     # Zustand offline-buffered candidate responses
│   │   │   └── types/
│   │   │
│   │   └── 6-psychometrics-analytics/        # BOUNDED CONTEXT 6: Analytics Service
│   │       ├── api/
│   │       │   ├── use-item-analysis.ts      # Fetch P-value & D-value per question
│   │       │   └── use-score-distribution.ts # Phổ điểm & Cronbach's Alpha
│   │       ├── components/
│   │       │   ├── difficulty-chart.tsx      # Biểu đồ độ khó P (0.0 -> 1.0)
│   │       │   ├── discrimination-gauge.tsx  # Chỉ số phân hóa D (-1.0 -> +1.0)
│   │       │   ├── score-histogram.tsx       # Phổ điểm hình chuông Gauss
│   │       │   └── distractor-table.tsx      # Phân tích phương án nhiễu A, B, C, D
│   │       └── types/
│   │
│   ├── shared/                               # [CROSS-CUTTING SHARED UTILITIES & COMPONENTS]
│   │   ├── components/                       # Headless / Styled UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   └── math-renderer.tsx             # KaTeX wrapper for LaTeX strings
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-local-storage.ts
│   │   │   └── use-event-source.ts           # Server-Sent Events / WebSocket
│   │   ├── lib/
│   │   │   ├── api-client.ts                 # Axios / Fetch client with auth interceptors
│   │   │   ├── cn.ts                         # Tailwind clsx/twMerge utility
│   │   │   └── formatters.ts                 # Date, score, psychometrics formatting
│   │   └── types/
│   │       └── common.types.ts
│   │
│   └── config/
│       ├── env.ts                            # Zod-parsed client env variables
│       └── constants.ts
│
├── tailwind.config.js                        # Tailwind CSS configuration
├── vite.config.ts                            # Vite configuration
└── package.json
`;

export const FRONTEND_ARCHITECTURE_PATTERNS = {
  stateManagement: {
    serverState: "TanStack Query v5 (React Query) cho caching, invalidation, polling và mutation",
    clientSessionState: "Zustand cho Exam Session (Bộ nhớ đệm câu trả lời thí sinh, tránh mất bài khi mất mạng)",
    urlState: "Nuqs hoặc SearchParams cho bộ lọc câu hỏi & cây tri thức"
  },
  uiPrinciples: {
    mathRendering: "Hỗ trợ MathJax hoặc KaTeX render mượt mà các công thức Toán/Lý/Hóa $f(x)$",
    accessibility: "WCAG 2.1 AA compliant với focus ring rõ ràng cho bài thi trắc nghiệm",
    responsiveness: "Tối ưu cả cho Desktop (Giám thị, Giáo viên) và Tablet/Mobile (Thí sinh làm bài)"
  }
};

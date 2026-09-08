export type CognitiveLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'HIGHER_ORDER';

export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, { vi: string; en: string; color: string; badge: string }> = {
  REMEMBER: { vi: 'Nhận biết', en: 'Remember', color: 'blue', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDERSTAND: { vi: 'Thông hiểu', en: 'Understand', color: 'emerald', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  APPLY: { vi: 'Vận dụng', en: 'Apply', color: 'amber', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGHER_ORDER: { vi: 'Vận dụng cao', en: 'Higher-Order / Analyze', color: 'purple', badge: 'bg-purple-50 text-purple-700 border-purple-200' }
};

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface QuestionOption {
  id: string;
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  content: string;
  isCorrect: boolean;
}

export interface QuestionVersionEntity {
  id: string;
  questionId: string;
  version: number;
  content: string;
  hasLatex: boolean;
  questionType: QuestionType;
  cognitiveLevel: CognitiveLevel;
  defaultScore: number;
  explanation: string;
  options: QuestionOption[];
  knowledgeNodeIds: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  createdBy: string;
}

export interface KnowledgeNode {
  id: string;
  code: string;
  name: string;
  subject: string;
  grade: number;
  level: 'CURRICULUM' | 'SUBJECT' | 'TOPIC' | 'KNOWLEDGE_UNIT' | 'OUTCOME';
  parentId?: string;
  version: number;
}

export interface BlueprintMatrixCell {
  nodeId: string;
  nodeCode: string;
  nodeName: string;
  quotas: Record<CognitiveLevel, number>;
  pointsPerQuestion: Record<CognitiveLevel, number>;
}

export interface ExamItem {
  orderIndex: number;
  questionId: string;
  version: number;
  content: string;
  cognitiveLevel: CognitiveLevel;
  points: number;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    originalKey: 'A' | 'B' | 'C' | 'D';
    content: string;
    isCorrect: boolean;
  }[];
}

export interface ExamVariant {
  variantCode: string; // e.g. "101", "102", "103", "104"
  seed: number;
  items: ExamItem[];
}

export interface PublishedExam {
  id: string;
  title: string;
  blueprintId: string;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  isPublished: boolean; // Immutable flag
  publishedAt: string;
  variants: ExamVariant[];
}

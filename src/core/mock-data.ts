import { KnowledgeNode, QuestionVersionEntity, BlueprintMatrixCell } from './types';

export const SAMPLE_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'KN_MATH_12_INT_01',
    code: '12.GT.01',
    name: 'Nguyên hàm & Bảng nguyên hàm cơ bản',
    subject: 'Toán học 12',
    grade: 12,
    level: 'KNOWLEDGE_UNIT',
    version: 1
  },
  {
    id: 'KN_MATH_12_INT_02',
    code: '12.GT.02',
    name: 'Phương pháp đổi biến số & từng phần',
    subject: 'Toán học 12',
    grade: 12,
    level: 'KNOWLEDGE_UNIT',
    version: 1
  },
  {
    id: 'KN_MATH_12_INT_03',
    code: '12.GT.03',
    name: 'Định nghĩa & Tính chất của Tích phân',
    subject: 'Toán học 12',
    grade: 12,
    level: 'KNOWLEDGE_UNIT',
    version: 1
  },
  {
    id: 'KN_MATH_12_INT_04',
    code: '12.GT.04',
    name: 'Ứng dụng tích phân tính diện tích hình phẳng & thể tích tròn xoay',
    subject: 'Toán học 12',
    grade: 12,
    level: 'KNOWLEDGE_UNIT',
    version: 1
  },
  {
    id: 'KN_MATH_12_OXYZ_01',
    code: '12.HH.01',
    name: 'Hệ tọa độ trong không gian Oxyz & Phương trình mặt cầu',
    subject: 'Toán học 12',
    grade: 12,
    level: 'KNOWLEDGE_UNIT',
    version: 1
  }
];

export const SAMPLE_QUESTIONS_POOL: QuestionVersionEntity[] = [
  // Node 1 - Remember
  {
    id: 'ver-q1-v1',
    questionId: 'q-math-001',
    version: 1,
    content: 'Họ nguyên hàm của hàm số $f(x) = 3x^2 + 2x$ là:',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'REMEMBER',
    defaultScore: 0.25,
    explanation: 'Ta có $\\int (3x^2 + 2x) dx = x^3 + x^2 + C$.',
    options: [
      { id: 'opt-1', key: 'A', content: '$x^3 + x^2 + C$', isCorrect: true },
      { id: 'opt-2', key: 'B', content: '$6x + 2 + C$', isCorrect: false },
      { id: 'opt-3', key: 'C', content: '$x^3 + 2x^2 + C$', isCorrect: false },
      { id: 'opt-4', key: 'D', content: '$\\frac{x^3}{3} + x^2 + C$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_01'],
    status: 'PUBLISHED',
    createdAt: '2026-08-10T10:00:00Z',
    createdBy: 'GV_NguyenVanAn'
  },
  {
    id: 'ver-q2-v1',
    questionId: 'q-math-002',
    version: 1,
    content: 'Khẳng định nào sau đây là đúng với mọi hằng số $k \\ne 0$?',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'REMEMBER',
    defaultScore: 0.25,
    explanation: 'Theo tính chất nguyên hàm: $\\int k f(x) dx = k \\int f(x) dx$.',
    options: [
      { id: 'opt-5', key: 'A', content: '$\\int k f(x) dx = k \\int f(x) dx$', isCorrect: true },
      { id: 'opt-6', key: 'B', content: '$\\int k f(x) dx = \\frac{1}{k} \\int f(x) dx$', isCorrect: false },
      { id: 'opt-7', key: 'C', content: '$\\int k f(x) dx = k + \\int f(x) dx$', isCorrect: false },
      { id: 'opt-8', key: 'D', content: '$\\int [f(x) + g(x)] dx = \\int f(x) dx \\cdot \\int g(x) dx$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_01'],
    status: 'PUBLISHED',
    createdAt: '2026-08-10T10:15:00Z',
    createdBy: 'GV_NguyenVanAn'
  },

  // Node 1 - Understand
  {
    id: 'ver-q3-v1',
    questionId: 'q-math-003',
    version: 1,
    content: 'Tìm một nguyên hàm $F(x)$ của hàm số $f(x) = e^{2x}$ biết $F(0) = 1$.',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'UNDERSTAND',
    defaultScore: 0.25,
    explanation: '$F(x) = \\frac{1}{2}e^{2x} + C$. Vì $F(0) = \\frac{1}{2} + C = 1 \\implies C = \\frac{1}{2}$. Vậy $F(x) = \\frac{1}{2}e^{2x} + \\frac{1}{2}$.',
    options: [
      { id: 'opt-9', key: 'A', content: '$F(x) = \\frac{1}{2}e^{2x} + \\frac{1}{2}$', isCorrect: true },
      { id: 'opt-10', key: 'B', content: '$F(x) = 2e^{2x} - 1$', isCorrect: false },
      { id: 'opt-11', key: 'C', content: '$F(x) = \\frac{1}{2}e^{2x} + 1$', isCorrect: false },
      { id: 'opt-12', key: 'D', content: '$F(x) = e^{2x}$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_01'],
    status: 'PUBLISHED',
    createdAt: '2026-08-11T09:00:00Z',
    createdBy: 'GV_LeThiMai'
  },

  // Node 2 - Understand & Apply
  {
    id: 'ver-q4-v1',
    questionId: 'q-math-004',
    version: 1,
    content: 'Sử dụng phương pháp đổi biến $u = 2x + 1$, tích phân $I = \\int_0^1 (2x + 1)^3 dx$ chuyển thành:',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'UNDERSTAND',
    defaultScore: 0.25,
    explanation: 'Đặt $u = 2x + 1 \\implies du = 2dx \\implies dx = \\frac{1}{2}du$. Đổi cận $x=0 \\to u=1, x=1 \\to u=3$. $I = \\frac{1}{2}\\int_1^3 u^3 du$.',
    options: [
      { id: 'opt-13', key: 'A', content: '$I = \\frac{1}{2}\\int_1^3 u^3 du$', isCorrect: true },
      { id: 'opt-14', key: 'B', content: '$I = \\int_1^3 u^3 du$', isCorrect: false },
      { id: 'opt-15', key: 'C', content: '$I = 2\\int_0^1 u^3 du$', isCorrect: false },
      { id: 'opt-16', key: 'D', content: '$I = \\frac{1}{2}\\int_0^1 u^3 du$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_02'],
    status: 'PUBLISHED',
    createdAt: '2026-08-11T09:30:00Z',
    createdBy: 'GV_LeThiMai'
  },
  {
    id: 'ver-q5-v2', // Demonstrating version 2 with updated diagram explanation!
    questionId: 'q-math-005',
    version: 2,
    content: 'Tính tích phân từng phần $I = \\int_1^e x \\ln x \\, dx$.',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'APPLY',
    defaultScore: 0.25,
    explanation: 'Đặt $u = \\ln x \\implies du = \\frac{1}{x}dx$; $dv = x dx \\implies v = \\frac{x^2}{2}$. $I = \\frac{x^2}{2}\\ln x\\Big|_1^e - \\int_1^e \\frac{x}{2}dx = \\frac{e^2+1}{4}$.',
    options: [
      { id: 'opt-17', key: 'A', content: '$\\frac{e^2 + 1}{4}$', isCorrect: true },
      { id: 'opt-18', key: 'B', content: '$\\frac{e^2 - 1}{4}$', isCorrect: false },
      { id: 'opt-19', key: 'C', content: '$\\frac{e^2 + 1}{2}$', isCorrect: false },
      { id: 'opt-20', key: 'D', content: '$\\frac{e^2}{4}$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_02'],
    status: 'PUBLISHED',
    createdAt: '2026-08-12T14:00:00Z',
    createdBy: 'GV_TranVanKhoa'
  },

  // Node 3 - Remember & Understand
  {
    id: 'ver-q6-v1',
    questionId: 'q-math-006',
    version: 1,
    content: 'Nếu $\\int_0^2 f(x) dx = 3$ và $\\int_0^2 g(x) dx = -1$ thì $\\int_0^2 [2f(x) - 3g(x)] dx$ bằng:',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'UNDERSTAND',
    defaultScore: 0.25,
    explanation: '$2(3) - 3(-1) = 6 + 3 = 9$.',
    options: [
      { id: 'opt-21', key: 'A', content: '$9$', isCorrect: true },
      { id: 'opt-22', key: 'B', content: '$3$', isCorrect: false },
      { id: 'opt-23', key: 'C', content: '$-9$', isCorrect: false },
      { id: 'opt-24', key: 'D', content: '$5$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_03'],
    status: 'PUBLISHED',
    createdAt: '2026-08-12T14:30:00Z',
    createdBy: 'GV_TranVanKhoa'
  },

  // Node 4 - Apply & Higher Order
  {
    id: 'ver-q7-v1',
    questionId: 'q-math-007',
    version: 1,
    content: 'Diện tích hình phẳng giới hạn bởi đồ thị hàm số $y = x^2 - 4x + 3$ và trục hoành $Ox$ bằng:',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'APPLY',
    defaultScore: 0.25,
    explanation: 'Nghiệm $x^2 - 4x + 3 = 0 \\implies x=1, x=3$. $S = \\int_1^3 |x^2-4x+3| dx = \\int_1^3 (-x^2+4x-3) dx = \\frac{4}{3}$.',
    options: [
      { id: 'opt-25', key: 'A', content: '$\\frac{4}{3}$', isCorrect: true },
      { id: 'opt-26', key: 'B', content: '$\\frac{8}{3}$', isCorrect: false },
      { id: 'opt-27', key: 'C', content: '$\\frac{2}{3}$', isCorrect: false },
      { id: 'opt-28', key: 'D', content: '$4$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_04'],
    status: 'PUBLISHED',
    createdAt: '2026-08-13T10:00:00Z',
    createdBy: 'GV_PhamThanhLong'
  },
  {
    id: 'ver-q8-v1',
    questionId: 'q-math-008',
    version: 1,
    content: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ thỏa mãn $x f(x^3) + f(1 - x^2) = -x^5 + x^4 - 2x + 1$. Tích phân $I = \\int_{-1}^0 f(x) dx$ thuộc khoảng nào?',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'HIGHER_ORDER',
    defaultScore: 0.25,
    explanation: 'Câu hỏi phân hóa cao yêu cầu biến đổi tích phân kết hợp lấy cận đối xứng.',
    options: [
      { id: 'opt-29', key: 'A', content: '$\\left(-\\frac{1}{2}; 0\\right)$', isCorrect: true },
      { id: 'opt-30', key: 'B', content: '$\\left(0; \\frac{1}{2}\\right)$', isCorrect: false },
      { id: 'opt-31', key: 'C', content: '$(1; 2)$', isCorrect: false },
      { id: 'opt-32', key: 'D', content: '$\\left(\\frac{1}{2}; 1\\right)$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_INT_04'],
    status: 'PUBLISHED',
    createdAt: '2026-08-13T11:00:00Z',
    createdBy: 'GV_PhamThanhLong'
  },

  // Node 5 - Oxyz Remember & Apply
  {
    id: 'ver-q9-v1',
    questionId: 'q-math-009',
    version: 1,
    content: 'Trong không gian $Oxyz$, cho mặt cầu $(S): (x-1)^2 + (y+2)^2 + (z-3)^2 = 16$. Tọa độ tâm $I$ và bán kính $R$ của $(S)$ là:',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'REMEMBER',
    defaultScore: 0.25,
    explanation: 'Tâm $I(1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.',
    options: [
      { id: 'opt-33', key: 'A', content: '$I(1; -2; 3), R = 4$', isCorrect: true },
      { id: 'opt-34', key: 'B', content: '$I(-1; 2; -3), R = 4$', isCorrect: false },
      { id: 'opt-35', key: 'C', content: '$I(1; -2; 3), R = 16$', isCorrect: false },
      { id: 'opt-36', key: 'D', content: '$I(-1; 2; -3), R = 16$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_OXYZ_01'],
    status: 'PUBLISHED',
    createdAt: '2026-08-14T08:00:00Z',
    createdBy: 'GV_VuThiHuong'
  },
  {
    id: 'ver-q10-v1',
    questionId: 'q-math-010',
    version: 1,
    content: 'Trong không gian $Oxyz$, tìm tất cả giá trị thực của tham số $m$ để mặt phẳng $(P): 2x - y + 2z + m = 0$ tiếp xúc với mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 2 = 0$.',
    hasLatex: true,
    questionType: 'SINGLE_CHOICE',
    cognitiveLevel: 'APPLY',
    defaultScore: 0.25,
    explanation: 'Mặt cầu có tâm $I(1; -2; 3)$ và bán kính $R = 4$. Mặt phẳng tiếp xúc khi khoảng cách $d(I, (P)) = R \\iff \\frac{|2(1) - (-2) + 2(3) + m|}{\\sqrt{2^2 + (-1)^2 + 2^2}} = 4 \\implies |m + 10| = 12 \\implies m = 2$ hoặc $m = -22$.',
    options: [
      { id: 'opt-37', key: 'A', content: '$m = 2$ hoặc $m = -22$', isCorrect: true },
      { id: 'opt-38', key: 'B', content: '$m = -2$ hoặc $m = 22$', isCorrect: false },
      { id: 'opt-39', key: 'C', content: '$m = 2$ hoặc $m = 12$', isCorrect: false },
      { id: 'opt-40', key: 'D', content: '$m = 4$ hoặc $m = -20$', isCorrect: false },
    ],
    knowledgeNodeIds: ['KN_MATH_12_OXYZ_01'],
    status: 'PUBLISHED',
    createdAt: '2026-08-14T08:30:00Z',
    createdBy: 'GV_VuThiHuong'
  }
];

export const INITIAL_BLUEPRINT_MATRIX: BlueprintMatrixCell[] = [
  {
    nodeId: 'KN_MATH_12_INT_01',
    nodeCode: '12.GT.01',
    nodeName: 'Nguyên hàm & Bảng nguyên hàm',
    quotas: { REMEMBER: 2, UNDERSTAND: 1, APPLY: 0, HIGHER_ORDER: 0 },
    pointsPerQuestion: { REMEMBER: 0.25, UNDERSTAND: 0.25, APPLY: 0.25, HIGHER_ORDER: 0.25 }
  },
  {
    nodeId: 'KN_MATH_12_INT_02',
    nodeCode: '12.GT.02',
    nodeName: 'Đổi biến số & Tích phân từng phần',
    quotas: { REMEMBER: 0, UNDERSTAND: 1, APPLY: 1, HIGHER_ORDER: 0 },
    pointsPerQuestion: { REMEMBER: 0.25, UNDERSTAND: 0.25, APPLY: 0.25, HIGHER_ORDER: 0.25 }
  },
  {
    nodeId: 'KN_MATH_12_INT_03',
    nodeCode: '12.GT.03',
    nodeName: 'Định nghĩa & Tính chất tích phân',
    quotas: { REMEMBER: 0, UNDERSTAND: 1, APPLY: 0, HIGHER_ORDER: 0 },
    pointsPerQuestion: { REMEMBER: 0.25, UNDERSTAND: 0.25, APPLY: 0.25, HIGHER_ORDER: 0.25 }
  },
  {
    nodeId: 'KN_MATH_12_INT_04',
    nodeCode: '12.GT.04',
    nodeName: 'Ứng dụng hình học của tích phân',
    quotas: { REMEMBER: 0, UNDERSTAND: 0, APPLY: 1, HIGHER_ORDER: 1 },
    pointsPerQuestion: { REMEMBER: 0.25, UNDERSTAND: 0.25, APPLY: 0.25, HIGHER_ORDER: 0.25 }
  },
  {
    nodeId: 'KN_MATH_12_OXYZ_01',
    nodeCode: '12.HH.01',
    nodeName: 'Oxyz & Phương trình mặt cầu',
    quotas: { REMEMBER: 1, UNDERSTAND: 0, APPLY: 1, HIGHER_ORDER: 0 },
    pointsPerQuestion: { REMEMBER: 0.25, UNDERSTAND: 0.25, APPLY: 0.25, HIGHER_ORDER: 0.25 }
  }
];

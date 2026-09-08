/**
 * PSYCHOMETRICS ANALYTICS ENGINE
 * Cung cấp các công thức Đo lường Giáo dục (Item Response Analysis & Classical Test Theory)
 */

export interface ItemAnalysisResult {
  questionId: string;
  questionCode: string;
  cognitiveLevel: string;
  totalExaminees: number;
  correctCount: number;
  difficultyIndex: number; // P: 0.0 - 1.0
  difficultyEvaluation: {
    status: 'VERY_EASY' | 'EASY' | 'MODERATE_OPTIMAL' | 'DIFFICULT' | 'VERY_DIFFICULT';
    label: string;
    color: string;
  };
  discriminationIndex: number; // D: -1.0 - 1.0
  discriminationEvaluation: {
    status: 'EXCELLENT' | 'GOOD' | 'MARGINAL' | 'POOR_REJECT' | 'NEGATIVE_DEFECT';
    label: string;
    color: string;
  };
  upperGroupCorrect: number;
  lowerGroupCorrect: number;
  distractorBreakdown: {
    optionKey: string;
    totalChosen: number;
    percentage: number;
    upperGroupChosen: number;
    lowerGroupChosen: number;
    isKey: boolean;
  }[];
}

export interface ScoreDistributionStats {
  totalAttempts: number;
  meanScore: number;
  medianScore: number;
  stdDeviation: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // % >= 5.0
  histogram: { range: string; count: number; percentage: number }[];
}

export function evaluateDifficulty(p: number): ItemAnalysisResult['difficultyEvaluation'] {
  if (p > 0.85) return { status: 'VERY_EASY', label: 'Quá dễ (P > 0.85)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (p > 0.70) return { status: 'EASY', label: 'Dễ (0.70 < P ≤ 0.85)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (p >= 0.40) return { status: 'MODERATE_OPTIMAL', label: 'Độ khó lý tưởng (0.40 ≤ P ≤ 0.70)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (p >= 0.20) return { status: 'DIFFICULT', label: 'Khó (0.20 ≤ P < 0.40)', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  return { status: 'VERY_DIFFICULT', label: 'Rất khó (P < 0.20)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

export function evaluateDiscrimination(d: number): ItemAnalysisResult['discriminationEvaluation'] {
  if (d >= 0.40) return { status: 'EXCELLENT', label: 'Phân hóa rất tốt (D ≥ 0.40)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (d >= 0.30) return { status: 'GOOD', label: 'Phân hóa tốt (0.30 ≤ D < 0.40)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (d >= 0.20) return { status: 'MARGINAL', label: 'Tạm chấp nhận (0.20 ≤ D < 0.30)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (d >= 0.0) return { status: 'POOR_REJECT', label: 'Kém - Cần sửa/loại (0 ≤ D < 0.20)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  return { status: 'NEGATIVE_DEFECT', label: 'Lỗi đề - Điểm D âm (D < 0)', color: 'text-red-800 bg-red-100 border-red-300 font-bold' };
}

/**
 * Sinh dữ liệu mẫu mô phỏng 120 bài thi của học sinh để thực hiện Item Analysis
 */
export function generateSimulatedAttempts(questionIds: string[], count = 120) {
  const attempts: {
    candidateId: string;
    totalScore: number;
    responses: Record<string, { selected: string; isCorrect: boolean; key: string }>;
  }[] = [];

  const baseDifficulties: Record<string, { p: number; key: string }> = {
    'q-math-001': { p: 0.82, key: 'A' },
    'q-math-002': { p: 0.78, key: 'A' },
    'q-math-003': { p: 0.65, key: 'A' },
    'q-math-004': { p: 0.58, key: 'A' },
    'q-math-005': { p: 0.45, key: 'A' },
    'q-math-006': { p: 0.62, key: 'A' },
    'q-math-007': { p: 0.42, key: 'A' },
    'q-math-008': { p: 0.22, key: 'A' }, // Very hard
    'q-math-009': { p: 0.75, key: 'A' },
    'q-math-010': { p: 0.35, key: 'A' }
  };

  for (let i = 0; i < count; i++) {
    // Mỗi thí sinh có năng lực tiềm ẩn theta (chuẩn hóa từ 0.1 đến 0.95)
    const ability = Math.min(0.98, Math.max(0.05, 0.55 + (Math.random() - 0.5) * 0.4 + (Math.random() - 0.5) * 0.3));
    let score = 0;
    const responses: Record<string, { selected: string; isCorrect: boolean; key: string }> = {};

    for (const qId of questionIds) {
      const qMeta = baseDifficulties[qId] || { p: 0.5, key: 'A' };
      // Xác suất làm đúng phụ thuộc vào năng lực thí sinh và độ khó câu hỏi (gần mô hình 1-PL Rasch)
      const pSuccess = Math.min(0.95, Math.max(0.05, qMeta.p * 0.4 + ability * 0.6 + (Math.random() - 0.5) * 0.15));
      const isCorrect = Math.random() < pSuccess;

      let selected = qMeta.key;
      if (!isCorrect) {
        // Chọn ngẫu nhiên distractor B, C, D
        const distractors = ['A', 'B', 'C', 'D'].filter(k => k !== qMeta.key);
        selected = distractors[Math.floor(Math.random() * distractors.length)];
      } else {
        score += 1.0;
      }

      responses[qId] = { selected, isCorrect, key: qMeta.key };
    }

    attempts.push({
      candidateId: `candidate-${i + 1}`,
      totalScore: score,
      responses
    });
  }

  // Sắp xếp bài thi theo điểm giảm dần để chia nhóm Kelly 27%
  attempts.sort((a, b) => b.totalScore - a.totalScore);
  return attempts;
}

export function computePsychometrics(
  questionIds: string[],
  attempts: ReturnType<typeof generateSimulatedAttempts>
): {
  items: ItemAnalysisResult[];
  distribution: ScoreDistributionStats;
} {
  const N = attempts.length;
  const kellyGroupSize = Math.max(1, Math.round(N * 0.27)); // 27% cao nhất & thấp nhất theo quy tắc Kelly

  const upperGroup = attempts.slice(0, kellyGroupSize);
  const lowerGroup = attempts.slice(N - kellyGroupSize);

  const items: ItemAnalysisResult[] = [];

  for (const qId of questionIds) {
    let correctCount = 0;
    let upperCorrect = 0;
    let lowerCorrect = 0;

    const chosenCounts: Record<string, { total: number; upper: number; lower: number }> = {
      A: { total: 0, upper: 0, lower: 0 },
      B: { total: 0, upper: 0, lower: 0 },
      C: { total: 0, upper: 0, lower: 0 },
      D: { total: 0, upper: 0, lower: 0 }
    };

    // Toàn bộ thí sinh
    attempts.forEach(att => {
      const resp = att.responses[qId];
      if (resp) {
        if (resp.isCorrect) correctCount++;
        if (chosenCounts[resp.selected]) {
          chosenCounts[resp.selected].total++;
        }
      }
    });

    // Nhóm điểm cao (Upper 27%)
    upperGroup.forEach(att => {
      const resp = att.responses[qId];
      if (resp) {
        if (resp.isCorrect) upperCorrect++;
        if (chosenCounts[resp.selected]) chosenCounts[resp.selected].upper++;
      }
    });

    // Nhóm điểm thấp (Lower 27%)
    lowerGroup.forEach(att => {
      const resp = att.responses[qId];
      if (resp) {
        if (resp.isCorrect) lowerCorrect++;
        if (chosenCounts[resp.selected]) chosenCounts[resp.selected].lower++;
      }
    });

    // Độ khó P = R / N
    const p = parseFloat((correctCount / N).toFixed(3));
    // Độ phân hóa D = (R_H - R_L) / n
    const d = parseFloat(((upperCorrect - lowerCorrect) / kellyGroupSize).toFixed(3));

    const distractorBreakdown = (['A', 'B', 'C', 'D'] as const).map(key => ({
      optionKey: key,
      totalChosen: chosenCounts[key]?.total || 0,
      percentage: parseFloat((((chosenCounts[key]?.total || 0) / N) * 100).toFixed(1)),
      upperGroupChosen: chosenCounts[key]?.upper || 0,
      lowerGroupChosen: chosenCounts[key]?.lower || 0,
      isKey: key === 'A'
    }));

    items.push({
      questionId: qId,
      questionCode: qId.toUpperCase(),
      cognitiveLevel: 'Standard',
      totalExaminees: N,
      correctCount,
      difficultyIndex: p,
      difficultyEvaluation: evaluateDifficulty(p),
      discriminationIndex: d,
      discriminationEvaluation: evaluateDiscrimination(d),
      upperGroupCorrect: upperCorrect,
      lowerGroupCorrect: lowerCorrect,
      distractorBreakdown
    });
  }

  // Thống kê phổ điểm toàn kỳ thi
  const scores = attempts.map(a => (a.totalScore / questionIds.length) * 10); // scale về thang 10
  scores.sort((a, b) => a - b);

  const sum = scores.reduce((acc, s) => acc + s, 0);
  const mean = sum / N;
  const median = N % 2 === 0 ? (scores[N / 2 - 1] + scores[N / 2]) / 2 : scores[Math.floor(N / 2)];
  const variance = scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / N;
  const stdDev = Math.sqrt(variance);
  const passedCount = scores.filter(s => s >= 5.0).length;

  // Bucketing histogram: [0-2), [2-4), [4-6), [6-8), [8-10]
  const buckets = [
    { range: '0.0 - 2.0', min: 0, max: 2, count: 0 },
    { range: '2.0 - 4.0', min: 2, max: 4, count: 0 },
    { range: '4.0 - 6.0', min: 4, max: 6, count: 0 },
    { range: '6.0 - 8.0', min: 6, max: 8, count: 0 },
    { range: '8.0 - 10.0', min: 8, max: 10.01, count: 0 }
  ];

  scores.forEach(s => {
    for (const b of buckets) {
      if (s >= b.min && s < b.max) {
        b.count++;
        break;
      }
    }
  });

  const histogram = buckets.map(b => ({
    range: b.range,
    count: b.count,
    percentage: parseFloat(((b.count / N) * 100).toFixed(1))
  }));

  return {
    items,
    distribution: {
      totalAttempts: N,
      meanScore: parseFloat(mean.toFixed(2)),
      medianScore: parseFloat(median.toFixed(2)),
      stdDeviation: parseFloat(stdDev.toFixed(2)),
      highestScore: parseFloat(scores[scores.length - 1].toFixed(1)),
      lowestScore: parseFloat(scores[0].toFixed(1)),
      passRate: parseFloat(((passedCount / N) * 100).toFixed(1)),
      histogram
    }
  };
}

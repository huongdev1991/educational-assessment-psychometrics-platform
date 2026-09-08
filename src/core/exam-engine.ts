/**
 * DELIVERABLE 3: INTERFACE PORTS & DOMAIN MODEL CHO EXAM GENERATION ENGINE
 * Thuật toán sinh đề thi theo Ma trận Blueprint & Xáo trộn mã đề (Multi-code Shuffling)
 */

import { CognitiveLevel, QuestionVersionEntity, ExamItem, ExamVariant, PublishedExam } from './types';

// ============================================================================
// 1. VALUE OBJECTS & DOMAIN EXCEPTIONS
// ============================================================================

export class BlueprintPoolExhaustedException extends Error {
  constructor(nodeId: string, level: CognitiveLevel, requested: number, available: number) {
    super(
      `Candidate pool exhausted for KnowledgeNode [${nodeId}] at CognitiveLevel [${level}]. ` +
      `Requested: ${requested}, Available in published pool: ${available}.`
    );
    this.name = 'BlueprintPoolExhaustedException';
  }
}

export class ExamAlreadyPublishedException extends Error {
  constructor(examId: string) {
    super(`Exam [${examId}] has already been PUBLISHED and is strictly IMMUTABLE.`);
    this.name = 'ExamAlreadyPublishedException';
  }
}

export interface BlueprintRuleValueObject {
  knowledgeNodeId: string;
  knowledgeNodeName: string;
  cognitiveLevel: CognitiveLevel;
  requiredCount: number;
  pointsPerQuestion: number;
}

// ============================================================================
// 2. DOMAIN AGGREGATES & ENTITIES
// ============================================================================

export class AssessmentBlueprintAggregate {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly subjectId: string,
    public readonly rules: BlueprintRuleValueObject[],
    public readonly durationMinutes: number,
    public readonly passingScore: number
  ) {}

  public getTotalQuestions(): number {
    return this.rules.reduce((acc, rule) => acc + rule.requiredCount, 0);
  }

  public getTotalMaxScore(): number {
    return this.rules.reduce((acc, rule) => acc + (rule.requiredCount * rule.pointsPerQuestion), 0);
  }
}

export class ExamAggregate {
  private _isPublished: boolean = false;
  private _variants: readonly ExamVariant[] = [];
  private _publishedAt: Date | null = null;

  constructor(
    public readonly id: string,
    public readonly blueprintId: string,
    public readonly title: string,
    public readonly subject: string,
    public readonly durationMinutes: number
  ) {}

  // IMMUTABLE RULE: Khóa hoàn toàn khi đã publish
  public publish(variants: ExamVariant[]): void {
    if (this._isPublished) {
      throw new ExamAlreadyPublishedException(this.id);
    }
    if (variants.length === 0) {
      throw new Error('Cannot publish exam without at least one variant.');
    }
    this._variants = Object.freeze([...variants]);
    this._isPublished = true;
    this._publishedAt = new Date();
  }

  get isPublished(): boolean { return this._isPublished; }
  get variants(): readonly ExamVariant[] { return this._variants; }
  get publishedAt(): Date | null { return this._publishedAt; }
}

// ============================================================================
// 3. PORTS (INTERFACES)
// ============================================================================

export interface IQuestionCandidatePoolPort {
  fetchEligibleCandidates(
    knowledgeNodeId: string,
    cognitiveLevel: CognitiveLevel
  ): Promise<QuestionVersionEntity[]>;
}

export interface IBlueprintRepositoryPort {
  findById(id: string): Promise<AssessmentBlueprintAggregate | null>;
}

export interface IExamRepositoryPort {
  save(exam: ExamAggregate): Promise<void>;
  findById(id: string): Promise<ExamAggregate | null>;
}

export interface IExamGenerationEnginePort {
  generateExamVariants(
    blueprint: AssessmentBlueprintAggregate,
    variantCodes: string[],
    baseSeed?: number
  ): Promise<ExamVariant[]>;
}

// ============================================================================
// 4. ALGORITHM IMPLEMENTATION (DETERMINISTIC SEEDED SHUFFLING)
// ============================================================================

/**
 * Seeded PRNG (Mulberry32) để đảm bảo tính tái lập (Reproducibility).
 * Cùng một seed luôn cho ra chính xác cùng một trật tự xáo trộn đề!
 */
export function createMulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates Shuffle với Seeded Random
 */
export function seededShuffle<T>(array: T[], randomFn: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class ExamGenerationEngine implements IExamGenerationEnginePort {
  constructor(private readonly questionPoolPort: IQuestionCandidatePoolPort) {}

  async generateExamVariants(
    blueprint: AssessmentBlueprintAggregate,
    variantCodes: string[] = ['101', '102', '103', '104'],
    baseSeed: number = 42
  ): Promise<ExamVariant[]> {
    // 1. Gom tập câu hỏi Master theo từng Rule trong Blueprint
    const selectedMasterQuestions: {
      question: QuestionVersionEntity;
      rule: BlueprintRuleValueObject;
    }[] = [];

    for (const rule of blueprint.rules) {
      if (rule.requiredCount <= 0) continue;

      const candidates = await this.questionPoolPort.fetchEligibleCandidates(
        rule.knowledgeNodeId,
        rule.cognitiveLevel
      );

      if (candidates.length < rule.requiredCount) {
        throw new BlueprintPoolExhaustedException(
          rule.knowledgeNodeId,
          rule.cognitiveLevel,
          rule.requiredCount,
          candidates.length
        );
      }

      // Xáo trộn sơ bộ pool để chọn ngẫu nhiên các câu hỏi đạt chuẩn
      const seedForPool = baseSeed + rule.knowledgeNodeId.charCodeAt(0) * 17;
      const rng = createMulberry32(seedForPool);
      const shuffledCandidates = seededShuffle(candidates, rng);

      const picked = shuffledCandidates.slice(0, rule.requiredCount);
      for (const q of picked) {
        selectedMasterQuestions.push({ question: q, rule });
      }
    }

    // 2. Tạo các Mã Đề (Variants) bằng cách Xáo trộn Câu hỏi & Xáo trộn Đáp án
    const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const variants: ExamVariant[] = [];

    for (let vIndex = 0; vIndex < variantCodes.length; vIndex++) {
      const code = variantCodes[vIndex];
      const variantSeed = baseSeed + parseInt(code, 10) * 31 + vIndex * 101;
      const rng = createMulberry32(variantSeed);

      // Xáo trộn thứ tự các câu hỏi trong đề
      const shuffledQuestions = seededShuffle(selectedMasterQuestions, rng);

      const examItems: ExamItem[] = shuffledQuestions.map((item, idx) => {
        const originalOptions = item.question.options;
        // Xáo trộn các phương án A, B, C, D
        const shuffledOptions = seededShuffle(originalOptions, rng);

        // Gán lại nhãn Key mới (A, B, C, D) nhưng bảo toàn originalKey để Grading Engine chấm chính xác
        const mappedOptions = shuffledOptions.slice(0, 4).map((opt, optIdx) => ({
          key: letters[optIdx],
          originalKey: opt.key as 'A' | 'B' | 'C' | 'D',
          content: opt.content,
          isCorrect: opt.isCorrect
        }));

        return {
          orderIndex: idx + 1,
          questionId: item.question.questionId,
          version: item.question.version,
          content: item.question.content,
          cognitiveLevel: item.rule.cognitiveLevel,
          points: item.rule.pointsPerQuestion,
          options: mappedOptions
        };
      });

      variants.push({
        variantCode: code,
        seed: variantSeed,
        items: examItems
      });
    }

    return variants;
  }
}

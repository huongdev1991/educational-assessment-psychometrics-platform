/**
 * DELIVERABLE 4: ĐỊNH NGHĨA EVENT PAYLOAD `AttemptCompletedEvent` CHO ASYNCHRONOUS MESSAGING
 * Message Broker: Kafka / RabbitMQ Event-Driven Architecture
 */

import { z } from 'zod';

// ============================================================================
// 1. ZOD RUNTIME SCHEMA & VALIDATION
// ============================================================================

export const ItemResponseSchema = z.object({
  questionId: z.string().uuid(),
  questionVersion: z.number().int().positive(),
  cognitiveLevel: z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'HIGHER_ORDER']),
  knowledgeNodeId: z.string(),
  selectedOptionKeys: z.array(z.string().min(1).max(2)),
  isCorrect: z.boolean(),
  scoreEarned: z.number().min(0),
  maxScore: z.number().positive(),
  timeSpentSeconds: z.number().int().min(0),
  changeCount: z.number().int().min(0).default(0) // Số lần đổi đáp án (psychometric jitter analysis)
});

export const AttemptCompletedEventSchema = z.object({
  // CloudEvents / Standard Event Envelope
  eventId: z.string().uuid(),
  eventType: z.literal('AttemptCompletedEvent'),
  aggregateId: z.string().uuid(), // attemptId
  occurredAt: z.string().datetime(),
  schemaVersion: z.literal('1.0.0'),
  producer: z.literal('attempt-service'),
  correlationId: z.string().uuid(),

  payload: z.object({
    attemptId: z.string().uuid(),
    examId: z.string().uuid(),
    variantCode: z.string().min(3).max(10), // e.g. "101"
    candidateId: z.string().uuid(),
    
    sessionMetrics: z.object({
      startedAt: z.string().datetime(),
      submittedAt: z.string().datetime(),
      durationSeconds: z.number().int().positive(),
      clientIp: z.string().optional(),
      userAgent: z.string().optional(),
      blurWindowCount: z.number().int().min(0).default(0), // Phát hiện rời màn hình làm bài
      tabSwitches: z.number().int().min(0).default(0)
    }),

    scoreSummary: z.object({
      totalScore: z.number().min(0),
      maxScore: z.number().positive(),
      percentage: z.number().min(0).max(100),
      isPassed: z.boolean(),
      totalQuestions: z.number().int().positive(),
      correctCount: z.number().int().min(0),
      isManualGraded: z.boolean().default(false)
    }),

    itemResponses: z.array(ItemResponseSchema).min(1)
  })
});

export type AttemptCompletedEvent = z.infer<typeof AttemptCompletedEventSchema>;
export type ItemResponse = z.infer<typeof ItemResponseSchema>;

// ============================================================================
// 2. KAFKA TOPIC CONFIGURATION & CONSUMER SPECIFICATION
// ============================================================================

export const EVENT_SPECIFICATION = {
  kafkaTopic: "assessment.attempt.completed.v1",
  partitionKeyStrategy: "payload.examId (Partition by examId để đảm bảo thứ tự thống kê của cùng 1 kỳ thi)",
  retentionPolicy: "30 days (Log Compaction disabled, Append-Only)",
  consumers: [
    {
      service: "Analytics Service (Psychometrics Engine)",
      purpose: "Lắng nghe để cập nhật Difficulty Index (P), Discrimination Index (D), Score Distribution histogram, Cronbach's Alpha",
      retryPolicy: "Dead Letter Queue (DLQ) sau 3 lần retry thất bại"
    },
    {
      service: "Knowledge Service",
      purpose: "Cập nhật Learning Analytics và độ phủ Mastery của thí sinh trên Cây tri thức",
      retryPolicy: "Exponential backoff"
    },
    {
      service: "Notification Service",
      purpose: "Gửi Email / Notification kết quả thi cho thí sinh và giáo viên",
      retryPolicy: "Immediate retry with backoff"
    }
  ]
};

// ============================================================================
// 3. SAMPLE SERIALIZED JSON EVENT PAYLOAD
// ============================================================================

export const SAMPLE_ATTEMPT_COMPLETED_EVENT_JSON = {
  eventId: "a7c29b4e-8f12-4d33-91b5-12e09bc48d91",
  eventType: "AttemptCompletedEvent",
  aggregateId: "e903b128-45a7-4c7a-9cb8-f02738a19234",
  occurredAt: "2026-09-08T08:30:00.000Z",
  schemaVersion: "1.0.0",
  producer: "attempt-service",
  correlationId: "fa1b98c2-3e21-419b-a9b0-98327ef2110c",
  payload: {
    attemptId: "e903b128-45a7-4c7a-9cb8-f02738a19234",
    examId: "c381f26a-912b-47e1-8ca3-9a842718ef02",
    variantCode: "102",
    candidateId: "u5190283-7182-4211-92b1-098273618291",
    sessionMetrics: {
      startedAt: "2026-09-08T07:45:00.000Z",
      submittedAt: "2026-09-08T08:30:00.000Z",
      durationSeconds: 2700,
      clientIp: "118.70.12.89",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      blurWindowCount: 0,
      tabSwitches: 1
    },
    scoreSummary: {
      totalScore: 8.50,
      maxScore: 10.00,
      percentage: 85.00,
      isPassed: true,
      totalQuestions: 20,
      correctCount: 17,
      isManualGraded: false
    },
    itemResponses: [
      {
        questionId: "f01b9231-1823-4cb2-8712-982371289123",
        questionVersion: 1,
        cognitiveLevel: "REMEMBER",
        knowledgeNodeId: "KN_MATH_12_INT_01",
        selectedOptionKeys: ["B"],
        isCorrect: true,
        scoreEarned: 0.50,
        maxScore: 0.50,
        timeSpentSeconds: 42,
        changeCount: 0
      },
      {
        questionId: "f01b9231-1823-4cb2-8712-982371289124",
        questionVersion: 2,
        cognitiveLevel: "APPLY",
        knowledgeNodeId: "KN_MATH_12_INT_02",
        selectedOptionKeys: ["C"],
        isCorrect: false,
        scoreEarned: 0.00,
        maxScore: 0.50,
        timeSpentSeconds: 145,
        changeCount: 2
      }
    ]
  }
};

# ⚙️ CHI TIẾT CÁC BƯỚC THỰC THI KỸ THUẬT (TECHNICAL EXECUTION STEPS)

---

## 1. Chiến Lược Di Trú Cơ Sở Dữ Liệu (Database Migration Strategy)

Hệ thống áp dụng kiến trúc **Database-per-Service** nghiêm ngặt với **Drizzle ORM** và **PostgreSQL 16**. Mỗi dịch vụ có thư mục schema riêng biệt và chạy migration độc lập.

### 1.1. Cấu Trúc Thư Mục Migration Chuẩn Cho Từng Dịch Vụ
```
services/
├── question-service/
│   ├── src/infrastructure/drizzle/
│   │   ├── schema.ts            # Drizzle Table Definitions
│   │   └── drizzle.config.ts    # Drizzle Kit Configuration
│   └── drizzle/migrations/      # Auto-generated SQL Migration files
```

### 1.2. Phân Vùng Dữ Liệu Lớn Cho `attempt_db` (PostgreSQL Table Partitioning)
Bảng `candidate_attempts` và `attempt_responses` trong `attempt_db` là nơi phát sinh khối lượng dữ liệu khổng lồ (hàng chục triệu bản ghi khi tổ chức các kỳ thi quy mô lớn). 
Áp dụng kỹ thuật **Declarative Range Partitioning** theo `exam_id` hoặc theo `created_at` (tháng):

```sql
-- Partitioning bảng candidate_attempts theo khoảng thời gian
CREATE TABLE candidate_attempts (
    id UUID NOT NULL,
    exam_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL,
    score NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Tạo partition cho từng quý
CREATE TABLE candidate_attempts_2026_q1 PARTITION OF candidate_attempts
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');
CREATE TABLE candidate_attempts_2026_q2 PARTITION OF candidate_attempts
    FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');
```

---

## 2. Quy Trình Khởi Tạo Dịch Vụ Mẫu Theo Chuẩn Hexagonal (Boilerplate Blueprint)

Khi một kỹ sư bắt đầu xây dựng một dịch vụ mới (hoặc mở rộng dịch vụ hiện có), quy trình triển khai bắt buộc phải đi từ **Tâm (Domain)** ra **Biên (Adapters)**:

```
Tầng 1: Domain (Tâm)          ──▶ Định nghĩa Aggregates, Entities, Value Objects, Domain Errors.
                                    (Không import express, drizzle, axios, pg)
                                    │
                                    ▼
Tầng 2: Application (Ứng dụng) ──▶ Khai báo Inbound Ports (Interfaces cho Use Cases)
                                    Khai báo Outbound Ports (Interfaces cho Repositories/Kafka)
                                    Cài đặt Use Case Interactors (Business Logic Flow)
                                    │
                                    ▼
Tầng 3: Infrastructure (Hạ tầng) ──▶ Cài đặt Inbound Adapters (Express / Fastify Controllers, gRPC Handlers)
                                    Cài đặt Outbound Adapters (Drizzle PostgreSQL Repositories, Kafka Producers)
```

---

## 3. Đặc Tả Giao Tiếp Liên Dịch Vụ: gRPC & Protobuf Hợp Đồng

Đối với các cuộc gọi nội bộ đồng bộ có yêu cầu hiệu năng cao (đặc biệt giữa `Exam Service` $\leftrightarrow$ `Question Service` $\leftrightarrow$ `Knowledge Service`), sử dụng **gRPC trên nền HTTP/2** thay vì REST/JSON:

### File Định Nghĩa: `question.proto`
```protobuf
syntax = "proto3";

package assessment.question.v1;

enum CognitiveLevel {
  COGNITIVE_LEVEL_UNSPECIFIED = 0;
  RECALL = 1;
  UNDERSTAND = 2;
  APPLY = 3;
  ANALYZE = 4;
}

message GetCandidatePoolRequest {
  string knowledge_node_id = 1;
  CognitiveLevel cognitive_level = 2;
  int32 limit = 3;
}

message QuestionOptionItem {
  string option_key = 1;
  string content_markdown = 2;
  bool is_correct = 3;
}

message QuestionItem {
  string question_id = 1;
  string version_id = 2;
  string stem_markdown = 3;
  CognitiveLevel cognitive_level = 4;
  repeated QuestionOptionItem options = 5;
}

message GetCandidatePoolResponse {
  repeated QuestionItem questions = 1;
  int32 total_available = 2;
}

service QuestionService {
  rpc GetCandidatePool (GetCandidatePoolRequest) returns (GetCandidatePoolResponse);
}
```

---

## 4. Cấu Hình Apache Kafka & Thiết Kế Producer / Consumer Chịu Tải

### 4.1. Kafka Producer Configuration (Phía `Attempt Service`)
Để đảm bảo **không bao giờ mất bài thi của thí sinh**, Producer được cấu hình chế độ bền vững tối đa (`acks=all`):

```typescript
import { Kafka, CompressionTypes } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'attempt-service-producer',
  brokers: process.env.KAFKA_BROKERS!.split(','),
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({
  allowAutoTopicCreation: false,
  idempotent: true, // Chống gửi lặp gói tin ở cấp độ socket
  maxInFlightRequests: 1
});

export async function publishAttemptCompleted(event: any) {
  await producer.send({
    topic: 'assessment.attempt.completed.v1',
    compression: CompressionTypes.GZIP, // Nén payload giảm tải băng thông mạng
    messages: [
      {
        key: event.payload.examId, // Đảm bảo toàn bộ bài thi cùng 1 kỳ thi vào cùng 1 Partition
        value: JSON.stringify(event),
        headers: {
          'trace-id': event.traceId,
          'schema-version': '1.0.0'
        }
      }
    ]
  });
}
```

### 4.2. Kafka Consumer Idempotency Pattern (Phía `Analytics Service`)
```typescript
export async function handleAttemptCompletedEvent(message: any) {
  const event = JSON.parse(message.value.toString());
  const idempotencyKey = `processed:event:${event.eventId}`;

  // 1. Kiểm tra xem sự kiện này đã từng xử lý hay chưa qua Redis Distributed Lock / Cache
  const alreadyProcessed = await redisClient.set(idempotencyKey, '1', 'EX', 86400 * 7, 'NX');
  if (!alreadyProcessed) {
    console.warn(`[Kafka Consumer] Bỏ qua sự kiện trùng lặp: ${event.eventId}`);
    return;
  }

  try {
    // 2. Cập nhật thống kê độ khó P và độ phân hóa D
    await psychometricsCalculator.incorporateAttempt(event.payload);
  } catch (err) {
    // 3. Xóa key nếu xử lý thất bại để cho phép Retry
    await redisClient.del(idempotencyKey);
    throw err;
  }
}
```

---

## 5. Chiến Lược Caching Hai Tầng (Two-Tier Caching Architecture)

Nhằm giảm tải tối đa cho PostgreSQL khi bước vào giờ thi cao điểm:

1. **Tầng 1: In-Memory Local Cache (RAM của từng Microservice Instance)**:
   - Lưu trữ danh sách khóa công khai JWKS từ IAM Service (TTL: 12 giờ).
   - Lưu cấu trúc cây tri thức (TTL: 24 giờ).
2. **Tầng 2: Redis Distributed Cache Cluster**:
   - Lưu trữ toàn bộ các mã đề thi đã khóa bất biến (`exam:variant:{variantId}`).
   - Khi $100,000$ thí sinh bắt đầu giờ làm bài thi, yêu cầu tải đề thi được phục vụ $100\%$ từ Redis với độ trễ $< 2\text{ms}$, cơ sở dữ liệu `exam_db` hoàn toàn không phải chịu tải đọc.

---

## 6. Kiến Trúc Frontend: Khả Năng Hoạt Động Khi Mất Mạng (Offline Resilience)

### Mô Hình Hàng Đợi Đồng Bộ Cục Bộ (Client-Side Sync Queue with Zustand)
```typescript
// src/features/5-attempt/stores/offline-attempt.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PendingAnswer {
  questionId: string;
  selectedOptionKey: string;
  timestamp: number;
  synced: boolean;
}

export const useOfflineAttemptStore = create(
  persist<{
    answers: Record<string, PendingAnswer>;
    saveAnswer: (questionId: string, optionKey: string) => void;
    markSynced: (questionId: string) => void;
  }>(
    (set, get) => ({
      answers: {},
      saveAnswer: (questionId, optionKey) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              questionId,
              selectedOptionKey: optionKey,
              timestamp: Date.now(),
              synced: false
            }
          }
        }));
        // Kích hoạt worker ngầm gửi lên server
        syncWorker.triggerSync();
      },
      markSynced: (questionId) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: { ...state.answers[questionId], synced: true }
          }
        }));
      }
    }),
    {
      name: 'candidate_exam_session_backup',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```
Nhờ cơ chế này, ngay cả khi thí sinh bị rớt mạng Wi-Fi trong 10 phút, họ vẫn tiếp tục thao tác làm bài bình thường. Khi kết nối Internet được phục hồi, hệ thống ngầm tự động đẩy toàn bộ câu trả lời còn đọng lên server mà thí sinh không hề bị gián đoạn.

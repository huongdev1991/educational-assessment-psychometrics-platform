# Educational Assessment & Psychometrics Platform
> **Master Architectural Blueprint, Design Principles, Engineering Guidelines & Codebase Standards**  
> *Tài liệu đặc tả kiến trúc tiêu chuẩn, nguyên lý thiết kế và khung tham chiếu kỹ thuật cho toàn bộ chu kỳ phát triển hệ thống.*

---

## 📑 Mục Lục
1. [Tầm Nhìn & Phạm Vi Hệ Thống (System Vision & Scope)](#1-tầm-nhìn--phạm-vi-hệ-thống)
2. [Nguyên Lý Kiến Trúc Cốt Lõi (Core Architectural Principles)](#2-nguyên-lý-kiến-trúc-cốt-lõi)
3. [Bản Đồ 6 Bounded Contexts (Microservices Landscape)](#3-bản-đồ-6-bounded-contexts)
4. [Chuẩn Thiết Kế Hexagonal Architecture (Ports & Adapters)](#4-chuẩn-thiết-kế-hexagonal-architecture)
5. [Thiết Kế Cơ Sở Dữ Liệu & Indexing Strategy (Drizzle ORM + PostgreSQL)](#5-thiết-kế-cơ-sở-dữ-liệu--indexing-strategy)
6. [Thuật Toán Sinh Đề Thi Xác Định (Deterministic Permutation Engine)](#6-thuật-toán-sinh-đề-thi-xác-định)
7. [Đặc Tả Hợp Đồng Bất Đồng Bộ (Event-Driven Architecture & Kafka Payload)](#7-đặc-tả-hợp-đồng-bất-đồng-bộ)
8. [Phép Đo Tâm Trắc Học Giáo Dục (Psychometrics Item Analysis Engine)](#8-phép-đo-tâm-trắc-học-giáo-dục)
9. [Kiến Trúc Frontend (React 19 + Tailwind CSS + Feature Slices)](#9-kiến-trúc-frontend)
10. [Quy Chuẩn Lập Trình & Quy Trình Kỹ Thuật (Engineering Standards)](#10-quy-chuẩn-lập-trình--quy-trình-kỹ-thuật)
11. [Hướng Dẫn Cài Đặt & Vận Hành (Getting Started & Deployment)](#11-hướng-dẫn-cài-đặt--vận-hành)

---

## 1. Tầm Nhìn & Phạm Vi Hệ Thống

**Educational Assessment & Psychometrics Platform** là nền tảng khảo thí chuẩn hóa và phân tích đo lường tâm trắc học giáo dục thế hệ mới, phục vụ:
- Quản lý cây tri thức phân cấp sâu (Chương trình GDPT, Quốc tế, Khung năng lực, Chuẩn đầu ra).
- Ngân hàng câu hỏi RichText/LaTeX hỗ trợ phân loại nhận thức Bloom và **phiên bản bất biến (Immutable Versioning)**.
- Soạn thảo và thẩm định ma trận đề thi (Assessment Blueprint) 2 chiều (Đơn vị kiến thức $\times$ Mức độ nhận thức).
- Sinh đề thi tự động, xáo trộn mã đề xác định (Deterministic Seeded Permutation) đảm bảo độ tương đương giữa các mã đề (101, 102, 103, 104).
- Tổ chức thi trực tuyến chịu tải cao, lưu vết thời gian thực, chống gian lận và tự động chấm điểm.
- Động cơ đo lường tâm trắc học (Psychometrics Engine): Phân tích độ khó ($P$-value), độ phân hóa ($D$-index theo quy tắc Kelly 27%), chất lượng phương án nhiễu (Distractor Analysis), phổ điểm chuẩn hóa và độ tin cậy đề thi (Cronbach's Alpha).

---

## 2. Nguyên Lý Kiến Trúc Cốt Lõi

Mọi quyết định thiết kế và dòng mã nguồn trong dự án **bắt buộc tuân thủ 6 nguyên lý nền tảng** sau:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CORE DESIGN PRINCIPLES                            │
│                                                                         │
│  [1] Domain-Driven Design (DDD) & Ubiquitous Language                   │
│  [2] Hexagonal Architecture (Ports & Adapters)                          │
│  [3] Database-per-Service & Microservices Loose Coupling                │
│  [4] Event-Driven Architecture (EDA) & Asynchronous Decoupling          │
│  [5] Append-Only Immutability for Legal & Academic Integrity            │
│  [6] Deterministic Seeded Algorithms for Reproducible Exams             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Domain-Driven Design (DDD) & Ubiquitous Language
- Mỗi nghiệp vụ có ranh giới ngữ cảnh (Bounded Context) rõ ràng, sử dụng đồng nhất bộ thuật ngữ chuyên ngành: *Curriculum, Subject, Topic, Knowledge Node, Cognitive Level, Question Aggregate, Version, Blueprint Matrix, Exam Variant, Attempt, Item Difficulty ($P$), Item Discrimination ($D$)*.
- Nghiệp vụ cốt lõi nằm trọn trong **Domain Entities, Value Objects và Aggregates**, không bị ô nhiễm bởi thư viện bên thứ ba hay Framework HTTP/ORM.

### 2.2. Hexagonal Architecture (Ports & Adapters)
- Tuân thủ nghiêm ngặt **Dependency Inversion Principle**: Lõi nghiệp vụ (Domain) không phụ thuộc vào Application Services; Application Services không phụ thuộc vào Infrastructure.
- Chiều mũi tên phụ thuộc luôn **hướng vào trong (Inward Dependencies Only)**.
- Giao tiếp ngoại vi thực hiện thông qua **Driving Ports** (nhận lệnh từ HTTP/gRPC) và **Driven Ports** (phát lệnh tới PostgreSQL/Kafka/External APIs).

### 2.3. Database-per-Service & Zero Distributed Monolith
- Mỗi Bounded Context sở hữu một Database riêng biệt. **Nghiêm cấm tuyệt đối việc JOIN chéo bảng giữa 2 database của 2 dịch vụ khác nhau.**
- Quan hệ liên dịch vụ chỉ lưu trữ dưới dạng định danh nguyên thủy (`uuid` string, ví dụ `knowledgeNodeId: string`). Khi cần đồng bộ dữ liệu, sử dụng REST/gRPC (truy vấn nhanh) hoặc Kafka Events (cập nhật trạng thái).

### 2.4. Event-Driven Architecture (EDA) & Asynchronous Decoupling
- Khi một hành động hoàn tất trong phiên thi (ví dụ: Nộp bài thi), **Attempt Service** phản hồi thành công cho thí sinh trong vòng $< 50\text{ms}$, đồng thời phát sự kiện `AttemptCompletedEvent` lên Kafka Broker.
- Các dịch vụ nặng về tính toán (Analytics Service, Notification Service) đóng vai trò **Consumers**, xử lý nền bất đồng bộ mà không chặn luồng chính của thí sinh.

### 2.5. Tính Bất Biến Lịch Sử & Kiểm Thư Pháp Lý (Append-Only Immutability)
- Câu hỏi đã được xuất bản (`PUBLISHED`) và đề thi đã đưa vào kỳ thi **không bao giờ được phép UPDATE đè dữ liệu**.
- Mọi chỉnh sửa nội dung hoặc công thức bắt buộc sinh phiên bản mới `(question_id, version: v + 1)`. Bài thi và kết quả của thí sinh luôn trỏ cứng vào đúng phiên bản thời điểm thi, bảo vệ tính minh bạch pháp lý 100%.

### 2.6. Thuật Toán Xác Định Có Thể Tái Lập (Deterministic Reproducibility)
- Sinh đề thi và xáo trộn mã đề không sử dụng hàm ngẫu nhiên tự do `Math.random()`. Bắt buộc sử dụng thuật toán sinh số giả ngẫu nhiên có hạt giống **PRNG (Mulberry32)** kết hợp thuật toán xáo trộn **Fisher-Yates**. Cùng một Seed và cùng một Blueprint sẽ luôn tái tạo ra cùng một đề thi chính xác đến từng câu hỏi và phương án.

---

## 3. Bản Đồ 6 Bounded Contexts

Hệ thống được chia thành 6 Microservices tương ứng với 6 ranh giới nghiệp vụ độc lập:

```
                                  ┌───────────────────────────┐
                                  │   1. Knowledge Service    │
                                  │ (Curriculums, Nodes, LOs) │
                                  └─────────────┬─────────────┘
                                                │ (gRPC Sync Lookup)
                                                ▼
┌───────────────────────────┐     ┌───────────────────────────┐
│   3. Assessment Service   │────▶│    2. Question Service    │
│ (Blueprints, Taxonomies)  │     │ (Questions, LaTeX, Bloom) │
└─────────────┬─────────────┘     └─────────────┬─────────────┘
              │ (Candidate Pool Query)          │ (Candidate Pool)
              ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      4. Exam Service                        │
│ (Seeded Exam Generator, Variant Shuffler 101-104, Lock)     │
└─────────────────────────────┬───────────────────────────────┘
                              │ (Delivery API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     5. Attempt Service                      │
│ (Candidate Session, Anti-Cheat Blur Tracking, Auto-Grading) │
└─────────────────────────────┬───────────────────────────────┘
                              │ (Kafka Event: AttemptCompletedEvent)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    6. Analytics Service                     │
│ (Psychometrics P & D Indices, Distractor Analysis, Bell)    │
└─────────────────────────────────────────────────────────────┘
```

| # | Bounded Context | Trách Nhiệm Nghiệp Vụ Chính | Giao Thức Giao Tiếp | Storage |
|---|---|---|---|---|
| **1** | **Knowledge Service** | Quản lý cây tri thức phân cấp, Yêu cầu cần đạt (Learning Outcomes), Versioning cây tri thức. | gRPC Server / REST API | PostgreSQL (`knowledge_db`) |
| **2** | **Question Service** | Quản trị ngân hàng câu hỏi RichText/LaTeX, cấp độ nhận thức Bloom, quy trình duyệt, phiên bản bất biến. | REST API / gRPC Server | PostgreSQL (`question_db`) |
| **3** | **Assessment Service** | Quản lý ma trận đề thi (Blueprint 2 chiều: Chủ đề $\times$ Mức độ nhận thức), phân bổ hạn ngạch câu hỏi và điểm số. | REST API | PostgreSQL (`assessment_db`) |
| **4** | **Exam Service** | Engine sinh đề thi tự động, xáo trộn câu/đáp án xác định (Mã đề 101, 102...), đóng băng khóa đề khi Publish. | REST API | PostgreSQL (`exam_db`) |
| **5** | **Attempt Service** | Tiếp nhận phiên thi trực tuyến, đếm ngược, lưu vết thay đổi đáp án, bắt sự kiện chuyển tab, chấm điểm tự động. | REST API / Kafka Producer | PostgreSQL + Redis (`attempt_db`) |
| **6** | **Analytics Service** | Tiêu thụ sự kiện bài thi từ Kafka, phân tích tâm trắc học ($P$-value, $D$-index theo Kelly 27%), phân tích phương án nhiễu, phổ điểm. | Kafka Consumer / REST API | ClickHouse / PostgreSQL (`analytics_db`) |

---

## 4. Chuẩn Thiết Kế Hexagonal Architecture

Mỗi dịch vụ (ví dụ: `question-service`) được cấu trúc chặt chẽ theo 3 tầng cô lập:

```
question-service/
├── src/
│   ├── domain/                               # [TẦNG 1: DOMAIN CORE - KHÔNG PHỤ THUỘC NGOẠI VI]
│   │   ├── aggregates/
│   │   │   └── question.aggregate.ts         # Quản lý vòng đời, Invariant, sinh Version mới
│   │   ├── entities/
│   │   │   ├── question.entity.ts            # Định danh thực thể câu hỏi
│   │   │   ├── question-version.entity.ts    # Nội dung phiên bản (RichText, LaTeX, Điểm)
│   │   │   └── question-option.entity.ts     # Phương án A, B, C, D
│   │   ├── value-objects/
│   │   │   ├── cognitive-level.vo.ts         # Bloom: REMEMBER, UNDERSTAND, APPLY, HIGHER_ORDER
│   │   │   ├── question-type.vo.ts           # SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE
│   │   │   └── rich-content.vo.ts            # Sanitizer kiểm tra LaTeX và HTML an toàn
│   │   ├── events/
│   │   │   ├── question-created.event.ts     # Sự kiện nội bộ Domain
│   │   │   └── question-versioned.event.ts
│   │   └── exceptions/
│   │       └── immutable-version.exception.ts# Ném lỗi khi cố tình sửa đè câu hỏi đã PUBLISHED
│   │
│   ├── application/                          # [TẦNG 2: USE CASES & INTERFACE PORTS]
│   │   ├── ports/
│   │   │   ├── in/                           # Driving Ports (Cổng vào cho Controllers)
│   │   │   │   ├── create-question.use-case.ts
│   │   │   │   ├── create-new-version.use-case.ts
│   │   │   │   ├── publish-question.use-case.ts
│   │   │   │   └── query-candidate-pool.use-case.ts
│   │   │   └── out/                          # Driven Ports (Cổng ra cho DB / Broker / gRPC)
│   │   │       ├── question-repository.port.ts
│   │   │       ├── knowledge-service-client.port.ts
│   │   │       └── event-publisher.port.ts
│   │   ├── dtos/                             # Data Transfer Objects
│   │   │   ├── create-question.dto.ts
│   │   │   └── question-filter.dto.ts
│   │   └── use-cases/                        # Triển khai Use Case thực tế
│   │       ├── create-question.service.ts
│   │       └── create-new-version.service.ts
│   │
│   ├── infrastructure/                       # [TẦNG 3: ADAPTERS & TRIỂN KHAI VẬT LÝ]
│   │   ├── adapters/
│   │   │   ├── in/                           # Primary / Driving Adapters
│   │   │   │   ├── http/
│   │   │   │   │   ├── question.controller.ts# Express / Fastify Controller
│   │   │   │   │   └── schemas/              # Zod validation schemas
│   │   │   │   └── grpc/
│   │   │   │       ├── question.proto        # Protobuf definition
│   │   │   │       └── question-grpc.server.ts
│   │   │   └── out/                          # Secondary / Driven Adapters
│   │   │       ├── persistence/              # Drizzle ORM PostgreSQL
│   │   │       │   ├── schema/
│   │   │       │   │   ├── questions.schema.ts
│   │   │       │   │   └── question-versions.schema.ts
│   │   │       │   ├── drizzle-question.repository.ts
│   │   │       │   └── db-client.ts
│   │   │       ├── messaging/                # Kafka Event Publisher
│   │   │       │   └── kafka-event.publisher.ts
│   │   │       └── external/                 # gRPC Client sang Knowledge Service
│   │   │           └── grpc-knowledge.client.ts
│   │   └── di/                               # Dependency Injection Container
│   │       └── container.ts
│   │
│   ├── server.ts
│   └── index.ts
├── drizzle/                                  # Migration scripts tự động
├── drizzle.config.ts
├── Dockerfile
└── package.json
```

### Quy Tắc Vàng Khi Viết Code Trong Hexagonal:
1. **Lớp Domain KHÔNG import bất kỳ thứ gì từ Application hoặc Infrastructure.** Tuyệt đối không import thư viện `express`, `drizzle-orm`, `zod`, `pg` vào thư mục `src/domain/`.
2. **Application Layer chỉ giao tiếp với Cơ sở dữ liệu thông qua Ports (`IQuestionRepositoryPort`).** Nếu mai sau đổi từ PostgreSQL sang MongoDB, chỉ cần viết thêm một Adapter mới trong Infrastructure mà không phải sửa một dòng code nào trong Domain hay Use Case.
3. **Mọi kiểm tra tính hợp lệ nghiệp vụ phải thực hiện trong Aggregate Root** (ví dụ: Trắc nghiệm đơn lựa chọn phải có đúng 1 đáp án đúng).

---

## 5. Thiết Kế Cơ Sở Dữ Liệu & Indexing Strategy

Hệ thống sử dụng **Drizzle ORM** kết hợp **PostgreSQL** để quản trị cơ sở dữ liệu với kiểu dữ liệu an toàn (Type-Safe).

### 5.1. Sơ Đồ Quan Hệ Dữ Liệu (ERD Tóm Tắt)

```
[curriculums] 1──N [subjects] 1──N [topics] 1──N [knowledge_nodes]
                                                         │
                               (Loose Coupling String ID)│
                                                         ▼
[questions] 1──N [question_versions] 1──N [question_knowledge_mappings]
                         │
                         ├── 1──N [question_options] (A, B, C, D)
                         └── 1──N [exam_variant_items]
```

### 5.2. Các Bảng Chính Trong `question_db`

```typescript
// 1. Gốc câu hỏi (Bền vững theo thời gian)
export const questionsTable = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(), // e.g. 'Q-MATH-2026-008'
  status: varchar('status', { length: 32 }).default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// 2. Phiên bản câu hỏi (Bất biến - Append Only)
export const questionVersionsTable = pgTable('question_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questionsTable.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').notNull(), // v1, v2, v3...
  content: text('content').notNull(), // RichText + LaTeX
  hasLatex: boolean('has_latex').default(false).notNull(),
  questionType: varchar('question_type', { length: 32 }).notNull(), // SINGLE_CHOICE, MULTIPLE_CHOICE...
  cognitiveLevel: varchar('cognitive_level', { length: 32 }).notNull(), // REMEMBER, UNDERSTAND, APPLY, HIGHER_ORDER
  defaultScore: numeric('default_score', { precision: 5, scale: 2 }).default('1.00').notNull(),
  explanation: text('explanation'),
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(), // DRAFT, PUBLISHED, DEPRECATED
  createdBy: varchar('created_by', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  // Composite Unique: Khóa cứng tính toàn vẹn 1 câu hỏi chỉ có 1 row cho 1 version
  idxQVerUnique: uniqueIndex('idx_question_version_unique').on(table.questionId, table.version),
  // Composite Index quét cực nhanh Candidate Pool phục vụ Engine sinh đề
  idxQVerCognitiveStatus: index('idx_qver_cognitive_status').on(table.cognitiveLevel, table.status, table.questionType),
  idxQVerQuestionId: index('idx_qver_question_id').on(table.questionId)
}));

// 3. Phương án lựa chọn (A, B, C, D)
export const questionOptionsTable = pgTable('question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersionsTable.id, { onDelete: 'cascade' }).notNull(),
  key: varchar('key', { length: 4 }).notNull(), // 'A', 'B', 'C', 'D'
  content: text('content').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull()
}, (table) => ({
  idxOptVerKey: uniqueIndex('idx_opt_version_key').on(table.questionVersionId, table.key),
  idxOptVerId: index('idx_opt_version_id').on(table.questionVersionId)
}));
```

### 5.3. Chiến Lược Đánh Index Chiến Thuật (Performance Tuning)
1. **Candidate Pool Indexing**: `CREATE INDEX idx_qver_cognitive_status ON question_versions (cognitive_level, status, question_type);`
   - *Lý do*: Khi sinh đề từ 100,000 câu hỏi, Exam Engine lọc theo `status = 'PUBLISHED' AND cognitive_level = 'APPLY'`. Composite Index này giúp truy vấn hoàn thành dưới $2\text{ms}$.
2. **Knowledge Tree Materialized Path**: Trên bảng `knowledge_nodes`, trường `materialized_path` (ví dụ `1.3.12`) được gắn B-Tree index, cho phép tìm tất cả các câu hỏi thuộc toàn bộ cây con bằng toán tử `LIKE '1.3.%'`.
3. **Immutability Enforcement**: Khóa `UNIQUE (question_id, version)` loại bỏ hoàn toàn khả năng ghi đè phiên bản câu hỏi khi hai giáo viên cùng submit đồng thời.

---

## 6. Thuật Toán Sinh Đề Thi Xác Định

Quy trình sinh đề thi từ Ma trận Blueprint được chuẩn hóa theo sơ đồ sau:

```
[Assessment Blueprint] (Ma trận: Chủ đề x Bloom)
        │
        ▼
[Fetch Candidate Pool] (Lọc từ Question Service theo hạn ngạch)
        │
        ▼
[Mulberry32 PRNG] (Hạt giống xác định theo Exam ID + Base Seed)
        │
        ├──▶ Tạo Mã đề 101 ──▶ Seeded Fisher-Yates (Xáo câu) ──▶ Seeded Fisher-Yates (Xáo A,B,C,D)
        ├──▶ Tạo Mã đề 102 ──▶ Seeded Fisher-Yates (Xáo câu) ──▶ Seeded Fisher-Yates (Xáo A,B,C,D)
        ├──▶ Tạo Mã đề 103 ──▶ Seeded Fisher-Yates (Xáo câu) ──▶ Seeded Fisher-Yates (Xáo A,B,C,D)
        └──▶ Tạo Mã đề 104 ──▶ Seeded Fisher-Yates (Xáo câu) ──▶ Seeded Fisher-Yates (Xáo A,B,C,D)
        │
        ▼
[Exam Aggregate: PUBLISH] ──▶ Khóa BẤT BIẾN (Chặn sửa đổi sau khi Publish)
```

### 6.1. Thuật Toán Sinh Số Giả Ngẫu Nhiên (Mulberry32 PRNG)
```typescript
export function createMulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

### 6.2. Thuật Toán Xáo Trộn Fisher-Yates Xác Định
```typescript
export function seededShuffle<T>(array: readonly T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### 6.3. Nguyên Tắc Bảo Toàn Ánh Xạ Chấm Điểm (`originalKey`)
Khi xáo trộn các phương án lựa chọn:
- Vị trí hiển thị trên đề thi của thí sinh được gán nhãn mới là `key: 'A' | 'B' | 'C' | 'D'`.
- Hệ thống luôn bảo lưu thuộc tính `originalKey` trỏ về phương án gốc trong ngân hàng câu hỏi.
- **Lợi ích**: Khi học sinh nộp bài chọn `'B'`, Attempt Service đối chiếu qua bảng ánh xạ của mã đề đó để biết câu trả lời thực chất tương ứng với `originalKey` nào, cho phép chấm điểm tự động tức thì mà không cần giải mã lại từ đầu.

---

## 7. Đặc Tả Hợp Đồng Bất Đồng Bộ

### 7.1. CloudEvents Schema Cho `AttemptCompletedEvent`
* **Kafka Topic**: `assessment.attempt.completed.v1`
* **Partition Key**: `payload.examId` *(Đảm bảo tất cả bài thi cùng 1 kỳ thi đổ vào cùng một partition để thống kê chuẩn xác)*
* **Retention**: 30 ngày (Append-Only)

```json
{
  "eventId": "e9b21f30-8a4b-4c28-9d48-6a1073820a11",
  "eventType": "AttemptCompletedEvent",
  "aggregateId": "att-2026-9941",
  "occurredAt": "2026-09-08T08:45:12.430Z",
  "schemaVersion": "1.0.0",
  "producer": "attempt-service",
  "correlationId": "cor-6352-fa01",
  "payload": {
    "attemptId": "att-2026-9941",
    "examId": "exam-math-g12-midterm",
    "variantCode": "102",
    "candidateId": "cand-user-8842",
    "sessionMetrics": {
      "startedAt": "2026-09-08T08:00:00.000Z",
      "submittedAt": "2026-09-08T08:45:10.000Z",
      "durationSeconds": 2710,
      "clientIp": "14.161.32.10",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "blurWindowCount": 1,
      "tabSwitches": 1
    },
    "scoreSummary": {
      "totalScore": 8.5,
      "maxScore": 10.0,
      "percentage": 85.0,
      "isPassed": true,
      "totalQuestions": 10,
      "correctCount": 8,
      "isManualGraded": false
    },
    "itemResponses": [
      {
        "questionId": "q-math-008",
        "questionVersion": 1,
        "cognitiveLevel": "APPLY",
        "knowledgeNodeId": "node-derivative-03",
        "selectedOptionKeys": ["B"],
        "isCorrect": true,
        "scoreEarned": 1.0,
        "maxScore": 1.0,
        "timeSpentSeconds": 145,
        "changeCount": 2
      }
    ]
  }
}
```

### 7.2. Chính Sách Xử Lý Lỗi Phía Consumer (Resilience Strategy)
1. **Idempotent Consumers**: Sử dụng `eventId` làm Idempotency Key lưu vào Redis cache trong 7 ngày để chống xử lý trùng lặp tin nhắn (At-Least-Once Delivery).
2. **Dead Letter Queue (DLQ)**: Nếu Consumer gặp lỗi logic hoặc schema không hợp lệ sau 3 lần Retry (Exponential Backoff: 1s, 5s, 20s), tin nhắn được đẩy sang Topic `assessment.attempt.completed.dlq` kèm stacktrace để kỹ sư điều tra.

---

## 8. Phép Đo Tâm Trắc Học Giáo Dục

**Analytics Service** tự động tính toán các chỉ số kiểm định chất lượng đề thi chuẩn hóa quốc tế:

### 8.1. Chỉ Số Độ Khó Của Câu Hỏi (Item Difficulty - $P$)
$$P = \frac{R}{N}$$
*Trong đó:*
- $R$: Số thí sinh trả lời đúng câu hỏi đó.
- $N$: Tổng số thí sinh tham gia làm bài thi.

**Thang Đánh Giá Chuẩn:**
- $P > 0.85$: Câu hỏi **Rất dễ** (Nên xem xét chuyển thành câu nhận biết cơ bản).
- $0.70 < P \le 0.85$: Câu hỏi **Dễ**.
- $0.30 \le P \le 0.70$: Câu hỏi **Độ khó lý tưởng** (Phù hợp phân loại học sinh).
- $0.15 \le P < 0.30$: Câu hỏi **Khó**.
- $P < 0.15$: Câu hỏi **Rất khó** (Cần kiểm tra lại nội dung có đánh đố hoặc sai đề).

### 8.2. Chỉ Số Độ Phân Hóa (Discrimination Index - $D$ theo Quy Tắc Kelly 27%)
Sắp xếp danh sách thí sinh theo tổng điểm thi từ cao xuống thấp:
- Nhóm Điểm Cao ($U$ - Upper Group): Gồm 27% số thí sinh có điểm cao nhất.
- Nhóm Điểm Thấp ($L$ - Lower Group): Gồm 27% số thí sinh có điểm thấp nhất.

$$D = \frac{R_U - R_L}{n_{27\%}}$$
*Trong đó:*
- $R_U$: Số thí sinh nhóm cao làm đúng câu hỏi đó.
- $R_L$: Số thí sinh nhóm thấp làm đúng câu hỏi đó.
- $n_{27\%}$: Số lượng thí sinh trong một nhóm ($N \times 0.27$).

**Thang Đánh Giá Khảo Thí (Ebel Criteria):**
- $D \ge 0.40$: Câu hỏi có độ phân hóa **Xuất sắc**.
- $0.30 \le D < 0.40$: Câu hỏi **Tốt** (Chấp nhận được, ít cần chỉnh sửa).
- $0.20 \le D < 0.30$: Câu hỏi **Tạm được** (Cần xem xét cải thiện các phương án nhiễu).
- $D < 0.20$: Câu hỏi **Kém** (Cần loại bỏ khỏi ngân hàng câu hỏi hoặc viết lại hoàn toàn).
- $D < 0$: Câu hỏi **Bất thường / Nghịch đảo** (Học sinh giỏi làm sai nhiều hơn học sinh yếu -> Khả năng cao đáp án bị nhập ngược hoặc câu hỏi có bẫy sai logic).

### 8.3. Phân Tích Phương Án Nhiễu (Distractor Analysis)
Một phương án nhiễu (Distractor - đáp án sai) được coi là **hoạt động hiệu quả** khi:
1. Thu hút được ít nhất $5\%$ tổng số thí sinh lựa chọn.
2. Tỷ lệ lựa chọn của nhóm điểm thấp ($L$) phải **cao hơn** tỷ lệ lựa chọn của nhóm điểm cao ($U$). Nếu nhóm học sinh giỏi lại chọn phương án nhiễu nhiều hơn nhóm học sinh yếu, phương án đó gây hiểu nhầm hoặc có từ ngữ mập mờ.

---

## 9. Kiến Trúc Frontend

Frontend được xây dựng trên nền **React 19 + Tailwind CSS**, tổ chức theo mô hình **Vertical Feature Slices** ánh xạ trực tiếp với các Bounded Contexts:

```
src/
├── features/
│   ├── 1-knowledge/              # Quản lý Cây tri thức & Learning Outcomes
│   │   ├── api/use-knowledge.ts  # TanStack Query
│   │   └── components/
│   ├── 2-question-bank/          # Ngân hàng câu hỏi, soạn thảo LaTeX, preview
│   │   ├── api/use-questions.ts
│   │   └── components/
│   ├── 3-assessment-blueprint/   # Thiết lập Ma trận đề thi & Quotas
│   ├── 4-exam-engine/            # Chạy thuật toán sinh mã đề, xem trước đề thi
│   ├── 5-attempt-delivery/       # Phòng thi của thí sinh, Timer đếm ngược, chống mất mạng
│   │   └── stores/exam-session.ts# Zustand kết hợp LocalStorage Persistence
│   └── 6-psychometrics-analytics/# Biểu đồ độ khó P, độ phân hóa D, phổ điểm
├── shared/
│   ├── components/               # MathRenderer (KaTeX), CodeBlock, Button, Dialog
│   ├── lib/api-client.ts         # Axios / Fetch client chuẩn hóa
│   └── types/
└── App.tsx
```

### Chiến Lược Quản Lý State Phân Tầng:
1. **Server State (TanStack Query v5)**:
   - Dùng cho dữ liệu từ API (cây tri thức, danh sách câu hỏi, ma trận đề thi).
   - Thiết lập `staleTime: 5 * 60 * 1000` (5 phút) cho các danh mục ít biến động.
   - Tự động invalidate cache khi tạo version mới của câu hỏi.
2. **Client Session State (Zustand + Persist Middleware)**:
   - Áp dụng trong phòng thi của thí sinh (`features/5-attempt-delivery/stores/exam-session.ts`).
   - Tự động lưu trữ đệm từng câu trả lời (`CandidateAnswer`) vào `localStorage`. Nếu thí sinh lỡ tay tải lại trang (F5) hoặc rớt mạng Wi-Fi, trạng thái bài thi và đồng hồ đếm ngược được khôi phục ngay lập tức mà không bị mất dữ liệu.

---

## 10. Quy Chuẩn Lập Trình & Quy Trình Kỹ Thuật

### 10.1. Quy Ước Đặt Tên & Cấu Trúc File
- Tên thư mục và file: `kebab-case` (ví dụ: `question-version.entity.ts`, `use-exam-engine.ts`).
- Tên Class, Aggregate, Entity: `PascalCase` (ví dụ: `QuestionAggregate`, `ExamGenerationEngine`).
- Tên Interface: Bắt đầu bằng tiền tố `I` cho Ports (ví dụ: `IQuestionRepositoryPort`, `IEventPublisherPort`).
- Tên Database Tables: Số nhiều, `snake_case` (ví dụ: `questions`, `question_versions`, `knowledge_nodes`).

### 10.2. Quy Chuẩn Git & Commit (Conventional Commits)
Mọi commit phải tuân theo cấu trúc:
```
<type>(<scope>): <short summary>

[optional body]
```
- `feat(question)`: Thêm tính năng tạo phiên bản mới của câu hỏi
- `fix(exam-engine)`: Sửa lỗi tràn số trong hàm sinh số giả ngẫu nhiên Mulberry32
- `refactor(hexagonal)`: Tách nhỏ Driven Port cho Repository
- `perf(drizzle)`: Tối ưu index composite cho Candidate Pool
- `test(psychometrics)`: Bổ sung unit test kiểm thử chỉ số phân hóa $D$ theo quy tắc Kelly 27%

### 10.3. Tháp Kiểm Thử (Testing Strategy)
1. **Unit Tests (Jest / Vitest)**: Kiểm thử 100% logic trong thư mục `src/domain/` và các thuật toán toán học (`Mulberry32`, `Fisher-Yates`, `Psychometrics Formulae`). Không cần mock database.
2. **Contract Tests (Pact / Protobuf)**: Kiểm thử hợp đồng gRPC giữa Exam Service và Question Service, đảm bảo không có breaking changes.
3. **Integration Tests (Testcontainers)**: Khởi chạy PostgreSQL và Kafka thật trong Docker để kiểm tra các Drizzle Adapters và Kafka Consumers.
4. **End-to-End Tests (Playwright)**: Giả lập kịch bản thí sinh làm bài thi từ lúc bắt đầu đếm ngược, chuyển tab cảnh báo đến khi nộp bài và nhận phản hồi.

---

## 11. Hướng Dẫn Cài Đặt & Vận Hành

### 11.1. Yêu Cầu Môi Trường
- **Node.js**: $\ge 20.0.0$ LTS
- **Bun / NPM / Yarn**: Bản mới nhất
- **Docker & Docker Compose**: Dùng để chạy PostgreSQL và Kafka cụm địa phương
- **PostgreSQL**: Phiên bản 16+

### 11.2. Biến Môi Trường (.env.example)
Sao chép file cấu hình mẫu:
```bash
cp .env.example .env
```
Các biến chính:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://postgres:password@localhost:5432/educational_assessment_db
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=assessment-platform-local
```

### 11.3. Khởi Chạy Local Development
```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Kiểm tra type-safe và linting
npm run lint

# 3. Khởi chạy dev server (Port 3000)
npm run dev

# 4. Biên dịch đóng gói sản phẩm (Production Build)
npm run build
```

Sau khi khởi chạy, truy cập ứng dụng tại `http://localhost:3000` để trải nghiệm trực tiếp **Interactive Architecture Workbench & Psychometrics Lab**.

---

### 👨‍💻 Thông Tin Bản Quyền & Phát Triển
- **Dự Án**: Educational Assessment & Psychometrics Platform
- **Kiến Trúc**: Microservices DDD • Hexagonal Architecture • Event-Driven Kafka • Drizzle ORM • React 19
- **Tiêu Chuẩn**: ISO/IEC 25010 Software Quality • Ebel & Kelly 27% Psychometrics Criteria.

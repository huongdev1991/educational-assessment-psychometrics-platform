/**
 * DELIVERABLE 2: DRIZZLE ORM DATABASE SCHEMAS & VERSIONING STRATEGY
 * PostgreSQL Schemas for Knowledge Service & Question Service
 */

export const KNOWLEDGE_SERVICE_DRIZZLE_CODE = `// ============================================================================
// KNOWLEDGE SERVICE DATABASE SCHEMA (PostgreSQL via Drizzle ORM)
// Database: educational_knowledge_db (Isolated Microservice DB)
// ============================================================================

import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  integer, 
  boolean, 
  timestamp, 
  index, 
  uniqueIndex, 
  foreignKey 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Curriculums (Chương trình GDPT, e.g., GDPT 2018, Cambridge, IB)
export const curriculumsTable = pgTable('curriculums', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 32 }).notNull().unique(), // e.g. 'GDPT_2018'
  name: varchar('name', { length: 255 }).notNull(),
  startYear: integer('start_year').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// 2. Subjects (Môn học, e.g., Toán học, Vật lý, Hóa học)
export const subjectsTable = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  curriculumId: uuid('curriculum_id').references(() => curriculumsTable.id).notNull(),
  code: varchar('code', { length: 32 }).notNull(), // e.g. 'MATH_G12'
  name: varchar('name', { length: 128 }).notNull(),
  grade: integer('grade').notNull(), // 1 - 12
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxSubjectCurriculumGrade: index('idx_subject_curr_grade').on(table.curriculumId, table.grade),
  idxSubjectCodeUnique: uniqueIndex('idx_subject_code_unique').on(table.curriculumId, table.code)
}));

// 3. Topics (Chủ đề / Chuyên đề)
export const topicsTable = pgTable('topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: uuid('subject_id').references(() => subjectsTable.id).notNull(),
  parentTopicId: uuid('parent_topic_id'), // Self-reference for hierarchical sub-topics
  code: varchar('code', { length: 64 }).notNull(), // e.g. 'CALCULUS_INTEGRAL'
  title: varchar('title', { length: 255 }).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxTopicSubjectOrder: index('idx_topic_subject_order').on(table.subjectId, table.orderIndex),
  idxTopicParent: index('idx_topic_parent').on(table.parentTopicId)
}));

// 4. Knowledge Nodes (Đơn vị kiến thức / Yêu cầu cần đạt / Khung năng lực)
export const knowledgeNodesTable = pgTable('knowledge_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  topicId: uuid('topic_id').references(() => topicsTable.id).notNull(),
  parentNodeId: uuid('parent_node_id'),
  code: varchar('code', { length: 64 }).notNull(), // e.g. 'KN_MATH_12_INT_01'
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  nodeType: varchar('node_type', { length: 32 }).notNull(), // 'KNOWLEDGE_UNIT' | 'LEARNING_OUTCOME' | 'COMPETENCY'
  
  // Versioning attributes
  version: integer('version').default(1).notNull(),
  isCurrent: boolean('is_current').default(true).notNull(),
  status: varchar('status', { length: 32 }).default('ACTIVE').notNull(), // 'ACTIVE' | 'DEPRECATED'
  
  // Materialized Path for fast recursive subtree hierarchy queries (e.g. '1.3.12')
  materializedPath: varchar('materialized_path', { length: 255 }).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  // Composite index for versioned code lookup
  idxNodeCodeVersion: uniqueIndex('idx_node_code_version').on(table.code, table.version),
  // Index for fast query of current active knowledge tree
  idxNodeCurrentActive: index('idx_node_current_active').on(table.topicId, table.isCurrent),
  // B-tree index for subtree prefix searches: WHERE materialized_path LIKE '1.3.%'
  idxNodeMaterializedPath: index('idx_node_materialized_path').on(table.materializedPath)
}));
`;

export const QUESTION_SERVICE_DRIZZLE_CODE = `// ============================================================================
// QUESTION SERVICE DATABASE SCHEMA (PostgreSQL via Drizzle ORM)
// Database: educational_question_db (Isolated Microservice DB)
// ============================================================================

import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  integer, 
  boolean, 
  numeric, 
  timestamp, 
  index, 
  uniqueIndex 
} from 'drizzle-orm/pg-core';

// 1. Questions Root Table (Định danh vật lý của câu hỏi)
export const questionsTable = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(), // e.g. 'Q-MATH-2026-0042'
  status: varchar('status', { length: 32 }).default('ACTIVE').notNull(), // 'ACTIVE' | 'ARCHIVED'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxQuestionCode: uniqueIndex('idx_question_code').on(table.code)
}));

// 2. Question Versions Table (BẤT BIẾN - IMMUTABLE VERSION STORE)
// Mọi sửa đổi nội dung câu hỏi sau khi PUBLISHED sẽ sinh ra version mới (v2, v3).
// Khóa cứng không bao giờ UPDATE trực tiếp row có status = 'PUBLISHED'.
export const questionVersionsTable = pgTable('question_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questionsTable.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').notNull(), // 1, 2, 3...
  
  content: text('content').notNull(), // Hỗ trợ Markdown + LaTeX: $f(x) = \\int_0^x t^2 dt$
  hasLatex: boolean('has_latex').default(false).notNull(),
  questionType: varchar('question_type', { length: 32 }).notNull(), // 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  cognitiveLevel: varchar('cognitive_level', { length: 32 }).notNull(), // 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'HIGHER_ORDER'
  defaultScore: numeric('default_score', { precision: 5, scale: 2 }).default('1.00').notNull(),
  explanation: text('explanation'), // Lời giải chi tiết
  
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(), // 'DRAFT' | 'PUBLISHED' | 'DEPRECATED'
  createdBy: varchar('created_by', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  // Khóa duy nhất (question_id, version): Không bao giờ trùng version cho 1 câu hỏi
  idxQuestionVersionUnique: uniqueIndex('idx_question_version_unique').on(table.questionId, table.version),
  
  // Composite index tối ưu cho Exam Engine truy vấn Candidate Pool theo Mức độ nhận thức & Status
  idxQVersionCognitiveStatus: index('idx_qver_cognitive_status').on(
    table.cognitiveLevel, 
    table.status, 
    table.questionType
  ),
  
  // Index truy vấn các version của câu hỏi
  idxQVersionQuestionId: index('idx_qver_question_id').on(table.questionId)
}));

// 3. Question Options Table (Phương án lựa chọn A, B, C, D)
export const questionOptionsTable = pgTable('question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersionsTable.id, { onDelete: 'cascade' }).notNull(),
  key: varchar('key', { length: 4 }).notNull(), // 'A' | 'B' | 'C' | 'D' | 'E'
  content: text('content').notNull(), // LaTeX / Text phương án
  isCorrect: boolean('is_correct').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull()
}, (table) => ({
  idxOptionVersionKey: uniqueIndex('idx_option_version_key').on(table.questionVersionId, table.key),
  idxOptionVersionId: index('idx_option_version_id').on(table.questionVersionId)
}));

// 4. Question - Knowledge Mappings Table (Mapping câu hỏi vào Node của Knowledge Domain)
// Tách biệt theo kiến trúc Microservice: Lưu knowledgeNodeId dạng UUID/Varchar (Loose Coupling)
export const questionKnowledgeMappingsTable = pgTable('question_knowledge_mappings', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersionsTable.id, { onDelete: 'cascade' }).notNull(),
  knowledgeNodeId: varchar('knowledge_node_id', { length: 64 }).notNull(), // Node ID từ Knowledge Service
  knowledgeVersion: integer('knowledge_version').default(1).notNull(),
  isPrimary: boolean('is_primary').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  // Composite index phục vụ Exam Engine tìm các câu hỏi thuộc Node kiến thức cụ thể
  idxKnowledgeQuestionLookup: index('idx_knowledge_question_lookup').on(
    table.knowledgeNodeId, 
    table.questionVersionId
  ),
  idxQuestionVersionMapping: uniqueIndex('idx_qver_node_unique').on(
    table.questionVersionId, 
    table.knowledgeNodeId
  )
}));
`;

export const VERSIONING_STRATEGY_ANALYSIS = {
  philosophy: "Bảo toàn Lịch sử Tuyệt đối (Append-Only / Immutable Versioning)",
  reasons: [
    "Một câu hỏi khi đã được gắn vào Đề thi (Exam v1) và đã có học sinh làm bài thi (Attempt v1), câu hỏi đó trở thành chứng cứ pháp lý và căn cứ chấm điểm.",
    "Nếu giáo viên phát hiện lỗi chính tả hoặc cải tiến hình vẽ, hệ thống KHÔNG UPDATE đè v1 mà tạo ra v2 (Question Version 2).",
    "Đề thi cũ vẫn trỏ vĩnh viễn vào tuple (question_id, version: 1) -> Điểm số và psychometrics quá khứ không bao giờ bị sai lệch.",
    "Đề thi mới trong tương lai sẽ tự động lấy version mới nhất đã PUBLISHED (version: 2)."
  ],
  databaseMechanics: [
    "Khóa Composite Unique: `UNIQUE(question_id, version)` ngăn chặn việc trùng lặp phiên bản.",
    "PostgreSQL Row-Level Trigger (hoặc Domain Aggregate Guard): Rejects bất kỳ lệnh `UPDATE` nào lên `question_versions` nếu `status = 'PUBLISHED'`."
  ]
};

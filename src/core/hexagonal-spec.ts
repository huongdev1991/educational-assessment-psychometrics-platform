/**
 * DELIVERABLE 1: THIẾT KẾ FOLDER STRUCTURE & CODE MẪU HEXAGONAL ARCHITECTURE + DDD
 * Bounded Context: Question Service
 */

export const QUESTION_SERVICE_TREE = `
question-service/
├── src/
│   ├── domain/                               # [LAYER 1: PURE DOMAIN - NO EXTERNAL DEPENDENCIES]
│   │   ├── aggregates/
│   │   │   └── question.aggregate.ts         # QuestionAggregate Root: enforces invariants & business rules
│   │   ├── entities/
│   │   │   ├── question.entity.ts            # Base Question entity
│   │   │   ├── question-version.entity.ts    # Immutable Version entity
│   │   │   └── question-option.entity.ts     # Distractor/choice entity
│   │   ├── value-objects/
│   │   │   ├── cognitive-level.vo.ts         # Bloom taxonomy: REMEMBER | UNDERSTAND | APPLY | HIGHER_ORDER
│   │   │   ├── question-type.vo.ts           # SINGLE_CHOICE, MULTIPLE_CHOICE, etc.
│   │   │   ├── rich-content.vo.ts            # LaTeX, Markdown, Media sanitization
│   │   │   └── scoring-rule.vo.ts            # Partial scoring, negative marking rules
│   │   ├── events/
│   │   │   ├── question-created.event.ts     # Domain event: QuestionCreated
│   │   │   ├── question-versioned.event.ts   # Domain event: QuestionNewVersionCreated
│   │   │   └── question-published.event.ts   # Domain event: QuestionPublished
│   │   ├── exceptions/
│   │   │   ├── immutable-version.exception.ts# Rejects mutation of PUBLISHED questions
│   │   │   └── invalid-option-key.exception.ts
│   │   └── index.ts
│   │
│   ├── application/                          # [LAYER 2: APPLICATION SERVICES / USE CASES]
│   │   ├── ports/
│   │   │   ├── in/                           # Driving Ports (Input Interfaces for Use Cases)
│   │   │   │   ├── create-question.use-case.ts
│   │   │   │   ├── create-new-version.use-case.ts
│   │   │   │   ├── publish-question.use-case.ts
│   │   │   │   ├── get-question.use-case.ts
│   │   │   │   └── list-by-knowledge-node.use-case.ts
│   │   │   └── out/                          # Driven Ports (Output Interfaces for Infrastructure)
│   │   │       ├── question-repository.port.ts
│   │   │       ├── knowledge-service-client.port.ts # Inter-service sync contract (gRPC/REST)
│   │   │       ├── event-publisher.port.ts          # Async message broker contract (Kafka/RabbitMQ)
│   │   │       └── media-storage.port.ts            # LaTeX svg/images asset storage
│   │   ├── dtos/
│   │   │   ├── create-question.dto.ts
│   │   │   ├── question-version.dto.ts
│   │   │   └── query-question-filter.dto.ts
│   │   └── use-cases/
│   │       ├── create-question.service.ts
│   │       ├── create-new-version.service.ts
│   │       └── publish-question.service.ts
│   │
│   ├── infrastructure/                       # [LAYER 3: ADAPTERS (INBOUND & OUTBOUND)]
│   │   ├── adapters/
│   │   │   ├── in/                           # Primary / Driving Adapters
│   │   │   │   ├── http/
│   │   │   │   │   ├── question.controller.ts# Express/Fastify REST controller
│   │   │   │   │   ├── schemas/              # Zod validation schemas
│   │   │   │   │   │   └── question-request.schema.ts
│   │   │   │   │   └── middlewares/
│   │   │   │   │       └── auth-guard.middleware.ts
│   │   │   │   └── grpc/
│   │   │   │       ├── question.proto        # Protobuf definition for internal sync queries
│   │   │   │       └── question-grpc.server.ts
│   │   │   │
│   │   │   └── out/                          # Secondary / Driven Adapters
│   │   │       ├── persistence/              # Drizzle ORM PostgreSQL implementation
│   │   │       │   ├── schema/
│   │   │       │   │   ├── questions.schema.ts
│   │   │       │   │   ├── question-versions.schema.ts
│   │   │       │   │   └── question-knowledge-mappings.schema.ts
│   │   │       │   ├── drizzle-question.repository.ts # Implements IQuestionRepositoryPort
│   │   │       │   └── db-client.ts          # PgPool & Drizzle instance
│   │   │       ├── messaging/                # Kafka / RabbitMQ producer
│   │   │       │   ├── kafka-event.publisher.ts       # Implements IEventPublisherPort
│   │   │       │   └── topics.config.ts
│   │   │       └── external/                 # External service clients
│   │   │           └── grpc-knowledge-service.client.ts # Implements IKnowledgeServiceClientPort
│   │   │
│   │   ├── config/                           # Environment, Database & Broker configuration
│   │   │   ├── env.schema.ts
│   │   │   └── logger.ts
│   │   └── di/                               # Dependency Injection Composition Root
│   │       └── container.ts
│   │
│   ├── index.ts                              # Microservice entrypoint
│   └── server.ts                             # HTTP/gRPC server bootstrapper
│
├── drizzle/                                  # Drizzle migration files
│   └── 0001_init_question_schema.sql
├── drizzle.config.ts                         # Drizzle Kit CLI config
├── docker-compose.yml                        # Postgres & Kafka local environment
├── Dockerfile
├── package.json
└── tsconfig.json
`;

export const CODE_SAMPLES = {
  domainAggregate: `// 1. DOMAIN AGGREGATE ROOT (Pure TypeScript - Zero External Framework Coupling)
// File: src/domain/aggregates/question.aggregate.ts

export type CognitiveLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'HIGHER_ORDER';
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface QuestionOptionProps {
  id?: string;
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  content: string;
  isCorrect: boolean;
}

export interface QuestionVersionProps {
  version: number;
  content: string;
  hasLatex: boolean;
  questionType: QuestionType;
  cognitiveLevel: CognitiveLevel;
  defaultScore: number;
  explanation: string;
  options: QuestionOptionProps[];
  knowledgeNodeIds: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  createdBy: string;
}

export class QuestionAggregate {
  private _id: string;
  private _code: string;
  private _versions: QuestionVersionProps[] = [];
  private _currentVersion: number;
  private _domainEvents: any[] = [];

  constructor(id: string, code: string) {
    this._id = id;
    this._code = code;
    this._currentVersion = 0;
  }

  // Factory: Tạo mới một câu hỏi (Version 1)
  public static create(
    id: string,
    code: string,
    initialProps: Omit<QuestionVersionProps, 'version' | 'status' | 'createdAt'>
  ): QuestionAggregate {
    const aggregate = new QuestionAggregate(id, code);
    
    // Invariant: Single choice phải có đúng 1 đáp án đúng
    if (initialProps.questionType === 'SINGLE_CHOICE') {
      const correctCount = initialProps.options.filter(o => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new Error('SINGLE_CHOICE question must have exactly one correct answer.');
      }
    }

    const version1: QuestionVersionProps = {
      ...initialProps,
      version: 1,
      status: 'DRAFT',
      createdAt: new Date()
    };

    aggregate._versions.push(version1);
    aggregate._currentVersion = 1;
    aggregate._domainEvents.push({
      eventName: 'QuestionCreatedEvent',
      questionId: id,
      version: 1,
      occurredOn: new Date()
    });

    return aggregate;
  }

  // BẤT BIẾN (IMMUTABLE RULE): Không sửa đè version đã PUBLISHED. 
  // Thay vào đó, tạo ra Version N + 1 để bảo vệ các đề thi cũ đã tạo!
  public createNewVersion(
    props: Omit<QuestionVersionProps, 'version' | 'status' | 'createdAt'>,
    authorId: string
  ): number {
    const latest = this.getLatestVersion();
    const nextVersionNumber = latest.version + 1;

    const newVersion: QuestionVersionProps = {
      ...props,
      version: nextVersionNumber,
      status: 'DRAFT',
      createdAt: new Date(),
      createdBy: authorId
    };

    this._versions.push(newVersion);
    this._currentVersion = nextVersionNumber;

    this._domainEvents.push({
      eventName: 'QuestionVersionedEvent',
      questionId: this._id,
      previousVersion: latest.version,
      newVersion: nextVersionNumber,
      occurredOn: new Date()
    });

    return nextVersionNumber;
  }

  public publishVersion(version: number): void {
    const target = this._versions.find(v => v.version === version);
    if (!target) throw new Error(\`Version \${version} does not exist.\`);
    target.status = 'PUBLISHED';

    this._domainEvents.push({
      eventName: 'QuestionPublishedEvent',
      questionId: this._id,
      version,
      occurredOn: new Date()
    });
  }

  public getLatestVersion(): QuestionVersionProps {
    const latest = this._versions.find(v => v.version === this._currentVersion);
    if (!latest) throw new Error('No version found in Question aggregate.');
    return latest;
  }

  public pullDomainEvents(): any[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  get id(): string { return this._id; }
  get code(): string { return this._code; }
  get versions(): readonly QuestionVersionProps[] { return this._versions; }
}`,

  ports: `// 2. DRIVING & DRIVEN PORTS (Hexagonal Interfaces)
// File: src/application/ports/out/question-repository.port.ts

import { QuestionAggregate } from '../../../domain/aggregates/question.aggregate';

export interface IQuestionRepositoryPort {
  save(aggregate: QuestionAggregate): Promise<void>;
  findById(id: string): Promise<QuestionAggregate | null>;
  findByCode(code: string): Promise<QuestionAggregate | null>;
  findByKnowledgeNode(nodeId: string, cognitiveLevel?: string): Promise<QuestionAggregate[]>;
  batchFindCandidatePool(criteria: {
    nodeIds: string[];
    cognitiveLevels: string[];
    publishedOnly: boolean;
  }): Promise<QuestionAggregate[]>;
}

// File: src/application/ports/out/event-publisher.port.ts
export interface IEventPublisherPort {
  publish(topic: string, event: {
    eventId: string;
    eventType: string;
    aggregateId: string;
    timestamp: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
}

// File: src/application/ports/out/knowledge-service-client.port.ts
export interface IKnowledgeServiceClientPort {
  verifyNodeExists(nodeId: string): Promise<boolean>;
  getNodeHierarchy(nodeId: string): Promise<{ id: string; code: string; title: string }>;
}

// File: src/application/ports/in/create-question.use-case.ts
export interface CreateQuestionCommand {
  code: string;
  content: string;
  hasLatex: boolean;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  cognitiveLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'HIGHER_ORDER';
  defaultScore: number;
  explanation: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; content: string; isCorrect: boolean }[];
  knowledgeNodeIds: string[];
  authorId: string;
}

export interface ICreateQuestionUseCase {
  execute(command: CreateQuestionCommand): Promise<{ questionId: string; version: number }>;
}`,

  drizzleAdapter: `// 3. SECONDARY ADAPTER: Drizzle ORM Repository Implementation
// File: src/infrastructure/adapters/out/persistence/drizzle-question.repository.ts

import { eq, and, inArray } from 'drizzle-orm';
import { IQuestionRepositoryPort } from '../../../application/ports/out/question-repository.port';
import { QuestionAggregate } from '../../../../domain/aggregates/question.aggregate';
import { questionsTable, questionVersionsTable, questionOptionsTable, questionKnowledgeMappingsTable } from './schema/questions.schema';

export class DrizzleQuestionRepository implements IQuestionRepositoryPort {
  constructor(private readonly db: any) {}

  async save(aggregate: QuestionAggregate): Promise<void> {
    // Transactional consistency across question root, versions, options, and knowledge mappings
    await this.db.transaction(async (tx: any) => {
      // 1. Upsert Root Question
      await tx.insert(questionsTable).values({
        id: aggregate.id,
        code: aggregate.code,
        status: 'ACTIVE',
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: questionsTable.id,
        set: { updatedAt: new Date() }
      });

      // 2. Insert new versions (Immutable: never update existing published version rows!)
      for (const v of aggregate.versions) {
        const existingVersion = await tx.select().from(questionVersionsTable).where(
          and(
            eq(questionVersionsTable.questionId, aggregate.id),
            eq(questionVersionsTable.version, v.version)
          )
        ).limit(1);

        if (existingVersion.length === 0) {
          const [insertedVersion] = await tx.insert(questionVersionsTable).values({
            questionId: aggregate.id,
            version: v.version,
            content: v.content,
            hasLatex: v.hasLatex,
            questionType: v.questionType,
            cognitiveLevel: v.cognitiveLevel,
            defaultScore: v.defaultScore.toString(),
            explanation: v.explanation,
            status: v.status,
            createdBy: v.createdBy,
            createdAt: v.createdAt
          }).returning({ id: questionVersionsTable.id });

          // Insert options
          for (let i = 0; i < v.options.length; i++) {
            const opt = v.options[i];
            await tx.insert(questionOptionsTable).values({
              questionVersionId: insertedVersion.id,
              key: opt.key,
              content: opt.content,
              isCorrect: opt.isCorrect,
              orderIndex: i
            });
          }

          // Insert knowledge node mappings
          for (const nodeId of v.knowledgeNodeIds) {
            await tx.insert(questionKnowledgeMappingsTable).values({
              questionVersionId: insertedVersion.id,
              knowledgeNodeId: nodeId,
              isPrimary: true
            });
          }
        }
      }
    });
  }

  async findById(id: string): Promise<QuestionAggregate | null> {
    // Queries relational schema & reconstitutes domain aggregate
    // ... reconstitution logic mapping database tuples back to pure Domain Entities
    return null;
  }

  async findByCode(code: string): Promise<QuestionAggregate | null> { return null; }
  async findByKnowledgeNode(nodeId: string): Promise<QuestionAggregate[]> { return []; }
  async batchFindCandidatePool(criteria: any): Promise<QuestionAggregate[]> { return []; }
}`,

  httpController: `// 4. PRIMARY ADAPTER: Express HTTP Controller with Zod Validation
// File: src/infrastructure/adapters/in/http/question.controller.ts

import { Request, Response } from 'express';
import { z } from 'zod';
import { ICreateQuestionUseCase } from '../../../../application/ports/in/create-question.use-case';

const CreateQuestionSchema = z.object({
  code: z.string().min(3).max(50),
  content: z.string().min(10),
  hasLatex: z.boolean().default(false),
  questionType: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
  cognitiveLevel: z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'HIGHER_ORDER']),
  defaultScore: z.number().positive(),
  explanation: z.string().default(''),
  options: z.array(z.object({
    key: z.enum(['A', 'B', 'C', 'D', 'E']),
    content: z.string().min(1),
    isCorrect: z.boolean()
  })).min(2),
  knowledgeNodeIds: z.array(z.string().uuid()).min(1),
});

export class QuestionHttpController {
  constructor(private readonly createQuestionUseCase: ICreateQuestionUseCase) {}

  async createQuestion(req: Request, res: Response): Promise<void> {
    try {
      const validatedBody = CreateQuestionSchema.parse(req.body);
      const authorId = (req as any).user?.id || 'system_author';

      const result = await this.createQuestionUseCase.execute({
        ...validatedBody,
        authorId
      });

      res.status(201).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: err.errors });
        return;
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
}`
};

import { z } from 'zod';

// ============================================================================
// 1. ROLES & FINE-GRAINED SCOPES SPECIFICATION (<service>:<action>)
// ============================================================================

export type GlobalRole = 'ADMIN' | 'AUTHOR' | 'REVIEWER' | 'CANDIDATE';

export const SYSTEM_SCOPES = [
  // Question Service
  'question:create',
  'question:version',
  'question:review',
  'question:publish',
  'question:read',
  'question:delete',

  // Knowledge Service
  'knowledge:read',
  'knowledge:manage',

  // Assessment Service
  'assessment:blueprint_create',
  'assessment:blueprint_read',
  'assessment:blueprint_publish',

  // Exam Service
  'exam:generate',
  'exam:publish',
  'exam:read_variant',

  // Attempt Service
  'attempt:start',
  'attempt:save_response',
  'attempt:submit',
  'attempt:grade',
  'attempt:read_own',

  // Analytics Service
  'analytics:read_summary',
  'analytics:read_item_difficulty',
  'analytics:read_discrimination',
  'analytics:export_reports',

  // IAM Service
  'iam:user_manage',
  'iam:role_assign'
] as const;

export type SystemScope = typeof SYSTEM_SCOPES[number];

export const ROLE_PERMISSIONS_MAP: Record<GlobalRole, SystemScope[]> = {
  ADMIN: [
    'iam:user_manage',
    'iam:role_assign',
    'knowledge:manage',
    'knowledge:read',
    'question:create',
    'question:version',
    'question:review',
    'question:publish',
    'question:read',
    'question:delete',
    'assessment:blueprint_create',
    'assessment:blueprint_read',
    'assessment:blueprint_publish',
    'exam:generate',
    'exam:publish',
    'exam:read_variant',
    'attempt:start',
    'attempt:save_response',
    'attempt:submit',
    'attempt:grade',
    'attempt:read_own',
    'analytics:read_summary',
    'analytics:read_item_difficulty',
    'analytics:read_discrimination',
    'analytics:export_reports'
  ],
  AUTHOR: [
    'knowledge:read',
    'question:create',
    'question:version',
    'question:read',
    'assessment:blueprint_create',
    'assessment:blueprint_read',
    'exam:generate',
    'analytics:read_item_difficulty'
  ],
  REVIEWER: [
    'knowledge:read',
    'question:read',
    'question:review',
    'question:publish',
    'assessment:blueprint_read',
    'assessment:blueprint_publish',
    'exam:read_variant',
    'analytics:read_item_difficulty',
    'analytics:read_discrimination'
  ],
  CANDIDATE: [
    'attempt:start',
    'attempt:save_response',
    'attempt:submit',
    'attempt:read_own'
  ]
};

// ============================================================================
// 2. JWT TOKEN PAYLOAD SPECIFICATION WITH STATELESS EXT_CTX
// ============================================================================

export interface ExternalContext {
  [key: string]: string | number | boolean | undefined;
  tenant_id?: string;       // e.g. "so-gddt-tphcm", "school-le-hong-phong"
  school_id?: string;       // e.g. "sch-7821"
  class_id?: string;        // e.g. "12A1"
  exam_room_id?: string;    // e.g. "room-lab-04"
  device_fingerprint?: string;
}

export interface IamJwtPayload {
  // Standard RFC 7519 Claims
  iss: string;              // "https://iam.assessment-platform.internal"
  sub: string;              // Minimal User ID: e.g. "usr-8842-candidate"
  aud: string;              // "assessment-platform-apis"
  exp: number;              // Timestamp (epoch seconds)
  nbf: number;              // Not Before
  iat: number;              // Issued At
  jti: string;              // Unique Token ID for revocation tracking

  // Educational IAM Custom Claims
  username: string;
  email: string;
  roles: GlobalRole[];
  scopes: SystemScope[];    // Fine-grained <service>:<action>

  // Stateless External Context (Flexible Key-Value for Downstream Logging & Audit)
  ext_ctx: ExternalContext;
}

// Zod Schema for Token Validation
export const IamJwtPayloadSchema = z.object({
  iss: z.string().url(),
  sub: z.string().min(1),
  aud: z.string(),
  exp: z.number().int().positive(),
  nbf: z.number().int().positive(),
  iat: z.number().int().positive(),
  jti: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  roles: z.array(z.enum(['ADMIN', 'AUTHOR', 'REVIEWER', 'CANDIDATE'])),
  scopes: z.array(z.string()),
  ext_ctx: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
});

// ============================================================================
// 3. DRIZZLE SCHEMA FOR IAM SERVICE (iam_db)
// ============================================================================

export const IAM_DRIZZLE_SCHEMA_CODE = `// ============================================================================
// IAM Service Database Schema (PostgreSQL with Drizzle ORM)
// Database: educational_iam_db
// Design Principle: Minimalist & Generic Identity (NO school/class logic)
// ============================================================================

import { pgTable, uuid, varchar, text, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

// 1. Minimal Users Table (Only Identity, Zero Educational Domain Concepts)
export const iamUsersTable = pgTable('iam_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxUserEmail: uniqueIndex('idx_iam_user_email').on(table.email),
  idxUsername: uniqueIndex('idx_iam_username').on(table.username)
}));

// 2. Credentials Table (Securely Separated, Argon2id / Bcrypt Hashes)
export const iamCredentialsTable = pgTable('iam_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => iamUsersTable.id, { onDelete: 'cascade' }).notNull().unique(),
  passwordHash: text('password_hash').notNull(), // Argon2id hash with unique salt
  algorithm: varchar('algorithm', { length: 32 }).default('argon2id').notNull(),
  failedAttempts: integer('failed_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }).defaultNow().notNull()
});

// 3. Global Roles Table (Generic: ADMIN, AUTHOR, REVIEWER, CANDIDATE)
export const iamRolesTable = pgTable('iam_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 32 }).notNull().unique(), // 'ADMIN' | 'AUTHOR' | 'REVIEWER' | 'CANDIDATE'
  name: varchar('name', { length: 64 }).notNull(),
  description: text('description')
});

// 4. Role Permissions Mapping (<service>:<action>)
export const iamRolePermissionsTable = pgTable('iam_role_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  roleId: uuid('role_id').references(() => iamRolesTable.id, { onDelete: 'cascade' }).notNull(),
  scope: varchar('scope', { length: 64 }).notNull() // e.g. 'question:create', 'attempt:submit'
}, (table) => ({
  idxRoleScope: uniqueIndex('idx_role_scope').on(table.roleId, table.scope)
}));

// 5. User-to-Role Assignment
export const iamUserRolesTable = pgTable('iam_user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => iamUsersTable.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => iamRolesTable.id, { onDelete: 'cascade' }).notNull()
}, (table) => ({
  idxUserRole: uniqueIndex('idx_user_role').on(table.userId, table.roleId)
}));

// 6. Asymmetric Key Pairs (RS256 / Ed25519) for Token Signing & Rotation
export const iamSigningKeysTable = pgTable('iam_signing_keys', {
  kid: varchar('kid', { length: 64 }).primaryKey(), // Key ID (e.g. 'key-2026-q1')
  algorithm: varchar('algorithm', { length: 16 }).default('RS256').notNull(),
  publicKeyPem: text('public_key_pem').notNull(),
  privateKeyEncrypted: text('private_key_encrypted').notNull(), // KMS/Vault encrypted
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
`;

// ============================================================================
// 4. JWKS ENDPOINT SPECIFICATION (/.well-known/jwks.json)
// ============================================================================

export const SAMPLE_JWKS_RESPONSE = {
  keys: [
    {
      kty: "RSA",
      use: "sig",
      alg: "RS256",
      kid: "iam-key-2026-v1",
      n: "u1R6e3WpP...M9xLq2Z_mock_rsa_modulus_2048bit...7wQ",
      e: "AQAB"
    }
  ]
};

// ============================================================================
// 5. DOWNSTREAM AUTHENTICATION & SCOPE ENFORCEMENT MIDDLEWARE CODE
// ============================================================================

export const DOWNSTREAM_AUTH_MIDDLEWARE_CODE = `// ============================================================================
// Downstream Service Auth Middleware (Express / Fastify)
// Zero Network Call to IAM Service: Validates token locally using cached JWKS!
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

// Cache Public Key from IAM JWKS Endpoint
const jwksClient = jwksRsa({
  jwksUri: process.env.IAM_JWKS_URI || 'http://iam-service:3000/.well-known/jwks.json',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

function getKey(header: any, callback: any) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// 1. Authenticate Token Middleware
export function authenticateIamToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing Bearer token' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['RS256'], audience: 'assessment-platform-apis' }, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: err.message });
    }

    // Attach User & Stateless Context to Request
    req.user = {
      userId: decoded.sub,
      username: decoded.username,
      roles: decoded.roles,
      scopes: decoded.scopes,
      // External Context extracted cleanly for audit & analytics logs:
      externalContext: decoded.ext_ctx || {}
    };

    next();
  });
}

// 2. Fine-Grained Scope Authorization Guard (<service>:<action>)
export function requireScope(requiredScope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userScopes: string[] = req.user?.scopes || [];
    
    if (!userScopes.includes(requiredScope)) {
      return res.status(403).json({
        error: 'FORBIDDEN_SCOPE',
        message: \`Operation requires scope [\${requiredScope}]. Granted: [\${userScopes.join(', ')}]\`,
        requiredScope
      });
    }

    // Pass through: Authorized!
    next();
  };
}

// Example Controller using Stateless External Context:
// app.post('/api/questions', authenticateIamToken, requireScope('question:create'), (req, res) => {
//   console.log(\`[AUDIT] User \${req.user.userId} created question under Tenant [\${req.user.externalContext.tenant_id}] Class [\${req.user.externalContext.class_id}]\`);
//   ...
// });
`;

// ============================================================================
// 6. SAMPLE USERS FOR INTERACTIVE WORKBENCH
// ============================================================================

export interface SampleIamUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: GlobalRole;
  defaultExtCtx: ExternalContext;
}

export const SAMPLE_IAM_USERS: SampleIamUser[] = [
  {
    userId: 'usr-admin-001',
    username: 'sysadmin',
    email: 'admin@assessment.edu.vn',
    fullName: 'Trần Văn Quản Trị (Super Admin)',
    role: 'ADMIN',
    defaultExtCtx: {
      tenant_id: 'central-assessment-board',
      school_id: 'board-hq'
    }
  },
  {
    userId: 'usr-author-042',
    username: 'author.nguyenvan',
    email: 'nguyen.author@assessment.edu.vn',
    fullName: 'Nguyễn Văn Soạn Thảo (Question Author)',
    role: 'AUTHOR',
    defaultExtCtx: {
      tenant_id: 'hcm-highschools-group',
      school_id: 'thpt-chuyen-le-hong-phong',
      subject_division: 'math-dept'
    }
  },
  {
    userId: 'usr-reviewer-019',
    username: 'reviewer.lethi',
    email: 'le.reviewer@assessment.edu.vn',
    fullName: 'Lê Thị Thẩm Định (Peer Reviewer)',
    role: 'REVIEWER',
    defaultExtCtx: {
      tenant_id: 'hcm-highschools-group',
      school_id: 'thpt-chuyen-tran-dai-nghia'
    }
  },
  {
    userId: 'usr-cand-8842',
    username: 'candidate.hoangminh',
    email: 'hoangminh2008@student.edu.vn',
    fullName: 'Hoàng Minh Khang (Thi Sinh)',
    role: 'CANDIDATE',
    defaultExtCtx: {
      tenant_id: 'hcm-highschools-group',
      school_id: 'thpt-chuyen-le-hong-phong',
      class_id: '12-Toan-1',
      exam_room_id: 'room-lab-04',
      device_fingerprint: 'fp_mac_chrome_8842'
    }
  }
];

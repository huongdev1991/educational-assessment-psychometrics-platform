import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Key, 
  FileCode, 
  UserCheck, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Server, 
  Sparkles,
  Layers,
  Database,
  Globe
} from 'lucide-react';
import { 
  SAMPLE_IAM_USERS, 
  SampleIamUser, 
  ROLE_PERMISSIONS_MAP, 
  IamJwtPayload, 
  IAM_DRIZZLE_SCHEMA_CODE, 
  DOWNSTREAM_AUTH_MIDDLEWARE_CODE,
  SAMPLE_JWKS_RESPONSE 
} from '../core/iam-service';
import { CodeBlock } from './CodeBlock';

export const Deliverable0IAM: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<SampleIamUser>(SAMPLE_IAM_USERS[3]); // Default: Candidate
  const [extCtxJson, setExtCtxJson] = useState<string>(JSON.stringify(SAMPLE_IAM_USERS[3].defaultExtCtx, null, 2));
  const [extCtxError, setExtCtxError] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'middleware' | 'drizzle' | 'jwks'>('middleware');

  // Test Endpoint Sandbox state
  const [testEndpoint, setTestEndpoint] = useState<{
    path: string;
    method: string;
    requiredScope: string;
    serviceName: string;
  }>({
    path: '/api/attempts/submit',
    method: 'POST',
    requiredScope: 'attempt:submit',
    serviceName: 'Attempt Service'
  });

  const [simulationLog, setSimulationLog] = useState<{
    status: 'SUCCESS' | 'FORBIDDEN' | 'ERROR';
    message: string;
    details?: any;
  } | null>(null);

  // Handle User change
  const handleUserChange = (u: SampleIamUser) => {
    setSelectedUser(u);
    setExtCtxJson(JSON.stringify(u.defaultExtCtx, null, 2));
    setExtCtxError(null);
    setSimulationLog(null);
  };

  // Parse ext_ctx
  const parsedExtCtx = useMemo(() => {
    try {
      const parsed = JSON.parse(extCtxJson);
      setExtCtxError(null);
      return parsed;
    } catch (e: any) {
      setExtCtxError(e.message);
      return selectedUser.defaultExtCtx;
    }
  }, [extCtxJson, selectedUser]);

  // Compute live JWT Payload
  const jwtPayload: IamJwtPayload = useMemo(() => {
    const nowEpoch = Math.floor(Date.now() / 1000);
    return {
      iss: 'https://iam.assessment-platform.internal',
      sub: selectedUser.userId,
      aud: 'assessment-platform-apis',
      exp: nowEpoch + 3600 * 4, // 4 hours
      nbf: nowEpoch,
      iat: nowEpoch,
      jti: `tok-${selectedUser.userId.slice(-4)}-9982-f47a`,
      username: selectedUser.username,
      email: selectedUser.email,
      roles: [selectedUser.role],
      scopes: ROLE_PERMISSIONS_MAP[selectedUser.role],
      ext_ctx: parsedExtCtx
    };
  }, [selectedUser, parsedExtCtx]);

  // JWT Header
  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'iam-key-2026-v1'
  };

  // Pseudo encoded token parts
  const encodedHeader = btoa(JSON.stringify(jwtHeader)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '');
  const pseudoSignature = 'c8bK7w_mock_rsa_sha256_digital_signature_99qL2vX_zK4';

  // Handle Test Downstream Request
  const handleSimulateRequest = () => {
    const hasScope = jwtPayload.scopes.includes(testEndpoint.requiredScope as any);
    if (hasScope) {
      setSimulationLog({
        status: 'SUCCESS',
        message: `[200 OK] Yêu cầu được chấp thuận bởi ${testEndpoint.serviceName}! Scope hợp lệ: '${testEndpoint.requiredScope}'.`,
        details: {
          sub: jwtPayload.sub,
          role: jwtPayload.roles[0],
          verifiedBy: 'Cached RS256 Public Key (Zero Network Call to IAM)',
          downstreamAuditLog: `[AUDIT LOG] Action executed under External Context: Tenant=[${parsedExtCtx.tenant_id || 'N/A'}], School=[${parsedExtCtx.school_id || 'N/A'}], Class=[${parsedExtCtx.class_id || 'N/A'}]`
        }
      });
    } else {
      setSimulationLog({
        status: 'FORBIDDEN',
        message: `[403 FORBIDDEN] Từ chối truy cập! Yêu cầu scope '${testEndpoint.requiredScope}' nhưng user '${selectedUser.username}' (${selectedUser.role}) chỉ có: [${jwtPayload.scopes.slice(0, 3).join(', ')}...]`,
        details: {
          requiredScope: testEndpoint.requiredScope,
          grantedScopes: jwtPayload.scopes,
          remediation: `Chỉ gán cho role có quyền (ví dụ: ${testEndpoint.requiredScope.startsWith('question') ? 'AUTHOR hoặc ADMIN' : testEndpoint.requiredScope.startsWith('exam') ? 'AUTHOR hoặc ADMIN' : 'CANDIDATE'}).`
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">0. Identity &amp; Access Management (IAM) Service</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  Headless &amp; Generic
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Xác thực phi tập trung (Stateless JWT / RS256 / JWKS) • Phân quyền Scopes hạt mịn &lt;service&gt;:&lt;action&gt; • Ngữ cảnh mở rộng ext_ctx
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              RS256 Asymmetric
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              JWKS Endpoint
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Zero School-Coupling
            </span>
          </div>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Định Danh Tối Giản</div>
            <div className="text-sm font-bold text-slate-800">UserId &amp; Credentials</div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              IAM chỉ quản lý UserID, Argon2id hash và 4 Global Roles (Admin, Author, Reviewer, Candidate). Không lưu logic trường học hay lớp.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chữ Ký Phi Đối Xứng</div>
            <div className="text-sm font-bold text-violet-700">RS256 / JWKS Standard</div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              IAM ký token bằng Private Key. Tất cả 6 Downstream Services tự xác thực token bằng Public Key qua JWKS mà không cần gọi API về IAM.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phân Quyền Hạt Mịn</div>
            <div className="text-sm font-bold text-indigo-700">&lt;service&gt;:&lt;action&gt;</div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Scopes định dạng chuẩn: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">question:create</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">exam:generate</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">attempt:submit</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stateless Context</div>
            <div className="text-sm font-bold text-emerald-700">ext_ctx Payload</div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Nhúng TenantID, ClassID, RoomID dưới dạng Key-Value trong Token để downstream services tự ghi log/thống kê mà IAM không cần quan tâm.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Token Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User & External Context Selector */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-sm">Chọn User Mẫu &amp; Ngữ Cảnh (External Context)</h3>
            </div>
          </div>

          {/* User Preset Radio Cards */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600">Preset Tài Khoản:</div>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_IAM_USERS.map((u) => {
                const isSelected = u.userId === selectedUser.userId;
                return (
                  <button
                    key={u.userId}
                    onClick={() => handleUserChange(u)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/60 shadow-xs ring-1 ring-violet-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">{u.username}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        u.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                        u.role === 'AUTHOR' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'REVIEWER' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{u.fullName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable ext_ctx JSON */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Tùy biến External Context (`ext_ctx` Key-Value):</span>
              <span className="text-[10px] text-slate-500 font-mono">Stateless Injection</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Các hệ thống bên ngoài (LMS, School App) có thể gắn thêm bất kỳ metadata nào khi yêu cầu IAM cấp token:
            </p>
            <textarea
              rows={6}
              value={extCtxJson}
              onChange={(e) => setExtCtxJson(e.target.value)}
              className={`w-full font-mono text-xs p-3 rounded-xl border bg-slate-950 text-emerald-300 focus:outline-none ${
                extCtxError ? 'border-rose-400' : 'border-slate-800'
              }`}
            />
            {extCtxError && (
              <p className="text-[11px] text-rose-600 mt-1">JSON không hợp lệ: {extCtxError}</p>
            )}
          </div>

          {/* Downstream Service Scope Testing Sandbox */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Kiểm Thử Cổng API Downstream Services</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Scope Guard</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Chọn Endpoint Mục Tiêu:</label>
              <select
                value={testEndpoint.path}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '/api/attempts/submit') {
                    setTestEndpoint({
                      path: '/api/attempts/submit',
                      method: 'POST',
                      requiredScope: 'attempt:submit',
                      serviceName: 'Attempt Service'
                    });
                  } else if (val === '/api/questions') {
                    setTestEndpoint({
                      path: '/api/questions',
                      method: 'POST',
                      requiredScope: 'question:create',
                      serviceName: 'Question Service'
                    });
                  } else if (val === '/api/exams/generate') {
                    setTestEndpoint({
                      path: '/api/exams/generate',
                      method: 'POST',
                      requiredScope: 'exam:generate',
                      serviceName: 'Exam Service'
                    });
                  } else if (val === '/api/analytics/reports') {
                    setTestEndpoint({
                      path: '/api/analytics/reports',
                      method: 'GET',
                      requiredScope: 'analytics:export_reports',
                      serviceName: 'Analytics Service'
                    });
                  } else if (val === '/api/iam/users') {
                    setTestEndpoint({
                      path: '/api/iam/users',
                      method: 'POST',
                      requiredScope: 'iam:user_manage',
                      serviceName: 'IAM Service'
                    });
                  }
                  setSimulationLog(null);
                }}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="/api/attempts/submit">POST /api/attempts/submit (requires: attempt:submit)</option>
                <option value="/api/questions">POST /api/questions (requires: question:create)</option>
                <option value="/api/exams/generate">POST /api/exams/generate (requires: exam:generate)</option>
                <option value="/api/analytics/reports">GET /api/analytics/reports (requires: analytics:export_reports)</option>
                <option value="/api/iam/users">POST /api/iam/users (requires: iam:user_manage)</option>
              </select>
            </div>

            <button
              onClick={handleSimulateRequest}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Gửi Yêu Cầu Kèm Bearer Token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {simulationLog && (
              <div className={`p-3 rounded-xl text-xs font-mono border ${
                simulationLog.status === 'SUCCESS' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {simulationLog.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{simulationLog.message}</span>
                </div>
                {simulationLog.details && (
                  <div className="mt-2 text-[11px] text-slate-700 bg-white/70 p-2 rounded border border-slate-200/60 leading-relaxed">
                    {simulationLog.details.downstreamAuditLog && (
                      <div className="text-emerald-800 font-semibold">{simulationLog.details.downstreamAuditLog}</div>
                    )}
                    {simulationLog.details.verifiedBy && (
                      <div className="text-slate-500 mt-1">Xác thực bởi: {simulationLog.details.verifiedBy}</div>
                    )}
                    {simulationLog.details.remediation && (
                      <div className="text-rose-700 mt-1">{simulationLog.details.remediation}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Decoded JWT & Raw Token Inspector */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-sm">Cấu Trúc JWT Token (RS256 Asymmetric)</h3>
            </div>
            <span className="font-mono text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-200">
              kid: {jwtHeader.kid}
            </span>
          </div>

          {/* Encoded Token Visualizer */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Encoded Compact Token (Header.Payload.Signature):</div>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs break-all leading-relaxed select-all">
              <span className="text-rose-400 font-bold">{encodedHeader}</span>
              <span className="text-slate-500">.</span>
              <span className="text-violet-400 font-bold">{encodedPayload}</span>
              <span className="text-slate-500">.</span>
              <span className="text-blue-400 font-bold">{pseudoSignature}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Header</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400"></span> Payload (Claims + ext_ctx)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> RS256 Signature</span>
            </div>
          </div>

          {/* Decoded Claims Inspector */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Decoded Payload Claims:</div>
            <CodeBlock
              code={JSON.stringify(jwtPayload, null, 2)}
              language="json"
              filename="jwt-claims-payload.json"
              maxHeight="max-h-[360px]"
            />
          </div>
        </div>
      </div>

      {/* Code Implementations & Drizzle Schema */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-sm">Triển Khai Kỹ Thuật (Architecture &amp; Code Specifications)</h3>
          </div>

          {/* Subtabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCodeTab('middleware')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'middleware'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Downstream Auth Middleware (Zero-Call)
            </button>
            <button
              onClick={() => setActiveCodeTab('drizzle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'drizzle'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Drizzle Schema (iam_db)
            </button>
            <button
              onClick={() => setActiveCodeTab('jwks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeCodeTab === 'jwks'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. JWKS Endpoint (/.well-known/jwks.json)
            </button>
          </div>
        </div>

        {activeCodeTab === 'middleware' && (
          <div>
            <p className="text-xs text-slate-600 mb-2">
              Mọi Downstream Service (Question, Exam, Attempt, Analytics) sử dụng Middleware này để xác thực Token cục bộ bằng Public Key từ JWKS Cache, sau đó kiểm tra fine-grained scopes và gắn <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">req.user.externalContext</code> cho Controller xử lý:
            </p>
            <CodeBlock
              code={DOWNSTREAM_AUTH_MIDDLEWARE_CODE}
              language="typescript"
              filename="downstream-auth.middleware.ts"
              maxHeight="max-h-[460px]"
            />
          </div>
        )}

        {activeCodeTab === 'drizzle' && (
          <div>
            <p className="text-xs text-slate-600 mb-2">
              Lược đồ cơ sở dữ liệu PostgreSQL cho IAM Service (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">educational_iam_db</code>). Tối giản, không chứa khái niệm trường/lớp:
            </p>
            <CodeBlock
              code={IAM_DRIZZLE_SCHEMA_CODE}
              language="typescript"
              filename="iam.schema.ts"
              maxHeight="max-h-[460px]"
            />
          </div>
        )}

        {activeCodeTab === 'jwks' && (
          <div>
            <p className="text-xs text-slate-600 mb-2">
              JSON Web Key Set (JWKS) được IAM Service công khai tại đường dẫn chuẩn <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">GET /.well-known/jwks.json</code> cho phép xoay vòng khóa bí mật (Key Rotation) định kỳ mà không gián đoạn hệ thống:
            </p>
            <CodeBlock
              code={JSON.stringify(SAMPLE_JWKS_RESPONSE, null, 2)}
              language="json"
              filename="jwks.json"
              maxHeight="max-h-[300px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

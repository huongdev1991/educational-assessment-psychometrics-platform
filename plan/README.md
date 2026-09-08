# 🗺️ KẾ HOẠCH TỔNG THỂ TRIỂN KHAI HỆ THỐNG (MASTER IMPLEMENTATION PLAN)
## Nền Tảng Khảo Thí Chuẩn Hóa & Đo Lường Tâm Trắc Học Giáo Dục (Educational Assessment & Psychometrics Platform)

---

## 1. Mục Đích & Phạm Vi Tài Liệu
Tài liệu này xác lập lộ trình triển khai chi tiết, thứ tự phân bổ nguồn lực, các giai đoạn bàn giao (Milestones) và quy chuẩn kỹ thuật bắt buộc để đưa hệ thống 7 Microservices từ giai đoạn thiết kế kiến trúc vào vận hành thực tế ở quy mô lớn (High-Concurrency Enterprise Grade).

Hệ thống phục vụ các kỳ thi chuẩn hóa cấp Sở/Bộ, các trường đại học và tổ chức giáo dục với các tiêu chuẩn khắt khe:
* **Tính toàn vẹn học thuật (Academic Integrity)**: Ngân hàng câu hỏi bất biến, đề thi xác định (Deterministic reproducibility), bảo mật mã đề.
* **Khả năng chịu tải cực hạn (High Concurrency)**: Sẵn sàng đáp ứng $\ge 100,000$ thí sinh nộp bài đồng thời trong khung thời gian 15 phút cuối giờ thi mà không xảy ra nghẽn cổ chai.
* **Thời gian phản hồi tức thì**: API nộp bài $< 50\text{ms}$ nhờ kiến trúc Event-Driven bất đồng bộ hóa với Apache Kafka.
* **Đo lường tâm trắc học chuẩn hóa**: Tự động tính độ khó ($P$-value), độ phân hóa ($D$-index theo Kelly 27%), phân tích phương án nhiễu và vẽ đồ thị phân phối chuẩn Gaussian.

---

## 2. Cấu Trúc Thư Mục Kế Hoạch (`/plan/`)

Toàn bộ kế hoạch được module hóa thành các tài liệu chuyên sâu:

```
plan/
├── README.md                          # [Tài liệu này] Tổng quan chiến lược & Bản đồ lộ trình
├── 01-service-dependency-order.md     # Đồ thị phụ thuộc (DAG) & Thứ tự triển khai 7 dịch vụ
├── 02-implementation-phases.md        # 5 Giai đoạn triển khai chi tiết (Phase 0 đến Phase 4)
├── 03-technical-execution-steps.md    # Chi tiết kỹ thuật: Database, Hexagonal, Kafka, Cache
├── 04-testing-qa-security-gates.md    # Tiêu chuẩn nghiệm thu, Tháp kiểm thử, Stress test k6
└── 05-risk-matrix-contingency.md      # Ma trận rủi ro, Ứng phó sự cố & Kế hoạch Disaster Recovery
```

---

## 3. Tóm Tắt Thứ Tự Triển Khai (High-Level Sequence)

Quy trình triển khai bắt buộc tuân theo nguyên tắc **Nền tảng trước - Dữ liệu thượng nguồn - Nghiệp vụ thi - Phân tích hạ nguồn**:

```
[Phase 0: Hạ Tầng Nền Tảng (Infra, K8s, Kafka, DBs, CI/CD, Observability)]
                                    │
                                    ▼
       [Bước 1: 0. IAM Service] ──▶ Cấp JWT RS256, JWKS, Scopes, ext_ctx
                                    │
                                    ▼
       [Bước 2: 1. Knowledge Service] ──▶ Cây tri thức phân cấp, Learning Outcomes
                                    │
                                    ▼
       [Bước 3: 2. Question Service] ──▶ Ngân hàng câu hỏi Bloom, RichText/LaTeX, Versioning
                                    │
                                    ▼
       [Bước 4: 3. Assessment Service] ──▶ Ma trận đề Blueprint 2 chiều (Chủ đề × Nhận thức)
                                    │
                                    ▼
       [Bước 5: 4. Exam Service] ──▶ Seeded PRNG Generator, Variant 101-104, Lock bất biến
                                    │
                                    ▼
       [Bước 6: 5. Attempt Service] ──▶ Phòng thi thời gian thực, Chống gian lận, Local resilience
                                    │ (Kafka: AttemptCompletedEvent)
                                    ▼
       [Bước 7: 6. Analytics Service] ──▶ Psychometrics Kelly 27%, P & D index, Distractor analysis
```

---

## 4. Các Cột Mốc Bàn Giao Cốt Lõi (Key Milestones)

| Cột Mốc | Tên Giai Đoạn | Mục Tiêu Nghiệm Thu Chính | Thời Lượng Ước Tính |
|---|---|---|---|
| **M0** | **Foundation & Infrastructure** | Hoàn thành hạ tầng Kubernetes, cụm Kafka, PostgreSQL cụm, OpenTelemetry, và CI/CD Pipelines. | 2 tuần |
| **M1** | **Identity & Knowledge Core** | Hoàn thành IAM Service (RS256/JWKS) và Knowledge Service (Cây tri thức phân cấp Materialized Path). | 3 tuần |
| **M2** | **Question Bank & Versioning** | Hoàn thành Question Service với quy trình soạn, thẩm định, duyệt và versioning bất biến. | 3 tuần |
| **M3** | **Assessment Blueprint & Engine** | Hoàn tất Assessment Service và Exam Engine sinh đề xác định Mulberry32 + Fisher-Yates. | 3 tuần |
| **M4** | **Exam Delivery & Anti-Cheat** | Hoàn thành Attempt Service: giao diện thi, auto-save đệm LocalStorage, chấm điểm tự động. | 3 tuần |
| **M5** | **Kafka Pipeline & Psychometrics** | Xây dựng pipeline Kafka CloudEvents và Analytics Service đo lường tâm trắc học Kelly 27%. | 2.5 tuần |
| **M6** | **Load Testing, Audit & Go-Live** | Stress-testing 100,000 CCU nộp bài, Security Penetration Test, Diễn tập sự cố & Triển khai Production. | 2.5 tuần |
| **TỔNG** | **Toàn diện hệ thống** | **Sẵn sàng vận hành quy mô lớn cho các kỳ thi chuẩn hóa quốc gia.** | **19 tuần (~4.5 tháng)** |

---

## 5. Nguyên Tắc Quản Trị Kỹ Thuật (Governance Rules)
1. **Không đi tắt đón đầu (No Step Skipping)**: Không thể triển khai Question Service khi Knowledge Service chưa ổn định schema; không thể triển khai Exam Service khi ma trận Blueprint chưa có định dạng chuẩn.
2. **Defensive API Contracts**: Tất cả giao tiếp nội bộ phải có schema xác thực nghiêm ngặt bằng Protobuf (gRPC) hoặc Zod (REST/Events).
3. **Database Isolation**: Tuyệt đối không chia sẻ chung Database giữa các dịch vụ để đảm bảo quyền tự chủ mở rộng (Independent Scalability).
4. **Resilience First**: Mọi chức năng liên quan đến thí sinh (làm bài, nộp bài) phải hoạt động ngay cả khi mạng chập chờn hoặc downstream analytics service tạm thời mất kết nối.

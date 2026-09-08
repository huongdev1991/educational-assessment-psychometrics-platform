# 📅 CÁC GIAI ĐOẠN TRIỂN KHAI CHI TIẾT (IMPLEMENTATION PHASES)

---

## Tổng Quan Tiến Trình (19 Tuần)

```
Tuần:  [1-2]    [3-5]      [6-8]      [9-11]     [12-14]    [15-16]    [17-19]
Giai   Phase 0  Phase 1    Phase 2    Phase 3    Phase 4    Phase 5    Phase 6
đoạn:  Infra    IAM &      Question   Exam &     Attempt    Analytics  Stress Test
       DevOps   Knowledge  Blueprint  Generator  Delivery   Pipeline   & Go-Live
```

---

## Giai Đoạn 0: Hạ Tầng, Nền Tảng DevOps & Quan Sát Hệ Thống (Phase 0: Tuần 1 - 2)

### Mục Tiêu:
Thiết lập toàn bộ hạ tầng đám mây (Kubernetes / Docker Compose), các cụm cơ sở dữ liệu PostgreSQL độc lập, cụm Kafka Broker có phân vùng, giải pháp giám sát tập trung (Prometheus, Grafana, OpenTelemetry) và quy trình CI/CD tự động.

### Danh Sách Hạng Mục Công Việc:
1. **Container Orchestration & Mạng Nội Bộ**:
   - Thiết lập Kubernetes Cluster (EKS / GKE hoặc On-premise K3s) với Network Policy ngăn chặn truy cập trực tiếp giữa các cơ sở dữ liệu.
   - Cấu hình Ingress Nginx / Envoy API Gateway đóng vai trò Reverse Proxy định tuyến `/api/*`.
2. **PostgreSQL Multi-Database Setup**:
   - Khởi tạo 7 cơ sở dữ liệu riêng biệt: `iam_db`, `knowledge_db`, `question_db`, `assessment_db`, `exam_db`, `attempt_db`, `analytics_db`.
   - Cấu hình Connection Pooler (PgBouncer) chịu tải cao, thiết lập chính sách Backup tự động (WAL-G / pgBackRest).
3. **Apache Kafka Cluster Setup**:
   - Cấu hình cụm Kafka 3-broker (KRaft mode hoặc ZooKeeper), phân vùng mặc định 6 partitions cho topic `assessment.attempt.completed.v1`.
   - Thiết lập Dead Letter Queue (DLQ) topic `assessment.attempt.completed.dlq`.
4. **Hệ Thống Quan Sát (Observability Stack)**:
   - Tích hợp OpenTelemetry Distributed Tracing cho tất cả microservices (Trace ID xuyên suốt từ Ingress đến Kafka Consumer).
   - Thiết lập Prometheus Metrics (thời gian phản hồi P95, P99, Kafka consumer lag, DB pool saturation) và Dashboard Grafana chuẩn.
5. **CI/CD Pipeline Chuẩn**:
   - GitHub Actions / GitLab CI: Tự động chạy TypeScript linting, Unit test, Testcontainers integration test và build Docker Image phân tầng (Multi-stage build).

---

## Giai Đoạn 1: Định Danh Phi Tập Trung & Cây Tri Thức Nền Tảng (Phase 1: Tuần 3 - 5)

### Mục Tiêu:
Triển khai `0. IAM Service` cung cấp cơ chế bảo mật RS256/JWKS và `1. Knowledge Service` quản lý cây cấu trúc học thuật.

### Danh Sách Hạng Mục Công Việc:
1. **0. IAM Service**:
   - Triển khai Hexagonal Architecture: Domain User, Value Objects, Argon2id Password Hashing.
   - Cấp phát JWT Access Token (RS256) và Refresh Token có cơ chế xoay vòng.
   - Xây dựng endpoint chuẩn RFC 7517: `GET /.well-known/jwks.json`.
   - Triển khai cơ chế đóng gói `ext_ctx` (Stateless External Context) cho các đối tác ngoài.
   - Phát hành SDK Middleware nội bộ (`@platform/auth-guard`) cho các microservices khác sử dụng để xác thực token bằng Public Key từ JWKS Cache.
2. **1. Knowledge Service**:
   - Thiết kế thực thể phân cấp: Curriculum $\rightarrow$ Subject $\rightarrow$ Topic $\rightarrow$ Knowledge Node $\rightarrow$ Learning Outcomes (LO).
   - Tối ưu hóa truy vấn cây bằng thuật toán **Materialized Path** (`1.2.5`) kèm chỉ mục B-Tree.
   - Xây dựng gRPC Server nội bộ phục vụ tra cứu node theo ID với độ trễ $< 2\text{ms}$.
   - Giao diện Frontend Quản trị: Trực quan hóa cây tri thức phân nhánh, hỗ trợ kéo thả và gán nhãn chuẩn đầu ra.

---

## Giai Đoạn 2: Ngân Hàng Câu Hỏi Chuẩn Hóa & Ma Trận Đề Thi (Phase 2: Tuần 6 - 8)

### Mục Tiêu:
Xây dựng `2. Question Service` với phiên bản bất biến (Immutable Versioning) và `3. Assessment Service` với ma trận đề thi 2 chiều.

### Danh Sách Hạng Mục Công Việc:
1. **2. Question Service (Ngân hàng câu hỏi)**:
   - Thiết kế Aggregate `Question` tách rời phần gốc (`questions`) và các phiên bản sửa đổi (`question_versions`).
   - Hỗ trợ RichText với công thức toán học LaTeX (KaTeX) và tải ảnh phương án lên Object Storage (S3/MinIO) có ký URL tạm thời (Presigned URL).
   - Phân loại 4 mức nhận thức Bloom: *Nhận biết (Recall), Thông hiểu (Understand), Vận dụng (Apply), Vận dụng cao (Analyze)*.
   - Quy trình kiểm duyệt trạng thái nghiêm ngặt: `DRAFT` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED` $\rightarrow$ `ARCHIVED`. Khi đã `PUBLISHED`, câu hỏi **bị khóa bất biến**, mọi chỉnh sửa bắt buộc tạo bản ghi phiên bản mới (`version + 1`).
   - Tối ưu hóa Composite Index cho Candidate Pool: `(cognitive_level, status, question_type)`.
2. **3. Assessment Service (Ma trận Blueprint)**:
   - Định nghĩa Ma trận đặc tả 2 chiều: Dòng = Danh sách Chủ đề tri thức; Cột = 4 Cấp độ nhận thức Bloom.
   - Cơ chế kiểm định logic tự động: Tổng số lượng câu hỏi các ô phải bằng số câu toàn bài; Tổng điểm phân bổ các ô phải bằng 10.0 điểm.
   - Thuật toán kiểm tra dung lượng kho (Inventory Feasibility Checker): Gọi gRPC sang Question Service để cảnh báo ngay nếu kho câu hỏi không đủ số lượng câu hỏi đạt chuẩn để sinh đề.

---

## Giai Đoạn 3: Bộ Máy Sinh Đề Xác Định & Khóa Bất Biến Đề Thi (Phase 3: Tuần 9 - 11)

### Mục Tiêu:
Triển khai `4. Exam Service` với Engine xáo trộn đề thi xác định (Deterministic Seeded PRNG) và tạo các mã đề hoán vị 101, 102, 103, 104.

### Danh Sách Hạng Mục Công Việc:
1. **Engine Sinh Số Giả Ngẫu Nhiên Có Hạt Giống (Mulberry32 PRNG)**:
   - Triển khai thuật toán Mulberry32 đảm bảo tính lặp lại 100%: Cùng một seed $S$ luôn luôn tạo ra cùng một dãy số ngẫu nhiên trên mọi máy chủ.
2. **Thuật Toán Xáo Trộn Đề Thi Fisher-Yates Chuẩn Hóa**:
   - Xáo trộn danh sách câu hỏi trong từng khối kiến thức.
   - Xáo trộn các phương án trả lời trong từng câu hỏi trắc nghiệm, đồng thời gán nhãn mới ($A, B, C, D$).
3. **Cơ Chế Bảo Toàn Khóa Chấm Điểm (`originalKey`)**:
   - Đảm bảo trong Payload lưu vết mã đề luôn lưu thuộc tính `originalKey` trỏ về phương án gốc để phục vụ việc chấm thi tức thì mà không cần giải mã ngược.
4. **Khóa Đề Thi Bất Biến (Exam Publishing & Locking)**:
   - Khi đề thi chuyển sang trạng thái `PUBLISHED`, khóa toàn bộ cấu trúc các mã đề vào cơ sở dữ liệu `exam_db`, ngăn chặn mọi hành vi thay đổi cấu trúc khi kỳ thi đang diễn ra.
   - Caching toàn bộ gói dữ liệu đề thi vào Redis Cluster để chuẩn bị phục vụ hàng chục ngàn thí sinh tải đề đồng thời.

---

## Giai Đoạn 4: Nền Tảng Phòng Thi Thời Gian Thực & Tự Chấm Điểm (Phase 4: Tuần 12 - 14)

### Mục Tiêu:
Triển khai `5. Attempt Service` với khả năng chịu lỗi cao (Resilience), cơ chế chống mất mạng cục bộ (LocalStorage/IndexedDB) và tự động chấm điểm.

### Danh Sách Hạng Mục Công Việc:
1. **Attempt Lifecycle Management**:
   - Quy trình trạng thái phiên thi: `INITIALIZED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `SUBMITTED` $\rightarrow$ `GRADED`.
   - Đồng bộ đồng hồ đếm ngược từ Server (NTP Server sync) để chống việc thí sinh sửa giờ trên máy tính cá nhân.
2. **Cơ Chế Đệm Cục Bộ Chống Mất Kết Nối Mạng (Offline Resilience)**:
   - Mỗi lần thí sinh chọn một đáp án, câu trả lời lập tức được lưu vào LocalStorage/IndexedDB của trình duyệt.
   - Gửi yêu cầu lưu vết ngầm (`PATCH /api/attempts/save-response`) với cơ chế hàng đợi (Queue) tự động gửi lại khi có mạng trở lại.
3. **Giám Sát Gian Lận Trực Tuyến (Anti-Cheat / Focus Tracker)**:
   - Lắng nghe sự kiện `visibilitychange` và `window.onblur`. Ghi nhận số lần thí sinh chuyển tab hoặc mở ứng dụng khác.
4. **Engine Chấm Điểm Tự Động Siêu Tốc (Auto-Grading)**:
   - Đối chiếu câu trả lời của thí sinh với `originalKey` của mã đề trong vòng $< 10\text{ms}$.
   - Lưu kết quả vào `attempt_db` và ngay lập tức phát sự kiện `AttemptCompletedEvent` lên Kafka Topic `assessment.attempt.completed.v1`.

---

## Giai Đoạn 5: Đo Lường Tâm Trắc Học Giáo Dục & Pipeline Kafka (Phase 5: Tuần 15 - 16)

### Mục Tiêu:
Triển khai `6. Analytics Service` tiêu thụ sự kiện từ Kafka và chạy các thuật toán tâm trắc học chuẩn hóa (Kelly 27%, Phân tích phương án nhiễu, Đồ thị phân phối chuẩn Gaussian).

### Danh Sách Hạng Mục Công Việc:
1. **Kafka Consumer Pipeline Chống Trùng Lặp (Idempotent Consumer)**:
   - Tiêu thụ tin nhắn từ topic `assessment.attempt.completed.v1`.
   - Kiểm tra `eventId` qua Redis Idempotency Key (TTL 7 ngày).
   - Tự động đẩy tin nhắn lỗi sang Dead Letter Queue (DLQ) khi gặp ngoại lệ.
2. **Thuật Toán Độ Khó Câu Hỏi ($P$-Value)**:
   - Tính tỷ lệ làm đúng $P = \frac{R}{N}$ cho từng câu hỏi, tự động phân loại: *Rất khó, Khó, Trung bình, Dễ, Rất dễ*.
3. **Thuật Toán Độ Phân Hóa Câu Hỏi ($D$-Index theo Kelly 27%)**:
   - Tự động phân chia 27% nhóm điểm cao nhất ($U$) và 27% nhóm điểm thấp nhất ($L$).
   - Tính chỉ số $D = \frac{R_U - R_L}{n}$. Cảnh báo ngay lập tức các câu hỏi có $D < 0.20$ (Kém) hoặc $D < 0$ (Nghịch đảo/Lỗi đáp án).
4. **Phân Tích Phương Án Nhiễu (Distractor Effectiveness)**:
   - Thống kê tỷ lệ chọn từng đáp án sai giữa nhóm $U$ và nhóm $L$.
5. **Đồ Thị Phổ Điểm & Báo Cáo Xuất Bản**:
   - Vẽ phân phối chuẩn Gaussian, tính điểm trung bình ($\mu$), độ lệch chuẩn ($\sigma$), độ tin cậy đề thi (Cronbach's Alpha).

---

## Giai Đoạn 6: Kiểm Thử Tải Cực Hạn, Kiểm Toán Bảo Mật & Go-Live (Phase 6: Tuần 17 - 19)

### Mục Tiêu:
Tiến hành Stress Testing ở quy mô $100,000$ thí sinh đồng thời, kiểm toán lỗ hổng bảo mật (Penetration Testing), diễn tập sự cố (Chaos Engineering) và đưa hệ thống vào vận hành chính thức (Go-Live).

### Danh Sách Hạng Mục Công Việc:
1. **Stress Testing Kịch Bản Cao Điểm (k6 / Locust)**:
   - Mô phỏng $100,000$ thí sinh: $20,000$ thí sinh đăng nhập đồng thời, $100,000$ thí sinh tải đề và nộp bài dồn dập trong 15 phút cuối giờ.
   - Tiêu chí đạt: Tỷ lệ lỗi nộp bài $= 0\%$; Thời gian phản hồi nộp bài P95 $< 100\text{ms}$; Kafka Consumer Lag $< 5000$ tin nhắn.
2. **Security Audit & Penetration Testing**:
   - Kiểm thử tấn công giả mạo token JWT (Algorithm Confusion, Tampered Claims).
   - Kiểm tra chống rò rỉ đáp án trong API tải đề thi của thí sinh.
   - Thử nghiệm tấn công từ chối dịch vụ (DDoS) và xác minh tính hiệu quả của Rate Limiting tại Ingress.
3. **Diễn Tập Sự Cố (Chaos Engineering)**:
   - Thử nghiệm tắt đột ngột 1 node PostgreSQL hoặc 1 broker Kafka trong khi thí sinh đang nộp bài.
   - Kiểm chứng khả năng tự động khôi phục (Failover) và không làm mất bất kỳ bài thi nào của thí sinh.
4. **Triển Khai Production (Phased Rollout / Canary)**:
   - Triển khai Canary cho kỳ thi thử nghiệm nội bộ 1,000 thí sinh.
   - Mở rộng dần lên $10,000 \rightarrow 50,000 \rightarrow 100,000$ thí sinh chính thức.

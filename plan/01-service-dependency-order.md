# 🔗 THỨ TỰ TRIỂN KHAI CÁC DỊCH VỤ & ĐỒ THỊ PHỤ THUỘC (SERVICE DEPENDENCY ORDER)

---

## 1. Bản Đồ Đồ Thị Phụ Thuộc Hướng (Directed Acyclic Graph - DAG)

Trong kiến trúc Microservices hướng tên miền (DDD), việc triển khai các dịch vụ không được phép tiến hành ngẫu nhiên. Mỗi dịch vụ đều có vai trò "Thượng nguồn" (Upstream / Producer) hoặc "Hạ nguồn" (Downstream / Consumer). 

Dưới đây là Đồ thị phụ thuộc bắt buộc:

```
[0. IAM Service] (Gốc: Cung cấp danh tính, Khóa công khai JWKS, Scopes)
       │
       ├─────────────────────────────────────────────────────────────┐
       ▼                                                             ▼
[1. Knowledge Service]                                  (Tất cả dịch vụ xác thực token)
       │ (Cung cấp cấu trúc Cây Tri Thức & LOs)
       ▼
[2. Question Service] (Tham chiếu KnowledgeNodeID, tạo Candidate Pool)
       │
       ├───────────────────────────────┐
       ▼                               ▼
[3. Assessment Service]        [4. Exam Service] (Sinh biến thể đề thi 101-104)
(Soạn Ma trận Blueprint)               ▲
       │                               │
       └───────────────────────────────┘
                                       │ (Cung cấp gói đề thi đã khóa bất biến)
                                       ▼
                              [5. Attempt Service] (Phòng thi, Làm bài, Chấm điểm)
                                       │
                                       │ (Phát sự kiện Kafka: AttemptCompletedEvent)
                                       ▼
                              [6. Analytics Service] (Đo lường tâm trắc học P & D)
```

---

## 2. Chi Tiết Lý Do & Hợp Đồng Phụ Thuộc Từng Bước

### Bước 0: `0. Identity & Access Management (IAM) Service` (Khởi nguyên)
* **Vì sao phải làm đầu tiên?**: 
  - Mọi lời gọi API của các dịch vụ khác đều cần kiểm tra thông tin người dùng (`userId`, `role`, `scopes`).
  - Nếu không có IAM cấp phát chuẩn JWT (RS256) và endpoint `/.well-known/jwks.json`, các dịch vụ phía sau sẽ không có phương thức chuẩn hóa để bảo vệ các endpoints.
* **Hợp đồng đầu ra cung cấp**:
  - Endpoint JWKS công khai cho toàn hệ thống.
  - Danh mục Scopes chuẩn hóa dạng `<service>:<action>`.
  - Cấu trúc `ext_ctx` không ràng buộc nghiệp vụ trường/lớp.

---

### Bước 1: `1. Knowledge Service` (Nền tảng tri thức học thuật)
* **Vì sao đứng thứ 2?**: 
  - Một câu hỏi khảo thí chuẩn hóa không thể tồn tại độc lập mà bắt buộc phải gắn với một đơn vị kiến thức cụ thể trong chương trình học (Chương trình $\rightarrow$ Môn học $\rightarrow$ Chủ đề $\rightarrow$ Đơn vị kiến thức / Yêu cầu cần đạt - Learning Outcome).
* **Phụ thuộc vào**: IAM Service (để xác thực quyền `knowledge:manage`, `knowledge:read`).
* **Hợp đồng đầu ra cung cấp**:
  - `knowledgeNodeId` (UUID) và `materialized_path` (đường dẫn phân cấp, ví dụ `1.3.12`).
  - gRPC Server phục vụ truy vấn cây tri thức tốc độ cao ($< 3\text{ms}$) cho Question Service.

---

### Bước 2: `2. Question Service` (Ngân hàng câu hỏi bất biến)
* **Vì sao đứng thứ 3?**: 
  - Không thể xây dựng ma trận đề thi hay sinh đề nếu chưa có kho câu hỏi đã được chuẩn hóa, phân loại theo 4 cấp độ nhận thức Bloom (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và thẩm định phê duyệt.
* **Phụ thuộc vào**:
  - IAM Service (kiểm tra quyền `question:create`, `question:review`, `question:publish`).
  - Knowledge Service (tra cứu `knowledgeNodeId` hợp lệ).
* **Hợp đồng đầu ra cung cấp**:
  - Candidate Pool API: Lọc các câu hỏi thỏa mãn tiêu chí `status = 'PUBLISHED'` và `cognitive_level`.
  - Dữ liệu câu hỏi phiên bản bất biến (`question_versions`, `question_options`).

---

### Bước 3: `3. Assessment Service` (Ma trận đặc tả đề thi - Blueprint)
* **Vì sao đứng thứ 4?**: 
  - Đề thi chuẩn hóa không được bốc ngẫu nhiên tùy tiện mà phải tuân thủ nghiêm ngặt theo Ma trận đề thi 2 chiều: Tỷ lệ kiến thức theo chủ đề $\times$ Tỷ lệ cấp độ nhận thức Bloom.
* **Phụ thuộc vào**:
  - IAM Service (`assessment:blueprint_create`, `assessment:blueprint_publish`).
  - Knowledge Service (để chọn các nhánh kiến thức đưa vào ma trận).
  - Question Service (để kiểm tra xem ngân hàng câu hỏi có đủ số lượng câu hỏi khả dụng đáp ứng ma trận hay không - Inventory Pre-flight Check).
* **Hợp đồng đầu ra cung cấp**:
  - `BlueprintAggregate`: Hạn ngạch số lượng câu hỏi và phân bổ điểm số chính xác cho từng ô trong ma trận.

---

### Bước 4: `4. Exam Service` (Bộ máy sinh đề xác định)
* **Vì sao đứng thứ 5?**: 
  - Exam Service nhận Blueprint từ Assessment Service, lấy danh sách câu hỏi từ Question Service, áp dụng thuật toán PRNG Mulberry32 và Fisher-Yates để sinh ra các mã đề hoán vị (101, 102, 103, 104) và khóa bất biến.
* **Phụ thuộc vào**:
  - Assessment Service (lấy cấu trúc ma trận Blueprint đã duyệt).
  - Question Service (lấy nội dung câu hỏi phiên bản chốt).
* **Hợp đồng đầu ra cung cấp**:
  - Exam Variant Payload hoàn chỉnh cho từng mã đề: Thứ tự câu hỏi xáo trộn, thứ tự đáp án xáo trộn, ánh xạ bảo toàn `originalKey` để phục vụ chấm thi tức thì.

---

### Bước 5: `5. Attempt Service` (Phòng thi & Chấm thi thời gian thực)
* **Vì sao đứng thứ 6?**: 
  - Thí sinh chỉ có thể làm bài khi đề thi đã được biên soạn và công bố.
* **Phụ thuộc vào**:
  - IAM Service (`attempt:start`, `attempt:submit`).
  - Exam Service (tải nội dung mã đề thi tương ứng của thí sinh).
* **Hợp đồng đầu ra cung cấp**:
  - API nộp bài siêu tốc phản hồi kết quả thi cho thí sinh.
  - Sự kiện Kafka bất đồng bộ: `assessment.attempt.completed.v1` mang toàn bộ câu trả lời, thời gian làm từng câu, điểm số và vết gian lận (tab blur count).

---

### Bước 6: `6. Analytics Service` (Đo lường & Phân tích tâm trắc học)
* **Vì sao đứng cuối cùng?**: 
  - Đây là dịch vụ phân tích cấp cao, tiêu thụ dữ liệu từ toàn bộ bài thi đã hoàn thành để chạy các mô hình thống kê học thuật (Classical Test Theory - CTT và Item Response Theory - IRT).
* **Phụ thuộc vào**:
  - Kafka Broker (lắng nghe sự kiện từ Attempt Service).
  - Question Service (cập nhật lại chỉ số độ khó $P$ và độ phân hóa $D$ vào metadata câu hỏi).
* **Hợp đồng đầu ra cung cấp**:
  - Báo cáo phân tích chất lượng đề thi, cảnh báo câu hỏi lỗi/bẫy, bảng xếp hạng năng lực học sinh và đồ thị phân phối chuẩn Gaussian.

---

## 3. Bảng Tóm Tắt Ma Trận Giao Tiếp Liên Dịch Vụ

| Chiều Gọi (Source $\rightarrow$ Target) | Giao Thức | Mục Đích | Thời Gian Cho Phép (SLA) | Cơ Chế Phục Hồi Khi Lỗi |
|---|---|---|---|---|
| Mọi Service $\rightarrow$ **0. IAM** | HTTP (JWKS) | Lấy Public Key giải mã RS256 | $< 10\text{ms}$ (Cached trong RAM) | Cache Fallback 24h |
| **2. Question** $\rightarrow$ **1. Knowledge** | gRPC Sync | Kiểm tra tính hợp lệ của cây tri thức | $< 5\text{ms}$ | Retry 2 lần (Exponential backoff) |
| **4. Exam** $\rightarrow$ **3. Assessment** | REST/gRPC | Đọc ma trận Blueprint | $< 15\text{ms}$ | Circuit Breaker |
| **4. Exam** $\rightarrow$ **2. Question** | gRPC Streaming | Lấy Candidate Pool câu hỏi số lượng lớn | $< 50\text{ms}$ | Paginated Batch Fetch |
| **5. Attempt** $\rightarrow$ **4. Exam** | REST/Redis | Tải cấu trúc mã đề thi cho thí sinh | $< 10\text{ms}$ (Cached trong Redis) | Redis Replica Failover |
| **5. Attempt** $\rightarrow$ **6. Analytics** | **Kafka Event** | Đẩy kết quả nộp bài thi | Bất đồng bộ (Async $< 5\text{ms}$) | Kafka Local Producer Buffer + Retry |

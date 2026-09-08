# 🛡️ CHIẾN LƯỢC KIỂM THỬ, TIÊU CHUẨN QA & CỔNG BẢO MẬT (TESTING, QA & SECURITY GATES)

---

## 1. Tháp Kiểm Thử 4 Tầng (Testing Pyramid Strategy)

Để đảm bảo nền tảng khảo thí đạt độ chính xác học thuật tuyệt đối và không có lỗi tiềm ẩn trong quá trình chấm thi, hệ thống áp dụng tháp kiểm thử 4 tầng:

```
                  ┌────────────────────────┐
                  │   E2E Tests (5%)       │ Playwright: Luồng thi từ Soạn đến Chấm điểm
                  ├────────────────────────┤
                  │ Integration Tests (15%)│ Testcontainers: PostgreSQL, Kafka, Redis
                  ├────────────────────────┤
                  │  Contract Tests (20%)  │ Pact / Protobuf Schema Compatibility
                  ├────────────────────────┤
                  │    Unit Tests (60%)    │ Vitest: Thuật toán PRNG, Kelly 27%, Domain
                  └────────────────────────┘
```

---

## 2. Chi Tiết Các Tầng Kiểm Thử

### 2.1. Tầng 1: Unit Tests (Tập Trung Tuyệt Đối Vào Logic Tên Miền)
* **Quy tắc bắt buộc**: 100% Unit Test chạy độc lập, không kết nối cơ sở dữ liệu thật, thời gian thực thi toàn bộ suite $< 10\text{giây}$.
* **Các bộ test trọng yếu**:
  1. `Mulberry32 PRNG Determinism`: Kiểm tra rằng khi cấp cùng một Seed (ví dụ `1337`), hàm luôn luôn sinh ra chính xác dãy số dự đoán trên mọi môi trường chạy (Node.js, Bun, Linux x86_64, ARM64).
  2. `Fisher-Yates Shuffle Invariance`: Kiểm tra thuật toán xáo trộn không làm mất phần tử, không thêm phần tử thừa và phân phối hoán vị đồng đều.
  3. `Kelly 27% Discrimination Index ($D$)`: Kiểm tra tính toán phân nhóm $U$ và $L$, bắt chính xác trường hợp câu hỏi lỗi khi $D < 0$.
  4. `Blueprint Validation Rules`: Kiểm tra tổng số câu hỏi và tổng điểm ma trận luôn bằng 10.0 điểm.

---

### 2.2. Tầng 2: Contract Tests (Kiểm Thử Hợp Đồng Bất Biến Giữa Các Microservices)
* **Mục tiêu**: Ngăn chặn tình trạng một kỹ sư sửa đổi trường dữ liệu ở `Question Service` làm sập `Exam Service` mà không được phát hiện.
* **Công nghệ**: Protobuf Schema Validator kết hợp **Pact**.
* **Tiêu chí cổng**: Nếu một Pull Request thay đổi schema mà phá vỡ tính tương thích ngược (Breaking Change), CI Pipeline sẽ lập tức chặn việc Merge.

---

### 2.3. Tầng 3: Integration Tests với Testcontainers
* **Mục tiêu**: Kiểm tra tính chính xác của các Drizzle ORM Repository Adapters và Kafka Consumers trên môi trường cơ sở dữ liệu và message broker thật.
* **Cách thức**: Trước mỗi lần chạy suite kiểm thử tích hợp, script tự động khởi động các Docker Containers nhẹ (PostgreSQL, Kafka, Redis) bằng thư viện `testcontainers-node` và tự dọn dẹp sau khi hoàn tất.

---

### 2.4. Tầng 4: End-to-End (E2E) Tests với Playwright
Kịch bản kiểm thử tự động toàn chu trình:
1. Đăng nhập tài khoản **Author** $\rightarrow$ Tạo câu hỏi Toán học kèm công thức LaTeX $\rightarrow$ Gửi duyệt.
2. Đăng nhập tài khoản **Reviewer** $\rightarrow$ Phê duyệt câu hỏi $\rightarrow$ Chuyển trạng thái `PUBLISHED`.
3. Đăng nhập tài khoản **Admin** $\rightarrow$ Thiết lập ma trận Blueprint $\rightarrow$ Nhấn "Sinh đề thi" (Exam Generation) $\rightarrow$ Khóa bất biến đề thi.
4. Giả lập trình duyệt của **Candidate** $\rightarrow$ Đăng nhập phòng thi $\rightarrow$ Làm bài $\rightarrow$ Kiểm tra cơ chế tự lưu đáp án $\rightarrow$ Nộp bài.
5. Kiểm tra kết quả chấm điểm trả về cho thí sinh và xác minh báo cáo thống kê tâm trắc học tại Dashboard Analytics.

---

## 3. Kịch Bản Kiểm Thử Tải Cực Hạn (High-Concurrency Load Testing với k6)

Trước khi tổ chức kỳ thi chính thức, hệ thống bắt buộc phải vượt qua bài kiểm tra tải với công cụ **k6**:

### Kịch Bản k6: 100,000 Thí Sinh Nộp Bài Trong 15 Phút Cuối Giờ Thi
```javascript
// load-tests/k6-attempt-submission.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    submission_rush: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 5000,
      maxVUs: 20000,
      stages: [
        { duration: '3m', target: 2000 },   // Tăng dần lên 2,000 bài nộp/giây
        { duration: '7m', target: 10000 },  // Cao điểm: 10,000 bài nộp/giây (Tương đương 100k thí sinh nộp trong 10-15 phút)
        { duration: '5m', target: 1000 },   // Hạ nhiệt
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate==0.00'],           // BẮT BUỘC: Tỷ lệ lỗi phải là 0%
    http_req_duration: ['p(95)<150', 'p(99)<300'], // 95% số bài nộp phản hồi dưới 150ms
  },
};

export default function () {
  const payload = JSON.stringify({
    attemptId: 'a7b3c4d5-0000-4000-8000-000000000001',
    examVariantId: '101',
    answers: [
      { questionId: 'q-1', selectedOptionKey: 'B' },
      { questionId: 'q-2', selectedOptionKey: 'A' },
      // ... 50 câu hỏi
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.CANDIDATE_JWT_TOKEN}`,
    },
  };

  const res = http.post('http://api-gateway:3000/api/v1/attempts/submit', payload, params);
  check(res, {
    'submission successful': (r) => r.status === 200,
    'response has score': (r) => JSON.parse(r.body).score !== undefined,
  });
}
```

---

## 4. Cổng Kiểm Toán Bảo Mật (Security & Anti-Cheat Audit Gates)

### 4.1. Chống Rò Rỉ Đáp Án Trong API Tải Đề Thi (Data Leakage Prevention)
* **Lỗ hổng nguy hiểm**: Đề thi tải về trình duyệt thí sinh bị lọt trường `is_correct: true` hoặc `originalKey` dẫn đến thí sinh có thể Inspect DevTools để thấy trước đáp án.
* **Cổng kiểm duyệt (Security Gate)**:
  - Tầng DTO Transform của `Exam Service` bắt buộc chạy qua bộ lọc nghiêm ngặt (Sanitizer).
  - Tự động quét kiểm thử tĩnh: Quét toàn bộ payload JSON trả về cho thí sinh; nếu phát hiện xuất hiện bất kỳ chuỗi `isCorrect`, `is_correct`, hoặc `correctOption`, hệ thống lập tức báo lỗi Build `SECURITY_DATA_LEAKAGE_DETECTED`.

### 4.2. Bảo Mật Xác Thực Token & Phòng Chống Giả Mạo
1. **Kiểm tra chữ ký số RS256**: Không chấp nhận bất kỳ token nào có header `alg: "none"` hoặc `alg: "HS256"` (Chống tấn công Algorithm Confusion).
2. **Kiểm tra thời gian hiệu lực**: Token chỉ có giá trị tối đa 2 giờ; nếu hết hạn, trình duyệt sử dụng Refresh Token để lấy Access Token mới một cách trong suốt.
3. **Phân quyền hạt mịn**: Thí sinh chỉ có scope `attempt:submit` và chỉ được nộp bài cho chính `candidate_id` trùng khớp với `sub` trong JWT Token. Không thể nộp thay thí sinh khác (Chống IDOR / BOLA).

---

## 5. Tiêu Chuẩn Nghiệm Thu Kỹ Thuật (Definition of Done - DoD)

Một dịch vụ hoặc tính năng chỉ được coi là hoàn tất khi đáp ứng trọn vẹn danh mục sau:

- [ ] Toàn bộ mã nguồn viết bằng TypeScript Strict Mode, không sử dụng `any`.
- [ ] Tuân thủ triệt để cấu trúc **Hexagonal Architecture** (Domain không phụ thuộc Infrastructure).
- [ ] Đạt tỷ lệ Unit Test Coverage $\ge 85\%$ cho thư mục `domain/` và `application/`.
- [ ] Có đầy đủ file Drizzle Schema Migration và đã được kiểm tra trên cơ sở dữ liệu PostgreSQL thực.
- [ ] Có tài liệu API chuẩn hóa (OpenAPI/Swagger hoặc file `.proto`).
- [ ] Có cấu hình OpenTelemetry Trace ID xuyên suốt.
- [ ] Đã vượt qua đợt quét mã bảo mật tự động (SAST) không có cảnh báo Critical/High.
- [ ] Đã được phê duyệt bởi ít nhất 2 Senior Engineers thông qua Code Review.

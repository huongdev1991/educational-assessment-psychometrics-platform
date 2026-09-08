# ⚠️ MA TRẬN RỦI RO, KẾ HOẠCH ỨNG PHÓ SỰ CỐ & DISASTER RECOVERY (RISK & CONTINGENCY)

---

## 1. Ma Trận Đánh Giá Rủi Ro Trọng Yếu (Risk Assessment Matrix)

| Mã Rủi Ro | Mô Tả Rủi Ro Kỹ Thuật / Vận Hành | Xác Suất | Mức Độ Tác Động | Cấp Độ Rủi Ro | Chiến Lược Phòng Ngừa & Giảm Thiểu |
|---|---|---|---|---|---|
| **R-01** | **Rớt mạng Internet diện rộng** tại phòng máy thi khi thí sinh đang làm bài | Cao (High) | Nghiêm trọng (Catastrophic) | **CỰC CAO** | **Tự lưu 2 tầng (Two-Tier Offline Buffer)**: Trình duyệt lưu đáp án lập tức vào IndexedDB/LocalStorage. Hệ thống ngầm tự động đồng bộ khi có mạng trở lại; Thí sinh không bị gián đoạn làm bài. |
| **R-02** | **Nghẽn cổ chai Database Connection Pool** khi $100,000$ thí sinh nộp bài cùng lúc trong 15 phút cuối | Trung bình (Med) | Nghiêm trọng (Catastrophic) | **CỰC CAO** | **Kiến trúc Bất Đồng Bộ Hóa (Event-Driven)**: API Nộp bài chỉ ghi nhận nhanh vào Redis và phát sự kiện vào Apache Kafka (`acks=all`). Tách biệt hoàn toàn luồng ghi điểm tức thì và luồng phân tích tâm trắc học. |
| **R-03** | **Lộ đề thi trước giờ mở phòng thi** do truy cập trái phép hoặc lọt file cấu hình | Thấp (Low) | Nghiêm trọng (Catastrophic) | **CAO** | **Mã hóa bất đối xứng khóa đề**: Đề thi trong cơ sở dữ liệu được mã hóa bằng AES-256; Khóa giải mã chỉ được tự động phát tán qua Redis trước giờ thi đúng 5 phút. |
| **R-04** | **Sập 1 Node Kafka hoặc PostgreSQL** trong quá trình diễn ra kỳ thi | Thấp (Low) | Lớn (Major) | **CAO** | **High Availability (HA) Failover**: PostgreSQL cấu hình Primary-Standby với Patroni tự động failover trong 30 giây; Cụm Kafka Replication Factor = 3 (cho phép hỏng 1 broker mà không gián đoạn). |
| **R-05** | **Trùng lặp mã đề hoặc sai sót xáo trộn** do lỗi hạt giống PRNG (Seed Collision) | Rất thấp (Low) | Lớn (Major) | **TRUNG BÌNH** | Thuật toán sinh Seed kết hợp: `SHA256(ExamID + VariantCode + MasterSalt)`. Chạy suite kiểm tra tính đơn trị (Uniqueness Checker) trước khi Publish đề thi. |
| **R-06** | **Dữ liệu câu hỏi bị sửa đổi** sau khi đề thi đã phát hành | Rất thấp (Low) | Nghiêm trọng (Catastrophic) | **CAO** | **Khóa bất biến (Immutable Snapshot)**: `Exam Service` sao chép cứng toàn bộ nội dung câu hỏi phiên bản tại thời điểm duyệt; Chặn mọi quyền sửa đổi (`UPDATE/DELETE`) bằng Trigger mức cơ sở dữ liệu. |

---

## 2. Kế Hoạch Ứng Phó Sự Cố Chi Tiết (Incident Response Runbooks)

### Kịch Bản 1: Thí Sinh Bị Đứt Mạng Wi-Fi / Mất Điện Cục Bộ Tại Phòng Thi
* **Hiện tượng**: Trình duyệt báo mất kết nối hoặc mất điện khởi động lại máy tính.
* **Quy trình xử lý tự động**:
  1. Trình duyệt hiển thị huy hiệu màu vàng: `"Đang lưu bài thi ngoại tuyến vào bộ nhớ đệm an toàn của máy"`.
  2. Mọi click chọn đáp án vẫn được lưu vào `IndexedDB`.
  3. Khi có mạng trở lại, một Web Worker chạy ngầm tự động gửi toàn bộ các câu trả lời chưa đồng bộ lên endpoint:
     `POST /api/v1/attempts/bulk-sync`
  4. Nếu máy tính bị sập nguồn: Sau khi bật lại máy, thí sinh mở lại trình duyệt, phiên thi được khôi phục nguyên vẹn trạng thái nhờ cơ chế phục hồi token từ LocalStorage và đối chiếu dấu thời gian đồng bộ cuối cùng với Server.

---

### Kịch Bản 2: Cơ Sở Dữ Liệu `attempt_db` Đạt Ngưỡng 90% Tải CPU Khi Nộp Bài
* **Hiện tượng**: P99 Response Time của API nộp bài tăng từ $50\text{ms}$ lên $> 1000\text{ms}$.
* **Quy trình kích hoạt khẩn cấp (Emergency Circuit Breaker)**:
  1. Envoy Gateway tự động kích hoạt **Degraded Mode (Chế độ phòng vệ)**:
     - Chuyển hướng ghi nhận bài thi: Thay vì ghi đồng thời vào PostgreSQL, tạm thời **chỉ ghi vào Redis In-Memory Cluster và đẩy trực tiếp vào Kafka Topic**.
     - Trả về ngay lập tức mã phản hồi `202 ACCEPTED` cho thí sinh kèm mã biên lai nộp bài (`submissionReceiptId`).
  2. Một nhóm Consumer dự phòng (Worker Pool) đọc từ Kafka và ghi bù (Drain) vào PostgreSQL sau khi cơn bão nộp bài qua đi.
  3. **Cam kết**: Tuyệt đối không làm mất bất kỳ bài thi nào của thí sinh ($RPO = 0$).

---

### Kịch Bản 3: Sự Cố Trục Trặc Cụm Kafka Broker
* **Hiện tượng**: Producer ở `Attempt Service` báo lỗi `LeaderNotAvailableException` hoặc timeout.
* **Cơ chế phòng thủ cục bộ (Local Outbox Pattern)**:
  - Nếu kết nối Kafka bị gián đoạn, `Attempt Service` tự động lưu sự kiện vào bảng dự phòng nội bộ `outbox_events` trong `attempt_db` (Transactional Outbox Pattern).
  - Một Background Cron Worker định kỳ 10 giây quét bảng này và phát lại vào Kafka ngay khi kết nối được phục hồi.

---

## 3. Kế Hoạch Khôi Phục Thảm Họa (Disaster Recovery & Backup Strategy)

### 3.1. Mục Tiêu Khôi Phục
* **RPO (Recovery Point Objective)**: $= 0$ (Không chấp nhận mất dù chỉ 1 câu trả lời thi).
* **RTO (Recovery Time Objective)**: $< 2$ phút đối với lỗi nút đơn lẻ; $< 15$ phút đối với sự cố toàn cụm hạ tầng.

### 3.2. Chính Sách Sao Lưu Dữ Liệu
1. **Continuous WAL Archiving (Sao lưu liên tục Write-Ahead Log)**:
   - Toàn bộ WAL log của PostgreSQL được đồng bộ tức thì lên Cloud Storage (S3 / GCS) bảo đảm khả năng phục hồi đến từng giây (Point-in-Time Recovery - PITR).
2. **Snapshot Hàng Giờ (Hourly Automated Snapshots)**:
   - Thực hiện snapshot tự động cho ổ đĩa lưu trữ (Persistent Volume) của các cụm cơ sở dữ liệu `exam_db` và `attempt_db`.

---

## 4. Chiến Lược Nâng Cấp Không Gián Đoạn (Zero-Downtime Rollout Strategy)

Để đảm bảo các bản vá lỗi hoặc cập nhật tính năng mới không làm gián đoạn kỳ thi:

```
[Bản Hiện Tại: Phiên Bản V1 (Active / Blue)] ──▶ Phục vụ 100% người dùng
                                                  │
                                                  ▼
[Bản Mới: Phiên Bản V2 (Staging / Green)]    ──▶ Triển khai ngầm, chạy Health Check nội bộ
                                                  │
                                                  ▼
[Chuyển Hướng Giao Thông (Canary: 5%)]      ──▶ Kiểm tra lỗi trên 5% người dùng trong 15 phút
                                                  │
                                                  ▼
[Chuyển Hướng Hoàn Toàn (100% traffic)]     ──▶ Chuyển toàn bộ sang V2 nếu tỷ lệ lỗi = 0%
                                                  │ (Tự động Rollback về V1 trong 10 giây nếu phát hiện lỗi)
```
* Áp dụng **Rolling Updates** với Kubernetes `maxSurge: 25%`, `maxUnavailable: 0` đảm bảo luôn có đủ số lượng Pods phục vụ liên tục.

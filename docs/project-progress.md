# StudyFlow Pro – Tiến độ dự án

**Cập nhật lần cuối:** 15/11/2026  
**Nhánh hiện tại trên máy leader:** `develop`  
**Trạng thái chung:** Giai đoạn chuẩn bị và thiết kế tuần 1; chưa bắt đầu phát triển tính năng MVP thực tế.

## 1. Mục tiêu dự án

Xây dựng ứng dụng giúp sinh viên quản lý việc học cá nhân và phối hợp học tập theo nhóm.

Leader đã chốt hướng MVP theo hai mức ưu tiên để phù hợp với nhóm 4 người và thời gian 5 tuần. Nhóm cần cùng xem lại và xác nhận trước khi bắt đầu tuần 1.

### MVP cốt lõi – ưu tiên hoàn thành

- Đăng ký và đăng nhập.
- CRUD môn học và công việc; công việc có hạn, trạng thái và có thể liên kết với môn học.
- Quản lý lịch học cơ bản.
- Tạo mục tiêu đơn giản và theo dõi tiến độ.
- Dashboard tổng hợp dữ liệu đã có.
- Tạo nhóm, tham gia nhóm, giao và theo dõi nhiệm vụ nhóm ở mức cơ bản.
- Phân quyền tối thiểu: dữ liệu cá nhân chỉ chủ sở hữu xem; dữ liệu nhóm chỉ thành viên được phép xem.

### Phần mở rộng – chỉ làm khi còn thời gian

- Quản lý thời gian rảnh.
- Smart Planner cá nhân dùng quy tắc đơn giản để gợi ý khung giờ học trước hạn công việc.
- Thống kê nâng cao hơn các số liệu cơ bản trên Dashboard.

### Ngoài phạm vi hiện tại

- Chat realtime/Socket.IO.
- Gửi email mời tự động.
- AI Planner cho nhiều thành viên.

Chi tiết phạm vi ban đầu nằm trong [mvp-scope.md](./mvp-scope.md); cần cập nhật tài liệu đó sau khi cả nhóm xác nhận các mức ưu tiên trên.

## 2. Đã hoàn thành trước đó

- Repository đã được clone; nhánh `develop` tồn tại trên GitHub.
- Frontend React + Vite đã được khởi tạo.
- React Router đã được thiết lập cho trang đăng nhập, đăng ký và dashboard.
- Zustand store cơ bản cho trạng thái sidebar đã được tạo.
- AuthContext/AuthProvider/useAuth mới ở mức giả lập frontend; chưa có đăng nhập thật.
- Trước lần bàn giao này, người dùng đã xác nhận các trang nền tảng chạy được trên trình duyệt, lint và build thành công.

## 3. Đã làm trên máy leader, chưa đưa lên GitHub

- Tạo tài liệu phạm vi MVP tại `docs/mvp-scope.md`.
- Soạn bản dự thảo đặc tả yêu cầu cho các tính năng cốt lõi tại `docs/requirements.md`; còn chờ nhóm review và chốt các câu hỏi mở.
- Soạn và rà soát chéo dự thảo thiết kế MongoDB/Mongoose tại `docs/database-design.md` và REST API tại `docs/api-contract.md`; các giả định cần nhóm xác nhận được ghi rõ.
- Dựng khung giao diện sau đăng nhập gồm sidebar, header và vùng nội dung.
- Tạo route khung cho Dashboard, Môn học, Công việc, Lịch học, Mục tiêu, Nhóm học tập và Thống kê.
- Tạo giao diện Dashboard mẫu và nội dung chờ cho các khu vực chức năng.
- Bổ sung CSS responsive cho khung ứng dụng.
- Tạo nền MongoDB/Mongoose tại `server/`: package/dependency, cấu hình kết nối, 8 model, indexes và script `db:init`.
- Khởi tạo database local `studyflow` thành công tại `mongodb://127.0.0.1:27017/studyflow`; đã tạo 8 collection và indexes.
- Dữ liệu local nằm trong `server/.data/` và được Git bỏ qua; các collection hiện đang rỗng.
- Tạo `server/README.md` hướng dẫn chạy MongoDB local và khởi tạo collections.

Các thay đổi trên hiện đang chưa commit/push. Thành viên clone `develop` từ GitHub chưa nhận được các thay đổi này. Cần review, tạo nhánh tính năng, commit và mở Pull Request vào `develop` trước khi xem chúng là phiên bản chung.

## 4. Chưa hoàn thành

- Nhóm chưa cùng xác nhận chính thức phạm vi MVP.
- Đặc tả yêu cầu đã được soạn ở dạng dự thảo; nhóm cần review và quyết định các câu hỏi mở trước khi thiết kế database/API.
- Thiết kế database và API contract đã có bản dự thảo; cần thống nhất các giả định và câu hỏi mở trước khi xem là bản chốt.
- Chưa có Express API, CRUD thực tế, xác thực JWT hoặc phân quyền backend.
- Các route chức năng hiện là khung; một số nút và khu vực chỉ mang tính minh họa.
- Chưa chạy lint/build sau các thay đổi khung giao diện mới.

## 5. Phân công thiết kế tuần 1

| Người phụ trách | Nội dung cần thiết kế | Tài liệu đề xuất |
|---|---|---|
| Leader | Auth, nhóm học tập, vai trò OWNER/MEMBER và quyền riêng tư | `docs/week1-auth-groups.md` |
| Thành viên 2 | Môn học, công việc, trạng thái, hạn và quan hệ dữ liệu | `docs/week1-subjects-tasks.md` |
| Thành viên 3 | Lịch học cơ bản (cốt lõi); thời gian rảnh và Smart Planner cá nhân (mở rộng) | `docs/week1-schedule-planner.md` |
| Thành viên 4 | Mục tiêu và Dashboard/thống kê cơ bản (cốt lõi); thống kê nâng cao (mở rộng) | `docs/week1-goals-analytics.md` |

Tuần 1 tập trung thống nhất yêu cầu, database và API; chưa yêu cầu thành viên code chức năng.

## 6. Việc tiếp theo

1. Leader review các file hiện có và đưa những thay đổi muốn chia sẻ lên nhánh riêng, mở Pull Request vào `develop`.
2. Nhóm review dự thảo `docs/requirements.md`, xác nhận phạm vi MVP và quyết định các câu hỏi mở ở cuối tài liệu.
3. Mỗi thành viên tạo nhánh riêng từ `develop`, cập nhật đặc tả phần được giao nếu cần và mở Pull Request.
4. Nhóm review `docs/database-design.md` và `docs/api-contract.md`; chốt quyền OWNER/MEMBER, lời mời, xóa dữ liệu, xác thực và các điểm còn mở.
5. Cập nhật các tài liệu sau review; chỉ bắt đầu code tính năng khi nhóm thống nhất yêu cầu, database và API contract.

## 7. Quy trình Git của nhóm

- Không làm trực tiếp trên `main` hoặc `develop`.
- Mỗi nhiệm vụ làm trên nhánh riêng được tạo từ `develop`.
- Commit, push nhánh và mở Pull Request vào `develop`.
- Leader review và merge sau khi nội dung được thống nhất.

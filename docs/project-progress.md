# StudyFlow Pro – Tiến độ dự án

**Cập nhật lần cuối:** 17/11/2026
**Giai đoạn hiện tại:** MVP đã được nhóm thống nhất. Backend nền và API MVP đã được triển khai trong repo; bước tiếp theo là chạy tích hợp với MongoDB, xử lý phát hiện khi vận hành, rồi bàn giao cho nhóm tập trung frontend.
**Nhánh:** `feature/project-foundation`

## Đã hoàn thành trong repo

- Phạm vi MVP đã thống nhất trong [mvp-scope.md](./mvp-scope.md); requirements, database design và API contract được chỉnh thành tài liệu triển khai theo phạm vi đó.
- Frontend React + Vite có khung màn hình cho đăng nhập/đăng ký, dashboard, môn học, công việc, lịch, mục tiêu, nhóm và thống kê.
- Nền MongoDB/Mongoose, các model/indexes và script `db:init`.
- Express API với đăng ký/đăng nhập, hash bcrypt, JWT, cập nhật hồ sơ, validation, xử lý lỗi và middleware xác thực.
- API CRUD cho môn học, công việc, lịch, mục tiêu, thời gian rảnh; API nhóm, lời mời, thành viên, chuyển OWNER và nhiệm vụ nhóm.
- API gợi ý Smart Planner cá nhân và dashboard tổng hợp.
- Proxy `/api` từ Vite sang API local; có hướng dẫn chạy server, tạo tài khoản thử và sử dụng bearer token tại [server/README.md](../server/README.md).

## Còn phải hoàn tất trước khi chuyển hẳn sang frontend

1. Cài/chạy MongoDB local và xác nhận `db:init`, API khởi động, các luồng auth/API chính hoạt động với database thật.
2. Xử lý các lỗi tích hợp phát hiện được; rà tương thích thực tế giữa phản hồi API và contract.
3. Chuẩn bị dữ liệu/tài khoản demo dùng chung và hướng dẫn bàn giao cuối cho nhóm frontend.

MongoDB chưa chạy trong môi trường hiện tại nên các luồng backend chưa được xác nhận end-to-end. Kiểm tra cú pháp JavaScript đã thực hiện; chưa chạy test suite.

## Sau khi bàn giao nền tảng

- Chia thành viên làm frontend theo các khu vực: xác thực; môn học/công việc; lịch/thời gian rảnh/Smart Planner; mục tiêu/dashboard; nhóm/nhiệm vụ nhóm.
- Tích hợp các màn hình với API thật, thay auth giả lập và dữ liệu mẫu.
- Hoàn thiện responsive, trạng thái tải/lỗi/xác nhận thao tác và luồng người dùng end-to-end.
- Chuẩn bị demo triển khai.

## Quy trình Git

- Làm việc trên nhánh tính năng từ `develop`; mở Pull Request để review theo quy trình nhóm.
- Cập nhật tài liệu này khi hạng mục chuyển trạng thái.

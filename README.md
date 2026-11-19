# StudyFlow Pro

Ứng dụng quản lý việc học cá nhân và phối hợp học tập theo nhóm. MVP đã được thống nhất. Frontend dùng React/Vite; backend dùng Express và MongoDB/Mongoose.

## Chạy local

Yêu cầu: Node.js 22 trở lên, npm và MongoDB local hoặc database `studyflow` trên Atlas. Khi nhóm dùng chung Atlas, mọi người kết nối tới cùng database cloud; không cần cài hay tải database local. Không commit file `.env`.

### 1. Cài và cấu hình backend

Mở PowerShell tại thư mục repo:

```powershell
cd server
npm.cmd install
Copy-Item .env.example .env
```

Mở `server/.env`, đặt `MONGODB_URI` tới MongoDB local hoặc database `studyflow` trên Atlas. Thay `JWT_SECRET` bằng chuỗi ngẫu nhiên dài ít nhất 32 ký tự. Các biến `DEMO_EMAIL` và `DEMO_PASSWORD` mặc định là tài khoản demo.

Ví dụ khởi tạo secret trong PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 2. Chuẩn bị database và dữ liệu demo

Đảm bảo MongoDB đang chạy, rồi trong PowerShell tại `server` chạy:

```powershell
npm.cmd run db:init
npm.cmd run db:seed
npm.cmd run dev
```

Seed có thể chạy lại; nó tạo/cập nhật dữ liệu mẫu cho user, môn học, công việc, lịch, mục tiêu, thời gian rảnh, nhóm và nhiệm vụ nhóm. Có thể dùng để khởi tạo database Atlas mới. **Không chạy seed trên database production hoặc database có dữ liệu thật.**

Tài khoản demo mặc định:

```text
Email: demo@studyflow.local
Mật khẩu: StudyflowDemo123!
```

### 3. Chạy frontend

Mở PowerShell thứ hai tại repo:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Mở URL Vite được in ra terminal. Proxy `/api` tự chuyển request tới backend ở `http://127.0.0.1:4000`; không cần cấu hình CORS riêng khi chạy qua Vite.

## Bàn giao API

- Base path: `/api/v1`
- Tài liệu endpoint, request/response và lỗi: [`docs/api.md`](docs/api.md)
- Chi tiết contract và quyền dữ liệu: [`docs/api-contract.md`](docs/api-contract.md)
- API client frontend dùng chung: [`client/src/services/api.js`](client/src/services/api.js)
- Health check: `GET http://127.0.0.1:4000/api/v1/health`

Đăng nhập trả về JWT. Route riêng tư dùng header `Authorization: Bearer <token>`; `api.js` tự gắn token đã lưu bằng `setAuthToken(token)`. Khi đăng xuất, gọi `setAuthToken(null)`.

## Database cho nhóm

Để cả nhóm dùng chung, cấu hình `MONGODB_URI` trong `.env` của mỗi backend trỏ tới database `studyflow` trên Atlas. Mỗi thành viên cần được cấp quyền kết nối và IP của họ phải nằm trong Atlas IP Access List. Chia sẻ URI qua kênh bí mật của nhóm, không đưa lên GitHub. `server/.data/` là dữ liệu local, không cần tải về khi dùng Atlas.

Xem thêm hướng dẫn backend tại [`server/README.md`](server/README.md).

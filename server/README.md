# StudyFlow Pro – Backend API

Backend dùng Node.js, Express, MongoDB/Mongoose, bcryptjs và JWT. Contract endpoint nằm tại [`../docs/api-contract.md`](../docs/api-contract.md); schema ở [`../docs/database-design.md`](../docs/database-design.md).

## Khởi chạy local trên Windows

1. Cài MongoDB Community Server hoặc khởi động MongoDB service. Nếu chạy `mongod` thủ công, mở PowerShell tại `server`:

   ```powershell
   New-Item -ItemType Directory -Force .data | Out-Null
   & 'C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe' --dbpath '.data' --bind_ip '127.0.0.1' --port 27017
   ```

2. Mở PowerShell khác tại `server`, tạo cấu hình local (chỉ cần làm lần đầu), cài dependencies:

   ```powershell
   Copy-Item .env.example .env
   npm.cmd install
   ```

   Đổi `JWT_SECRET` trong `.env` thành chuỗi ngẫu nhiên riêng dài ít nhất 32 ký tự. Không commit `.env`.

3. Khởi tạo collections và indexes:

   ```powershell
   npm.cmd run db:init
   ```

   Lệnh này tạo các collection MVP và indexes; không thêm tài khoản hay dữ liệu mẫu.

   Tạo/cập nhật dữ liệu demo cho database local:

   ```powershell
   npm.cmd run db:seed
   ```

   Tài khoản mặc định được đọc từ `DEMO_EMAIL` và `DEMO_PASSWORD` trong `.env`. Seed chỉ dùng cho local; không chạy trên production.

4. Khởi động API:

   ```powershell
   npm.cmd run dev
   ```

Mặc định API chạy tại `http://127.0.0.1:4000/api/v1`. `GET /api/v1/health` trả trạng thái tiến trình. Frontend Vite chuyển tiếp `/api` tới port 4000.

## Tạo tài khoản dùng thử

Seed tạo sẵn tài khoản ở trên. Hoặc tự đăng ký bằng `POST /api/v1/auth/register`:

```json
{
  "name": "Nguyen An",
  "email": "an@example.com",
  "password": "example-password",
  "timeZone": "Asia/Ho_Chi_Minh"
}
```

Đăng nhập qua `POST /api/v1/auth/login`; dùng `token` trong header `Authorization: Bearer <token>` cho route riêng tư.

## Nhóm endpoint

- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- Cá nhân: `/subjects`, `/tasks`, `/schedules`, `/goals`, `/availability`
- Planner và dashboard: `/planner/suggestions`, `/dashboard/summary`
- Nhóm: `/groups`, `/me/group-invitations`, `/group-invitations/:invitationId`, group members và group tasks

Danh sách hỗ trợ `page` mặc định 1 và `limit` mặc định 20, tối đa 100. Dữ liệu cá nhân luôn truy vấn theo user trong token; quyền nhóm luôn kiểm tra membership ACTIVE tại backend.

Xem hướng dẫn dành cho frontend tại [`../docs/api.md`](../docs/api.md).

## Bảo vệ dữ liệu local

- `server/.env` và `server/.data/` không được commit.
- MongoDB phát triển chỉ bind vào `127.0.0.1`.
- Không ghi URI có mật khẩu hoặc khóa JWT vào source control.

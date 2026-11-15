# StudyFlow Pro – Backend Database

Backend database layer dùng MongoDB và Mongoose. Schema chung được mô tả tại [`../docs/database-design.md`](../docs/database-design.md).

## Collections MVP

- `users`
- `subjects`
- `tasks`
- `schedules`
- `goals`
- `studyGroups`
- `groupMembers`
- `groupTasks`

Các model nằm trong `src/models/`. Dùng chung tên field và collection theo các model này; không tự tạo collection trùng mục đích ở feature branch.

## Khởi tạo trên Windows

1. Mở PowerShell thứ nhất tại thư mục `server` và chạy MongoDB Server. Lệnh dưới đây dùng thư mục dữ liệu local của dự án; terminal này cần để mở khi phát triển:

   ```powershell
   New-Item -ItemType Directory -Force .data | Out-Null
   & 'C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe' --dbpath '.data' --bind_ip '127.0.0.1' --port 27017
   ```

   Nếu MongoDB Server được cài như Windows service và service đang chạy, không cần chạy lệnh trên.

2. Mở PowerShell thứ hai tại `server`, tạo file cấu hình local nếu chưa có, rồi cài dependencies:

   ```powershell
   Copy-Item .env.example .env
   npm.cmd install
   ```

3. Tạo database `studyflow`, các collection và indexes:

   ```powershell
   npm.cmd run db:init
   ```

MongoDB tạo database khi có collection đầu tiên. Script `db:init` tạo trước 8 collection MVP và indexes được khai báo trong model. Database chỉ chứa các collection rỗng; chưa có tài khoản hay dữ liệu mẫu.

## Compass

Khi MongoDB Server đang chạy, mở Compass và kết nối tới:

```text
mongodb://127.0.0.1:27017
```

Chọn database `studyflow` để xem collections.

## Bảo vệ dữ liệu local

- `server/.env` và `server/.data/` không được commit.
- Không thêm URI có mật khẩu hoặc thông tin bí mật vào source control.
- MongoDB bind chỉ vào `127.0.0.1` trong cấu hình phát triển này.

# StudyFlow API – hướng dẫn cho frontend

Contract triển khai: [`api-contract.md`](./api-contract.md). Base path là `/api/v1`; chạy local qua Vite bằng `/api/v1/...` hoặc gọi server ở `http://127.0.0.1:4000/api/v1/...`.

## Xác thực và định dạng

- Các endpoint có khóa 🔒 cần `Authorization: Bearer <token>`. `POST /auth/register` và `POST /auth/login` không cần token.
- Login trả `data.token`. Lưu token bằng `setAuthToken(token)` trong [`../client/src/services/api.js`](../client/src/services/api.js); API client tự gắn header. Logout gọi `setAuthToken(null)`.
- JSON thành công thường có dạng `{ "data": ... }`; DELETE thành công trả `204` và không có body.
- Lỗi có dạng `{ "error": { "code": "...", "message": "...", "details": [] } }`.
- Danh sách hỗ trợ `?page=1&limit=20` (limit tối đa 100). ID lấy từ `id` trong response.

## Auth

| Method | Path             | Body                              | Auth  | Thành công                                         |
| ------ | ---------------- | --------------------------------- | ----- | -------------------------------------------------- |
| POST   | `/auth/register` | `{name,email,password,timeZone?}` | Không | `201 {data:{user:{id,name,email,timeZone}}}`       |
| POST   | `/auth/login`    | `{email,password}`                | Không | `200 {data:{user:{id,name,email,timeZone},token}}` |
| GET    | `/auth/me`       | —                                 | 🔒    | `{data:{user:{id,name,email,timeZone}}}`           |
| PATCH  | `/auth/me`       | `{name? ,timeZone?}`              | 🔒    | `{data:{user}}`                                    |

Email phải hợp lệ; mật khẩu tối thiểu 8 ký tự. Múi giờ mặc định `Asia/Ho_Chi_Minh` và phải là mã IANA hợp lệ. Lỗi thường gặp: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `409 EMAIL_ALREADY_EXISTS`.

## Dữ liệu cá nhân

Tất cả route dưới đây cần 🔒. Mọi record tự gắn với user trong token; không gửi `ownerId`.

| Method               | Path                            | Body / query                                                                                                    | Thành công                                          |
| -------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| GET / POST           | `/subjects`                     | POST `{name,code?,description?}`                                                                                | GET `{data:[subject]}`; POST `201 {data:subject}`   |
| GET / PATCH / DELETE | `/subjects/:subjectId`          | PATCH `{name?,code?,description?}`                                                                              | GET/PATCH `{data:subject}`; DELETE `204`            |
| GET / POST           | `/tasks`                        | POST `{title,description?,subjectId?,dueAt,estimatedMinutes?}`; GET query `status,subjectId,dueBefore,dueAfter` | GET `{data:[task]}`; POST `201 {data:task}`         |
| GET / PATCH / DELETE | `/tasks/:taskId`                | PATCH `{title?,description?,subjectId?,dueAt?,estimatedMinutes?,status?}`                                       | GET/PATCH `{data:task}`; DELETE `204`               |
| GET / POST           | `/schedules`                    | POST `{title,startsAt,endsAt,subjectId?,taskId?,location?,notes?}`; GET query `from,to`                         | GET `{data:[schedule]}`; POST `201 {data:schedule}` |
| GET / PATCH / DELETE | `/schedules/:scheduleId`        | PATCH các trường POST ở trên                                                                                    | GET/PATCH `{data:schedule}`; DELETE `204`           |
| GET / POST           | `/goals`                        | POST `{title,description?,dueAt?}`                                                                              | GET `{data:[goal]}`; POST `201 {data:goal}`         |
| GET / PATCH / DELETE | `/goals/:goalId`                | PATCH `{title?,description?,dueAt?,progress?}`                                                                  | GET/PATCH `{data:goal}`; DELETE `204`               |
| GET / POST           | `/availability`                 | POST `{dayOfWeek,startMinute,endMinute}`                                                                        | GET `{data:[window]}`; POST `201 {data:window}`     |
| PATCH / DELETE       | `/availability/:availabilityId` | PATCH các trường POST ở trên                                                                                    | PATCH `{data:window}`; DELETE `204`                 |

Quy tắc quan trọng: `estimatedMinutes` là số nguyên 15–480 (mặc định 60); task status là `TODO`, `IN_PROGRESS`, `DONE`; `progress` là số nguyên 0–100. Schedule phải có `endsAt > startsAt`; xung đột trả `409 SCHEDULE_CONFLICT`. Xóa môn đang được task/lịch tham chiếu trả `409 SUBJECT_IN_USE`. Khung availability dùng ISO weekday 1–7 và phút địa phương; khung chồng nhau trả `409 AVAILABILITY_CONFLICT`.

Ví dụ tạo task:

```js
const task = await api.post('/tasks', {
  title: 'Ôn chương 1',
  dueAt: '2026-11-20T10:00:00.000Z',
  estimatedMinutes: 60,
});
```

## Planner và dashboard

| Method | Path                   | Body                                                 | Auth | Thành công                                                                                 |
| ------ | ---------------------- | ---------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| POST   | `/planner/suggestions` | `{from:'YYYY-MM-DD',to:'YYYY-MM-DD'}` tối đa 14 ngày | 🔒   | `{data:{suggestions:[{taskId,startsAt,endsAt}],unscheduledTasks:[{taskId,reason}]}}`       |
| GET    | `/dashboard/summary`   | —                                                    | 🔒   | `{data:{subjectCount,openTaskCount,upcomingTasks,upcomingSchedules,goals,groupTaskCount}}` |

Planner chỉ đưa gợi ý, chưa lưu schedule. `reason` có thể là `OVERDUE` hoặc `NO_SLOT_BEFORE_DUE_DATE`.

## Nhóm và nhiệm vụ nhóm

Tất cả route cần 🔒. Chỉ thành viên ACTIVE mới đọc nội dung nhóm; OWNER mới quản lý thành viên và nhóm.

| Method               | Path                               | Body                                                 | Thành công                                      |
| -------------------- | ---------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| GET / POST           | `/groups`                          | POST `{name,description?}`                           | GET `{data:[group]}`; POST `201 {data:group}`   |
| GET / PATCH          | `/groups/:groupId`                 | PATCH `{name?,description?}`                         | `{data:group}`                                  |
| GET                  | `/groups/:groupId/members`         | —                                                    | `{data:[{id,name,email,status,role,joinedAt}]}` |
| POST                 | `/groups/:groupId/invitations`     | `{email}`                                            | `201 {data:{id,groupId,userId,status}}`         |
| GET                  | `/me/group-invitations`            | —                                                    | `{data:[{id,group,invitedBy,createdAt}]}`       |
| PATCH                | `/group-invitations/:invitationId` | `{status: ACTIVE or DECLINED}`                       | `{data:{status}}`                               |
| PATCH                | `/groups/:groupId/owner`           | `{newOwnerId}`                                       | `{data:{groupId,ownerId}}`                      |
| DELETE               | `/groups/:groupId/members/:userId` | —                                                    | `204`                                           |
| DELETE               | `/groups/:groupId/membership`      | —                                                    | `204`                                           |
| GET / POST           | `/groups/:groupId/tasks`           | POST `{title,description?,assigneeId,dueAt}`         | GET `{data:[task]}`; POST `201 {data:task}`     |
| GET / PATCH / DELETE | `/groups/:groupId/tasks/:taskId`   | PATCH task fields; assigned user may send `{status}` | GET/PATCH `{data:task}`; DELETE `204`           |

OWNER hoặc người tạo nhiệm vụ được sửa/xóa; người được giao chỉ cập nhật trạng thái. Lỗi quyền thường gặp: `403 FORBIDDEN`; nhóm/tài nguyên không thuộc quyền trả `404 NOT_FOUND`. Lỗi nghiệp vụ phổ biến: `409 INVITATION_EXISTS`, `409 OWNER_MUST_TRANSFER`, `400 VALIDATION_ERROR`.

## Lỗi dùng chung

| HTTP | Code               | Khi nào                                                   |
| ---- | ------------------ | --------------------------------------------------------- |
| 400  | `VALIDATION_ERROR` | Body, query hoặc ID không hợp lệ                          |
| 401  | `UNAUTHENTICATED`  | Thiếu token, token sai/hết hạn                            |
| 403  | `FORBIDDEN`        | Đã đăng nhập nhưng không được phép thao tác               |
| 404  | `NOT_FOUND`        | Không tồn tại hoặc không có quyền xem tài nguyên          |
| 409  | Mã theo nghiệp vụ  | Email trùng, lịch/khung giờ trùng, môn học đang được dùng |
| 500  | `INTERNAL_ERROR`   | Lỗi server                                                |

API client ném `ApiError` có `status`, `code`, `details` và `message` để UI hiển thị.

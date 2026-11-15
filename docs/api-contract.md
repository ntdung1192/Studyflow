# StudyFlow Pro – API Contract (MVP)

**Trạng thái:** Bản dự thảo để nhóm review; cần chốt cùng [requirements.md](./requirements.md) và [database-design.md](./database-design.md).  
**Base path đề xuất:** `/api/v1`  
**Định dạng:** JSON. Các ngày giờ dùng ISO 8601 UTC, ví dụ `2026-11-14T09:00:00.000Z`.

## 1. Quy ước API

### Xác thực

- Route riêng tư yêu cầu `Authorization: Bearer <token>`.
- Backend lấy `userId` từ token; client không được tự gửi `ownerId`/vai trò để quyết định quyền.
- Chưa đăng nhập: `401 UNAUTHENTICATED`.
- Đã đăng nhập nhưng tài nguyên cá nhân/nhóm không thuộc quyền truy cập: đề xuất trả `404 NOT_FOUND` để không tiết lộ tài nguyên có tồn tại hay không. Lỗi quyền trên thao tác quản trị không liên quan tài nguyên cụ thể có thể trả `403 FORBIDDEN`.

### Phản hồi lỗi

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu gửi lên không hợp lệ.",
    "details": [{ "field": "title", "message": "Trường này là bắt buộc." }]
  }
}
```

Các mã HTTP thường dùng: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.

### Danh sách

Các endpoint danh sách trả mảng trong `data`. Phân trang có thể dùng `page` và `limit` nếu nhóm thấy cần; MVP có thể bắt đầu với giới hạn tối đa mặc định.

## 2. Auth

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/auth/register` | Tạo tài khoản |
| POST | `/auth/login` | Đăng nhập và nhận token |
| GET | `/auth/me` | Lấy tài khoản hiện tại |

**Register body:**

```json
{ "name": "Nguyen An", "email": "an@example.com", "password": "example-password" }
```

**Register response `201`:** `{ "data": { "user": { "id": "...", "name": "Nguyen An", "email": "an@example.com" } } }`

**Login body:** `{ "email": "an@example.com", "password": "example-password" }`

**Login response `200`:** `{ "data": { "user": { "id": "...", "name": "Nguyen An", "email": "an@example.com" }, "token": "..." } }`

`passwordHash` không bao giờ xuất hiện trong response. Với JWT stateless, logout ở MVP là xóa token ở client; nếu nhóm yêu cầu thu hồi token phía server thì cần thiết kế thêm.

## 3. Môn học

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/subjects` | Liệt kê môn học của người dùng hiện tại |
| POST | `/subjects` | Tạo môn học |
| GET | `/subjects/:subjectId` | Xem chi tiết môn học |
| PATCH | `/subjects/:subjectId` | Sửa môn học |
| DELETE | `/subjects/:subjectId` | Xóa môn học nếu không còn liên kết |

**Body tạo/sửa:** `name` bắt buộc; `code`, `description` tùy chọn. Không nhận `ownerId` từ client.

Nếu còn task hoặc schedule liên kết, DELETE trả `409 SUBJECT_IN_USE`.

## 4. Công việc cá nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/tasks` | Danh sách công việc cá nhân |
| POST | `/tasks` | Tạo công việc |
| GET | `/tasks/:taskId` | Xem chi tiết |
| PATCH | `/tasks/:taskId` | Sửa trường được phép |
| DELETE | `/tasks/:taskId` | Xóa công việc |

**Query GET:** `status`, `subjectId`, `dueBefore`, `dueAfter` (đều tùy chọn).

**Body tạo:**

```json
{ "title": "Ôn chương 1", "description": "", "subjectId": "...", "dueAt": "2026-11-20T10:00:00.000Z" }
```

Trạng thái mặc định `TODO`; PATCH trạng thái chỉ nhận `TODO`, `IN_PROGRESS`, `DONE`. Backend phải xác nhận `subjectId` thuộc cùng người dùng.

## 5. Lịch học cá nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/schedules?from=...&to=...` | Lấy lịch trong khoảng thời gian |
| POST | `/schedules` | Tạo buổi học |
| GET | `/schedules/:scheduleId` | Xem chi tiết |
| PATCH | `/schedules/:scheduleId` | Sửa buổi học |
| DELETE | `/schedules/:scheduleId` | Xóa buổi học |

**Body tạo:** `title`, `startsAt`, `endsAt` bắt buộc; `subjectId`, `location`, `notes` tùy chọn. `endsAt` phải sau `startsAt`; subject phải thuộc cùng người dùng. Một record là một buổi học cụ thể, chưa có lịch lặp trong phần cốt lõi.

## 6. Mục tiêu cá nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/goals` | Danh sách mục tiêu |
| POST | `/goals` | Tạo mục tiêu |
| GET | `/goals/:goalId` | Xem chi tiết |
| PATCH | `/goals/:goalId` | Sửa mục tiêu/tiến độ |
| DELETE | `/goals/:goalId` | Xóa mục tiêu |

**Body tạo:** `{ "title": "Hoàn thành khóa học", "description": "...", "dueAt": "2026-12-20T00:00:00.000Z" }`.

Tiến độ nhập thủ công qua PATCH, là số nguyên 0–100. Trạng thái `ACTIVE`/`COMPLETED` được backend đồng bộ theo tiến độ.

## 7. Nhóm học tập và lời mời

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/groups` | Liệt kê nhóm người dùng đang là thành viên ACTIVE |
| POST | `/groups` | Tạo nhóm; người tạo thành OWNER |
| GET | `/groups/:groupId` | Xem nhóm nếu có quyền |
| PATCH | `/groups/:groupId` | OWNER sửa tên/mô tả |
| GET | `/groups/:groupId/members` | Liệt kê thành viên |
| POST | `/groups/:groupId/invitations` | OWNER mời tài khoản đã đăng ký bằng email |
| GET | `/me/group-invitations` | Danh sách lời mời đang chờ của người dùng |
| PATCH | `/group-invitations/:invitationId` | Chấp nhận hoặc từ chối lời mời |
| PATCH | `/groups/:groupId/owner` | OWNER chuyển quyền cho thành viên ACTIVE khác |
| DELETE | `/groups/:groupId/members/:userId` | OWNER loại thành viên |
| DELETE | `/groups/:groupId/membership` | Thành viên tự rời nhóm |

**Tạo nhóm body:** `{ "name": "Nhóm Giải tích", "description": "..." }`.

**Mời body:** `{ "email": "member@example.com" }`. Chỉ lời mời trong ứng dụng; không gửi email tự động. Không được mời tài khoản đã ACTIVE hoặc tạo lời mời PENDING trùng.

**Phản hồi lời mời:** `{ "status": "ACTIVE" }` hoặc `{ "status": "DECLINED" }`; chỉ người được mời có thể phản hồi.

**Quyền:** OWNER quản lý thông tin nhóm/thành viên. Thành viên ACTIVE mới truy cập được nhóm. OWNER cần chuyển quyền cho thành viên ACTIVE khác trước khi rời nhóm; xóa nhóm chưa thuộc MVP cốt lõi.

**Chuyển OWNER body:** `{ "newOwnerId": "..." }`. Backend chỉ cho OWNER hiện tại chuyển quyền sang thành viên ACTIVE cùng nhóm. `studyGroups.ownerId` là nguồn dữ liệu chuẩn; API suy ra role là `OWNER` cho ownerId và `MEMBER` cho các thành viên ACTIVE khác, không lưu role trùng trong membership. OWNER mới được quyền quản trị; OWNER cũ trở thành MEMBER và có thể rời nhóm.

## 8. Nhiệm vụ nhóm

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/groups/:groupId/tasks` | Liệt kê nhiệm vụ nhóm |
| POST | `/groups/:groupId/tasks` | Tạo và giao nhiệm vụ |
| GET | `/groups/:groupId/tasks/:taskId` | Xem nhiệm vụ |
| PATCH | `/groups/:groupId/tasks/:taskId` | Sửa nhiệm vụ hoặc trạng thái |
| DELETE | `/groups/:groupId/tasks/:taskId` | Xóa nhiệm vụ |

**Body tạo:**

```json
{ "title": "Chuẩn bị phần ví dụ", "description": "...", "assigneeId": "...", "dueAt": "2026-11-22T10:00:00.000Z" }
```

`createdBy` lấy từ token; `groupId` lấy từ path. `assigneeId` phải là thành viên ACTIVE của nhóm. Dự thảo quyền sửa: người tạo hoặc OWNER sửa/xóa; người được giao chỉ đổi trạng thái. Mọi route xác minh membership trước khi trả dữ liệu.

## 9. Dashboard

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/dashboard/summary` | Tổng hợp dữ liệu người dùng hiện tại |

**Response đề xuất:**

```json
{
  "data": {
    "subjectCount": 0,
    "openTaskCount": 0,
    "upcomingTasks": [],
    "upcomingSchedules": [],
    "goals": [],
    "groupTaskCount": 0
  }
}
```

Chỉ tổng hợp dữ liệu cá nhân của user và nhiệm vụ thuộc các nhóm họ đang là thành viên ACTIVE.

## 10. Bảo vệ quyền truy cập bắt buộc

- Với mọi Subject/Task/Schedule/Goal, truy vấn phải gồm ID tài nguyên và `ownerId` từ token.
- Với Group/GroupTask, kiểm tra membership `ACTIVE` trước khi truy vấn/trả dữ liệu.
- Khi tạo GroupTask, xác nhận người tạo và người được giao đều là thành viên ACTIVE.
- Khi người dùng rời hoặc bị loại khỏi nhóm, các request tiếp theo tới dữ liệu nhóm đó phải bị từ chối.
- Không coi việc ẩn nút trên frontend là kiểm soát quyền.

## 11. Đề xuất cần nhóm xác nhận trước khi đóng API contract

1. Với ID tài nguyên riêng tư/nhóm không có quyền: trả `404`; với hành động quản trị bị cấm: trả `403`.
2. GroupTask: thành viên được tạo; người tạo hoặc OWNER được sửa/xóa; người được giao được đổi trạng thái.
3. JWT logout: client xóa token; không xây hệ thống thu hồi token phía server trong MVP.
4. Danh sách: chưa yêu cầu phân trang ở bản đầu; giới hạn số bản ghi tối đa ở backend.
5. OWNER cần chuyển quyền cho một thành viên ACTIVE trước khi rời nhóm; thiết kế đề xuất endpoint chuyển quyền ở trên.

Các lựa chọn này khớp với đề xuất trong [requirements.md](./requirements.md), nhưng vẫn cần nhóm xác nhận trước khi xem API contract là bản chốt.

# StudyFlow Pro – API Contract (MVP)

**Trạng thái:** Contract triển khai theo phạm vi MVP đã thống nhất; dùng chung với [requirements.md](./requirements.md) và [database-design.md](./database-design.md).
**Base path:** `/api/v1`
**Định dạng:** JSON. Các ngày giờ dùng ISO 8601 UTC, ví dụ `2026-11-14T09:00:00.000Z`.

## 1. Quy ước API

### Xác thực

- Route riêng tư yêu cầu `Authorization: Bearer <token>`.
- Backend lấy `userId` từ token; client không được tự gửi `ownerId`/vai trò để quyết định quyền.
- Chưa đăng nhập: `401 UNAUTHENTICATED`.
- Đã đăng nhập nhưng tài nguyên cá nhân/nhóm không thuộc quyền truy cập: trả `404 NOT_FOUND` để không tiết lộ tài nguyên có tồn tại hay không. Lỗi quyền trên thao tác quản trị trả `403 FORBIDDEN`.

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

Các mã HTTP dùng: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `500`. Lỗi validation thống nhất dùng `400 VALIDATION_ERROR`; xung đột dữ liệu dùng `409` với mã lỗi riêng.

### Danh sách

Các endpoint danh sách trả mảng trong `data` và hỗ trợ `page` (mặc định 1), `limit` (mặc định 20, tối đa 100). Backend luôn giới hạn kết quả.

## 2. Auth

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/auth/register` | Tạo tài khoản |
| POST | `/auth/login` | Đăng nhập và nhận token |
| GET | `/auth/me` | Lấy tài khoản hiện tại |
| PATCH | `/auth/me` | Cập nhật tên hoặc múi giờ IANA |

**Register body:**

```json
{ "name": "Nguyen An", "email": "an@example.com", "password": "example-password", "timeZone": "Asia/Ho_Chi_Minh" }
```

**Register response `201`:** `{ "data": { "user": { "id": "...", "name": "Nguyen An", "email": "an@example.com" } } }`

**Login body:** `{ "email": "an@example.com", "password": "example-password" }`

**Login response `200`:** `{ "data": { "user": { "id": "...", "name": "Nguyen An", "email": "an@example.com" }, "token": "..." } }`

`timeZone` tùy chọn, mặc định `Asia/Ho_Chi_Minh`; chỉ chấp nhận mã IANA hợp lệ. PATCH `/auth/me` chỉ nhận `name` và/hoặc `timeZone`. `passwordHash` không bao giờ xuất hiện trong response. JWT có thời hạn 24 giờ; logout ở MVP là xóa token ở client, không có thu hồi token phía server.

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
{ "title": "Ôn chương 1", "description": "", "subjectId": "...", "dueAt": "2026-11-20T10:00:00.000Z", "estimatedMinutes": 60 }
```

`estimatedMinutes` tùy chọn, mặc định 60; nếu gửi phải là số nguyên 15–480. Trạng thái mặc định `TODO`; PATCH trạng thái chỉ nhận `TODO`, `IN_PROGRESS`, `DONE`. Backend phải xác nhận `subjectId` thuộc cùng người dùng.

## 5. Lịch học cá nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/schedules?from=...&to=...` | Lấy lịch trong khoảng thời gian |
| POST | `/schedules` | Tạo buổi học |
| GET | `/schedules/:scheduleId` | Xem chi tiết |
| PATCH | `/schedules/:scheduleId` | Sửa buổi học |
| DELETE | `/schedules/:scheduleId` | Xóa buổi học |

**Body tạo:** `title`, `startsAt`, `endsAt` bắt buộc; `subjectId`, `taskId`, `location`, `notes` tùy chọn. `endsAt` phải sau `startsAt`; subject/task phải thuộc cùng người dùng. Mỗi record là một buổi học cụ thể. Lịch chồng giờ với buổi khác của cùng người dùng bị từ chối bằng `409 SCHEDULE_CONFLICT`.

## 6. Mục tiêu cá nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/goals` | Danh sách mục tiêu |
| POST | `/goals` | Tạo mục tiêu |
| GET | `/goals/:goalId` | Xem chi tiết |
| PATCH | `/goals/:goalId` | Sửa mục tiêu/tiến độ |
| DELETE | `/goals/:goalId` | Xóa mục tiêu |

**Body tạo:** `{ "title": "Hoàn thành khóa học", "description": "...", "dueAt": "2026-12-20T00:00:00.000Z" }`.

Tiến độ nhập thủ công qua PATCH, là số nguyên 0–100. API trả `status` suy ra (`COMPLETED` khi progress=100, còn lại `ACTIVE`); không lưu status riêng trong DB.

## 7. Thời gian rảnh

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/availability` | Liệt kê khung giờ rảnh hằng tuần |
| POST | `/availability` | Tạo khung giờ rảnh |
| PATCH | `/availability/:availabilityId` | Sửa khung giờ |
| DELETE | `/availability/:availabilityId` | Xóa khung giờ |

**Body tạo/sửa:** `{ "dayOfWeek": 1, "startMinute": 540, "endMinute": 720 }`; ngày ISO weekday (1=Thứ Hai, 7=Chủ Nhật), phút địa phương theo múi giờ tài khoản. `endMinute` lớn hơn `startMinute` và tối đa 1440. Khung qua nửa đêm không hỗ trợ. Chồng lấn trong cùng thứ trả `409 AVAILABILITY_CONFLICT`.

## 8. Smart Planner cá nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/planner/suggestions` | Tính gợi ý mà không ghi dữ liệu |

**Body:** `{ "from": "2026-11-16", "to": "2026-11-29" }`; ngày địa phương theo múi giờ tài khoản, khoảng tối đa 14 ngày.

Planner lấy Task `TODO`/`IN_PROGRESS` có hạn đến hết `to`, xếp theo `dueAt` tăng dần rồi `createdAt` tăng dần. Mỗi Task được xếp vào một phiên liên tục có độ dài `estimatedMinutes`, trong availability và trước deadline; bỏ qua khoảng đã chiếm bởi Schedule hoặc gợi ý trước đó. Không chia phiên. Response trả `suggestions` (gồm `taskId`, `startsAt`, `endsAt`) và `unscheduledTasks` với lý do `OVERDUE` hoặc `NO_SLOT_BEFORE_DUE_DATE`. Gợi ý chưa được lưu; người dùng chọn rồi tạo Schedule qua `POST /schedules` kèm `taskId`. Backend xác minh xung đột lần nữa khi lưu.

## 9. Nhóm học tập và lời mời

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

**Mời body:** `{ "email": "member@example.com" }`. Chỉ lời mời trong ứng dụng; không email tự động hoặc mã mời. Không mời tài khoản `ACTIVE` hoặc tạo lời mời `PENDING` trùng. Với membership `DECLINED`, `REMOVED` hoặc `LEFT`, cập nhật cùng record thành `PENDING`, thay `invitedBy`, xóa `joinedAt`.

**Phản hồi lời mời:** `{ "status": "ACTIVE" }` hoặc `{ "status": "DECLINED" }`; chỉ người được mời có thể phản hồi.

**Quyền:** OWNER quản lý thông tin nhóm/thành viên. Thành viên ACTIVE mới truy cập được nhóm. OWNER cần chuyển quyền cho thành viên ACTIVE khác trước khi rời nhóm; xóa nhóm chưa thuộc MVP cốt lõi.

Khi thành viên rời/bị loại, giữ nguyên GroupTask để bảo toàn lịch sử nhưng từ chối quyền truy cập của thành viên đó ngay lập tức. OWNER có thể giao lại task chưa hoàn thành cho thành viên ACTIVE.

**Chuyển OWNER body:** `{ "newOwnerId": "..." }`. Backend chỉ cho OWNER hiện tại chuyển quyền sang thành viên ACTIVE cùng nhóm. `studyGroups.ownerId` là nguồn dữ liệu chuẩn; API suy ra role là `OWNER` cho ownerId và `MEMBER` cho các thành viên ACTIVE khác, không lưu role trùng trong membership. OWNER mới được quyền quản trị; OWNER cũ trở thành MEMBER và có thể rời nhóm.

## 10. Nhiệm vụ nhóm

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

`createdBy` lấy từ token; `groupId` lấy từ path. `assigneeId` phải là thành viên ACTIVE của nhóm. Người tạo hoặc OWNER sửa/xóa; người được giao chỉ đổi trạng thái. Mọi route xác minh membership trước khi trả dữ liệu.

## 11. Dashboard

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/dashboard/summary` | Tổng hợp dữ liệu người dùng hiện tại |

**Response:**

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

## 12. Bảo vệ quyền truy cập bắt buộc

- Với mọi Subject/Task/Schedule/Goal, truy vấn phải gồm ID tài nguyên và `ownerId` từ token.
- Với Group/GroupTask, kiểm tra membership `ACTIVE` trước khi truy vấn/trả dữ liệu.
- Khi tạo GroupTask, xác nhận người tạo và người được giao đều là thành viên ACTIVE.
- Khi người dùng rời hoặc bị loại khỏi nhóm, các request tiếp theo tới dữ liệu nhóm đó phải bị từ chối.
- Không coi việc ẩn nút trên frontend là kiểm soát quyền.

## 13. Quy tắc phản hồi

- ID tài nguyên riêng tư/nhóm không thuộc quyền người dùng: `404 NOT_FOUND`; hành động quản trị bị cấm: `403 FORBIDDEN`.
- Validation trả `400 VALIDATION_ERROR`; email trùng trả `409 EMAIL_ALREADY_EXISTS`; lịch chồng trả `409 SCHEDULE_CONFLICT`; khung rảnh chồng trả `409 AVAILABILITY_CONFLICT`; môn học còn tham chiếu trả `409 SUBJECT_IN_USE`.
- API không nhận `ownerId`, `createdBy`, `role` hoặc quyền từ client; các giá trị này được suy ra từ token và membership.

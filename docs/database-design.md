# StudyFlow Pro – Thiết kế Database (MVP)

**Trạng thái:** Thiết kế triển khai theo phạm vi MVP đã thống nhất.
**Database:** MongoDB với Mongoose.  
**Liên quan:** [Đặc tả yêu cầu](./requirements.md), [API contract](./api-contract.md)

## 1. Quy ước chung

- Mỗi document dùng `_id` kiểu `ObjectId`; Mongoose tự quản lý `createdAt` và `updatedAt`.
- Thời điểm lưu dưới dạng BSON Date; API nhận/trả thời gian theo ISO 8601 UTC.
- Tất cả dữ liệu cá nhân có `ownerId`; truy vấn phải lọc theo người dùng đã xác thực.
- Dữ liệu nhóm phải kiểm tra người dùng có membership `ACTIVE` trước khi đọc hoặc sửa.
- Không tin `ownerId`, `createdBy` hoặc vai trò do client gửi lên; backend suy ra từ token và membership.

## 2. Collections

### 2.1. `users`

| Trường                   | Kiểu     | Bắt buộc | Ghi chú                                                                                   |
| ------------------------ | -------- | -------: | ----------------------------------------------------------------------------------------- |
| `_id`                    | ObjectId |       Có | ID người dùng                                                                             |
| `name`                   | String   |       Có | Họ tên, trim                                                                              |
| `email`                  | String   |       Có | Lưu lowercase, unique                                                                     |
| `passwordHash`           | String   |       Có | Hash bcrypt, không bao giờ trả qua API                                                    |
| `timeZone`               | String   |       Có | Mã IANA; mặc định `Asia/Ho_Chi_Minh`, dùng để diễn giải khung giờ rảnh và ngày địa phương |
| `createdAt`, `updatedAt` | Date     |       Có | Timestamp                                                                                 |

**Index:** unique trên `email`.

### 2.2. `subjects`

| Trường                   | Kiểu            | Bắt buộc | Ghi chú     |
| ------------------------ | --------------- | -------: | ----------- |
| `ownerId`                | ObjectId → User |       Có | Chủ sở hữu  |
| `name`                   | String          |       Có | Tên môn học |
| `code`                   | String          |    Không | Mã môn      |
| `description`            | String          |    Không | Mô tả       |
| `createdAt`, `updatedAt` | Date            |       Có | Timestamp   |

**Index:** `{ ownerId: 1, name: 1 }`.

### 2.3. `tasks` (công việc cá nhân)

| Trường                   | Kiểu                         | Bắt buộc | Ghi chú                                                                          |
| ------------------------ | ---------------------------- | -------: | -------------------------------------------------------------------------------- |
| `ownerId`                | ObjectId → User              |       Có | Chủ sở hữu                                                                       |
| `subjectId`              | ObjectId → Subject hoặc null |    Không | Nếu có, subject phải thuộc cùng owner                                            |
| `title`                  | String                       |       Có | Tiêu đề                                                                          |
| `description`            | String                       |    Không | Mô tả                                                                            |
| `dueAt`                  | Date                         |       Có | Hạn hoàn thành                                                                   |
| `estimatedMinutes`       | Number                       |       Có | Số nguyên 15–480; mặc định 60, thời lượng Planner dùng để xếp một phiên liên tục |
| `status`                 | String                       |       Có | `TODO`, `IN_PROGRESS`, `DONE`; mặc định `TODO`                                   |
| `createdAt`, `updatedAt` | Date                         |       Có | Timestamp                                                                        |

**Index:** `{ ownerId: 1, dueAt: 1 }`, `{ ownerId: 1, status: 1 }`, `{ subjectId: 1 }`.

### 2.4. `schedules`

| Trường                   | Kiểu                         | Bắt buộc | Ghi chú                                                          |
| ------------------------ | ---------------------------- | -------: | ---------------------------------------------------------------- |
| `ownerId`                | ObjectId → User              |       Có | Chủ sở hữu                                                       |
| `subjectId`              | ObjectId → Subject hoặc null |    Không | Subject phải thuộc cùng owner                                    |
| `taskId`                 | ObjectId → Task hoặc null    |    Không | Task cá nhân mà phiên học được tạo từ Planner gắn với cùng owner |
| `title`                  | String                       |       Có | Tên buổi học                                                     |
| `startsAt`               | Date                         |       Có | Thời điểm bắt đầu                                                |
| `endsAt`                 | Date                         |       Có | Phải sau `startsAt`                                              |
| `location`               | String                       |    Không | Địa điểm                                                         |
| `notes`                  | String                       |    Không | Ghi chú                                                          |
| `createdAt`, `updatedAt` | Date                         |       Có | Timestamp                                                        |

**Index:** `{ ownerId: 1, startsAt: 1 }`, `{ ownerId: 1, taskId: 1 }`.

Mỗi document là một buổi học có ngày cụ thể; lịch lặp tuần nằm ngoài phần cốt lõi. Availability là khung lặp hằng tuần riêng.

### 2.5. `availability` (khung giờ rảnh hằng tuần)

| Trường                   | Kiểu            | Bắt buộc | Ghi chú                                                       |
| ------------------------ | --------------- | -------: | ------------------------------------------------------------- |
| `ownerId`                | ObjectId → User |       Có | Chủ sở hữu                                                    |
| `dayOfWeek`              | Number          |       Có | ISO weekday: 1=Thứ Hai … 7=Chủ Nhật                           |
| `startMinute`            | Number          |       Có | Phút tính từ 00:00 giờ địa phương, từ 0 đến 1439              |
| `endMinute`              | Number          |       Có | Phút tính từ 00:00; phải lớn hơn `startMinute` và tối đa 1440 |
| `createdAt`, `updatedAt` | Date            |       Có | Timestamp                                                     |

**Index:** `{ ownerId: 1, dayOfWeek: 1, startMinute: 1 }`.

**Quy tắc:** múi giờ lấy từ `users.timeZone`; khung giờ không được chồng nhau trong cùng thứ. Đây là quy tắc lặp mỗi tuần; không hỗ trợ ngoại lệ ngày nghỉ hoặc khung qua nửa đêm trong MVP. Chồng lấn phải được kiểm tra trong service trước khi ghi.

### 2.6. `goals`

| Trường                   | Kiểu            | Bắt buộc | Ghi chú                     |
| ------------------------ | --------------- | -------: | --------------------------- |
| `ownerId`                | ObjectId → User |       Có | Chủ sở hữu                  |
| `title`                  | String          |       Có | Tên mục tiêu                |
| `description`            | String          |    Không | Mô tả                       |
| `dueAt`                  | Date            |    Không | Hạn mục tiêu                |
| `progress`               | Number          |       Có | Số nguyên 0–100, mặc định 0 |
| `createdAt`, `updatedAt` | Date            |       Có | Timestamp                   |

**Index:** `{ ownerId: 1, dueAt: 1 }`.

**Quy tắc:** không lưu `status` vì nó trùng lặp với `progress`. API suy ra `COMPLETED` khi progress=100, ngược lại là `ACTIVE`. Khi lọc status, backend chuyển điều kiện thành lọc progress.

### 2.7. `studyGroups`

| Trường                   | Kiểu            | Bắt buộc | Ghi chú                                        |
| ------------------------ | --------------- | -------: | ---------------------------------------------- |
| `_id`                    | ObjectId        |       Có | ID nhóm                                        |
| `name`                   | String          |       Có | Tên nhóm                                       |
| `description`            | String          |    Không | Mô tả                                          |
| `ownerId`                | ObjectId → User |       Có | Nguồn dữ liệu chuẩn để xác định OWNER hiện tại |
| `createdAt`, `updatedAt` | Date            |       Có | Timestamp                                      |

**Index:** `{ ownerId: 1, createdAt: -1 }`.

### 2.8. `groupMembers`

| Trường                   | Kiểu                  | Bắt buộc | Ghi chú                                            |
| ------------------------ | --------------------- | -------: | -------------------------------------------------- |
| `groupId`                | ObjectId → StudyGroup |       Có | Nhóm                                               |
| `userId`                 | ObjectId → User       |       Có | Thành viên được mời/tham gia                       |
| `status`                 | String                |       Có | `PENDING`, `ACTIVE`, `DECLINED`, `REMOVED`, `LEFT` |
| `invitedBy`              | ObjectId → User       |    Không | Người gửi lời mời                                  |
| `joinedAt`               | Date                  |    Không | Thời điểm chấp nhận                                |
| `createdAt`, `updatedAt` | Date                  |       Có | Timestamp                                          |

**Index:** unique `{ groupId: 1, userId: 1 }`; `{ userId: 1, status: 1 }`.

**Quy tắc:** tạo nhóm đồng thời tạo membership `ACTIVE` cho người tạo và đặt người đó vào `studyGroups.ownerId`. Vai trò API suy ra từ ownerId, không lưu lặp. Mời theo email tài khoản đã có; không gửi email tự động. Nếu membership ở `DECLINED`, `REMOVED` hoặc `LEFT`, mời lại bằng cách cập nhật document đó về `PENDING`, cập nhật `invitedBy` và xóa `joinedAt`; không tạo document mới. `PENDING` hoặc `ACTIVE` không thể nhận lời mời trùng.

### 2.9. `groupTasks` (nhiệm vụ nhóm)

| Trường                   | Kiểu                  | Bắt buộc | Ghi chú                                        |
| ------------------------ | --------------------- | -------: | ---------------------------------------------- |
| `groupId`                | ObjectId → StudyGroup |       Có | Nhóm sở hữu nhiệm vụ                           |
| `createdBy`              | ObjectId → User       |       Có | Thành viên tạo                                 |
| `assigneeId`             | ObjectId → User       |       Có | Thành viên được giao                           |
| `title`                  | String                |       Có | Tiêu đề                                        |
| `description`            | String                |    Không | Mô tả                                          |
| `dueAt`                  | Date                  |       Có | Hạn hoàn thành                                 |
| `status`                 | String                |       Có | `TODO`, `IN_PROGRESS`, `DONE`; mặc định `TODO` |
| `createdAt`, `updatedAt` | Date                  |       Có | Timestamp                                      |

**Index:** `{ groupId: 1, dueAt: 1 }`, `{ assigneeId: 1, status: 1 }`.

**Quy tắc:** `createdBy` và `assigneeId` phải là thành viên `ACTIVE` của cùng nhóm lúc tạo/giao. Khi người tạo hoặc người được giao rời/bị loại, giữ nguyên task để bảo toàn lịch sử; thành viên không còn ACTIVE mất quyền truy cập. OWNER được giao lại task chưa hoàn thành cho thành viên ACTIVE khác.

## 3. Quan hệ chính

- User 1 → N Subjects, Tasks, Schedules, Goals.
- User 1 → N Availability windows.
- Subject 1 → N Tasks; `subjectId` tùy chọn.
- Subject 1 → N Schedules; `subjectId` tùy chọn.
- User N ↔ N StudyGroup qua GroupMember.
- StudyGroup 1 → N GroupTasks.
- GroupTask tham chiếu người tạo và người được giao.

## 4. Hợp đồng triển khai theo thành viên

Các feature dùng chung tên collection và field như trên; không tự tạo collection trùng mục đích hoặc đổi tên field riêng ở từng nhánh.

| Phần việc                       | Collections chính                      | Trách nhiệm dữ liệu                                                                           |
| ------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Leader – Auth/Groups            | `users`, `studyGroups`, `groupMembers` | Tài khoản, membership, lời mời và quyền truy cập nhóm                                         |
| Thành viên 2 – Subjects/Tasks   | `subjects`, `tasks`                    | CRUD môn học và công việc cá nhân                                                             |
| Thành viên 3 – Schedule/Planner | `schedules`, `availability`, `tasks`   | CRUD lịch, khung rảnh và gợi ý Smart Planner cá nhân                                          |
| Thành viên 4 – Goals/Dashboard  | `goals` và truy vấn tổng hợp           | CRUD mục tiêu và tổng hợp số liệu từ collections hiện có; không lưu bản sao số liệu Dashboard |
| Nhiệm vụ nhóm                   | `groupTasks`                           | Leader hoặc người được phân công phối hợp với owner nhóm để thống nhất quyền và API           |

### Ví dụ document và tham chiếu

Môn học:

```json
{ "_id": "SUBJECT_ID", "ownerId": "USER_ID", "name": "Cơ sở dữ liệu", "code": "IT203" }
```

Công việc cá nhân liên kết môn học:

```json
{
  "_id": "TASK_ID",
  "ownerId": "USER_ID",
  "subjectId": "SUBJECT_ID",
  "title": "Ôn chương 1",
  "dueAt": "2026-11-20T10:00:00.000Z",
  "status": "TODO"
}
```

Membership đang hoạt động; API xác định role bằng cách so `userId` với `studyGroups.ownerId`:

```json
{ "_id": "MEMBERSHIP_ID", "groupId": "GROUP_ID", "userId": "USER_ID", "status": "ACTIVE" }
```

## 5. Quy tắc xóa và toàn vẹn dữ liệu

- Xóa Subject đang được Task hoặc Schedule tham chiếu: trả lỗi `409 SUBJECT_IN_USE`; yêu cầu người dùng bỏ liên kết hoặc chọn môn khác trước. Không xóa dây chuyền.
- Xóa nhóm chưa thuộc MVP cốt lõi. OWNER chuyển quyền cho thành viên ACTIVE khác trước khi rời; backend cập nhật `studyGroups.ownerId`, role được suy ra nên không cần cập nhật từng membership.
- Xóa User không nằm trong luồng tự phục vụ của MVP; xử lý tài khoản cần chính sách riêng.
- Trước khi tạo GroupTask, kiểm tra cả người tạo và người được giao còn là thành viên ACTIVE.
- Lịch do người dùng xác nhận từ Planner là document `schedules` có `taskId` tùy chọn; lịch thủ công có thể để trống `taskId`.
- Không cho tạo/sửa schedule chồng lấn với schedule khác của cùng owner; trả `409 SCHEDULE_CONFLICT`. Planner áp dụng cùng quy tắc trước khi trả gợi ý.

## 6. Các quy ước triển khai

1. Lịch học là từng buổi có ngày/giờ cụ thể; chỉ availability lặp hằng tuần.
2. Lời mời nhóm gửi đến tài khoản đã đăng ký; membership cũ được tái sử dụng khi mời lại.
3. MEMBER được tạo nhiệm vụ nhóm; OWNER hoặc người tạo có thể sửa/xóa; người được giao đổi trạng thái.
4. Xóa Subject bị chặn nếu còn Task/Schedule tham chiếu.
5. Tiến độ Goal nhập thủ công 0–100%; status được API suy ra, không lưu trong DB.
6. Task và GroupTask bắt buộc có hạn hoàn thành; Task có estimatedMinutes mặc định 60.
7. OWNER được suy ra từ `studyGroups.ownerId`; chuyển OWNER cập nhật ownerId sau khi xác minh người nhận là thành viên ACTIVE.
8. Planner xếp task cá nhân theo deadline gần nhất, mỗi task vào một khoảng liên tục; gợi ý chỉ lưu thành schedule khi người dùng xác nhận.

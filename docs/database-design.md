# StudyFlow Pro – Thiết kế Database (MVP)

**Trạng thái:** Bản dự thảo để nhóm review; chưa phải quyết định cuối cùng.  
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

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `_id` | ObjectId | Có | ID người dùng |
| `name` | String | Có | Họ tên, trim |
| `email` | String | Có | Lưu lowercase, unique |
| `passwordHash` | String | Có | Hash bcrypt, không bao giờ trả qua API |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** unique trên `email`.

### 2.2. `subjects`

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `ownerId` | ObjectId → User | Có | Chủ sở hữu |
| `name` | String | Có | Tên môn học |
| `code` | String | Không | Mã môn |
| `description` | String | Không | Mô tả |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** `{ ownerId: 1, name: 1 }`.

### 2.3. `tasks` (công việc cá nhân)

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `ownerId` | ObjectId → User | Có | Chủ sở hữu |
| `subjectId` | ObjectId → Subject hoặc null | Không | Nếu có, subject phải thuộc cùng owner |
| `title` | String | Có | Tiêu đề |
| `description` | String | Không | Mô tả |
| `dueAt` | Date | Có | Hạn hoàn thành |
| `status` | String | Có | `TODO`, `IN_PROGRESS`, `DONE`; mặc định `TODO` |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** `{ ownerId: 1, dueAt: 1 }`, `{ ownerId: 1, status: 1 }`, `{ subjectId: 1 }`.

### 2.4. `schedules`

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `ownerId` | ObjectId → User | Có | Chủ sở hữu |
| `subjectId` | ObjectId → Subject hoặc null | Không | Subject phải thuộc cùng owner |
| `title` | String | Có | Tên buổi học |
| `startsAt` | Date | Có | Thời điểm bắt đầu |
| `endsAt` | Date | Có | Phải sau `startsAt` |
| `location` | String | Không | Địa điểm |
| `notes` | String | Không | Ghi chú |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** `{ ownerId: 1, startsAt: 1 }`.

**Giới hạn dự thảo:** mỗi document là một buổi học có ngày cụ thể; lịch lặp tuần để ngoài phần cốt lõi.

### 2.5. `goals`

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `ownerId` | ObjectId → User | Có | Chủ sở hữu |
| `title` | String | Có | Tên mục tiêu |
| `description` | String | Không | Mô tả |
| `dueAt` | Date | Không | Hạn mục tiêu |
| `progress` | Number | Có | Số nguyên 0–100, mặc định 0 |
| `status` | String | Có | `ACTIVE` hoặc `COMPLETED` |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** `{ ownerId: 1, status: 1 }`.

**Quy tắc:** đặt `progress` thành 100 thì trạng thái được chuyển sang `COMPLETED`; nếu tiến độ giảm dưới 100 thì trạng thái trở lại `ACTIVE` (đề xuất).

### 2.6. `studyGroups`

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `_id` | ObjectId | Có | ID nhóm |
| `name` | String | Có | Tên nhóm |
| `description` | String | Không | Mô tả |
| `ownerId` | ObjectId → User | Có | Nguồn dữ liệu chuẩn để xác định OWNER hiện tại |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** `{ ownerId: 1, createdAt: -1 }`.

### 2.7. `groupMembers`

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `groupId` | ObjectId → StudyGroup | Có | Nhóm |
| `userId` | ObjectId → User | Có | Thành viên được mời/tham gia |
| `status` | String | Có | `PENDING`, `ACTIVE`, `DECLINED`, `REMOVED`, `LEFT` |
| `invitedBy` | ObjectId → User | Không | Người gửi lời mời |
| `joinedAt` | Date | Không | Thời điểm chấp nhận |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** unique `{ groupId: 1, userId: 1 }`; `{ userId: 1, status: 1 }`.

**Quy tắc:** tạo nhóm đồng thời tạo membership `ACTIVE` cho người tạo và đặt người đó vào `studyGroups.ownerId`. Vai trò trả ra qua API được suy ra: thành viên ACTIVE có `userId` bằng `ownerId` là `OWNER`; các thành viên ACTIVE còn lại là `MEMBER`. Không lưu role lặp lại trong membership. Lời mời chỉ gửi tới tài khoản đã đăng ký; thông báo xử lý trong ứng dụng, không gửi email tự động.

### 2.8. `groupTasks` (nhiệm vụ nhóm)

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---:|---|
| `groupId` | ObjectId → StudyGroup | Có | Nhóm sở hữu nhiệm vụ |
| `createdBy` | ObjectId → User | Có | Thành viên tạo |
| `assigneeId` | ObjectId → User | Có | Thành viên được giao |
| `title` | String | Có | Tiêu đề |
| `description` | String | Không | Mô tả |
| `dueAt` | Date | Có | Hạn hoàn thành |
| `status` | String | Có | `TODO`, `IN_PROGRESS`, `DONE`; mặc định `TODO` |
| `createdAt`, `updatedAt` | Date | Có | Timestamp |

**Index:** `{ groupId: 1, dueAt: 1 }`, `{ assigneeId: 1, status: 1 }`.

**Quy tắc:** `createdBy` và `assigneeId` phải là thành viên `ACTIVE` của cùng nhóm.

## 3. Quan hệ chính

- User 1 → N Subjects, Tasks, Schedules, Goals.
- Subject 1 → N Tasks; `subjectId` tùy chọn.
- Subject 1 → N Schedules; `subjectId` tùy chọn.
- User N ↔ N StudyGroup qua GroupMember.
- StudyGroup 1 → N GroupTasks.
- GroupTask tham chiếu người tạo và người được giao.

## 4. Hợp đồng triển khai theo thành viên

Các feature dùng chung tên collection và field như trên; không tự tạo collection trùng mục đích hoặc đổi tên field riêng ở từng nhánh.

| Phần việc | Collections chính | Trách nhiệm dữ liệu |
|---|---|---|
| Leader – Auth/Groups | `users`, `studyGroups`, `groupMembers` | Tài khoản, membership, lời mời và quyền truy cập nhóm |
| Thành viên 2 – Subjects/Tasks | `subjects`, `tasks` | CRUD môn học và công việc cá nhân |
| Thành viên 3 – Schedule/Planner | `schedules` | CRUD lịch học; `availability` chỉ thêm nếu được duyệt làm phần mở rộng |
| Thành viên 4 – Goals/Dashboard | `goals` và truy vấn tổng hợp | CRUD mục tiêu và tổng hợp số liệu từ collections hiện có; không lưu bản sao số liệu Dashboard |
| Nhiệm vụ nhóm | `groupTasks` | Leader hoặc người được phân công phối hợp với owner nhóm để thống nhất quyền và API |

### Ví dụ document và tham chiếu

Môn học:

```json
{ "_id": "SUBJECT_ID", "ownerId": "USER_ID", "name": "Cơ sở dữ liệu", "code": "IT203" }
```

Công việc cá nhân liên kết môn học:

```json
{ "_id": "TASK_ID", "ownerId": "USER_ID", "subjectId": "SUBJECT_ID", "title": "Ôn chương 1", "dueAt": "2026-11-20T10:00:00.000Z", "status": "TODO" }
```

Membership đang hoạt động; API xác định role bằng cách so `userId` với `studyGroups.ownerId`:

```json
{ "_id": "MEMBERSHIP_ID", "groupId": "GROUP_ID", "userId": "USER_ID", "status": "ACTIVE" }
```

## 4. Quy tắc xóa và toàn vẹn dữ liệu (đề xuất)

- Xóa Subject đang được Task hoặc Schedule tham chiếu: trả lỗi `409 SUBJECT_IN_USE`; yêu cầu người dùng bỏ liên kết hoặc chọn môn khác trước. Không xóa dây chuyền.
- Xóa nhóm chưa thuộc MVP cốt lõi. OWNER chuyển quyền cho thành viên ACTIVE khác trước khi rời; backend cập nhật `studyGroups.ownerId`, role được suy ra nên không cần cập nhật từng membership.
- Xóa User không nằm trong luồng tự phục vụ của MVP; xử lý tài khoản cần chính sách riêng.
- Trước khi tạo GroupTask, kiểm tra cả người tạo và người được giao còn là thành viên ACTIVE.

## 5. Các giả định cần nhóm xác nhận

1. Lịch học trong MVP cốt lõi là từng buổi có ngày cụ thể, không lặp tuần.
2. Lời mời nhóm gửi tới email của tài khoản đã đăng ký và được xử lý trong ứng dụng; không gửi email tự động.
3. MEMBER được tạo nhiệm vụ nhóm; OWNER hoặc người tạo có thể sửa/xóa, người được giao có thể đổi trạng thái.
4. Xóa Subject bị chặn nếu còn Task/Schedule tham chiếu.
5. Tiến độ Goal nhập thủ công từ 0 đến 100%.
6. Task và GroupTask bắt buộc có hạn hoàn thành.
7. Tiến độ Goal 100% tự chuyển trạng thái hoàn thành.

8. Vai trò OWNER được suy ra từ `studyGroups.ownerId`, không lưu trùng ở `groupMembers`.
9. Chuyển OWNER bằng cách cập nhật `studyGroups.ownerId` sau khi xác minh người nhận là thành viên ACTIVE; OWNER cũ trở thành MEMBER theo quy tắc suy ra và có thể rời nhóm.

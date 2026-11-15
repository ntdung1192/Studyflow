# StudyFlow Pro – Phạm vi MVP

**Trạng thái:** Đã thống nhất trong nhóm  
**Mục đích:** Làm mốc chung để phân công, thiết kế dữ liệu và API, đồng thời kiểm soát phạm vi phát triển.

## 1. Mục tiêu MVP

Xây dựng ứng dụng giúp sinh viên quản lý việc học cá nhân và phối hợp học tập theo nhóm ở mức cơ bản.

## 2. Chức năng nằm trong phạm vi

### Tài khoản
- Đăng ký, đăng nhập và đăng xuất.
- Mỗi người dùng chỉ truy cập được dữ liệu cá nhân của mình.

### Học tập cá nhân
- Quản lý môn học: tạo, xem, sửa và xóa.
- Quản lý công việc/bài tập: tạo, xem, sửa và xóa; theo dõi hạn hoàn thành và trạng thái; liên kết công việc với môn học khi phù hợp.
- Quản lý lịch học và thời gian rảnh.
- Tạo mục tiêu học tập và theo dõi tiến độ.
- Smart Planner cá nhân ở mức cơ bản, sử dụng lịch học, thời gian rảnh và hạn công việc để hỗ trợ lập kế hoạch.

### Học tập nhóm
- Tạo nhóm học tập và quản lý thành viên.
- Mời người dùng tham gia; người nhận có thể chấp nhận hoặc từ chối lời mời.
- Hỗ trợ vai trò OWNER và MEMBER.
- Tạo, giao và theo dõi nhiệm vụ nhóm.
- Chỉ thành viên có quyền mới được xem dữ liệu thuộc nhóm.

### Tổng quan
- Dashboard cá nhân hiển thị thông tin học tập cơ bản.
- Thống kê cơ bản về công việc, mục tiêu và tiến độ nhóm.

## 3. Ngoài phạm vi ưu tiên của MVP

- Chat realtime và Socket.IO.
- Smart Planner/AI Planner lập kế hoạch cho nhiều thành viên.
- Gửi email mời tự động.

Các mục này có thể được xem xét sau MVP; không đưa vào cam kết hoàn thành hiện tại.

## 4. Nguyên tắc quyền riêng tư

- Dữ liệu học tập cá nhân mặc định chỉ chủ sở hữu xem được.
- Chỉ dữ liệu được tạo trong phạm vi nhóm mới được chia sẻ cho thành viên nhóm phù hợp.
- Backend phải kiểm tra xác thực và quyền truy cập cho mọi dữ liệu riêng tư hoặc dữ liệu nhóm.

## 5. Tiêu chí hoàn thành ở mức MVP

- Người dùng có thể đăng ký và đăng nhập.
- Các chức năng cá nhân chính có thể tạo, xem, cập nhật và xóa dữ liệu phù hợp.
- Người dùng có thể tạo nhóm, quản lý thành viên và theo dõi nhiệm vụ nhóm theo quyền được cấp.
- Dashboard và thống kê hiển thị được thông tin cơ bản từ dữ liệu ứng dụng.
- Smart Planner cá nhân tạo được kế hoạch cơ bản dựa trên dữ liệu học tập hiện có.
- Dữ liệu cá nhân và dữ liệu nhóm được bảo vệ theo đúng quyền truy cập.

## 6. Quy tắc thay đổi phạm vi

Yêu cầu mới ngoài danh sách trên cần được cả nhóm xem xét về thời gian và mức ưu tiên trước khi đưa vào MVP. Tài liệu này là mốc phạm vi; thay đổi cần được cập nhật tại đây để mọi thành viên cùng theo dõi.

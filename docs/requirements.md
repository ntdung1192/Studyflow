# StudyFlow Pro – Đặc tả yêu cầu MVP

**Trạng thái:** Bản dự thảo để nhóm review  
**Phạm vi:** Các chức năng cốt lõi đã được leader chốt; chưa phải quyết định cuối cùng của cả nhóm.  
**Liên quan:** [Tiến độ dự án](./project-progress.md), [Phạm vi MVP](./mvp-scope.md)

## 1. Mục tiêu và người dùng

StudyFlow Pro giúp sinh viên quản lý việc học cá nhân và phối hợp các nhiệm vụ học tập theo nhóm. Mỗi người dùng có tài khoản riêng. Dữ liệu cá nhân mặc định chỉ người sở hữu truy cập được; dữ liệu nhóm chỉ thành viên đang hoạt động trong nhóm truy cập được.

## 2. Quy ước chung

- Tất cả chức năng yêu cầu đăng nhập, trừ đăng ký và đăng nhập.
- Người dùng chỉ được xem, tạo, sửa hoặc xóa dữ liệu cá nhân thuộc về mình.
- Dữ liệu nhóm phải được kiểm tra quyền ở backend; giao diện không thay thế kiểm tra quyền này.
- Thao tác xóa cần có xác nhận trên giao diện.
- Giao diện cần dùng được trên desktop và mobile.
- Thông báo lỗi cần dễ hiểu; không hiển thị mật khẩu hoặc thông tin nhạy cảm.

## 3. Đặc tả theo tính năng

### 3.1. Tài khoản: đăng ký, đăng nhập, đăng xuất

**Người dùng có thể:**
- Đăng ký bằng họ tên, email và mật khẩu.
- Đăng nhập bằng email và mật khẩu.
- Đăng xuất khỏi tài khoản.

**Quy tắc:**
- Email phải có định dạng hợp lệ và không được trùng tài khoản đã có.
- Mật khẩu tối thiểu 8 ký tự theo đề xuất; hệ thống không lưu mật khẩu dạng văn bản thuần.
- Thông tin tài khoản không được trả về cho người dùng khác.

**Tiêu chí chấp nhận:**
- Đăng ký thành công tạo tài khoản mới; email trùng hoặc dữ liệu không hợp lệ thì báo lỗi rõ ràng.
- Đăng nhập đúng thông tin cho phép vào khu vực học tập; sai thông tin thì không đăng nhập.
- Đăng xuất kết thúc phiên; trang được bảo vệ không còn truy cập được bằng phiên đã đăng xuất.

**Ngoài phạm vi cốt lõi:** Quên/đặt lại mật khẩu qua email và đăng nhập mạng xã hội.

### 3.2. Môn học

**Người dùng có thể:**
- Tạo, xem danh sách, xem chi tiết, sửa và xóa môn học cá nhân.
- Xem các công việc liên kết với môn học.

**Thông tin tối thiểu đề xuất:** tên môn học. Mã môn và mô tả là tùy chọn.

**Quy tắc:**
- Tên môn học là bắt buộc.
- Người dùng chỉ quản lý được môn học của chính mình.
- Khi xóa môn học đang được công việc sử dụng, hệ thống phải thông báo và không được âm thầm xóa công việc.

**Tiêu chí chấp nhận:** Sau khi tạo hoặc sửa, môn học xuất hiện đúng trong danh sách; người dùng khác không truy cập được môn học riêng tư này.

### 3.3. Công việc/bài tập cá nhân

**Người dùng có thể:**
- Tạo, xem, sửa, xóa công việc và đổi trạng thái.
- Lọc công việc theo trạng thái hoặc hạn hoàn thành.
- Liên kết công việc với một môn học; liên kết này có thể để trống.

**Thông tin tối thiểu đề xuất:** tiêu đề, hạn hoàn thành, trạng thái. Mô tả và môn học là tùy chọn.

**Trạng thái MVP:** Chưa bắt đầu, Đang thực hiện, Hoàn thành.

**Quy tắc:**
- Tiêu đề là bắt buộc.
- Chỉ chủ sở hữu được truy cập công việc cá nhân.
- Công việc quá hạn vẫn được giữ và đánh dấu quá hạn; không tự xóa.

**Tiêu chí chấp nhận:** Người dùng tạo được công việc, đổi trạng thái, xem công việc sắp đến hạn và không nhìn thấy công việc cá nhân của người khác.

### 3.4. Lịch học

**Người dùng có thể:**
- Tạo, xem, sửa và xóa lịch học cá nhân.
- Xem lịch theo tuần.
- Gắn lịch học với môn học nếu phù hợp.

**Thông tin tối thiểu đề xuất:** tên buổi học, ngày, giờ bắt đầu, giờ kết thúc. Địa điểm/ghi chú và môn học là tùy chọn.

**Quy tắc:**
- Tên, ngày và thời gian là bắt buộc; giờ kết thúc phải sau giờ bắt đầu.
- Chỉ chủ sở hữu được xem và chỉnh sửa lịch cá nhân.
- Trong đề xuất MVP cốt lõi, mỗi buổi học có ngày cụ thể; lịch lặp hằng tuần để giai đoạn sau.

**Tiêu chí chấp nhận:** Người dùng xem được các buổi học theo tuần, tạo/sửa/xóa buổi học và không truy cập được lịch của người khác.

### 3.5. Mục tiêu học tập

**Người dùng có thể:**
- Tạo, xem, sửa và xóa mục tiêu cá nhân.
- Cập nhật tiến độ và đánh dấu hoàn thành.

**Thông tin tối thiểu đề xuất:** tên mục tiêu, ngày hết hạn (tùy chọn), tiến độ phần trăm.

**Quy tắc:**
- Tên mục tiêu là bắt buộc.
- Tiến độ nằm trong khoảng 0–100%; khi đạt 100% có thể đánh dấu hoàn thành.
- Chỉ chủ sở hữu được quản lý mục tiêu.

**Tiêu chí chấp nhận:** Người dùng tạo mục tiêu, cập nhật phần trăm tiến độ và xem được tiến độ mới nhất.

### 3.6. Nhóm học tập và thành viên

**Người dùng có thể:**
- Tạo nhóm học tập.
- Xem nhóm mình tham gia và danh sách thành viên.
- Mời người dùng khác; người nhận có thể chấp nhận hoặc từ chối.
- Rời nhóm; OWNER có thể quản lý thành viên và chuyển quyền OWNER cho thành viên ACTIVE khác.

**Vai trò:**
- **OWNER:** quản lý thông tin nhóm và thành viên.
- **MEMBER:** xem nội dung nhóm và tham gia nhiệm vụ nhóm.

**Quy tắc:**
- Người tạo nhóm là OWNER ban đầu.
- OWNER hiện tại được xác định từ `studyGroups.ownerId`; role MEMBER/OWNER không lưu trùng trong membership.
- OWNER phải chuyển quyền cho thành viên ACTIVE khác trước khi rời nhóm; xóa nhóm chưa thuộc MVP cốt lõi.
- Chỉ thành viên đang hoạt động mới truy cập dữ liệu của nhóm.
- Người ngoài nhóm không xem được nhóm hoặc nhiệm vụ nhóm.
- Thành viên bị xóa/rời nhóm mất quyền truy cập dữ liệu nhóm ngay sau đó.

**Tiêu chí chấp nhận:** Người dùng tạo nhóm, xử lý lời mời, xem thành viên; người ngoài nhóm bị từ chối truy cập.

**Cần nhóm quyết định:** Lời mời được gửi bằng cách nào trong MVP (tìm theo email/tài khoản hay mã tham gia). Email tự động nằm ngoài phạm vi ưu tiên.

### 3.7. Nhiệm vụ nhóm

**Người dùng có thể:**
- Thành viên tạo nhiệm vụ trong nhóm, giao cho một thành viên đang hoạt động và theo dõi trạng thái.
- Xem danh sách nhiệm vụ của nhóm.
- Người được giao cập nhật trạng thái nhiệm vụ.

**Thông tin tối thiểu đề xuất:** tiêu đề, người tạo, người được giao, hạn hoàn thành và trạng thái. Mô tả tùy chọn.

**Quy tắc:**
- Nhiệm vụ luôn thuộc một nhóm.
- Người được giao phải là thành viên đang hoạt động trong nhóm.
- Chỉ thành viên nhóm truy cập được nhiệm vụ; quyền quản lý/xóa cần được nhóm thống nhất.

**Tiêu chí chấp nhận:** Thành viên giao được nhiệm vụ cho thành viên khác; người được giao cập nhật được trạng thái; người ngoài nhóm không xem được nhiệm vụ.

### 3.8. Dashboard và thống kê cơ bản

**Dashboard hiển thị:**
- Số môn học cá nhân.
- Số công việc chưa hoàn thành và công việc sắp đến hạn.
- Các buổi học sắp tới.
- Tiến độ mục tiêu.
- Tóm tắt nhiệm vụ nhóm nếu người dùng tham gia nhóm.

**Quy tắc:**
- Chỉ tổng hợp dữ liệu mà người dùng có quyền truy cập.
- Số liệu được lấy từ các chức năng thật; không dùng số liệu giả sau khi đã tích hợp API.
- Thống kê nâng cao không bắt buộc cho MVP cốt lõi.

**Tiêu chí chấp nhận:** Dashboard hiển thị dữ liệu đúng với tài khoản hiện tại và cập nhật sau khi dữ liệu nguồn thay đổi.

## 4. Phần mở rộng nếu còn thời gian

### Thời gian rảnh và Smart Planner cá nhân

- Người dùng tự khai báo các khung giờ rảnh.
- Planner có thể gợi ý thời gian học dựa trên thời gian rảnh, lịch học và hạn công việc.
- Gợi ý là hỗ trợ lập kế hoạch; người dùng quyết định có thêm vào lịch hay không.
- Không yêu cầu AI hoặc lập kế hoạch phối hợp nhiều thành viên.

### Thống kê nâng cao

Có thể bổ sung biểu đồ hoặc so sánh tiến độ theo tuần/tháng sau khi các chức năng cốt lõi hoạt động ổn định.

## 5. Các quyết định đề xuất để nhóm xác nhận

Các tài liệu Database và API đang dùng các phương án đơn giản dưới đây để làm bản thiết kế đầu tiên. Đây chưa phải quyết định cuối cùng của cả nhóm.

| Chủ đề | Đề xuất cho MVP | Lý do |
|---|---|---|
| Lịch học lặp | Chỉ lưu từng buổi có ngày cụ thể; chưa lặp hằng tuần | Giảm độ phức tạp của lịch và truy vấn |
| Mời thành viên | Mời theo email tài khoản đã đăng ký; chấp nhận/từ chối trong ứng dụng; không gửi email | Đáp ứng luồng nhóm mà không cần dịch vụ gửi mail |
| Quyền nhiệm vụ nhóm | Thành viên có thể tạo; OWNER/người tạo sửa hoặc xóa; người được giao đổi trạng thái | Phân quyền MVP dễ hiểu |
| Xóa môn học đang được dùng | Chặn xóa và yêu cầu gỡ liên kết công việc/lịch trước | Tránh xóa dữ liệu liên quan ngoài ý muốn |
| Tiến độ mục tiêu | Chủ sở hữu nhập thủ công 0–100% | Không cần thêm hệ thống theo dõi hoạt động |
| Mật khẩu | Tối thiểu 8 ký tự | Quy tắc đơn giản cho MVP |
| Không có quyền truy cập | Trả `404` cho tài nguyên riêng tư/nhóm không thuộc quyền người dùng | Hạn chế tiết lộ tài nguyên có tồn tại hay không |
| Đăng xuất JWT | Xóa token phía client; không thu hồi token phía server trong MVP | Giữ xác thực stateless đơn giản |
| Phân trang | Chưa bắt buộc; giới hạn số bản ghi trả về và bổ sung phân trang khi cần | Phù hợp quy mô demo, giảm phạm vi ban đầu |

**Cần nhóm xác nhận:** các đề xuất trên, cùng quy trình OWNER chuyển quyền/rời nhóm hoặc đóng nhóm. Nếu nhóm chọn phương án khác, cần cập nhật đồng thời đặc tả, database design và API contract.

## 6. Tiêu chí hoàn thành MVP cốt lõi

MVP cốt lõi sẵn sàng demo khi các luồng đăng nhập, quản lý dữ liệu học tập cá nhân, nhóm và nhiệm vụ nhóm hoạt động end-to-end; dashboard lấy dữ liệu thật; quyền riêng tư được kiểm tra ở backend. Phần mở rộng không được làm chậm các luồng cốt lõi.

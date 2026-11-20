# StudyFlow Pro – Đặc tả yêu cầu MVP

**Trạng thái:** Phạm vi MVP đã được nhóm thống nhất
**Phạm vi:** Đặc tả triển khai theo phạm vi MVP đã thống nhất.
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
- Thời lượng ước tính `estimatedMinutes` là số nguyên từ 15 đến 480 phút; mặc định 60 phút nếu người dùng không nhập.
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
- Lời mời gửi tới email của tài khoản đã đăng ký và được xử lý trong ứng dụng; không gửi email tự động hoặc dùng mã mời trong MVP.
- Mỗi cặp nhóm/người dùng chỉ có một membership. Mời lại người có trạng thái `DECLINED`, `REMOVED` hoặc `LEFT` sẽ đặt lại membership đó thành `PENDING`; không tạo document thứ hai. Không được mời lại khi đang `PENDING` hoặc `ACTIVE`.
- Khi thành viên rời/bị loại, nhiệm vụ nhóm đã tạo vẫn được giữ để bảo toàn lịch sử. OWNER có thể giao lại nhiệm vụ chưa hoàn thành cho thành viên ACTIVE; thành viên rời nhóm không còn quyền xem/cập nhật nhiệm vụ.

**Tiêu chí chấp nhận:** Người dùng tạo nhóm, xử lý lời mời, xem thành viên; người ngoài nhóm bị từ chối truy cập.

### 3.7. Nhiệm vụ nhóm

**Người dùng có thể:**

- Thành viên tạo nhiệm vụ trong nhóm, giao cho một thành viên đang hoạt động và theo dõi trạng thái.
- Xem danh sách nhiệm vụ của nhóm.
- Người được giao cập nhật trạng thái nhiệm vụ.

**Thông tin tối thiểu đề xuất:** tiêu đề, người tạo, người được giao, hạn hoàn thành và trạng thái. Mô tả tùy chọn.

**Quy tắc:**

- Nhiệm vụ luôn thuộc một nhóm.
- Người được giao phải là thành viên đang hoạt động trong nhóm.
- Thành viên ACTIVE có thể tạo nhiệm vụ; người tạo hoặc OWNER được sửa/xóa; người được giao chỉ được đổi trạng thái.
- Nếu người được giao rời/bị loại khỏi nhóm, nhiệm vụ được giữ nguyên; OWNER phải giao lại nhiệm vụ chưa hoàn thành nếu cần tiếp tục.

**Tiêu chí chấp nhận:** Thành viên giao được nhiệm vụ cho thành viên ACTIVE; người được giao cập nhật được trạng thái; người ngoài nhóm không xem được nhiệm vụ; quyền của thành viên vừa rời nhóm bị từ chối ở request kế tiếp.

### 3.8. Thời gian rảnh và Smart Planner cá nhân

**Người dùng có thể:**

- Khai báo các khung giờ rảnh lặp hằng tuần theo thứ trong tuần.
- Yêu cầu gợi ý lịch học cho các công việc cá nhân chưa hoàn thành.
- Xem các công việc chưa xếp được lịch và lý do.
- Chọn gợi ý phù hợp để thêm thành buổi học vào lịch; gợi ý không tự động ghi vào lịch.

**Quy tắc MVP:**

- Khung giờ rảnh dùng múi giờ IANA của tài khoản (mặc định `Asia/Ho_Chi_Minh`); ngày giờ của lịch lưu/trả qua API theo ISO 8601 UTC.
- Khung giờ rảnh là giờ địa phương trong tuần, không có ngoại lệ ngày nghỉ trong MVP.
- Planner xử lý công việc `TODO`/`IN_PROGRESS`, xếp theo hạn gần nhất rồi thời điểm tạo; mỗi công việc được xếp thành một phiên liên tục theo `estimatedMinutes`.
- Gợi ý chỉ nằm trong khung rảnh và trước hạn công việc; không được chồng lên lịch cá nhân hiện có hoặc gợi ý khác trong cùng lần tính.
- Nếu không đủ một khung liên tục trước hạn, công việc được trả trong danh sách chưa xếp được; không tự chia nhỏ phiên.
- Planner là thuật toán quy tắc, không dùng AI và không lập lịch cho nhóm.

**Tiêu chí chấp nhận:** Khung rảnh chồng lấn bị từ chối; gợi ý không chồng lịch, nằm trước deadline, xếp công việc theo thứ tự xác định; công việc không đủ chỗ được trả kèm lý do; chỉ khi người dùng chọn thì buổi học mới được lưu.

### 3.9. Dashboard và thống kê cơ bản

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

### Thống kê nâng cao

Có thể bổ sung biểu đồ hoặc so sánh tiến độ theo tuần/tháng sau khi các chức năng cốt lõi hoạt động ổn định.

## 5. Quy ước triển khai thống nhất

Các quy ước dưới đây được dùng thống nhất khi triển khai database và API theo MVP.

| Chủ đề                     | Đề xuất cho MVP                                                                                                   | Lý do                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Lịch học                   | Mỗi lịch là một buổi có ngày/giờ cụ thể; khung rảnh là quy tắc lặp tuần riêng                                     | Tách lịch bận thực tế khỏi thời gian có thể học |
| Mời thành viên             | Mời theo email tài khoản đã đăng ký; chấp nhận/từ chối trong ứng dụng; membership cũ được tái sử dụng khi mời lại | Khớp unique index theo nhóm/người dùng          |
| Quyền nhiệm vụ nhóm        | Thành viên có thể tạo; OWNER/người tạo sửa hoặc xóa; người được giao đổi trạng thái                               | Phân quyền MVP dễ hiểu                          |
| Xóa môn học đang được dùng | Chặn xóa và yêu cầu gỡ liên kết công việc/lịch trước                                                              | Tránh xóa dữ liệu liên quan ngoài ý muốn        |
| Tiến độ mục tiêu           | Chủ sở hữu nhập thủ công 0–100%; `COMPLETED` khi progress=100, trạng thái được suy ra không lưu trùng             | Tránh status lệch với progress                  |
| Smart Planner              | Phiên liên tục, không tự chia nhỏ; deadline gần nhất trước; gợi ý chưa lưu cho đến khi người dùng xác nhận        | Thuật toán đơn giản, kết quả giải thích được    |
| Mật khẩu                   | Tối thiểu 8 ký tự                                                                                                 | Quy tắc đơn giản cho MVP                        |
| Không có quyền truy cập    | Trả `404` cho tài nguyên riêng tư/nhóm không thuộc quyền người dùng                                               | Hạn chế tiết lộ tài nguyên có tồn tại hay không |
| Đăng xuất JWT              | Xóa token phía client; không thu hồi token phía server trong MVP                                                  | Giữ xác thực stateless đơn giản                 |
| Phân trang                 | Chưa bắt buộc; giới hạn số bản ghi trả về và bổ sung phân trang khi cần                                           | Phù hợp quy mô demo, giảm phạm vi ban đầu       |

Nếu nhóm thay đổi một quy ước, cần cập nhật đồng thời đặc tả, database design và API contract.

## 6. Tiêu chí hoàn thành MVP cốt lõi

MVP cốt lõi sẵn sàng demo khi đăng nhập, dữ liệu học tập cá nhân, nhóm/nhiệm vụ nhóm, khai báo thời gian rảnh và Smart Planner quy tắc hoạt động end-to-end; dashboard lấy dữ liệu thật; quyền riêng tư được kiểm tra ở backend. Thống kê nâng cao không được làm chậm các luồng cốt lõi.

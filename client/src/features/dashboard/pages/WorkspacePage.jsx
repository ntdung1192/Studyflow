import { useLocation } from 'react-router-dom';

const pages = {
  '/subjects': ['Môn học', 'Tập hợp các môn học của bạn sẽ được quản lý tại đây.'],
  '/tasks': ['Công việc', 'Theo dõi bài tập, thời hạn và trạng thái hoàn thành tại đây.'],
  '/schedule': ['Lịch học', 'Lịch học và thời gian rảnh sẽ được sắp xếp tại đây.'],
  '/goals': ['Mục tiêu', 'Thiết lập mục tiêu và theo dõi tiến độ học tập tại đây.'],
  '/groups': ['Nhóm học tập', 'Không gian để phối hợp và theo dõi nhiệm vụ nhóm.'],
  '/analytics': ['Thống kê', 'Tổng hợp tiến độ học tập cá nhân và nhóm tại đây.'],
};

export default function WorkspacePage() {
  const { pathname } = useLocation();
  const [title, description] = pages[pathname] ?? ['Không gian học tập', ''];
  return (
    <main className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STUDYFLOW PRO</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
      </div>
      <section className="empty-workspace">
        <span className="empty-icon" aria-hidden="true">
          ✦
        </span>
        <h2>Khu vực này đã sẵn sàng</h2>
        <p>
          Khung giao diện đã được tạo. Thành viên phụ trách có thể bổ sung chức năng và dữ liệu vào
          đây.
        </p>
      </section>
    </main>
  );
}

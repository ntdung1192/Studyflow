export default function DashboardPage() {
  return (
    <main className="workspace-page dashboard-page">
      <div className="page-heading">
        <div><p className="eyebrow">BẢNG ĐIỀU KHIỂN CỦA BẠN</p><h1>Tổng quan học tập</h1><p className="page-description">Chào mừng bạn trở lại. Đây là không gian để sắp xếp hành trình học tập.</p></div>
        <button className="primary-action" type="button">＋ <span>Tạo mới</span></button>
      </div>
      <div className="overview-grid">
        <section className="overview-card"><span className="overview-icon blue">▤</span><div><p>Môn học</p><strong>—</strong></div><span className="card-note">Môn học của bạn</span></section>
        <section className="overview-card"><span className="overview-icon orange">✓</span><div><p>Công việc cần làm</p><strong>—</strong></div><span className="card-note">Theo dõi thời hạn</span></section>
        <section className="overview-card"><span className="overview-icon violet">▣</span><div><p>Lịch học sắp tới</p><strong>—</strong></div><span className="card-note">Kế hoạch trong tuần</span></section>
        <section className="overview-card"><span className="overview-icon green">◎</span><div><p>Mục tiêu đang tiến hành</p><strong>—</strong></div><span className="card-note">Tiến độ của bạn</span></section>
      </div>
      <div className="dashboard-lower-grid">
        <section className="content-panel"><div className="panel-heading"><div><h2>Lịch trình hôm nay</h2><p>Các hoạt động học tập của bạn</p></div><span className="panel-date">Hôm nay</span></div><div className="panel-empty"><span>▣</span><p>Chưa có lịch học nào được thêm.</p></div></section>
        <section className="content-panel"><div className="panel-heading"><div><h2>Việc cần hoàn thành</h2><p>Ưu tiên tiếp theo của bạn</p></div><span className="panel-more">···</span></div><div className="panel-empty"><span>✓</span><p>Các công việc của bạn sẽ xuất hiện tại đây.</p></div></section>
      </div>
    </main>
  );
}


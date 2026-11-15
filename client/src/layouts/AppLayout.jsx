import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useUIStore } from '../store/useUIStore';

const navigation = [
  { label: 'Tổng quan', to: '/dashboard', icon: '▦' },
  { label: 'Môn học', to: '/subjects', icon: '▤' },
  { label: 'Công việc', to: '/tasks', icon: '✓' },
  { label: 'Lịch học', to: '/schedule', icon: '▣' },
  { label: 'Mục tiêu', to: '/goals', icon: '◎' },
  { label: 'Nhóm học tập', to: '/groups', icon: '♧' },
  { label: 'Thống kê', to: '/analytics', icon: '▥' },
];

export default function AppLayout() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const closeSidebar = useUIStore((state) => state.setSidebarCollapsed);

  return (
    <div className={`app-shell${isSidebarCollapsed ? ' sidebar-collapsed' : ''}${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
      <aside className="sidebar">
        <NavLink className="brand" to="/dashboard" aria-label="StudyFlow Pro - Tổng quan">
          <span className="brand-mark">S</span><span className="brand-name">StudyFlow <b>Pro</b></span>
        </NavLink>
        <p className="nav-caption">KHÔNG GIAN HỌC TẬP</p>
        <nav className="primary-nav" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => { closeSidebar(false); setMobileMenuOpen(false); }}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span><span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-icon" aria-hidden="true">✦</span><div><strong>Học tập có kế hoạch</strong><span>Từng bước tiến gần mục tiêu.</span></div></div>
          <div className="profile-mini"><span className="avatar">HV</span><div className="profile-copy"><strong>Học viên</strong><span>Tài khoản cá nhân</span></div><span className="profile-menu" aria-hidden="true">···</span></div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" onClick={() => { toggleSidebar(); setMobileMenuOpen((open) => !open); }} aria-label="Thu gọn hoặc mở thanh điều hướng"><span aria-hidden="true">☰</span></button>
          <div className="breadcrumb"><span>StudyFlow</span><span className="breadcrumb-separator">/</span><strong>Khu vực học tập</strong></div>
          <div className="topbar-actions"><span className="today-label">Không gian của bạn</span><button className="icon-button notification-button" type="button" aria-label="Thông báo">♧<i /></button><span className="avatar topbar-avatar">HV</span></div>
        </header>
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  );
}

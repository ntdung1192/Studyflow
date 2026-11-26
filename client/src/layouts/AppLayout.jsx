import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
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

function getInitials(name) {
  if (!name) return 'HV';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const currentNav = navigation.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  );
  const initials = getInitials(user?.name);

  const handleMenuToggle = () => {
    if (window.matchMedia('(max-width: 680px)').matches) {
      setMobileMenuOpen((open) => !open);
    } else {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className={`app-shell${isSidebarCollapsed ? ' sidebar-collapsed' : ''}${
        isMobileMenuOpen ? ' mobile-menu-open' : ''
      }`}
    >
      {isMobileMenuOpen ? (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Đóng thanh điều hướng"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside className="sidebar">
        <NavLink
          className="brand"
          to="/dashboard"
          aria-label="StudyFlow Pro - Tổng quan"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="brand-mark">S</span>
          <span className="brand-name">
            StudyFlow <b>Pro</b>
          </span>
        </NavLink>
        <p className="nav-caption">KHÔNG GIAN HỌC TẬP</p>
        <nav className="primary-nav" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon" aria-hidden="true">
              ✦
            </span>
            <div>
              <strong>Học tập có kế hoạch</strong>
              <span>Từng bước tiến gần mục tiêu.</span>
            </div>
          </div>
          <div className="profile-mini">
            <span className="avatar">{initials}</span>
            <div className="profile-copy">
              <strong>{user?.name || 'Học viên'}</strong>
              <span>{user?.email || 'Tài khoản cá nhân'}</span>
            </div>
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            onClick={handleMenuToggle}
            aria-label="Thu gọn hoặc mở thanh điều hướng"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div className="breadcrumb">
            <span>StudyFlow</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{currentNav?.label || 'Khu vực học tập'}</strong>
          </div>
          <div className="topbar-actions">
            <span className="today-label">{user?.name || 'Không gian của bạn'}</span>
            <button
              className="icon-button notification-button"
              type="button"
              aria-label="Thông báo"
            >
              ♧<i />
            </button>
            <span className="avatar topbar-avatar" title={user?.email || undefined}>
              {initials}
            </span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/**
 * Authenticated portal shell with ROAR | FITNESS branding and sidebar navigation.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PortalClock } from './PortalClock';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({ title, navItems, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <span className="dashboard-sidebar__logo">ROAR | FITNESS</span>
          <span className="dashboard-sidebar__portal">{title}</span>
        </div>

        <nav className="dashboard-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          <div className="dashboard-sidebar__user">
            {user?.firstName} {user?.lastName}
            <br />
            <small>{user?.email}</small>
          </div>
          <button className="btn btn--outline btn--sm btn--block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <PortalClock />
        </div>
        {children}
      </main>
    </div>
  );
}

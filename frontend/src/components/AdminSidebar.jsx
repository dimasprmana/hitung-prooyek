import { NavLink } from 'react-router';
import { Calculator,FolderKanban,Gauge,LogOut,Package,Tag,UserRound,Users,} from 'lucide-react';
import '../styles/admin-sidebar.css';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: Gauge, end: true },
  { label: 'User', path: '/admin/users', icon: Users },
  { label: 'Material', path: '/admin/materials', icon: Package },
  { label: 'Harga Material', path: '/admin/prices', icon: Tag },
  { label: 'Proyek', path: '/admin/projects', icon: FolderKanban },
  { label: 'Perhitungan', path: '/admin/calculations', icon: Calculator },
];

function AdminSidebar({ onClose }) {
  return (
    <aside className="admin-sidebar">
      
      {/* Brand Header */}
      <div className="admin-brand">
        <span className="admin-brand-mark">HP</span>
        <div>
          <strong>HitungProyek</strong>
          <small>Admin Panel</small>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="admin-nav" aria-label="Navigasi admin">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="admin-sidebar-bottom">
        <NavLink 
          className="admin-nav-link" 
          to="/admin/profile" 
          onClick={onClose}
        >
          <UserRound size={18} />
          <span>Profil Admin</span>
        </NavLink>

        <button className="admin-logout" type="button">
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
      
    </aside>
  );
}

export default AdminSidebar;
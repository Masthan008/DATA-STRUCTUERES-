import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileQuestion, 
  Settings, 
  Users, 
  AlertTriangle, 
  Trophy,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { setAdminLoggedIn } = useAdmin();

  const handleLogout = () => {
    setAdminLoggedIn(false);
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileQuestion, label: 'Questions', path: '/admin/questions' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: Users, label: 'Monitoring', path: '/admin/monitoring' },
    { icon: AlertTriangle, label: 'Violation Logs', path: '/admin/logs' },
    { icon: Trophy, label: 'Results', path: '/admin/results' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/50">
        <ShieldCheck className="text-brand-primary" size={24} />
        <span className="font-bold text-white tracking-tight">Admin Portal</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

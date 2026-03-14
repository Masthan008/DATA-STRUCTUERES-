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
  Code2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logoutAdmin, admin } = useAdmin();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileQuestion, label: 'Questions', path: '/admin/questions' },
    { icon: Users, label: 'Students', path: '/admin/monitoring' },
    { icon: AlertTriangle, label: 'Violations', path: '/admin/logs' },
    { icon: Trophy, label: 'Results', path: '/admin/results' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-[260px] bg-brand-secondary flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-700/50">
        <div className="flex bg-gradient-to-br from-brand-primary to-brand-accent text-white p-2 rounded-lg">
          <Code2 size={20} />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight">Admin Portal</span>
          <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Control Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

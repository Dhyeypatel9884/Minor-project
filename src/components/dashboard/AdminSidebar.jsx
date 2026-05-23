import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, GraduationCap, ChevronLeft } from 'lucide-react';
import { useToast } from '../Toast';

const AdminSidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Platform Stats', path: '/admin/dashboard' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 w-64 z-50 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#1ab2a6] p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1ab2a6]">CampusAdmin</span>
          </div>
          <button 
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
            onClick={() => setOpen(false)}
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-gray-50 text-[#1ab2a6]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

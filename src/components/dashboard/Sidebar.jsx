import React from 'react';
import { 
  LayoutGrid, 
  Briefcase, 
  Gavel, 
  MessageSquare, 
  User, 
  LogOut,
  ChevronLeft,
  GraduationCap,
  Trophy
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { name: 'Browse Projects', icon: Briefcase, path: '/browse-projects' },
    { name: 'My Bids', icon: Gavel, path: '/my-bids' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 w-64 z-50 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#1ab2a6] p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1ab2a6]">CampusFreelance</span>
          </div>
          <button 
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-gray-50 text-[#1ab2a6]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#1ab2a6]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-4">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
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

export default Sidebar;

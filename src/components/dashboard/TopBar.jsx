import React from 'react';
import { Search, Menu } from 'lucide-react';
import { getImageUrl } from '../../utils/formatters';

const TopBar = ({ setSidebarOpen }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-2 hover:bg-gray-50 rounded-lg text-gray-500"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center gap-3 bg-white w-full max-w-md">
          {/* We'll just show the icon as per image, but could be a full search bar */}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1ab2a6]/20 cursor-pointer">
            <img 
              src={getImageUrl(currentUser.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.fullName || 'User'}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

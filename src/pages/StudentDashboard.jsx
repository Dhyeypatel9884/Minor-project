import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { 
  ProjectCard, 
  StatCard, 
  NotificationItem 
} from '../components/dashboard/DashboardComponents';
import { 
  Briefcase, 
  User, 
  MessageSquare, 
  Gavel, 
  Clock, 
  Award, 
  Bell, 
  CheckCircle2,
  IndianRupee
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('there');
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState([
    { label: 'Active Bids', value: 0, icon: Gavel, color: 'teal' },
    { label: 'Accepted', value: 0, icon: Award, color: 'green' },
    { label: 'Pending', value: 0, icon: Clock, color: 'orange' }
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.fullName) {
      setUserName(user.fullName.split(' ')[0]);
    }

    // Fetch latest projects
    api.get('/projects')
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data.slice(0, 3));
        }
      })
      .catch(() => {});

    // Fetch student bid stats & wallet
    Promise.all([
      api.get('/bids/my-bids'),
      api.get('/auth/profile')
    ])
      .then(([bidsData, profileData]) => {
        const bids = bidsData.bids || [];
        const active = bids.filter(b => b.status === 'Pending').length;
        const accepted = bids.filter(b => b.status === 'Accepted').length;
        const wallet = profileData.user?.walletBalance || 0;

        setStats([
          { label: 'Active Bids', value: active, icon: Gavel, color: 'teal' },
          { label: 'Accepted', value: accepted, icon: Award, color: 'green' },
          { label: 'Wallet Balance', value: `₹${wallet}`, icon: IndianRupee, color: 'purple' },
          { label: 'Total Bids', value: bids.length, icon: Clock, color: 'orange' }
        ]);
      })
      .catch(() => {});

    // Fetch real notifications
    api.get('/notifications')
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      })
      .catch(() => {});
  }, []);

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'bid_accepted': return { icon: Award, color: 'green' };
      case 'bid_rejected': return { icon: CheckCircle2, color: 'orange' };
      case 'new_message': return { icon: MessageSquare, color: 'blue' };
      default: return { icon: Bell, color: 'teal' };
    }
  };

  const getTimeAgo = (dateStr) => {
    const minutes = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
    return `${Math.floor(minutes/1440)}d ago`;
  };



  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Top Section: Welcome + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-center">
                <div className="relative z-10">
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2 italic">Welcome back, {userName}!</h1>
                  <p className="text-gray-500 font-medium">Stay on top of your projects and find new opportunities.</p>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-teal-50 rounded-full opacity-60 z-0" />
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Browse New Projects', icon: Briefcase, path: '/browse-projects' },
                    { name: 'Update Your Profile', icon: User, path: '/profile' },
                    { name: 'View Messages', icon: MessageSquare, path: '/messages' }
                  ].map((action) => (
                    <button 
                      key={action.name} 
                      onClick={() => navigate(action.path)}
                      className="w-full flex items-center justify-between px-4 py-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-700">{action.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 italic">Your Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </section>

            {/* Recommended Projects */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 italic">Recommended Projects</h2>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project._id} {...project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                  <p className="text-gray-400 font-medium">No projects available right now.</p>
                </div>
              )}
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 italic">Notifications</h2>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 h-fit">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map(notif => {
                      const { icon, color } = getNotificationStyles(notif.type);
                      return (
                        notif.link ? (
                          <Link key={notif._id} to={notif.link} className="block">
                            <NotificationItem message={notif.message} time={getTimeAgo(notif.createdAt)} icon={icon} color={color} />
                          </Link>
                        ) : (
                          <NotificationItem key={notif._id} message={notif.message} time={getTimeAgo(notif.createdAt)} icon={icon} color={color} />
                        )
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No new notifications</p>
                )}
              </div>

            </section>

          </div>
        </main>

        <footer className="py-8 text-center text-gray-400 text-xs font-bold font-sans opacity-70">
          © 2025 CampusFreelance. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default StudentDashboard;

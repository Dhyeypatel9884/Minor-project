import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import { 
  IndianRupee, 
  FileText, 
  CheckCircle,
  MessageSquare,
  Calendar,
  Bell,
  Award,
  Loader2

} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Client');
  const [recentProjects, setRecentProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [stats, setStats] = useState([
    { label: 'Total Bids', value: 0, sublabel: 'Across all projects', icon: IndianRupee, color: 'teal' },
    { label: 'Bids Pending', value: 0, sublabel: 'Awaiting your action', icon: FileText, color: 'blue' },
    { label: 'Bids Awarded', value: 0, sublabel: 'Projects in progress', icon: CheckCircle, color: 'green' },
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.fullName) setUserName(user.fullName);

    // Fetch projects
    setIsLoadingProjects(true);
    api.get('/projects/client/my-projects')
      .then(data => {
        if (Array.isArray(data)) {
          setRecentProjects(data.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingProjects(false));

    // Fetch bid stats for client
    api.get('/bids/received')
      .then(data => {
        const bids = data.bids || [];
        const pending = bids.filter(b => b.status === 'Pending').length;
        const awarded = bids.filter(b => b.status === 'Accepted').length;
        setStats([
          { label: 'Total Bids', value: bids.length, sublabel: 'Across all projects', icon: IndianRupee, color: 'teal' },
          { label: 'Bids Pending', value: pending, sublabel: 'Awaiting your action', icon: FileText, color: 'blue' },
          { label: 'Bids Awarded', value: awarded, sublabel: 'Projects in progress', icon: CheckCircle, color: 'green' },
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
      case 'bid_placed': return { icon: IndianRupee, color: 'green' };
      case 'new_message': return { icon: MessageSquare, color: 'blue' };
      case 'review_received': return { icon: Award, color: 'purple' };
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
      <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Top Banner */}
            <div className="bg-[#1ab2a6] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-2">Good day, {userName}!</h1>
                <p className="text-teal-50 opacity-90 max-w-2xl">
                  Welcome back to your client dashboard. Manage projects, review bids, and connect with talented students.
                </p>
              </div>
              <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full" />
            </div>

            {/* Recently Posted Projects */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Recently Posted Projects</h2>
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Loader2 className="w-6 h-6 text-[#1ab2a6] animate-spin" />
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentProjects.map(project => (
                    <div key={project._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                      <p className="text-xs text-gray-400 font-medium mb-4">Posted: {new Date(project.createdAt).toLocaleDateString()}</p>
                      
                      <div className="mb-8">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${
                          project.status === 'Open' ? 'bg-green-50 text-green-600 border-green-100' :
                          project.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      <button 
                        onClick={() => navigate('/client/bids')}
                        className="w-full border border-gray-100 hover:bg-gray-50 hover:border-teal-500/30 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95"
                      >
                        View Bids
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-400 font-medium mb-4">No projects posted yet.</p>
                  <button 
                    onClick={() => navigate('/client/post-project')}
                    className="bg-[#1ab2a6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#148e85] transition-all"
                  >
                    Post Your First Project
                  </button>
                </div>
              )}
              <div className="mt-8 text-center">
                <button 
                  onClick={() => navigate('/client/my-projects')}
                  className="text-[#1ab2a6] font-bold text-sm hover:underline"
                >
                  View All My Projects
                </button>
              </div>
            </section>

            {/* Active Bids Overview */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Active Bids Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center flex flex-col items-center group">
                    <div className={`p-4 rounded-xl mb-4 transition-transform group-hover:scale-110 ${
                      stat.color === 'teal' ? 'bg-teal-50 text-teal-600' : 
                      stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                      'bg-green-50 text-green-600'
                    }`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-4xl font-extrabold text-gray-900 mb-2">{stat.value}</span>
                    <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{stat.sublabel}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Notifications</h2>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map(notif => {
                      const { icon: Icon, color } = getNotificationStyles(notif.type);
                      const content = (
                        <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 rounded-xl transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              color === 'green' ? 'bg-green-50 text-green-600' :
                              color === 'orange' ? 'bg-orange-50 text-orange-500' :
                              color === 'blue' ? 'bg-blue-50 text-blue-500' :
                              color === 'purple' ? 'bg-purple-50 text-purple-500' :
                              'bg-teal-50 text-teal-600'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{notif.message}</p>
                          </div>
                          <span className="text-xs text-gray-400 font-bold ml-4 whitespace-nowrap">{getTimeAgo(notif.createdAt)}</span>
                        </div>
                      );

                      return notif.link ? (
                        <Link key={notif._id} to={notif.link} className="block">
                          {content}
                        </Link>
                      ) : (
                        <div key={notif._id}>{content}</div>
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

        <footer className="py-8 text-center border-t border-gray-50 text-gray-400 text-xs font-bold font-sans opacity-70">
          © 2025 CampusFreelance. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default ClientDashboard;

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, IndianRupee, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Menu, Loader2, MessageSquare, X, Gavel } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import AdminSidebar from '../../components/dashboard/AdminSidebar';
import { formatCurrency, getImageUrl } from '../../utils/formatters';

const AdminDashboard = () => {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  // Modal states
  const [resolveModal, setResolveModal] = useState({ show: false, reportId: null, action: 'Refund Client', notes: '' });
  const [messageModal, setMessageModal] = useState({ show: false, projectId: null, text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, projectsRes, usersRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/projects'),
        api.get('/admin/users'),
        api.get('/admin/reports')
      ]);

      setStats(statsRes.stats);
      setProjects(projectsRes.projects || []);
      setUsers(usersRes.users || []);
      setReports(reportsRes.reports || []);
    } catch (err) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to administratively cancel this project? This action cannot be undone.')) return;
    
    try {
      await api.put(`/admin/projects/${projectId}/cancel`);
      toast.success('Project cancelled successfully');
      fetchAdminData(); // Refresh data
    } catch (err) {
      toast.error(err.message || 'Failed to cancel project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This will also remove any bids on this project. This action cannot be undone.')) return;
    
    try {
      await api.delete(`/admin/projects/${projectId}`);
      toast.success('Project permanently deleted');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      toast.success('User approved and verified!');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve user');
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/block`);
      toast.success(res.message || 'User block status updated');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user block status');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User permanently removed');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove user');
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveModal.notes.trim()) return toast.warning('Please provide resolution notes');
    setIsSubmitting(true);
    try {
      await api.put(`/admin/reports/${resolveModal.reportId}/resolve`, {
        action: resolveModal.action,
        notes: resolveModal.notes
      });
      toast.success('Dispute resolved successfully');
      setResolveModal({ show: false, reportId: null, action: 'Refund Client', notes: '' });
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to resolve dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!messageModal.text.trim()) return toast.warning('Message cannot be empty');
    setIsSubmitting(true);
    try {
      await api.post('/admin/messages', {
        projectId: messageModal.projectId,
        text: messageModal.text
      });
      toast.success('Message sent to project conversation');
      setMessageModal({ show: false, projectId: null, text: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1ab2a6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Simple TopBar for Admin */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Platform Overview</h1>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-[#1ab2a6] rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats?.users?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stats?.users?.students} Students, {stats?.users?.clients} Clients</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-[#1ab2a6] rounded-xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Projects</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats?.projects?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stats?.projects?.open} Open, {stats?.projects?.completed} Completed</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Transacted</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(stats?.revenue?.totalVolume || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Platform-wide volume</p>
                </div>
              </div>
            </div>

            {/* Content Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Projects Moderation Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#1ab2a6]" />
                    Project Moderation
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                        <th className="p-4 font-bold">Project</th>
                        <th className="p-4 font-bold">Client</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projects.map(project => (
                        <React.Fragment key={project._id}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{project.title}</p>
                            <p className="text-xs text-gray-400 font-bold">{formatCurrency(project.budget)}</p>
                          </td>
                          <td className="p-4 text-sm text-gray-600 font-medium">{project.client?.name || 'Unknown'}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              project.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {project.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                              {project.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                              {project.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                              className="text-xs font-bold text-[#1ab2a6] hover:text-[#148e85] bg-teal-50/50 hover:bg-teal-100/70 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {expandedProject === project._id ? 'Hide Content' : 'Review Content'}
                            </button>
                            {project.status !== 'Cancelled' && project.status !== 'Completed' && (
                              <button 
                                onClick={() => handleCancelProject(project._id)}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteProject(project._id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        {expandedProject === project._id && (
                          <tr className="bg-teal-50/10">
                            <td colSpan="4" className="p-4 border-t border-teal-100/50">
                              <div className="text-sm text-gray-700 p-4 bg-white rounded-xl border border-teal-100/50 shadow-inner">
                                <h4 className="font-bold text-teal-900 mb-2">Project Description (Academic Integrity Check)</h4>
                                <p className="whitespace-pre-wrap">{project.description}</p>
                                {project.skills && project.skills.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {project.skills.map(s => (
                                      <span key={s} className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100">{s}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                      ))}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">No projects found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Users Table (Privacy First) */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1ab2a6]" />
                    Platform Users
                  </h2>
                </div>
                <div className="p-4 bg-teal-50/40 border-b border-teal-100/40 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#1ab2a6] shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-800 font-medium leading-relaxed">
                    <strong>Privacy & Verification:</strong> Contact details are hidden. Use "Review" to verify their authenticity based on bio and institution.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(user => (
                        <React.Fragment key={user._id}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={getImageUrl(user.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100 object-cover" />
                            <span className="font-bold text-gray-900 text-sm">{user.fullName}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            {user.isBlocked ? (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">Blocked</span>
                            ) : user.isVerified ? (
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">Verified</span>
                            ) : user.verificationStatus === 'Pending' ? (
                              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200 animate-pulse">Pending Review</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Unverified</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                              className="text-xs font-bold text-[#1ab2a6] hover:text-[#148e85] bg-teal-50/50 hover:bg-teal-100/70 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {expandedUser === user._id ? 'Close' : 'Review'}
                            </button>
                            {user.verificationStatus === 'Pending' && !user.isVerified && (
                              <button 
                                onClick={() => handleApproveUser(user._id)}
                                className="text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleToggleBlock(user._id)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                user.isBlocked 
                                  ? 'text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100' 
                                  : 'text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100'
                              }`}
                            >
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button 
                              onClick={() => handleRemoveUser(user._id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                        {expandedUser === user._id && (
                          <tr className="bg-teal-50/10">
                            <td colSpan="4" className="p-4 border-t border-teal-100/50">
                              <div className="text-sm text-gray-700 p-4 bg-white rounded-xl border border-teal-100/50 shadow-inner">
                                <h4 className="font-bold text-teal-900 mb-2 border-b border-teal-50 pb-2">User Authenticity Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Institution</p>
                                    <p className="font-medium text-gray-900">{user.institution || <span className="text-gray-400 italic">Not provided</span>}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                      {user.skills && user.skills.length > 0 ? user.skills.map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100">{s}</span>
                                      )) : <span className="text-gray-400 italic">None listed</span>}
                                    </div>
                                  </div>
                                  <div className="col-span-1 md:col-span-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bio</p>
                                    <p className="whitespace-pre-wrap text-gray-900">{user.bio || <span className="text-gray-400 italic">Not provided</span>}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-400">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Dispute Queue */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden flex flex-col mt-8">
              <div className="p-6 border-b border-rose-100 flex justify-between items-center bg-rose-50/50">
                <h2 className="text-lg font-bold text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Active Dispute Queue
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="p-4 font-bold">Project / Status</th>
                      <th className="p-4 font-bold">Reporter</th>
                      <th className="p-4 font-bold">Complaint</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map(report => (
                      <tr key={report._id} className="hover:bg-red-50/20 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{report.projectId?.title || 'Unknown Project'}</p>
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            report.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-sm text-gray-900">{report.reporterId?.fullName}</p>
                          <p className="text-xs text-gray-400 font-bold capitalize">{report.reporterId?.role}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600 max-w-xs break-words">{report.reason}</p>
                          {report.status === 'Resolved' && (
                            <p className="text-xs text-gray-400 mt-1">Resolution: {report.resolutionAction}</p>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {report.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => setMessageModal({ show: true, projectId: report.projectId?._id, text: '' })}
                                className="text-xs font-bold text-[#1ab2a6] hover:text-[#148e85] bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" /> Chat
                              </button>
                              <button 
                                onClick={() => setResolveModal({ show: true, reportId: report._id, action: 'Refund Client', notes: '' })}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Resolve
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">No disputes in the queue! 🎉</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>

        {/* Resolve Modal */}
        {resolveModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50/50">
                <h3 className="text-xl font-bold text-rose-800 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-rose-500" />
                  Resolve Dispute
                </h3>
                <button onClick={() => setResolveModal({ show: false, reportId: null, action: 'Refund Client', notes: '' })} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleResolveSubmit} className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Execution Action</label>
                    <select
                      value={resolveModal.action}
                      onChange={(e) => setResolveModal({...resolveModal, action: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Refund Client">Refund Client (Cancel Project)</option>
                      <option value="Force Pay Student">Force Pay Student (Complete Project)</option>
                      <option value="Ban User">Ban Offending User</option>
                      <option value="Dismiss">Dismiss Dispute (No Action)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resolution Note (Sent to users)</label>
                    <textarea
                      value={resolveModal.notes}
                      onChange={(e) => setResolveModal({...resolveModal, notes: e.target.value})}
                      placeholder="Explain your ruling to the users..."
                      className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Ruling'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Admin Message Modal */}
        {messageModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-teal-50">
                <h3 className="text-xl font-bold text-teal-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#1ab2a6]" />
                  Message Users
                </h3>
                <button onClick={() => setMessageModal({ show: false, projectId: null, text: '' })} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleMessageSubmit} className="p-6">
                <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">
                  Inject a message directly into the active chat between the student and client. Both parties will see your message.
                </p>
                <textarea
                  value={messageModal.text}
                  onChange={(e) => setMessageModal({...messageModal, text: e.target.value})}
                  placeholder="E.g., Admin Notice: Please explain why you didn't deliver the code."
                  className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1ab2a6] resize-none mb-6"
                  required
                />
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold rounded-xl hover:shadow-teal-500/10 transition-colors flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

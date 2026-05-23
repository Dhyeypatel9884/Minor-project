import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import { 
  Search, 
  Filter, 
  Calendar, 
  IndianRupee, 
  Clock, 
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, getImageUrl } from '../utils/formatters';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const MyProjects = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/projects/client/my-projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load your projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also remove all associated bids.')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      if (isModalOpen && selectedProject?._id === projectId) setIsModalOpen(false);
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const handleEditClick = (project) => {
    setEditForm({
      ...project,
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      skills: Array.isArray(project.skills) ? project.skills.join(', ') : project.skills || ''
    });
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editForm) return;

    setIsSaving(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        budget: editForm.budget,
        deadline: editForm.deadline,
        status: editForm.status,
        skills: typeof editForm.skills === 'string'
          ? editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
          : editForm.skills
      };

      const data = await api.put(`/projects/${editForm._id}`, payload);
      const updatedProject = data.project;

      setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p));
      setIsEditModalOpen(false);
      toast.success('Project updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-green-50 text-green-600 border-green-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Completed': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans tracking-tight">My Projects</h1>
                <p className="text-gray-500 font-medium">Manage and track all your posted projects in one place.</p>
              </div>
              <Link 
                to="/client/post-project"
                className="inline-flex items-center justify-center gap-2 bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#1ab2a6]/30 shadow-[#1ab2a6]/20 active:scale-95 w-fit"
              >
                <Plus className="w-5 h-5" />
                Post New Project
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search projects by title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-1 focus:ring-[#1ab2a6] outline-none transition-all text-sm"
                />
              </div>
              <div className="relative w-full md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white outline-none transition-all text-sm text-gray-600 appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Project List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-[#1ab2a6] animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading your projects...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div key={project._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getImageUrl(project.image) || "https://images.unsplash.com/photo-1522071823957-09c527762297?auto=format&fit=crop&q=80&w=800"} 
                        alt={project.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522071823957-09c527762297?auto=format&fit=crop&q=80&w=800" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-3">
                         <img 
                          src={getImageUrl(project.client?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.client?.name || 'User'}`} 
                          alt={project.client?.name || 'Client'} className="w-8 h-8 rounded-full border-2 border-white/20" />
                          <span className="text-white text-xs font-bold">{project.client?.name || 'Client'}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px] font-medium leading-relaxed">
                        {project.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <IndianRupee className="w-3.5 h-3.5 opacity-60" />
                          <span>Budget: <span className="text-gray-800">{formatCurrency(project.budget)}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          <span>Deadline: <span className="text-gray-800">{new Date(project.deadline).toLocaleDateString()}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Clock className="w-3.5 h-3.5 opacity-60" />
                          <span>Posted: <span className="text-gray-800">{new Date(project.createdAt).toLocaleDateString()}</span></span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-8">
                        {(project.skills || []).map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-md border border-gray-100">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleEditClick(project)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(project._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <button 
                          onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                          className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1ab2a6] text-white text-xs font-bold hover:bg-[#148e85] transition-all shadow-md hover:shadow-teal-500/20 shadow-teal-500/10 active:scale-[0.98]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                  <AlertCircle className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500 font-medium mb-8 text-center max-w-sm">
                  {searchQuery || filterStatus !== 'All' 
                    ? "Try adjusting your filters or search query." 
                    : "You haven't posted any projects yet. Start by posting your first project."}
                </p>
                {!searchQuery && filterStatus === 'All' && (
                  <Link 
                    to="/client/post-project"
                    className="inline-flex items-center justify-center gap-2 bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    Post Your First Project
                  </Link>
                )}
              </div>
            )}

          </div>
        </main>

        <footer className="py-8 text-center text-gray-400 text-xs font-bold font-sans opacity-70">
          © 2025 CampusFreelance. All rights reserved.
        </footer>
      </div>

      {/* Project Details Modal */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
                <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{selectedProject.title}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest opacity-50">Description</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest opacity-50">Budget & Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <IndianRupee className="w-4 h-4 text-[#1ab2a6]" />
                      <span>Budget: <span className="text-gray-900">{formatCurrency(selectedProject.budget)}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <Calendar className="w-4 h-4 text-[#1ab2a6]" />
                      <span>Deadline: <span className="text-gray-900">{new Date(selectedProject.deadline).toLocaleDateString()}</span></span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest opacity-50">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.skills || []).map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-lg border border-gray-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleEditClick(selectedProject)}
                className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Project
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="py-4 bg-[#1ab2a6] text-white font-bold rounded-2xl hover:bg-[#148e85] transition-colors shadow-lg shadow-teal-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">Project Title</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#1ab2a6] focus:ring-1 focus:ring-[#1ab2a6] outline-none transition-all text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">Description</label>
                <textarea 
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#1ab2a6] focus:ring-1 focus:ring-[#1ab2a6] outline-none transition-all text-sm font-medium resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">Budget (INR)</label>
                  <input 
                    type="number" 
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#1ab2a6] focus:ring-1 focus:ring-[#1ab2a6] outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#1ab2a6] outline-none transition-all text-sm font-medium cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">Deadline</label>
                <input 
                  type="date" 
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#1ab2a6] focus:ring-1 focus:ring-[#1ab2a6] outline-none transition-all text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={typeof editForm.skills === 'string' ? editForm.skills : (editForm.skills || []).join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, Node.js, UI/UX"
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#1ab2a6] focus:ring-1 focus:ring-[#1ab2a6] outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3.5 rounded-xl bg-[#1ab2a6] text-white text-sm font-bold hover:bg-[#148e85] transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;

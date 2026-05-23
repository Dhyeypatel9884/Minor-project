import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  IndianRupee, 
  Calendar, 
  Clock, 
  ChevronDown,
  ExternalLink,
  Star
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, getImageUrl } from '../utils/formatters';

const BrowseProjects = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [maxBudget, setMaxBudget] = useState(10000);
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedDeadline, setSelectedDeadline] = useState('Any');
  const [projects, setProjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Fetch projects error:', err);
        setIsLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter(p => {
    // Budget filter
    const budgetVal = typeof p.budget === 'number' ? p.budget : parseInt(p.budget) || 0;
    if (budgetVal > maxBudget) return false;

    // Skill filter
    if (selectedSkill !== 'All Skills') {
      const projectSkills = (p.skills || []).map(s => s.toLowerCase());
      if (!projectSkills.includes(selectedSkill.toLowerCase())) return false;
    }

    // Deadline filter
    if (selectedDeadline !== 'Any') {
      const daysLeft = Math.ceil((new Date(p.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (selectedDeadline === 'Less than 1 week' && daysLeft >= 7) return false;
      if (selectedDeadline === '1-4 weeks' && (daysLeft < 7 || daysLeft > 28)) return false;
      if (selectedDeadline === '1+ month' && daysLeft <= 28) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto space-y-10">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">Browse Projects</h1>
            </div>

            {/* Filter Projects Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1ab2a6]" />
                Filter Projects
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                {/* Skills Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills</label>
                  <div className="relative">
                    <select 
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full pl-5 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option>All Skills</option>
                      <option>Graphic Design</option>
                      <option>Web Development</option>
                      <option>Content Writing</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Budget Range Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Max Budget: <span className="text-[#1ab2a6]">{formatCurrency(maxBudget)}</span></label>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                    className="w-full h-2 bg-teal-50 rounded-lg appearance-none cursor-pointer accent-[#1ab2a6]"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                    <span>₹ 0</span>
                    <span>₹ 10,000</span>
                  </div>
                </div>

                {/* Deadline Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deadline</label>
                  <div className="relative">
                    <select 
                      value={selectedDeadline}
                      onChange={(e) => setSelectedDeadline(e.target.value)}
                      className="w-full pl-5 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option>Any</option>
                      <option>Less than 1 week</option>
                      <option>1-4 weeks</option>
                      <option>1+ month</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Projects Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Available Projects ({filteredProjects.length})</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div key={project._id || project.customId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all group flex flex-col">
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
                          alt={project.client?.name || 'Client'} 
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                         />
                         <span className="text-white text-xs font-bold shadow-sm">{project.client?.name || 'Client'}</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#1ab2a6] transition-colors">{project.title}</h3>
                      <p className="text-gray-500 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.skills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                           <div className="flex items-center gap-2 text-[#1ab2a6] font-bold">
                              <IndianRupee className="w-4 h-4" />
                              <span className="text-sm">Budget: {formatCurrency(project.budget)}</span>
                           </div>
                           <div className="flex items-center gap-2 text-gray-400 font-bold">
                              <Calendar className="w-4 h-4" />
                              <span className="text-[10px] uppercase tracking-wider">{new Date(project.deadline).toLocaleDateString()}</span>
                           </div>
                        </div>

                        <button 
                          onClick={() => navigate(`/project-details/${project._id}`)}
                          className="w-full bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-[#1ab2a6]/20 shadow-[#1ab2a6]/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>

        <footer className="py-8 text-center text-gray-400 text-xs font-bold font-sans opacity-70">
          © 2025 CampusFreelance. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default BrowseProjects;

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IndianRupee, 
  Calendar, 
  Clock, 
  Gavel,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const PlaceBid = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [proposal, setProposal] = useState('');
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!id) {
      toast.error('No project specified');
      navigate('/browse-projects');
      return;
    }
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      toast.error(err.message || 'Project not found');
      navigate('/browse-projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.warning('Please enter a valid bid amount');
      return;
    }
    if (!deliveryTime.trim()) {
      toast.warning('Please specify your delivery time');
      return;
    }
    if (!proposal.trim() || proposal.trim().length < 20) {
      toast.warning('Please write a proposal with at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/bids', {
        projectId: project._id,
        description: proposal,
        bidAmount: Number(bidAmount),
        deliveryTime: deliveryTime,
      });

      toast.success('Bid submitted successfully! The client will review your proposal.');
      setTimeout(() => navigate('/my-bids'), 800);
    } catch (err) {
      toast.error(err.message || 'Failed to submit bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1ab2a6] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 mb-2 italic">Place Your Bid</h1>
              <p className="text-gray-500 font-medium">You are bidding on: <span className="text-[#1ab2a6] font-bold">{project.title}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              
              {/* Left Section: Form Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Bid Amount */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest opacity-40 ml-1">
                          Bid Amount (₹)
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1ab2a6] transition-colors">
                            <IndianRupee className="w-5 h-5" />
                          </div>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="Enter your bid amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#1ab2a6]/20 focus:border-[#1ab2a6] transition-all"
                          />
                        </div>
                      </div>

                      {/* Delivery Time */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest opacity-40 ml-1">
                          Delivery Time
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1ab2a6] transition-colors">
                            <Clock className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 5 days"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#1ab2a6]/20 focus:border-[#1ab2a6] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Proposal */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-widest opacity-40 ml-1">
                        Professional Proposal
                      </label>
                      <textarea
                        required
                        rows="8"
                        placeholder="Describe why you are the best fit for this project... (min. 20 characters)"
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1ab2a6]/20 focus:border-[#1ab2a6] transition-all resize-none"
                      />
                      <p className="text-xs text-gray-400 font-medium text-right">{proposal.length} characters</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-5 rounded-2xl transition-all shadow-lg hover:shadow-[#1ab2a6]/40 shadow-[#1ab2a6]/10 active:scale-[0.98] flex items-center justify-center gap-3 group ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting Bid...
                          </>
                        ) : (
                          <>
                            <Gavel className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Submit Bid
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/browse-projects')}
                        disabled={isSubmitting}
                        className="flex-1 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-500 hover:text-gray-700 font-bold py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Right Section: Project Summary Card */}
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-8 relative">Project Summary</h2>
                  
                  <div className="space-y-6 relative">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <IndianRupee className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget</span>
                      </div>
                      <span className="text-sm font-black text-[#1ab2a6]">{formatCurrency(project.budget)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Skills Needed</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(project.skills || []).map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                    <Clock className="w-3.5 h-3.5" />
                    Client usually responds in 24h
                  </div>
                </div>

                {/* Status Notice */}
                <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative flex items-center gap-4 mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-teal-50">
                      <AlertCircle className="w-6 h-6 text-[#1ab2a6]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Important Note</h3>
                  </div>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4 relative italic">
                    "Professional proposals with realistic budgets and timelines have a 70% higher chance of being selected."
                  </p>
                  <div className="h-1.5 w-full bg-teal-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-[#1ab2a6] w-2/3 rounded-full shadow-[0_0_8px_rgba(26,178,166,0.4)]"></div>
                  </div>
                </div>
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

export default PlaceBid;

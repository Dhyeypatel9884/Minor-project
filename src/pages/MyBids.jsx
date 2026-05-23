import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useNavigate } from 'react-router-dom';
import { 
  Gavel, 
  Clock, 
  IndianRupee, 
  ExternalLink, 
  Trash2, 
  AlertCircle,
  Briefcase,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const MyBids = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/bids/my-bids');
      setBids(data.bids || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load your bids');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (bidId) => {
    if (!window.confirm('Are you sure you want to withdraw this bid?')) return;

    try {
      await api.delete(`/bids/${bidId}`);
      setBids(prev => prev.filter(b => b._id !== bidId));
      toast.success('Bid withdrawn successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw bid');
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-50 text-green-600 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto space-y-10">
            
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 italic tracking-tight">My Bids</h1>
              <p className="text-gray-500 font-medium">Track all the bids you have submitted to various projects.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                <Loader2 className="w-8 h-8 text-[#1ab2a6] animate-spin mb-4" />
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Loading your bids...</p>
              </div>
            ) : bids.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {bids.map((bid) => (
                  <div key={bid._id} className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/30 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                      
                      {/* Left Side: Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 group-hover:text-[#1ab2a6] group-hover:bg-teal-50 transition-colors">
                            <Gavel className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1ab2a6] transition-colors">{bid.projectTitle}</h3>
                        </div>
                        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed max-w-2xl">
                          {bid.description}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Submitted {new Date(bid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-8 lg:px-8 lg:border-x lg:border-gray-50">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Bid</p>
                          <div className="flex items-center gap-1.5 text-[#1ab2a6] font-black text-lg">
                            <IndianRupee className="w-4 h-4" />
                            {formatCurrency(bid.bidAmount)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timeline</p>
                          <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {bid.deliveryTime}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 min-w-[140px]">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyles(bid.status)}`}>
                          {bid.status}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate(`/project-details/${bid.projectId?._id || bid.projectId}`)}
                            className="p-3 bg-gray-50 hover:bg-teal-50 text-gray-400 hover:text-[#1ab2a6] rounded-xl border border-gray-100 transition-all active:scale-95"
                            title="View Project"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          {bid.status === 'Pending' && (
                            <button 
                              onClick={() => handleWithdraw(bid._id)}
                              className="p-3 bg-white hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl border border-gray-100 hover:border-red-100 transition-all active:scale-95"
                              title="Withdraw Bid"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center space-y-8 shadow-sm">
                <div className="flex justify-center">
                  <div className="p-8 bg-gray-50 rounded-full border border-gray-50 text-gray-300 relative">
                    <Gavel className="w-20 h-20 opacity-20" />
                    <Briefcase className="w-10 h-10 absolute bottom-6 right-6 text-gray-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 italic">You haven't placed any bids yet</h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">Start exploring exciting projects and submit your first proposal today.</p>
                </div>
                <button 
                  onClick={() => navigate('/browse-projects')}
                  className="bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-[#1ab2a6]/40 shadow-[#1ab2a6]/10 active:scale-95 inline-flex items-center gap-3"
                >
                  <Briefcase className="w-5 h-5" />
                  Browse Projects
                </button>
              </div>
            )}

          </div>
        </main>

        <footer className="py-8 text-center text-gray-400 text-xs font-bold font-sans opacity-70">
          © 2025 CampusFreelance. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MyBids;

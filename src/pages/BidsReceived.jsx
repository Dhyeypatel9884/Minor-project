import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import { 
  MessageSquare, 
  IndianRupee, 
  CheckCircle2,
  Inbox,
  Loader2,
  XCircle,
  Star
} from 'lucide-react';

import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const BidsReceived = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBid, setReviewBid] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);


  useEffect(() => {
    fetchReceivedBids();
  }, []);

  const fetchReceivedBids = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/bids/received');
      setBids(data.bids || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load received bids');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async (bid) => {
    try {
      const data = await api.post('/messages/conversations', {
        studentId: bid.studentId,
        studentName: bid.studentName,
        projectId: bid.projectId,
        projectTitle: bid.projectTitle
      });
      navigate('/messages', { state: { conversationId: data.conversation._id } });
    } catch (err) {
      toast.error(err.message || 'Failed to open conversation');
    }
  };

  const handleUpdateStatus = async (bidId, status) => {
    const actionLabel = status === 'Accepted' ? 'award' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this bid?`)) return;

    try {
      const data = await api.put(`/bids/${bidId}/status`, { status });
      setBids(prev => prev.map(bid => bid._id === bidId ? { ...bid, status } : bid));
      toast.success(data.message || `Bid ${actionLabel}ed successfully`);
    } catch (err) {
      toast.error(err.message || `Failed to ${actionLabel} bid`);
    }
  };

  const openReviewModal = (bid) => {
    setReviewBid(bid);
    setReviewData({ rating: 5, comment: '' });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        projectId: reviewBid.projectId,
        revieweeId: reviewBid.studentId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
      setReviewBid(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#f9fafb]">
      <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Bids Received</h1>
              <p className="text-gray-500 font-medium max-w-3xl leading-relaxed">
                Review and manage all the bids submitted for your projects. Connect with students or award projects directly.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                <Loader2 className="w-8 h-8 text-[#1ab2a6] animate-spin mb-4" />
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Loading bids...</p>
              </div>
            ) : bids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="p-6 bg-gray-50 rounded-full mb-4">
                  <Inbox className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No bids received yet</h3>
                <p className="text-gray-500 font-medium text-center max-w-sm">
                  Once students bid on your projects, they will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50 bg-[#fafbfc]/50">
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight">Student</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight">Project</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight">Bid Amount</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight">Proposal</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight">Timeline</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight">Status</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-500 tracking-tight text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bids.map((bid) => (
                        <tr key={bid._id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">{bid.studentName}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-medium text-gray-600 line-clamp-1">{bid.projectTitle}</span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-black text-gray-900">{formatCurrency(bid.bidAmount)}</span>
                          </td>
                          <td className="px-8 py-6 max-w-xs xl:max-w-md">
                            <p className="text-sm text-gray-500 font-medium truncate group-hover:text-clip group-hover:whitespace-normal transition-all">
                              {bid.description}
                            </p>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-500">{bid.deliveryTime}</span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              bid.status === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                              bid.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-yellow-50 text-yellow-600 border-yellow-100'
                            }`}>
                              {bid.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => handleChat(bid)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-teal-500/30 transition-all active:scale-95"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Chat
                              </button>
                              {bid.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(bid._id, 'Accepted')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1ab2a6] hover:bg-[#148e85] text-white transition-all shadow-md active:scale-95"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Award
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(bid._id, 'Rejected')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 text-red-500 hover:bg-red-50 transition-all active:scale-95"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {bid.status === 'Accepted' && (
                                <button 
                                  onClick={() => openReviewModal(bid)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Leave Review
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Leave Review Modal */}
        {isReviewModalOpen && reviewBid && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h2>
              <p className="text-sm text-gray-500 font-medium mb-6">
                Rate your experience working with {reviewBid.studentName} on "{reviewBid.projectTitle}".
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className={`p-2 rounded-full transition-colors ${
                          star <= reviewData.rating ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 bg-gray-50'
                        }`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Comment</label>
                  <textarea
                    rows={4}
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Describe what it was like working with this student..."
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 outline-none transition-all text-sm font-medium resize-none"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="py-8 text-center text-gray-400 text-xs font-bold font-sans opacity-70">

          © 2025 CampusFreelance. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default BidsReceived;

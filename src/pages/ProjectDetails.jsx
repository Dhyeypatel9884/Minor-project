import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  IndianRupee, 
  Calendar, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  Gavel,
  Loader2,
  AlertTriangle,
  X,
  UploadCloud,
  CheckCircle
} from 'lucide-react';
import { formatCurrency, getImageUrl } from '../utils/formatters';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [hasBid, setHasBid] = useState(false);

  // Deliverables State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    fetchProject();
    if (currentUser.role === 'student') {
      checkExistingBid();
    }
  }, [id]);

  const checkExistingBid = async () => {
    try {
      const res = await api.get('/bids/my-bids');
      const bids = res.bids || [];
      if (bids.some(bid => bid.projectId?._id === id)) {
        setHasBid(true);
      }
    } catch (err) {
      console.error('Failed to fetch user bids', err);
    }
  };

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

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return toast.warning('Please provide a reason');
    
    setIsReporting(true);
    try {
      const res = await api.post(`/projects/${id}/report`, { reason: reportReason });
      toast.success(res.message || 'Report submitted successfully');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setIsReporting(false);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionLink.trim()) return toast.warning('Please provide a link to your work');

    setIsSubmitting(true);
    try {
      const res = await api.post(`/projects/${id}/submit`, {
        link: submissionLink,
        notes: submissionNotes
      });
      toast.success(res.message || 'Work submitted successfully!');
      setShowSubmitModal(false);
      setProject(res.project); // Update local project state to show 'In Review'
    } catch (err) {
      toast.error(err.message || 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveWork = async () => {
    if (!window.confirm("Are you sure you want to approve this work? The payment will be released to the student immediately.")) return;
    
    setIsApproving(true);
    try {
      const res = await api.put(`/projects/${id}/approve`);
      toast.success(res.message || 'Work approved and payment released!');
      setProject(res.project);
    } catch (err) {
      toast.error(err.message || 'Failed to approve work');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1ab2a6] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading project details...</p>
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
            
            <button 
              onClick={() => navigate('/browse-projects')}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-all mb-8 group font-bold text-sm bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Browse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                  {/* Project Image */}
                  <div className="h-64 md:h-80 overflow-hidden relative">
                    <img 
                      src={getImageUrl(project.image) || "https://images.unsplash.com/photo-1522071823957-09c527762297?auto=format&fit=crop&q=80&w=800"} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522071823957-09c527762297?auto=format&fit=crop&q=80&w=800" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-50">
                      <div className="flex-1">
                        <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
                          {project.title}
                        </h1>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <img 
                              src={getImageUrl(project.client?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.client?.name}`} 
                              alt={project.client?.name} 
                              className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-50 object-cover"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                {project.client?.name}
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client</span>
                            </div>
                          </div>
                          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 border-l border-gray-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            Identity Verified
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest opacity-40 mb-3">Project Description</h3>
                        <div className="text-gray-600 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
                          {project.description}
                        </div>
                      </div>

                      <div className="pt-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest opacity-40 mb-4">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                          {(project.skills || []).map(skill => (
                            <span 
                              key={skill} 
                              className="px-4 py-2 bg-teal-50 text-[#1ab2a6] text-xs font-bold rounded-xl border border-teal-100/50 hover:bg-teal-100 hover:scale-105 transition-all cursor-default"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-teal-100 transition-all">
                    <div className="p-3 bg-teal-50 text-[#1ab2a6] rounded-2xl group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Posted On</p>
                      <p className="text-sm font-bold text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-blue-100 transition-all">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                      <Gavel className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activity</p>
                      <p className="text-sm font-bold text-gray-900">{project.totalBids || 0} Bids Received</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Summary Card */}
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
                        {(project.skills || []).slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">
                            {skill}
                          </span>
                        ))}
                        {(project.skills || []).length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg border border-gray-100">
                            +{project.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 space-y-3">
                    {project.status === 'Open' ? (
                      <>
                        {currentUser.role === 'student' && hasBid ? (
                          <div className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-gray-200 cursor-not-allowed">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Bid Already Placed
                          </div>
                        ) : (
                          <button 
                            onClick={() => navigate(`/place-bid/${project._id}`)}
                            className="w-full bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-[#1ab2a6]/40 shadow-[#1ab2a6]/20 active:scale-95 flex items-center justify-center gap-3"
                          >
                            <Gavel className="w-4 h-4" />
                            Place Bid Now
                          </button>
                        )}
                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest pt-2">
                          Client usually responds in 24h
                        </p>
                      </>
                    ) : project.status === 'In Progress' ? (
                      <>
                        {currentUser.role === 'student' && project.acceptedBid?.studentId === currentUser._id && (
                          <button
                            onClick={() => setShowSubmitModal(true)}
                            className="w-full bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#1ab2a6]/20 active:scale-95 flex items-center justify-center gap-3 mb-3"
                          >
                            <UploadCloud className="w-5 h-5" />
                            Submit Final Work
                          </button>
                        )}
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-all border border-red-100 active:scale-95 flex items-center justify-center gap-3"
                        >
                          <AlertTriangle className="w-5 h-5" />
                          Report Dispute
                        </button>
                      </>
                    ) : project.status === 'In Review' ? (
                      <>
                        {currentUser.role === 'client' && project.clientId === currentUser._id ? (
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                              <h4 className="font-bold text-blue-900 mb-2">Work Submitted!</h4>
                              {project.submission?.link && (
                                <a href={project.submission.link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all block mb-2">
                                  {project.submission.link}
                                </a>
                              )}
                              {project.submission?.notes && (
                                <p className="text-sm text-blue-800 italic">"{project.submission.notes}"</p>
                              )}
                            </div>
                            <button
                              onClick={handleApproveWork}
                              disabled={isApproving}
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-3"
                            >
                              {isApproving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                              Approve & Release Payment
                            </button>
                            <button
                              onClick={() => setShowReportModal(true)}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-2xl transition-all border border-red-100 text-sm active:scale-95 flex items-center justify-center gap-2"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Report Dispute
                            </button>
                          </div>
                        ) : (
                          <div className="w-full bg-blue-50 text-blue-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-blue-100">
                            <Clock className="w-5 h-5" />
                            Pending Client Approval
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-gray-200 cursor-not-allowed">
                        Project {project.status}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 relative flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1ab2a6]" />
                    Safety Tips
                  </h3>
                  <ul className="text-xs space-y-3 text-gray-600 font-medium relative">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 bg-[#1ab2a6] rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(26,178,166,0.4)]"></div>
                      Never share personal contact info before being awarded.
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 bg-[#1ab2a6] rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(26,178,166,0.4)]"></div>
                      Keep all communication on the platform.
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Report Dispute
                </h3>
                <button onClick={() => setShowReportModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleReportSubmit} className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Please describe the issue in detail. Our Admin team will review the chat logs and project files to make a final ruling.
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="E.g., The student hasn't replied in 3 days, or the client is refusing to pay for completed work..."
                  className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none mb-6"
                  required
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isReporting} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                    {isReporting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submit Work Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-teal-50/30">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#1ab2a6]" />
                  Submit Final Work
                </h3>
                <button onClick={() => setShowSubmitModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitWork} className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                  Provide a link to your completed work (e.g., GitHub repo, Google Drive folder, Figma link) so the client can review and approve payment.
                </p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work URL</label>
                    <input
                      type="url"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      placeholder="https://"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1ab2a6] focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
                    <textarea
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="Any instructions for the client..."
                      className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1ab2a6] focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#1ab2a6] text-white font-bold rounded-xl hover:bg-[#148e85] transition-colors flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Now'}
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

export default ProjectDetails;

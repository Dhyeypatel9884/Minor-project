import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import { 
  Camera, 
  Mail, 
  X,
  Save,
  ShieldCheck,
  Calendar,
  Briefcase,
  Gavel,
  Loader2,
  IndianRupee,
  BadgeCheck,
  Clock
} from 'lucide-react';
import { formatCurrency, getImageUrl } from '../utils/formatters';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const Profile = () => {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ averageRating: 0, successRate: 0, totalReviews: 0 });

  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    bio: '',
    skills: [],
    avatar: '',
    createdAt: null,
    walletBalance: 0
  });

  const [skillInput, setSkillInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/reviews/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      // Silently fail stats fetch
    }
  };


  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/auth/profile');
      const user = data.user;
      setRole(user.role);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        institution: user.institution || '',
        bio: user.bio || '',
        skills: user.skills || [],
        avatar: user.avatar || '',
        createdAt: user.createdAt,
        walletBalance: user.walletBalance || 0
      });
      // Keep localStorage in sync
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({ ...stored, fullName: user.fullName, avatar: user.avatar }));
      localStorage.setItem('fullName', user.fullName);
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const data = await api.post('/upload/avatar', formData);
      setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
      // Keep localStorage in sync
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({ ...stored, avatar: data.avatarUrl }));
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.warning('Full name is required');
      return;
    }

    setIsSaving(true);
    try {
      const data = await api.put('/auth/profile', {
        fullName: formData.fullName,
        phone: formData.phone,
        institution: formData.institution,
        bio: formData.bio,
        skills: formData.skills
      });

      const updated = data.user;
      setFormData(prev => ({ ...prev, ...updated }));

      // Keep localStorage in sync
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({ ...stored, fullName: updated.fullName }));
      localStorage.setItem('fullName', updated.fullName);

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      // Auto-save the profile first to ensure backend has the latest data
      const isStudent = role === 'student';
      if (!formData.bio || !formData.institution || (isStudent && (!formData.skills || formData.skills.length === 0))) {
        const msg = isStudent
          ? 'You must fill out your bio, institution, and at least one skill first.'
          : 'You must fill out your bio and institution first.';
        return toast.warning(msg);
      }

      setIsSaving(true);
      await api.put('/auth/profile', {
        fullName: formData.fullName,
        phone: formData.phone,
        institution: formData.institution,
        bio: formData.bio,
        skills: formData.skills
      });

      const res = await api.put('/auth/profile/request-verification');
      toast.success(res.message);
      setFormData(prev => ({ ...prev, verificationStatus: 'Pending' }));
      
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({ ...stored, verificationStatus: 'Pending' }));
    } catch (err) {
      toast.error(err.message || 'Failed to request verification');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1ab2a6] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {role === 'client' 
        ? <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        : <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      }
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">My Profile</h1>
              <p className="text-gray-500 font-medium">Manage your personal information and account settings</p>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-500 to-teal-600 opacity-5"></div>
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50">
                    <img 
                      src={getImageUrl(formData.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.fullName)}`} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-1 right-1 bg-[#1ab2a6] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer disabled:opacity-70"
                    title="Change profile picture"
                  >
                    {isUploadingAvatar
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Camera className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {formData.fullName}
                      {formData.isVerified && (
                        <BadgeCheck className="w-6 h-6 text-green-500" title="Verified User" />
                      )}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border self-center ${
                      role === 'client' 
                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {role}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Mail className="w-4 h-4" />
                    {formData.email}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 border-t border-gray-50">
                    {formData.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Joined {new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {role !== 'client' && formData.skills.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-gray-300" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {formData.skills.length} Skills Listed
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Status Section */}
                  <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
                    {!formData.isVerified && formData.verificationStatus !== 'Pending' && (
                      <button
                        onClick={handleRequestVerification}
                        className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        Request Verification
                      </button>
                    )}
                    {formData.verificationStatus === 'Pending' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl text-sm font-bold">
                        <Clock className="w-4 h-4" />
                        Verification Pending
                      </div>
                    )}
                    {!formData.isVerified && (
                      <p className="text-xs text-gray-500 max-w-xs text-center md:text-left">
                        *Complete your bio, institution{role === 'student' ? ', and skills' : ''} to request verification. Verified users get unlimited access!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Section */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-50">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="text" 
                        value={formData.email}
                        disabled
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/30 cursor-not-allowed text-sm font-medium text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                      <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {role === 'client' ? 'Company Name' : 'College Name'}
                      </label>
                      <input 
                        type="text" 
                        name="institution"
                        value={formData.institution}
                        onChange={handleInputChange}
                        placeholder={role === 'client' ? 'Your Company' : 'Your University'}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                    <textarea 
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell clients about yourself..."
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  {role !== 'client' && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-50">Professional Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.skills.map(skill => (
                          <span key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-[#1ab2a6] text-xs font-bold rounded-lg border border-teal-100/50">
                            {skill}
                            <button onClick={() => removeSkill(skill)} type="button" className="hover:text-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Type a skill and press Enter" 
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  )}

                  <div className="pt-8 flex items-center gap-4">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#1ab2a6] text-white font-bold text-sm hover:bg-[#148e85] transition-all shadow-lg hover:shadow-[#1ab2a6]/30 shadow-[#1ab2a6]/20 active:scale-95 disabled:opacity-70"
                    >
                      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                    <button 
                      type="button"
                      onClick={fetchProfile}
                      className="px-8 py-3 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Stats / Info Sidebar */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Account Verification</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-bold text-gray-700">Email Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-bold text-gray-700">Profile Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1ab2a6] rounded-3xl p-8 shadow-lg shadow-teal-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                  <h3 className="text-lg font-bold text-white mb-6 relative">Platform Reputation</h3>
                  <div className="space-y-6 relative">
                    <div>
                      <div className="flex justify-between text-white/80 text-xs font-bold mb-2 uppercase tracking-wide">
                        <span>Success Rate</span>
                        <span>{stats.successRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full shadow-sm" style={{ width: `${stats.successRate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-white/80 text-xs font-bold mb-2 uppercase tracking-wide">
                        <span>Average Rating</span>
                        <span>{stats.averageRating} / 5.0 ({stats.totalReviews} Reviews)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full shadow-sm" style={{ width: `${(stats.averageRating / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                </div>

                {role === 'student' && (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <h3 className="text-lg font-bold text-white/90 mb-4 relative flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-teal-400" />
                      Wallet Balance
                    </h3>
                    <div className="relative">
                      <p className="text-4xl font-black text-white tracking-tight">
                        {formatCurrency(formData.walletBalance)}
                      </p>
                      <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">
                        Available for withdrawal
                      </p>
                    </div>
                  </div>
                )}

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

export default Profile;

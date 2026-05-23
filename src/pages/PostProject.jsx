import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import { 
  X, 
  IndianRupee, 
  Calendar, 
  Upload,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../components/Toast';

const PostProject = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  
  const [formData, setFormData] = useState({
    title: 'Responsive E-commerce Website Design',
    description: 'Develop a modern and responsive e-commerce website for a local campus startup. The website should include product listings, a shopping cart, secure checkout process, and an admin panel for product management. Key technologies involved are React for the frontend and Node.js for the backend. A clear, intuitive user experience is paramount.',
    budget: '5000',
    deadline: '2024-12-31',
    skills: ['React', 'Node.js', 'UI/UX', 'Database Management'],
  });

  const [skillInput, setSkillInput] = useState('');
  const [images, setImages] = useState([]); // Keeps previews
  const [selectedFile, setSelectedFile] = useState(null); // Keeps actual file for upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('fullName');
    if (storedName) {
      setClientName(storedName);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages([reader.result]); // Just one image as per backend logic
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.budget || !formData.deadline) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('budget', formData.budget);
      formDataToSubmit.append('deadline', formData.deadline);
      formDataToSubmit.append('skills', formData.skills.join(','));
      if (selectedFile) {
        formDataToSubmit.append('image', selectedFile);
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSubmit
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post project');
      }

      toast.success('Project posted successfully!');
      setTimeout(() => navigate('/client/my-projects'), 700);
    } catch (err) {
      toast.error(err.message || 'An error occurred while posting the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Post New Project</h1>
              <p className="text-gray-500 font-medium">Fill out the details below to list your project and connect with talented students.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Project Details</h2>
                    <p className="text-sm text-gray-400 font-medium tracking-tight">Provide comprehensive information about your project.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 tracking-wide">Project Title</label>
                      <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Mobile App for Food Delivery" 
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 tracking-wide">Description</label>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your project requirements in detail..." 
                        rows={6}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all placeholder:text-gray-300 text-sm resize-none font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 tracking-wide">Budget (INR)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="number" 
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            placeholder="₹ 5000" 
                            className="w-full pl-10 pr-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 tracking-wide">Deadline</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="date" 
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all text-sm text-gray-700 font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 tracking-wide">Skills Required</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.skills.map(skill => (
                          <span key={skill} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-400/50 rounded-full text-xs font-bold text-gray-600 transition-all hover:border-red-400 hover:text-red-500 cursor-pointer group" onClick={() => removeSkill(skill)}>
                            {skill}
                            <X className="w-3 h-3 text-gray-400 group-hover:text-red-400" />
                          </span>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Add a skill and press Enter" 
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1ab2a6] focus:ring-4 focus:ring-[#1ab2a6]/5 outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 tracking-wide">Upload Project Image</label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer group"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1ab2a6] transition-colors" />
                          <p className="text-xs text-gray-500 font-medium">Click to upload or drag and drop</p>
                          <p className="text-[10px] text-red-400 font-bold mt-1">Max file size: 5MB (1 image only)</p>
                        </div>
                      </div>

                      {/* Image Thumbnails */}
                      {images.length > 0 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                              <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="absolute top-1 right-1 bg-white/80 p-1 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-[#1ab2a6]/30 shadow-[#1ab2a6]/20 mt-8 active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting Project...
                      </>
                    ) : (
                      'Submit Project'
                    )}
                  </button>
                </form>
              </div>

              {/* Live Preview Section */}
              <div className="lg:sticky lg:top-28">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Project Preview</h2>
                  <p className="text-xs text-gray-400 font-medium mb-6">This is how your project will appear to students.</p>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                     <div className="aspect-video bg-gray-100 relative overflow-hidden">
                       <img 
                        src={images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1522071823957-09c527762297?auto=format&fit=crop&q=80&w=800"} 
                        alt="Project Preview" 
                        className="w-full h-full object-cover opacity-90 transition-all duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">
                        {formData.title || 'Untitled Project'}
                      </h3>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <span className="opacity-60">Budget:</span>
                          <span className="text-gray-700 italic">{formData.budget ? formatCurrency(formData.budget) : 'Not set'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <span className="opacity-60">Deadline:</span>
                          <span className="text-gray-700 italic">{formData.deadline || 'Not set'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                         <p className="text-xs font-extrabold text-gray-900 tracking-tight">Skills Required:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.skills.length > 0 ? (
                            formData.skills.map(skill => (
                              <span key={skill} className="px-3 py-1 bg-teal-50 text-[#1ab2a6] text-[10px] font-bold rounded-lg border border-teal-100/30">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium italic">No skills added</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client</span>
                            <span className="text-xs text-gray-800 font-extrabold">{clientName}</span>
                         </div>
                      </div>
                      
                      <button className="w-full bg-[#1ab2a6] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary/10 mt-6 pointer-events-none opacity-90">
                        View Details (Simulated)
                      </button>
                    </div>
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

export default PostProject;

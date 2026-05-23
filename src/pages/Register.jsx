import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import registerImg from '../assets/register_image.png';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      toast.warning('Please select a role');
      return;
    }
    if (formData.password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('fullName', data.user.fullName);

      toast.success('Account created successfully! Welcome to CampusFreelance!');

      setTimeout(() => {
        navigate(data.user.role === 'client' ? '/client/dashboard' : '/dashboard');
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="max-w-[1000px] w-full bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100/50">
        
        {/* Left Side: Illustration */}
        <div className="md:w-1/2 bg-gray-50/50 flex items-center justify-center p-8 md:p-12">
          <img 
            src={registerImg} 
            alt="Campus Illustration" 
            className="w-full h-auto object-contain max-h-[600px]"
          />
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-10 md:p-16 flex flex-col bg-white">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-primary">CampusFreelance</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center leading-tight">
              Create Your Account
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 tracking-tight">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                placeholder="Your Name" 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 tracking-tight">College Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="your.email@college.edu" 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 tracking-tight">Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Min. 6 characters" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 tracking-tight">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Repeat password" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 tracking-tight">I am a</label>
              <select 
                name="role"
                value={formData.role}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-600 appearance-none"
                onChange={handleChange}
                required
              >
                <option value="">Select your role</option>
                <option value="student">Student (Freelancer)</option>
                <option value="client">Client (Project Owner)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg transition-all shadow-md shadow-primary/10 mt-6 active:scale-[0.99] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-medium text-gray-500">
            <Link to="/login" className="text-primary hover:underline">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

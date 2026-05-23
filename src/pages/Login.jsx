import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginImg from '../assets/login_image.png';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.warning('Please select a role (Student or Client)');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.post('/auth/login', { email, password, role });

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('fullName', data.user.fullName);

      toast.success(`Welcome back, ${data.user.fullName}!`);

      setTimeout(() => {
        if (data.user.role === 'student') {
          navigate('/dashboard');
        } else if (data.user.role === 'client') {
          navigate('/client/dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        }
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="max-w-[1000px] w-full bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100/50">
        
        {/* Left Side: Image */}
        <div className="md:w-1/2 shrink-0 h-64 md:h-auto">
          <img 
            src={loginImg} 
            alt="Work illustration" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Form Content */}
        <div className="md:w-1/2 flex flex-col justify-center bg-white p-12 md:p-16">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="text-left mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">Enter your credentials to access your CampusFreelance account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800 tracking-wide">Email</label>
              <input 
                type="email" 
                placeholder="your.email@college.edu" 
                className="w-full px-5 py-3.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800 tracking-wide">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800 tracking-wide">Login as</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-5 py-3.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-600 appearance-none"
                required
              >
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg transition-all shadow-md shadow-primary/10 mt-4 active:scale-[0.99] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

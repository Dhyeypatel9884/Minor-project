import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Info, ArrowLeft } from 'lucide-react';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const correctOTP = '123456';

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value !== '' && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input if value is entered
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === correctOTP) {
      alert('Email verified successfully');
      
      const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
      if (pendingUser) {
        const verifiedUser = { ...pendingUser, isVerified: true, id: Date.now() };
        localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
        localStorage.removeItem('pendingUser');
        
        if (verifiedUser.role === 'student') {
          navigate('/dashboard');
        } else if (verifiedUser.role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Fallback for cases where pendingUser is lost
        const role = localStorage.getItem('role');
        const fullName = localStorage.getItem('fullName');
        const user = { fullName, role, isVerified: true, id: Date.now() };
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (role === 'student') {
          navigate('/dashboard');
        } else if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/');
        }
      }
    } else {
      alert('Invalid OTP');
    }
  };

  const handleResend = () => {
    alert('OTP resent to email');
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="max-w-[500px] w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
        {/* Back Button */}
        <Link 
          to="/register" 
          className="absolute top-8 left-8 text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex flex-col items-center">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-4 text-center">Verify Your Email</h2>
          
          {/* Subtitle */}
          <p className="text-gray-500 text-sm text-center mb-6 max-w-[320px]">
            Please enter the 6-digit code sent to your college email address.
          </p>

          {/* Email Box */}
          <div className="flex items-center gap-2 mb-8">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 font-medium">student.example@campusfreelance.edu</span>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-between gap-2 mb-8 w-full max-w-[320px]">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
              />
            ))}
          </div>

          {/* Notification Box */}
          <div className="bg-[#f3f4f6] rounded-xl p-5 mb-8 w-full flex gap-3 border border-gray-100">
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">Important Notification</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Please ensure you have uploaded your student ID for verification in the profile section.
              </p>
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            className="w-full bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-6 active:scale-[0.99]"
          >
            Verify Account
          </button>

          {/* Resend Link */}
          <button
            onClick={handleResend}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

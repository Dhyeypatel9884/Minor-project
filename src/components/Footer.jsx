import React from 'react';
import { GraduationCap, Globe, MessageCircle, Building2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Company Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">CampusFreelance</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            A secure freelancing marketplace for college projects & skills.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <Globe size={18} className="hover:text-primary cursor-pointer" />
            <MessageCircle size={18} className="hover:text-primary cursor-pointer" />
            <Building2 size={18} className="hover:text-primary cursor-pointer" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li className="hover:text-primary cursor-pointer">How It Works</li>
            <li className="hover:text-primary cursor-pointer">Features</li>
            <li className="hover:text-primary cursor-pointer">About Us</li>
            <li className="hover:text-primary cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li className="hover:text-primary cursor-pointer">Help Center</li>
            <li className="hover:text-primary cursor-pointer">Terms of Service</li>
            <li className="hover:text-primary cursor-pointer">Privacy Policy</li>
            <li className="hover:text-primary cursor-pointer">FAQs</li>
          </ul>
        </div>

        {/* College Info */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6">College Info</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li className="font-semibold text-gray-700">Navrachna University</li>
            <li className="whitespace-pre-line leading-relaxed">
              Navrachana University{'\n'}
              Vasna-Bhayli Road, Vadodara -391 410, Gujarat, India
            </li>
            <li className="whitespace-pre-line leading-relaxed mt-4">
              Landline: +91-265-2617000 / 100{'\n'}
              WhatsApp: +91-9327843239{'\n'}
              Mail: nuv@nuv.ac.in{'\n'}
              Working Hours: Mon to Sat – 9am to 5pm
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-200 pt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
        © 2025 CampusFreelance. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

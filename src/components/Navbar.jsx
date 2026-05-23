import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-primary">CampusFreelance</span>
      </Link>
      <div className="flex items-center gap-8 font-medium text-gray-600">
        <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
        <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
        <a href="#about" className="hover:text-primary transition-colors font-bold border-b-2 border-teal-500/0 hover:border-teal-500 transition-all duration-300">About</a>
      </div>
    </nav>
  );
};

export default Navbar;

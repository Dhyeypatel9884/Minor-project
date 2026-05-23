import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-primary pt-24 pb-32 px-4 text-center text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          CampusFreelance
        </h1>
        <p className="text-xl md:text-2xl font-light opacity-90">
          A secure freelancing marketplace for college projects & skills.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link to="/register" className="px-8 py-3 bg-white text-primary font-bold rounded-md hover:bg-gray-100 transition-all shadow-sm">
            Register Now
          </Link>
          <Link to="/login" className="px-10 py-3 bg-white text-primary font-bold rounded-md hover:bg-gray-100 transition-all shadow-sm">
            Login
          </Link>
          <button className="px-8 py-3 bg-transparent text-white font-medium hover:underline transition-all underline-offset-4">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

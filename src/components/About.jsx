import React from 'react';
import { Target, Users, Zap } from 'lucide-react';
import aboutImg from '../assets/about_hero.png';

const About = () => {
  const highlights = [
    {
      icon: Target,
      title: "Real-World Experience",
      text: "Turn classroom theories into practical achievements that stand out on your resume."
    },
    {
      icon: Users,
      title: "Campus Connections",
      text: "A tailored community where local clients find the specific student talent they need."
    },
    {
      icon: Zap,
      title: "Fast Collaboration",
      text: "Streamlined tools that make project management as simple as a campus coffee chat."
    }
  ];

  return (
    <section id="about" className="py-24 px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Content Column */}
          <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 text-sm font-bold tracking-wide uppercase">
                Our Mission
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Empowering the Next Generation of <span className="text-teal-600">Campus Talent</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                CampusFreelance is more than just a marketplace. We're a bridge that connects the classroom to the real world, 
                allowing students to build impressive portfolios while helping businesses thrive with specialized, 
                enthusiastic campus talent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="mt-1 bg-teal-50 p-2 rounded-lg text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-teal-500/20 active:scale-95">
                Explore More
              </button>
            </div>
          </div>

          {/* Illustration Column */}
          <div className="flex-1 relative animate-in slide-in-from-right duration-1000">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-50/50 rounded-full blur-3xl -z-10" />
            
            <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-teal-50 transform transition-all duration-700 hover:rotate-3 hover:scale-[1.02] group/img">
              <img 
                src={aboutImg} 
                alt="About CampusFreelance" 
                className="w-full h-auto rounded-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-teal-50 flex items-center gap-3 animate-bounce">
                <div className="bg-teal-500 p-2 rounded-lg">
                  <span className="text-white text-xl font-bold">10k+</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Projects</p>
                  <p className="text-[10px] text-gray-400">Completed</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;

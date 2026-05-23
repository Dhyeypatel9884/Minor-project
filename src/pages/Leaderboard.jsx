import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import api from '../utils/api';
import { getImageUrl } from '../utils/formatters';
import { Loader2, Trophy, Medal, Award, CheckCircle2, Star, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const role = currentUser.role || 'student';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leaderboard');
      if (res.success) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPodiumStyle = (index) => {
    switch (index) {
      case 0:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          shadow: 'shadow-yellow-100',
          icon: <Trophy className="w-8 h-8 text-yellow-500" />,
          label: 'Gold'
        };
      case 1:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-600',
          shadow: 'shadow-gray-200',
          icon: <Medal className="w-8 h-8 text-gray-400" />,
          label: 'Silver'
        };
      case 2:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          shadow: 'shadow-orange-100',
          icon: <Award className="w-8 h-8 text-orange-600" />,
          label: 'Bronze'
        };
      default:
        return null;
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const theRest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {role === 'client' 
        ? <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        : <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      }
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-4">
                <Trophy className="w-8 h-8 text-[#1ab2a6]" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Top Freelancers</h1>
              <p className="text-gray-500 font-medium max-w-xl mx-auto">
                Discover the highest-ranked students on the platform based on successful projects, positive reviews, and verified status.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#1ab2a6] animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Rankings...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">No students ranked yet.</p>
              </div>
            ) : (
              <>
                {/* Podium Section for Top 3 */}
                {topThree.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-4 md:px-0 items-end">
                    {/* 2nd Place */}
                    {topThree[1] && (
                      <div className={`relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 ${getPodiumStyle(1).border} ${getPodiumStyle(1).shadow} shadow-xl transform hover:-translate-y-2 transition-all order-2 md:order-1 h-[90%]`}>
                        <div className="absolute -top-6 bg-white p-2 rounded-full shadow-md">
                          {getPodiumStyle(1).icon}
                        </div>
                        <img 
                          src={getImageUrl(topThree[1].avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].fullName}`} 
                          alt={topThree[1].fullName} 
                          className="w-20 h-20 rounded-full mb-4 mt-6 border-4 border-gray-100 object-cover"
                        />
                        <h3 className="font-bold text-lg text-gray-900 text-center line-clamp-1">{topThree[1].fullName}</h3>
                        <p className="text-xs text-gray-500 mb-4 text-center line-clamp-1">{topThree[1].institution || 'Unknown University'}</p>
                        <div className="w-full bg-gray-50 py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-100">
                          <TrendingUp className={`w-4 h-4 ${getPodiumStyle(1).text}`} />
                          <span className={`font-black ${getPodiumStyle(1).text}`}>{topThree[1].points} pts</span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                      <div className={`relative flex flex-col items-center p-8 bg-white rounded-[2.5rem] border-2 ${getPodiumStyle(0).border} ${getPodiumStyle(0).shadow} shadow-2xl transform hover:-translate-y-4 transition-all order-1 md:order-2 z-10`}>
                        <div className="absolute -top-8 bg-white p-2 rounded-full shadow-lg">
                          {getPodiumStyle(0).icon}
                        </div>
                        <img 
                          src={getImageUrl(topThree[0].avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].fullName}`} 
                          alt={topThree[0].fullName} 
                          className="w-28 h-28 rounded-full mb-4 mt-4 border-4 border-yellow-100 object-cover shadow-inner"
                        />
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="font-black text-xl text-gray-900 text-center">{topThree[0].fullName}</h3>
                          {topThree[0].isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-6 text-center">{topThree[0].institution || 'Unknown University'}</p>
                        <div className="w-full bg-yellow-50 py-4 rounded-2xl flex items-center justify-center gap-3 border border-yellow-100">
                          <TrendingUp className={`w-5 h-5 ${getPodiumStyle(0).text}`} />
                          <span className={`text-xl font-black ${getPodiumStyle(0).text}`}>{topThree[0].points} pts</span>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                      <div className={`relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 ${getPodiumStyle(2).border} ${getPodiumStyle(2).shadow} shadow-xl transform hover:-translate-y-2 transition-all order-3 md:order-3 h-[85%]`}>
                        <div className="absolute -top-6 bg-white p-2 rounded-full shadow-md">
                          {getPodiumStyle(2).icon}
                        </div>
                        <img 
                          src={getImageUrl(topThree[2].avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].fullName}`} 
                          alt={topThree[2].fullName} 
                          className="w-20 h-20 rounded-full mb-4 mt-6 border-4 border-gray-100 object-cover"
                        />
                        <h3 className="font-bold text-lg text-gray-900 text-center line-clamp-1">{topThree[2].fullName}</h3>
                        <p className="text-xs text-gray-500 mb-4 text-center line-clamp-1">{topThree[2].institution || 'Unknown University'}</p>
                        <div className="w-full bg-gray-50 py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-100">
                          <TrendingUp className={`w-4 h-4 ${getPodiumStyle(2).text}`} />
                          <span className={`font-black ${getPodiumStyle(2).text}`}>{topThree[2].points} pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ranking Table for the Rest */}
                {theRest.length > 0 && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Projects</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {theRest.map((student, index) => (
                            <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-5 whitespace-nowrap">
                                <span className="text-lg font-bold text-gray-400 group-hover:text-[#1ab2a6] transition-colors">
                                  #{index + 4}
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                  <img 
                                    src={getImageUrl(student.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.fullName}`} 
                                    alt="" 
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-gray-900">{student.fullName}</span>
                                      {student.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                                    </div>
                                    <span className="text-xs text-gray-500">{student.institution || 'Unknown'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-center">
                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-50 text-gray-600 font-bold text-sm border border-gray-100">
                                  {student.completedProjectsCount}
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="font-bold text-gray-700">{student.averageRating}</span>
                                  <span className="text-xs text-gray-400">({student.totalReviews})</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-right">
                                <span className="font-black text-[#1ab2a6] text-lg">{student.points}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;

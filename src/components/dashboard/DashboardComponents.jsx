import { Clock, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const ProjectCard = ({ _id, title, client, budget, deadline, tags, skills }) => {
  const navigate = useNavigate();
  const displayClient = typeof client === 'object' ? client?.name : client;
  const displayTags = tags || skills || [];
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString() : 'N/A';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 font-medium opacity-80">Client: {displayClient}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {displayTags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-lg border border-gray-100">
            {tag}
          </span>
        ))}
      </div>

      <div className="border-t border-gray-50 pt-6 space-y-3 mb-6">
        <div className="flex items-center gap-2 text-[#1ab2a6] font-bold">
          <IndianRupee className="w-4 h-4" />
          <span className="text-sm">Budget: {formatCurrency(budget)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-medium tracking-tight">
          <Clock className="w-4 h-4" />
          <span className="text-sm italic">Deadline: {formattedDeadline}</span>
        </div>
      </div>

      <button 
        onClick={() => _id && navigate(`/project-details/${_id}`)}
        className="w-full bg-[#1ab2a6] hover:bg-[#148e85] text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-teal-500/20 shadow-teal-500/10 active:scale-95"
      >
        View Details
      </button>
    </div>
  );
};


export const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color === 'teal' ? 'bg-teal-50 text-[#1ab2a6]' : color === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500 tracking-tight">{label}</p>
        </div>
      </div>
      <span className="text-4xl font-extrabold text-gray-900 italic">{value}</span>
    </div>
  );
};

export const NotificationItem = ({ message, time, icon: Icon, color }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-50 text-blue-500' : color === 'teal' ? 'bg-teal-50 text-[#1ab2a6]' : color === 'green' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-400'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm text-gray-700 font-medium line-clamp-1 group-hover:text-gray-900 transition-colors">
          {message}
        </p>
      </div>
      <span className="text-xs text-gray-400 font-bold whitespace-nowrap ml-4">{time}</span>
    </div>
  );
};

import React from 'react';

const Card = ({ icon: Icon, title, description, iconColor = "text-primary" }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
      <div className={`${iconColor} bg-opacity-10 p-4 rounded-full`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default Card;

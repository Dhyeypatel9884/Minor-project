import React from 'react';
import { CheckCircle, Briefcase, MessageSquare } from 'lucide-react';
import Card from './Card';

const Benefits = () => {
  const data = [
    {
      icon: CheckCircle,
      title: "Verified Campus Users",
      description: "Ensure trust and security with verified student and client accounts.",
      iconColor: "text-secondary"
    },
    {
      icon: Briefcase,
      title: "Seamless Project Bidding",
      description: "Intuitive tools for students to bid and clients to manage proposals.",
      iconColor: "text-secondary"
    },
    {
      icon: MessageSquare,
      title: "Integrated Chat & Collaboration",
      description: "Communicate directly with project partners through our platform.",
      iconColor: "text-secondary"
    }
  ];

  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
        <h2 className="text-4xl font-bold text-gray-900">Why Choose CampusFreelance?</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Unlock opportunities and talent with our robust platform designed for campus needs.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {data.map((item, idx) => (
          <Card key={idx} {...item} />
        ))}
      </div>
    </section>
  );
};

export default Benefits;

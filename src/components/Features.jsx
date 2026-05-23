import React from 'react';
import { ClipboardList, IndianRupee, Send } from 'lucide-react';
import Card from './Card';

const Features = () => {
  const data = [
    {
      icon: ClipboardList,
      title: "Clients Post Projects",
      description: "Clients describe their project needs, budget, and timeline."
    },
    {
      icon: IndianRupee,
      title: "Students Bid & Apply",
      description: "Students submit proposals and their competitive bids."
    },
    {
      icon: Send,
      title: "Collaborate & Deliver",
      description: "Work together efficiently and deliver quality results."
    }
  ];

  return (
    <section className="py-24 px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
        <h2 className="text-4xl font-bold text-gray-900">How CampusFreelance Works</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Connecting college students with project opportunities in three simple steps.
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

export default Features;

import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Footer from '../components/Footer';
import Features from '../components/Features';
import Benefits from '../components/Benefits';

const Landing = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Benefits />
      <Footer />
    </>
  );
};

export default Landing;

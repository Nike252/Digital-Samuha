import React from 'react';
import { Button } from '../../components/ui';
import heroImage from '../../assets/hero-image.jpg';

const HeroSection = ({ onRegister, onLogin, onSignup }) => {
  return (
    <section className="w-full px-6 py-12 lg:px-12 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-[#2563eb] leading-tight">Digital Samuha</h1>
            <p className="text-xl text-gray-600 font-medium">Transform your local community into a digital powerhouse.</p>
            <p className="text-gray-600 leading-relaxed">Manage contributions, track expenses, record meeting minutes, and ensure government compliance all in one place.</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="primary" size="large" onClick={onRegister} className="flex items-center justify-center gap-2">Register Samuha <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 15L12.5 10L7.5 5"/></svg></Button>
              <Button variant="outline" size="large" onClick={onLogin}>Login</Button>
              <Button variant="success" size="large" onClick={onSignup}>Sign Up</Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-lg aspect-[4/3]">
              <img src={heroImage} alt="Digital Samuha - Transform your local community" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center hidden">
                <div className="text-white text-center p-8">
                  <p className="text-sm mb-2">Hero Image Placeholder</p>
                  <p className="text-xs text-gray-400">Add your image to /src/assets/hero-image.jpg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

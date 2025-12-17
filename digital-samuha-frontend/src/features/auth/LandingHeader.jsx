import React from 'react';
import { Button } from '../../components/ui';

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="12" r="6" fill="#2563eb"/>
      <path d="M8 28C8 24 11.5 20 16 20C20.5 20 24 24 24 28" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <span className="text-xl font-bold text-[#2563eb]">Digital Samuha</span>
  </div>
);

const LandingHeader = ({ onRegister }) => {
  return (
    <header className="w-full px-6 py-4 lg:px-16 lg:py-6">
      <div className="w-full flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-6">
          <Button variant="primary" size="medium" onClick={onRegister}>Register Samuha</Button>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;

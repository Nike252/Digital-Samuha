import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentBSDate } from '../utils/nepaliDateUtils';

// Import local images
import slide1 from '../assets/Photos/login_page_1.jpg';
import slide2 from '../assets/Photos/login_page_2.jpg';
import slide3 from '../assets/Photos/login_page_3.jpg';
import logo from '../assets/Photos/ds_logo.png';

const AuthLayout = ({ children, title, subtitle, backButton }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Use imported images
  const slides = [
    {
      url: slide1,
      quote: "Empowering Communities through Digital Transparency",
      author: "Digital Samuha"
    },
    {
      url: slide2,
      quote: "Manage Savings and Loans with Ease",
      author: "Financial Freedom"
    },
    {
      url: slide3,
      quote: "Secure, Transparent, and Accessible for All",
      author: "Future of Samuhas"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50/80 font-sans p-2 sm:p-4">
      
      {/* Centered Card Container - "Not this big split" */}
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-5xl min-h-[600px] border border-white/50 my-4 sm:my-8">
          
          {/* Left Side - Image Slider (45% Width) */}
          <div className="hidden lg:flex lg:w-[45%] relative bg-gray-900 text-white overflow-hidden min-h-full">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={slide.url} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                />
                {/* Vibrant Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-purple-600/40 mix-blend-overlay" />
                {/* Text Readability Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ))}

            {/* Content Overlay */}
            <div className="relative z-20 flex flex-col justify-between p-10 w-full h-full">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-1">
                  <img src={logo} alt="Digital Samuha Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white drop-shadow-md">Digital Samuha</span>
              </div>

              <div className="mb-8">
                 <div className="relative h-32"> {/* Increased height to prevent cutoff */}
                   {slides.map((slide, index) => (
                     <div 
                        key={index}
                        className={`absolute bottom-0 left-0 w-full transition-all duration-700 ease-out transform ${
                            currentSlide === index 
                                ? 'translate-y-0 opacity-100 delay-300' 
                                : 'translate-y-8 opacity-0 pointer-events-none'
                        }`}
                     >
                        <h2 className="text-3xl font-bold leading-tight mb-3 text-white drop-shadow-lg">
                          "{slide.quote}"
                        </h2>
                        <p className="text-indigo-200 text-sm font-medium tracking-wide">— {slide.author}</p>
                     </div>
                   ))}
                 </div>
                 
                 {/* Indicators */}
                 <div className="flex gap-2 mt-8">
                   {slides.map((_, index) => (
                     <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                            currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                        }`}
                     />
                   ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Container (55% Width) */}
          <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8 bg-white relative">
             {/* Decorative background element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[100%] -translate-y-32 translate-x-32 pointer-events-none"></div>

            <div className="w-full max-w-sm relative z-10">
               <div className="mb-6 sm:mb-8">
                 {backButton && <div className="mb-6 lg:hidden">{backButton}</div>}
                 <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                 {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
               </div>
               
               {children}
               
               {/* Footer Navigation (DRY) */}
               <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                 <p className="text-sm text-gray-500">
                    {title === 'Welcome Back' ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button 
                      type="button" 
                      onClick={() => navigate(title === 'Welcome Back' ? '/signup' : '/login')} 
                      className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer relative z-20"
                    >
                        {title === 'Welcome Back' ? 'Create an account' : 'Log In'}
                    </button>
                 </p>
                 
                 <button 
                    type="button"
                    onClick={() => navigate('/')} 
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors cursor-pointer relative z-20"
                 >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Home
                 </button>

                 <div className="text-gray-300 text-[10px]">
                   &copy; {getCurrentBSDate().year} BS Digital Samuha
                 </div>
               </div>
            </div>
          </div>
          
      </div>

    </div>
  );
};

export default AuthLayout;

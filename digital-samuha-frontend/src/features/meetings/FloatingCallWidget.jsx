import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCall } from '../../context/CallContext';
import { Maximize2, Phone, Move } from 'lucide-react';

/**
 * FloatingCallWidget — renders the PERSISTENT video element.
 * 
 * The video element lives outside React's VDOM (created via document.createElement in CallContext).
 * This component just provides a "host" div and uses appendChild to move the video element into it.
 * Since the video element is never destroyed, ZegoCloud keeps rendering into it.
 * 
 * Modes:
 * - Full-screen (on /premium-meeting page): Hidden here; PremiumMeetingRoom hosts it.
 * - PiP (minimized): Small draggable floating window.
 */
const FloatingCallWidget = () => {
  const { active, minimized, loading, getVideoElement, maximizeCall, endCall, roomID } = useCall();
  const navigate = useNavigate();
  const location = useLocation();

  const pipHostRef = useRef(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 280 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Move the persistent video element INTO the PiP host when minimized
  useEffect(() => {
    if (minimized && pipHostRef.current && active) {
      const videoEl = getVideoElement();
      if (videoEl && pipHostRef.current !== videoEl.parentNode) {
        pipHostRef.current.appendChild(videoEl);
      }
    }
  }, [minimized, active, getVideoElement]);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const move = (e) => {
      if (!isDragging) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 360, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 240, e.clientY - dragOffset.current.y))
      });
    };
    const up = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [isDragging]);

  useEffect(() => {
    if (minimized) setPosition({ x: window.innerWidth - 380, y: window.innerHeight - 280 });
  }, [minimized]);

  const handleMaximize = () => {
    maximizeCall();
    navigate(`/premium-meeting/${roomID}`);
  };

  const handleEndCall = () => {
    const wasOnMeetingPage = location.pathname.startsWith('/premium-meeting');
    endCall();
    if (wasOnMeetingPage) navigate('/dashboard');
  };

  if (!active || !minimized) return null;

  return (
    <div className="fixed z-[9999] select-none" style={{ left: position.x, top: position.y }}>
      <div
        className="w-[350px] h-[220px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700 group relative"
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      >
        {/* Controls overlay */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 text-white/80">
            <Move size={14} />
            <span className="text-[11px] font-bold tracking-wide">LIVE MEETING</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleMaximize} className="p-1.5 bg-white/10 hover:bg-white/25 rounded-lg transition-colors" title="Maximize">
              <Maximize2 size={14} className="text-white" />
            </button>
            <button onClick={handleEndCall} className="p-1.5 bg-rose-500/80 hover:bg-rose-500 rounded-lg transition-colors" title="End Call">
              <Phone size={14} className="text-white rotate-[135deg]" />
            </button>
          </div>
        </div>

        {/* HOST for the persistent video element */}
        <div ref={pipHostRef} className="w-full h-full" style={{ pointerEvents: isDragging ? 'none' : 'auto' }} />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCallWidget;

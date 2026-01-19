import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { subscriptionsAPI, chatAPI } from '../utils/api';

const CallContext = createContext(null);

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const [callState, setCallState] = useState({
    active: false,
    roomID: null,
    minimized: false,
    loading: false,
    error: null,
  });

  // This is the PERMANENT DOM element for ZegoCloud. Created once, never destroyed.
  const videoElementRef = useRef(null);
  const zpRef = useRef(null);
  const userRef = useRef(null);
  const navigateRef = useRef(null);

  // Create the permanent video element on first render
  useEffect(() => {
    if (!videoElementRef.current) {
      const el = document.createElement('div');
      el.style.width = '100%';
      el.style.height = '100%';
      el.id = 'zego-persistent-container';
      videoElementRef.current = el;
    }
  }, []);

  const joinCall = useCallback(async (roomID, user, navigate) => {
    if (zpRef.current) return; // Already in a call

    userRef.current = user;
    navigateRef.current = navigate;
    setCallState(prev => ({ ...prev, active: true, roomID, loading: true, error: null, minimized: false }));

    // Small delay to let the host component mount and grab the element
    await new Promise(r => setTimeout(r, 300));

    const container = videoElementRef.current;
    if (!container) {
      setCallState(prev => ({ ...prev, loading: false, error: "Video container not available." }));
      return;
    }

    try {
      let isPremium = user?.samuha?.is_premium;
      if (!isPremium) {
        const subRes = await subscriptionsAPI.getCurrentSubscription();
        isPremium = subRes.data?.is_premium;
      }

      if (!isPremium) {
        setCallState(prev => ({ ...prev, loading: false, error: "This room requires a Premium Samuha Subscription." }));
        return;
      }

      const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

      if (!appID || !serverSecret) {
        setCallState(prev => ({ ...prev, loading: false, error: "ZegoCloud credentials missing in .env file." }));
        return;
      }

      const safeUserId = `user_${user.id}`;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, serverSecret, roomID, safeUserId, user.full_name || "Member"
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      const joinKey = `joined_${roomID}_${user.id}`;
      if (!sessionStorage.getItem(joinKey)) {
        chatAPI.sendMessage(`${user.full_name} joined the call`, 'system');
        sessionStorage.setItem(joinKey, 'true');
      }

      zp.joinRoom({
        container,
        sharedLinks: [{ name: 'Link', url: window.location.href }],
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
        showScreenSharingButton: true,
        showUserJoinAndLeave: false,
        onLeaveRoom: () => {
          try {
            chatAPI.sendMessage(`${user?.full_name || 'Member'} left the call`, 'system');
            sessionStorage.removeItem(`joined_${roomID}_${user.id}`);
          } catch (e) { console.error("Leave msg error:", e); }
          endCall();
          if (navigateRef.current) navigateRef.current('/chat');
        }
      });

      setCallState(prev => ({ ...prev, loading: false }));
    } catch (err) {
      console.error("ZegoCloud Join Error:", err);
      setCallState(prev => ({ ...prev, loading: false, error: "Failed to join meeting room." }));
    }
  }, []);

  const endCall = useCallback(() => {
    if (zpRef.current) {
      try { zpRef.current.destroy(); } catch (e) { console.error("SDK cleanup:", e); }
      zpRef.current = null;
    }
    setCallState({ active: false, roomID: null, minimized: false, loading: false, error: null });
  }, []);

  const minimizeCall = useCallback(() => {
    setCallState(prev => ({ ...prev, minimized: true }));
  }, []);

  const maximizeCall = useCallback(() => {
    setCallState(prev => ({ ...prev, minimized: false }));
  }, []);

  // Getter for the permanent DOM element
  const getVideoElement = useCallback(() => videoElementRef.current, []);

  return (
    <CallContext.Provider value={{
      ...callState,
      getVideoElement,
      joinCall,
      endCall,
      minimizeCall,
      maximizeCall,
      user: userRef.current
    }}>
      {children}
    </CallContext.Provider>
  );
};

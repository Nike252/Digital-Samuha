import { useEffect, useRef, useState } from 'react';
import { subscriptionsAPI, chatAPI } from '../../utils/api';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const useMeetingRoom = (roomID, user, navigate) => {
  const containerRef = useRef(null);
  const isInitialized = useRef(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let zp = null;
    
    const initZego = async () => {
      if (isInitialized.current) return;
      try {
        let isPremium = user?.samuha?.is_premium;
        
        if (!isPremium) {
           const subRes = await subscriptionsAPI.getCurrentSubscription();
           isPremium = subRes.data?.is_premium;
        }

        if (!isPremium) {
          setError("This room requires a Premium Samuha Subscription.");
          setLoading(false);
          return;
        }

        const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
        
        if (!appID || !serverSecret) {
          setError("ZegoCloud credentials missing in .env file.");
          setLoading(false);
          return;
        }

        const safeUserId = `user_${user.id}`;
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, serverSecret, roomID, safeUserId, user.full_name || "Member"
        );

        zp = ZegoUIKitPrebuilt.create(kitToken);
        isInitialized.current = true;
        
        const joinKey = `joined_${roomID}_${user.id}`;
        if (!sessionStorage.getItem(joinKey)) {
            chatAPI.sendMessage(`${user.full_name} joined the call`, 'system');
            sessionStorage.setItem(joinKey, 'true');
        }

        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [{ name: 'Link', url: window.location.href }],
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
          showScreenSharingButton: true,
          showUserJoinAndLeave: false,
          onLeaveRoom: () => {
             try {
                chatAPI.sendMessage(`${user?.full_name || 'Member'} left the call`, 'system');
                sessionStorage.removeItem(`joined_${roomID}_${user.id}`);
             } catch (e) {
                console.error("Error sending leave message:", e);
             }
             setIsExiting(true); 
             setTimeout(() => navigate('/chat'), 300);
          }
        });
        setLoading(false);
      } catch (err) {
        console.error("ZegoCloud Join Error:", err);
        setError("Failed to join meeting room. Please try again.");
        setLoading(false);
      }
    };

    if (containerRef.current && !isInitialized.current) {
        initZego();
    }

    return () => {
       if (zp) {
           try { zp.destroy(); } catch (e) { console.error("SDK cleanup error:", e); }
           zp = null;
       }
    };
  }, [roomID, user, navigate]);

  return { containerRef, error, loading, isExiting };
};

export default useMeetingRoom;

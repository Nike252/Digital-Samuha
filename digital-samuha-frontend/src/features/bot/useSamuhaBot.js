import { useState, useEffect, useRef } from 'react';
import { subscriptionsAPI, chatAPI } from '../../utils/api';

const useSamuhaBot = (user) => {
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      sender: 'bot', 
      text: `Namaste! I am Samuha Bot, your Samuha AI Assistant. I have been trained on your group's specific rules, finances, and history. How can I help you today?`, 
      time: new Date().toLocaleTimeString() 
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPremium, setIsPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const res = await subscriptionsAPI.getCurrentSubscription();
        setIsPremium(res.data?.is_premium || false);
      } catch (err) {
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };
    checkPremium();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !isPremium) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    const promptToSend = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      const res = await chatAPI.askSamuhaAI(promptToSend);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.response,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm having trouble connecting to my brain right now. Please check your connection and try again.",
        time: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages, newMessage, setNewMessage, isTyping, isPremium, loading,
    messagesEndRef, handleSend
  };
};

export default useSamuhaBot;

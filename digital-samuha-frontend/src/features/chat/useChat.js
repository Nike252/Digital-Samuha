import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const useChat = (user, navigate) => {
  const { showToast } = useUI();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const isInitialMount = useRef(true);

  const fetchMessages = async () => {
    try {
      const res = await chatAPI.getMessages();
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: isInitialMount.current ? 'auto' : 'smooth' });
      setPrevMessageCount(messages.length);
    }
    if (isInitialMount.current && messages.length > 0) {
      isInitialMount.current = false;
    }
  }, [messages, prevMessageCount]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    setSending(true);
    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append('content', newMessage.trim());
      if (selectedFile) formData.append('attachment', selectedFile);

      await chatAPI.sendMessage(formData);
      setNewMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      await fetchMessages();
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startCall = (type) => {
    chatAPI.startCall(type);
    navigate(`/premium-meeting/${type}`);
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return {
    messages, newMessage, setNewMessage, loading, sending,
    selectedFile, filePreview, messagesEndRef, fileInputRef,
    handleFileChange, handleSend, clearFile, startCall, getAvatarColor
  };
};

export default useChat;

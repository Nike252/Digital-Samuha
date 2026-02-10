import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import useSamuhaBot from './useSamuhaBot';
import PremiumLockState from './PremiumLockState';
import BotHeader from './BotHeader';
import BotChatArea from './BotChatArea';

const SamuhaBot = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const {
    messages, newMessage, setNewMessage, isTyping, isPremium, loading,
    messagesEndRef, handleSend
  } = useSamuhaBot(user);

  if (loading) {
    return (
      <MainLayout user={user} onLogout={onLogout} userRole={user?.role}>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
           <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isPremium) {
    return (
      <MainLayout user={user} onLogout={onLogout} currentPath="/ai-assistant" userRole={user?.role}>
        <PremiumLockState onUpgrade={() => navigate('/settings')} />
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} onLogout={onLogout} currentPath="/ai-assistant" userRole={user?.role}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] sm:h-[calc(100vh-100px)] flex flex-col px-0 sm:px-4">
        <BotHeader samuhaName={user.samuha?.samuha_name} />
        <BotChatArea {...{ messages, isTyping, newMessage, setNewMessage, handleSend, messagesEndRef }} />
      </div>
    </MainLayout>
  );
};

export default SamuhaBot;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import useChat from './useChat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const GroupChat = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const {
    messages, newMessage, setNewMessage, loading, sending,
    selectedFile, filePreview, messagesEndRef, fileInputRef,
    handleFileChange, handleSend, clearFile, startCall, getAvatarColor
  } = useChat(user, navigate);

  return (
    <MainLayout user={user} onLogout={onLogout} currentPath="/group-chat" userRole={user?.role}>
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <ChatHeader samuhaName={user?.samuha?.name} onStartCall={startCall} />
        <ChatMessages {...{ messages, user, getAvatarColor, loading, messagesEndRef }} />
        <ChatInput {...{ newMessage, setNewMessage, sending, handleSend, selectedFile, filePreview, clearFile, fileInputRef, handleFileChange }} />
      </div>
    </MainLayout>
  );
};

export default GroupChat;

"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoginComponent from './components/LoginComponent';
import ChatComponent from './components/ChatComponent';
import ChannelList from './components/ChannelList';
import UserList from './components/UserList';
import DmListComponent from './components/DmListComponent';
import styles from './page.module.css';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const [token, setToken] = useState(null);
  const [selfUser, setSelfUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [availableChannels, setAvailableChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [dmConversations, setDmConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para a sidebar
  const chatComponentRef = useRef(null);

  // Função para abrir/fechar a sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLoginSuccess = useCallback((newToken) => {
    localStorage.setItem('chat_token', newToken);
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken);
      setSelfUser({ id: decoded.id, username: decoded.username });
    } catch (error) { console.error("Token inválido:", error); }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('chat_token');
    setToken(null);
    setSelfUser(null);
    setOnlineUsers([]);
    setAvailableChannels([]);
    setActiveChannel(null);
    setDmConversations([]);
    setUnreadCounts({});
  }, []);
  
  const handleSelectChannel = useCallback((channel) => {
    setActiveChannel(channel);
    setUnreadCounts(counts => ({ ...counts, [channel]: 0 }));
    setIsSidebarOpen(false); // Fecha a sidebar ao selecionar um canal
  }, []);

  const handleSelectUser = useCallback((userId) => {
    chatComponentRef.current?.startDmWith(userId);
    setIsSidebarOpen(false); // Fecha a sidebar ao iniciar uma DM
  }, []);
  
  const incrementUnreadCount = useCallback((channel) => {
    setActiveChannel(currentActiveChannel => {
      if (channel !== currentActiveChannel) {
        setUnreadCounts(counts => ({
          ...counts,
          [channel]: (counts[channel] || 0) + 1
        }));
      }
      return currentActiveChannel;
    });
  }, []);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('chat_token');
    if (storedToken) {
      handleLoginSuccess(storedToken);
    }
  }, [handleLoginSuccess]);

  if (!token) {
    const loginContainerStyle = { maxWidth: '400px', margin: '40px auto', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' };
    return ( <main style={loginContainerStyle}><h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Bem-vindo ao Chat</h1><LoginComponent onLoginSuccess={handleLoginSuccess} /></main> );
  }

  return (
    <>
      {isSidebarOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}
      <div className={styles.mainLayout}>
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
          <ChannelList channels={availableChannels} activeChannel={activeChannel} onSelectChannel={handleSelectChannel} unreadCounts={unreadCounts} />
          <DmListComponent conversations={dmConversations} activeChannel={activeChannel} onSelectChannel={handleSelectChannel} unreadCounts={unreadCounts} />
          <UserList users={onlineUsers} selfId={selfUser?.id} onUserClick={handleSelectUser} />
        </div>
        <div className={styles.chatArea}>
          <ChatComponent
            ref={chatComponentRef}
            token={token}
            selfUser={selfUser}
            onLogout={handleLogout}
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            setAvailableChannels={setAvailableChannels}
            setOnlineUsers={setOnlineUsers}
            setDmConversations={setDmConversations}
            incrementUnreadCount={incrementUnreadCount}
            onToggleSidebar={toggleSidebar}
          />
        </div>
      </div>
    </>
  );
}
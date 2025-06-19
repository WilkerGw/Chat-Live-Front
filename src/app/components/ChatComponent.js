"use client";
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { io } from 'socket.io-client';
import styles from './ChatComponent.module.css';
import Avatar from './Avatar';

const ChatComponent = forwardRef(function ChatComponent({ token, selfUser, onLogout, activeChannel, setActiveChannel, setAvailableChannels, setOnlineUsers, setDmConversations, incrementUnreadCount }, ref) {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Conectando...');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [dmUsers, setDmUsers] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messageAreaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startDmWith(targetUserId) {
      if (socket) {
        socket.emit('start_dm', targetUserId);
      }
    }
  }));

  useEffect(() => {
    const newSocket = io("http://localhost:3001", { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnectionStatus('Conectado!');
      newSocket.emit('get_dm_conversations');
    });

    newSocket.on('receiveMessage', (newMessage) => {
      if (newMessage.roomName !== activeChannel) {
        incrementUnreadCount(newMessage.roomName);
      }
      setTypingUsers(prev => prev.filter(u => u.id !== newMessage.user.id));
      setChatLog(prevLog => [...prevLog, newMessage]);
    });
    
    newSocket.on('onlineUsers', setOnlineUsers);
    newSocket.on('dm_conversations_list', setDmConversations);
    newSocket.on('dm_started', ({ roomName, users }) => {
      setActiveChannel(roomName);
      setDmUsers(users);
      newSocket.emit('get_dm_conversations');
    });
    newSocket.on('availableRooms', (rooms) => {
      setAvailableChannels(rooms);
      setActiveChannel(current => (!current && rooms.length > 0) ? rooms[0] : current);
    });
    newSocket.on('messageHistory', (history) => setChatLog(history || []));
    newSocket.on('userTyping', (typingUser) => setTypingUsers(prev => prev.some(u => u.id === typingUser.id) ? prev : [...prev, typingUser]));
    newSocket.on('userStoppedTyping', (stoppedUser) => setTypingUsers(prev => prev.filter(u => u.id !== stoppedUser.id)));
    newSocket.on('connect_error', (err) => {
      console.error("Erro de conexão:", err.message);
      setConnectionStatus(`Falha na conexão.`);
      if (err.message.includes("Token")) setTimeout(onLogout, 3000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, onLogout, setAvailableChannels, setActiveChannel, setOnlineUsers, setDmConversations, incrementUnreadCount]);

  useEffect(() => {
    if (socket && activeChannel) {
      if (!activeChannel.startsWith('dm-')) {
        socket.emit('joinRoom', activeChannel);
      }
      setChatLog([]);
      setTypingUsers([]);
      if (!activeChannel.startsWith('dm-')) {
        setDmUsers(null);
      }
    }
  }, [socket, activeChannel]);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!socket || !activeChannel) return;
    socket.emit('typing');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping');
    }, 1500);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && message.trim() && activeChannel) {
      socket.emit('sendMessage', message);
      socket.emit('stopTyping');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setMessage('');
    }
  };

  const getChannelDisplayName = () => {
    if (!activeChannel) return 'Nenhum';
    if (activeChannel.startsWith('dm-')) {
      const otherUser = dmUsers?.find(user => user.id !== selfUser?.id);
      return `DM com ${otherUser?.username || 'utilizador'}`;
    }
    return activeChannel;
  };

  const formatTypingUsers = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].username} está a digitar...`;
    if (typingUsers.length === 2) return `${typingUsers[0].username} e ${typingUsers[1].username} estão a digitar...`;
    return 'Vários utilizadores estão a digitar...';
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>{getChannelDisplayName()}</h2>
        <button onClick={onLogout} className={styles.logoutButton}>Sair</button>
      </div>
      <p className={styles.status}>Status: <span>{connectionStatus}</span></p>
      <div className={styles.messageArea} ref={messageAreaRef}>
        {chatLog.map((msg) => {
          const formatTimestamp = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };
          const isMyMessage = socket && msg.socketId === socket.id;
          return (
            <div key={msg.id} className={`${styles.messageContainer} ${isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer}`}>
              {!isMyMessage && <Avatar user={msg.user} />}
              <div className={`${styles.messageBubble} ${isMyMessage ? styles.myMessage : styles.otherMessage}`}>
                <div className={styles.messageMeta}>
                  {!isMyMessage && (<div className={styles.messageUsername}>{msg.user.username}</div>)}
                  <div className={styles.messageTimestamp}>{formatTimestamp(msg.createdAt)}</div>
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.typingIndicator}>{formatTypingUsers()}</div>
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input type="text" value={message} onChange={handleTyping} placeholder="Digite sua mensagem..." className={styles.messageInput}/>
        <button type="submit" className={styles.sendButton} disabled={!socket || !socket.connected || !activeChannel}>Enviar</button>
      </form>
    </div>
  );
});

// --- LINHA EM FALTA ADICIONADA AQUI ---
export default ChatComponent;
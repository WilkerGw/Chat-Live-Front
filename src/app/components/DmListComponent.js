"use client";
import styles from './DmListComponent.module.css';
import Avatar from './Avatar';

export default function DmListComponent({ conversations, activeChannel, onSelectChannel, unreadCounts }) {
  if (!conversations || conversations.length === 0) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mensagens Diretas</h2>
      <ul className={styles.list}>
        {conversations.map(({ roomName, otherUser }) => {
          if (!otherUser) return null;
          const count = unreadCounts[roomName] || 0;

          return (
            <li key={roomName}>
              <button
                className={`${styles.dmButton} ${roomName === activeChannel ? styles.active : ''}`}
                onClick={() => onSelectChannel(roomName)}
              >
                <div className={styles.userInfo}>
                  <Avatar user={otherUser} />
                  <span className={styles.username}>{otherUser.username}</span>
                </div>
                {count > 0 && <span className={styles.unreadBadge}>{count}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
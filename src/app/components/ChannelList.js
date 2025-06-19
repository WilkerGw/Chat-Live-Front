"use client";
import styles from './ChannelList.module.css';

export default function ChannelList({ channels, activeChannel, onSelectChannel, unreadCounts }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Canais</h2>
      <ul className={styles.list}>
        {channels.map((channel) => {
          const count = unreadCounts[channel] || 0;

          return (
            <li key={channel}>
              <button
                className={`${styles.channelButton} ${channel === activeChannel ? styles.active : ''}`}
                onClick={() => onSelectChannel(channel)}
              >
                <span className={styles.channelName}>{channel}</span>
                {count > 0 && <span className={styles.unreadBadge}>{count}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
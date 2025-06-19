"use client";
import styles from './UserList.module.css';
import Avatar from './Avatar'; // Importar o novo componente

export default function UserList({ users, selfId, onUserClick }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Utilizadores Online</h2>
      <ul className={styles.list}>
        {users.map((user) => {
          if (user.id === selfId) return null;
          
          return (
            <li key={user.id}>
              <button
                className={styles.userButton}
                onClick={() => onUserClick(user.id)}
              >
                <Avatar user={user} />
                {user.username}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
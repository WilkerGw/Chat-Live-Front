import styles from './Avatar.module.css';

export default function Avatar({ user }) {
  // Retorna um placeholder se o 'user' for nulo para evitar erros
  if (!user) {
    const style = { width: '40px', height: '40px' };
    return <div className={styles.avatar} style={style}>?</div>;
  }

  if (user.avatarUrl) {
    return (
      <img 
        src={user.avatarUrl} 
        alt={user.username} 
        className={styles.avatar}
      />
    );
  }

  // Fallback para a primeira letra do nome de utilizador
  const initial = user.username ? user.username.charAt(0).toUpperCase() : '?';
  return (
    <div className={styles.avatar}>
      <span className={styles.initial}>{initial}</span>
    </div>
  );
}
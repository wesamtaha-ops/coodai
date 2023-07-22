import { useState } from 'react';
import styles from './login.module.css'; // Import the CSS styles

const LoginForm = ({ onLogin, adminUsername, adminPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === adminUsername && password === adminPassword) {
      onLogin();
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <>
      <br /><br /><br /><br />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Username:
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Password:
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <button className={styles.button} type="submit">
            Login
          </button>
        </div>
      </form>
    </>
  ); 
};

export default LoginForm;

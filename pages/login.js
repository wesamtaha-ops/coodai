import { useState } from 'react';
import styles from './login.module.css'; // Import the CSS styles
const crypto = require('crypto');

const LoginForm = ({ onLogin, adminUsername, adminPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const COOKIE_EXPIRATION_TIME = 15 * 60 * 1000; // 20 minutes in milliseconds

  const generateHashedCookieName = () => {
    const timestamp = Date.now().toString();
    const hash = crypto.createHash('sha256').update(timestamp).digest('hex');
    return hash;
  };

  const setCookie = (name, value) => {
    const expirationDate = new Date(Date.now() + COOKIE_EXPIRATION_TIME);
    document.cookie = `ck=${value};Expires=${expirationDate.toUTCString()};`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === adminUsername && password === adminPassword) {
      const hashedCookieName = generateHashedCookieName();
      setCookie('ck', hashedCookieName);
      onLogin();
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <form className={styles.form} onSubmit={handleSubmit}>
        <img
          src='https://magazine.altherr.de/wp-content/uploads/2022/09/ALTHERR_Logo.png'
          width={200}
          style={{ marginTop: 25, alignSelf: 'center', marginBottom: 0 }}
        />
        <br />
        <br />
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Username:
            <input
              className={styles.input}
              type='text'
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
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <button className={styles.button} type='submit'>
            Login
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;

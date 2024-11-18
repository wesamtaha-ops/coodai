// components/Navbar.js

import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = ({ clientFolder }) => {
    const handleLogout = () => {
        // For simplicity, let's assume the login status is stored in a session cookie
        document.cookie = 'ck=false; Max - Age=-99999999; ';
        document.cookie = 'ck=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setTimeout(() => {
            window.location.reload(); // Redirect to the login page after logout
        }, 1000);
    };
    return (
        <nav className={`navbar navbar-expand-lg navbar-light bg-light ${styles.navbar}`}>
            <div className={`container d-flex justify-content-between align-items-center`}>
                <Link href={`/my-account/${clientFolder}`} passHref>
                    <span className={`navbar-brand ${styles['navbar-brand']}`}>ALTHERR AI</span>
                </Link>

                <div className={`d-flex justify-content-end align-items-center ${styles['navbar-nav']}`}>
                    <button onClick={() => {
                        handleLogout()
                    }} className={`btn btn-primary ${styles['btn-primary']}`}>Logout</button>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;

// components/Navbar.js

import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = ({ clientFolder }) => {
    return (
        <nav className={`navbar navbar-expand-lg navbar-light bg-light ${styles.navbar}`}>
            <div className={`container d-flex justify-content-between align-items-center`}>
                <Link href={`/my-account/${clientFolder}`} passHref>
                    <span className={`navbar-brand ${styles['navbar-brand']}`}>stc</span>
                </Link>

                <div className={`d-flex justify-content-end align-items-center ${styles['navbar-nav']}`}>
                    <Link href={`/my-account/${clientFolder}`} passHref>
                        <button className={`btn btn-primary ${styles['btn-primary']}`}>Logout</button>
                    </Link>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;

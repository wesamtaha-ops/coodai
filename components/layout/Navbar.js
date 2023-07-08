// components/Navbar.js

import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = ({ clientFolder }) => {
    return (
        <nav className={`navbar navbar-expand-lg navbar-light bg-light ${styles.navbar}`}>
            <div className={`container d-flex justify-content-between align-items-center`}>
                <Link href="/" passHref>
                    <span className={`navbar-brand ${styles['navbar-brand']}`}>COODAI</span>
                </Link>
                <div className={`d-flex justify-content-center align-items-center ${styles['navbar-nav']}`}>
                    <ul className={`navbar-nav`}>
                        <li className={`nav-item ${styles['nav-item']}`}>
                            <Link href="/" passHref>
                                <div className={`nav-link ${styles['nav-link']}`}>Home</div>
                            </Link>
                        </li>
                        <li className={`nav-item ${styles['nav-item']}`}>
                            <Link href="/use-cases" passHref>
                                <div className={`nav-link ${styles['nav-link']}`}>Use Cases</div>
                            </Link>
                        </li>
                        <li className={`nav-item ${styles['nav-item']}`}>
                            <Link href="/docs" passHref>
                                <div className={`nav-link ${styles['nav-link']}`}>Examples</div>
                            </Link>
                        </li>
                        <li className={`nav-item ${styles['nav-item']}`}>
                            <Link href="/pricing" passHref>
                                <div className={`nav-link ${styles['nav-link']}`}>Pricing</div>
                            </Link>
                        </li>
                        <li className={`nav-item ${styles['nav-item']}`}>
                            <Link href="/docs" passHref>
                                <div className={`nav-link ${styles['nav-link']}`}>Guide</div>
                            </Link>
                        </li>
                        <li className={`nav-item ${styles['nav-item']}`}>
                            <Link href="/faqs" passHref>
                                <div className={`nav-link ${styles['nav-link']}`}>FAQs</div>
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className={`d-flex justify-content-end align-items-center ${styles['navbar-nav']}`}>
                    <Link href={`/my-account/${clientFolder}`} passHref>
                        <button className={`btn btn-primary ${styles['btn-primary']}`}>My Account</button>
                    </Link>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;

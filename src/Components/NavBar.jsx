import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Navbar.css';
import Logo from '../Assets/logo.png'; // Import du logo SVG

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <img src={Logo} alt="KaraScolaire Logo" className="navbar-logo" aria-label="KaraScolaire Logo" />
                    <Link to="/">KaraScolaire</Link>
                </div>
                <button 
                    className={`hamburger ${isOpen ? 'open' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
                    <li><Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link></li>
                    <li><Link to="/about" onClick={() => setIsOpen(false)}>À propos</Link></li>
                    <li><Link to="/services" onClick={() => setIsOpen(false)}>Services</Link></li>
                    <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
                    <li><Link to="/login" onClick={() => setIsOpen(false)}>Connexion</Link></li>
                    <li><Link to="/register" className="signup-btn" onClick={() => setIsOpen(false)}>Inscription</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
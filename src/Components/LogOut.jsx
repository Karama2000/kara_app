import React from 'react';
import { useNavigate } from 'react-router-dom'; // Utilisation de useNavigate pour la redirection
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importer FontAwesomeIcon
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Importer l'icône de déconnexion
import '../Styles/Logout.css';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Supprimer les informations de l'utilisateur dans localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Rediriger l'utilisateur vers la page de connexion
        navigate('/');
    };

    return (
        <div className="logout-container">
            <button onClick={handleLogout} className="logout-btn">
                <FontAwesomeIcon icon={faSignOutAlt} size="2x" /> {/* Icône de déconnexion */}
            </button>
        </div>
    );
};

export default LogoutButton;

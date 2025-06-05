// src/Components/UnitDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../Styles/UnitDetails.css';

const UnitDetails = () => {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }
        console.log('Token:', token);
        console.log(`Fetching unit with ID: ${id}`);

        const response = await axios.get(`https://kara-back.onrender.com/api/units/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Unit data received:', response.data);
        setUnit(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'unité', error);
        if (error.response?.status === 401) {
          console.log('Unauthorized: Invalid or expired token');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Unité non trouvée.');
        } else {
          setError(error.response?.data?.message || 'Impossible de charger l\'unité.');
        }
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id, navigate]);

  const goBack = () => {
    navigate('/manage-units');
  };

  return (
    <div className="unit-details-container">
      <FontAwesomeIcon
        icon={faArrowLeft}
        className="back-icon"
        onClick={goBack}
      />
      <h2>Détails de l'Unité</h2>

      {loading && <div className="loading">Chargement...</div>}
      {error && <div className="error">{error}</div>}

      {unit && (
        <div className="unit-details">
          <div className="detail-group">
            <label>Titre :</label>
            <p>{unit.title}</p>
          </div>
          <div className="detail-group">
            <label>Programme :</label>
            <p>
              {unit.programId?.title || 'Non spécifié'} (
              {unit.programId?.niveauId?.nom || 'Niveau non spécifié'})
            </p>
          </div>
          <div className="detail-group">
            <label>Description :</label>
            <p>{unit.description || 'Aucune description'}</p>
          </div>
          <button onClick={goBack} className="back-btn">
          🏠 Retour
          </button>
        </div>
      )}
    </div>
  );
};

export default UnitDetails;

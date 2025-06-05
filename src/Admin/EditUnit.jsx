// EditUnit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import unitIllustration from '../Assets/images/dashboard/learning-unit.avif';
import submitIcon from '../Assets/images/dashboard/submit.avif';

const EditUnit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    programId: '',
    title: '',
    description: '',
  });
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTokenOrRedirect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  const fetchUnit = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      const response = await axios.get(`https://kara-back.onrender.com/api/units/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        programId: response.data.programId?._id || response.data.programId || '',
        title: response.data.title || '',
        description: response.data.description || '',
      });
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'unité', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Impossible de charger l\'unité.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchPrograms = useCallback(async () => {
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      const response = await axios.get('https://kara-back.onrender.com/api/admin/programs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des programmes', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Impossible de charger les programmes.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchUnit();
    fetchPrograms();
  }, [fetchUnit, fetchPrograms]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      await axios.put(`https://kara-back.onrender.com/api/units/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Unité mise à jour avec succès');
      navigate('/manage-units');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'unité', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'unité');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate('/manage-units');

  if (loading) {
    return <div className="text-center py-10 text-xl">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-white to-purple-50 py-10 px-4 flex flex-col items-center">
      <div
        className="absolute left-6 top-6 cursor-pointer text-purple-600 hover:text-purple-900 transition"
        onClick={goBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} size="2x" />
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-3xl w-full">
        <img src={unitIllustration} alt="Unité" className="rounded-xl w-full h-48 object-cover mb-6" />

        <h2 className="text-3xl font-semibold text-center text-purple-800 mb-6">Modifier l'Unité</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Programme</label>
            <select
              name="programId"
              value={formData.programId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Sélectionner un programme</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.title} ({program.niveauId?.nom || 'Niveau non spécifié'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Titre</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition shadow-md"
          >
            <img src={submitIcon} alt="Soumettre" className="w-5 h-5" />
            Mettre à jour l'Unité
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUnit;

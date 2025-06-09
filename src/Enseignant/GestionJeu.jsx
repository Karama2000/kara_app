import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/GestionJeux.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const api = axios.create({
  baseURL: 'https://kara-back.onrender.com',
});

// Add Axios interceptors for request and response handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', token); // Debug token
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized:', error.response.data.message);
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      return Promise.reject(new Error('Session expirée, veuillez vous reconnecter.'));
    }
    return Promise.reject(error);
  }
);

const GestionJeu = () => {
  const [sections, setSections] = useState([]);
  const [games, setGames] = useState([]);
  const [newSection, setNewSection] = useState({ name: '', image: null });
  const [editSection, setEditSection] = useState(null);
  const [newGame, setNewGame] = useState({ name: '', image: null, url: '', section: '' });
  const [editGame, setEditGame] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté');
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, gamesRes] = await Promise.all([
        api.get('/api/game/sections'),
        api.get('/api/game/games'),
      ]);
      setSections(sectionsRes.data);
      setGames(gamesRes.data);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddSection = async () => {
    if (!newSection.name) {
      setError('Le nom de la section est requis');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newSection.name);
      if (newSection.image) formData.append('image', newSection.image);
      await api.post('/api/game/sections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewSection({ name: '', image: null });
      document.getElementById('section-image-input').value = '';
      fetchData();
      alert('Section ajoutée avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout de la section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editSection?.name) {
      setError('Le nom de la section est requis');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', editSection.name);
      if (editSection.image instanceof File) formData.append('image', editSection.image);
      await api.put(`/api/game/sections/${editSection._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditSection(null);
      document.getElementById('section-image-input').value = '';
      fetchData();
      alert('Section mise à jour avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour de la section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette section et ses jeux associés ?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/game/sections/${sectionId}`);
      fetchData();
      alert('Section supprimée avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression de la section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async () => {
    if (!newGame.name || !newGame.url || !newGame.section) {
      setError('Les champs nom, URL et section sont requis');
      return;
    }
    if (!validateUrl(newGame.url)) {
      setError('L\'URL du jeu est invalide');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newGame.name);
      if (newGame.image) formData.append('image', newGame.image);
      formData.append('url', newGame.url);
      formData.append('section', newGame.section);
      await api.post('/api/game/games', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewGame({ name: '', image: null, url: '', section: '' });
      document.getElementById('game-image-input').value = '';
      fetchData();
      alert('Jeu ajouté avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout du jeu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGame = async () => {
    if (!editGame?.name || !editGame?.url || !editGame?.section) {
      setError('Les champs nom, URL et section sont requis');
      return;
    }
    if (!validateUrl(editGame.url)) {
      setError('L\'URL du jeu est invalide');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', editGame.name);
      if (editGame.image instanceof File) formData.append('image', editGame.image);
      formData.append('url', editGame.url);
      formData.append('section', editGame.section);
      await api.put(`/api/game/games/${editGame._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditGame(null);
      document.getElementById('game-image-input').value = '';
      fetchData();
      alert('Jeu mis à jour avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du jeu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce jeu et ses scores associés ?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/game/games/${gameId}`);
      fetchData();
      alert('Jeu supprimé avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression du jeu');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/teacher-dashboard');
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-700">Gestion des Jeux Éducatifs</h1>
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> 🏠 Retour
          </button>
        </div>

        {/* Scores Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/suivre-scores')}
            className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Voir les scores des élèves
          </button>
        </div>

        {/* Error and Loading */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-pulse">
            <p>{error}</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
            <p className="text-purple-600 font-medium">Chargement...</p>
          </div>
        )}

        {/* Add/Edit Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-4 border-green-200 transform hover:scale-[1.01] transition-all duration-200">
          <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
            {editSection ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier Section
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter Section
              </>
            )}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la section</label>
              <input
                type="text"
                value={editSection ? editSection.name : newSection.name}
                onChange={(e) =>
                  editSection
                    ? setEditSection({ ...editSection, name: e.target.value })
                    : setNewSection({ ...newSection, name: e.target.value })
                }
                placeholder="Ex: Mathématiques, Français..."
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image de la section</label>
              {editSection && editSection.image && !(editSection.image instanceof File) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Image actuelle :</p>
                  <img
                    src={`${api.defaults.baseURL}${editSection.image}`}
                    alt="Section"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex items-center">
                <label
                  htmlFor="section-image-input"
                  className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg border-2 border-dashed border-blue-300 flex items-center transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {(editSection?.image instanceof File
                    ? editSection.image.name
                    : newSection.image?.name) || 'Choisir une image'}
                </label>
                <input
                  id="section-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    editSection
                      ? setEditSection({ ...editSection, image: e.target.files[0] || null })
                      : setNewSection({ ...newSection, image: e.target.files[0] || null })
                  }
                  className="hidden"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={editSection ? handleUpdateSection : handleAddSection}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:shadow-lg"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editSection ? 'Mettre à jour' : 'Ajouter Section'}
              </button>

              {editSection && (
                <button
                  type="button"
                  onClick={() => setEditSection(null)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:shadow-lg"
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Game */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-4 border-orange-200 transform hover:scale-[1.01] transition-all duration-200">
          <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center">
            {editGame ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier Jeu
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter Jeu
              </>
            )}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du jeu</label>
              <input
                type="text"
                value={editGame ? editGame.name : newGame.name}
                onChange={(e) =>
                  editGame
                    ? setEditGame({ ...editGame, name: e.target.value })
                    : setNewGame({ ...newGame, name: e.target.value })
                }
                placeholder="Ex: Addition facile, Mots croisés..."
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image du jeu</label>
              {editGame && editGame.image && !(editGame.image instanceof File) && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Image actuelle :</p>
                  <img
                    src={`${api.defaults.baseURL}${editGame.image}`}
                    alt="Jeu"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex items-center">
                <label
                  htmlFor="game-image-input"
                  className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg border-2 border-dashed border-blue-300 flex items-center transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {(editGame?.image instanceof File
                    ? editGame.image.name
                    : newGame.image?.name) || 'Choisir une image'}
                </label>
                <input
                  id="game-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    editGame
                      ? setEditGame({ ...editGame, image: e.target.files[0] || null })
                      : setNewGame({ ...newGame, image: e.target.files[0] || null })
                  }
                  className="hidden"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL du jeu</label>
              <input
                type="url"
                value={editGame ? editGame.url : newGame.url}
                onChange={(e) =>
                  editGame
                    ? setEditGame({ ...editGame, url: e.target.value })
                    : setNewGame({ ...newGame, url: e.target.value })
                }
                placeholder="https://..."
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={editGame ? editGame.section : newGame.section}
                onChange={(e) =>
                  editGame
                    ? setEditGame({ ...editGame, section: e.target.value })
                    : setNewGame({ ...newGame, section: e.target.value })
                }
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Sélectionner une section</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={editGame ? handleUpdateGame : handleAddGame}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:shadow-lg"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editGame ? 'Mettre à jour' : 'Ajouter Jeu'}
              </button>

              {editGame && (
                <button
                  type="button"
                  onClick={() => setEditGame(null)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:shadow-lg"
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sections and Games List */}
        <div className="bg-white rounded-xl shadow-md p-6 border-4 border-purple-200">
          <h3 className="text-2xl font-bold text-purple-600 mb-6 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Sections et Jeux
          </h3>

          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section._id}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200"
              >
                <div
                  className="flex justify-between items-center mb-3 cursor-pointer"
                  onClick={() => toggleSection(section._id)}
                >
                  <div className="flex items-center space-x-4">
                    {section.image && (
                      <img
                        src={`${api.defaults.baseURL}${section.image}`}
                        alt={section.name}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    )}
                    <h4 className="text-xl font-semibold text-blue-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      {section.name}
                      <FontAwesomeIcon
                        icon={expandedSection === section._id ? faChevronUp : faChevronDown}
                        className="ml-2 text-gray-600"
                      />
                    </h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditSection(section);
                      }}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded-lg flex items-center transition-colors duration-200"
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section._id);
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded-lg flex items-center transition-colors duration-200"
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>

                {expandedSection === section._id && (
                  <div className="ml-6 space-y-2">
                    {games
                      .filter((game) => game.section?._id?.toString() === section._id.toString())
                      .map((game) => (
                        <div
                          key={game._id}
                          className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            {game.image && (
                              <img
                                src={`${api.defaults.baseURL}${game.image}`}
                                alt={game.name}
                                className="h-12 w-12 object-cover rounded-md"
                              />
                            )}
                            <span className="font-medium text-gray-700 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-yellow-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                              </svg>
                              {game.name}
                            </span>
                            <a
                              href={game.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              Ouvrir le jeu
                            </a>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setEditGame({
                                  ...game,
                                  section: game.section?._id || '',
                                })
                              }
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded-lg flex items-center transition-colors duration-200"
                              disabled={loading}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game._id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded-lg flex items-center transition-colors duration-200"
                              disabled={loading}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    {games.filter((game) => game.section?._id?.toString() === section._id.toString()).length === 0 && (
                      <p className="text-gray-500 italic">Aucun jeu dans cette section.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {sections.length === 0 && (
              <p className="text-gray-500 italic">Aucune section disponible. Ajoutez une section pour commencer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionJeu;
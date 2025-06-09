import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/StudentJeu.css';

const api = axios.create({
  baseURL: 'https://kara-back.onrender.com',
});

const StudentJeu = () => {
  const [sections, setSections] = useState([]);
  const [games, setGames] = useState([]);
  const [scores, setScores] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await api.get('/api/student/game/sections', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSections(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des sections');
    }
  };

  const handleSectionClick = async (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedGame(null);
    setScores([]);
    try {
      const res = await api.get(`/api/student/games/section/${sectionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGames(res.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des jeux');
    }
  };

  const handlePlayGame = async (game) => {
    window.open(game.url, '_blank');
    setSelectedGame(game);
    try {
      const res = await api.get('/api/student/scores/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { gameId: game._id },
      });
      setScores(res.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des scores');
    }
  };

  const handleScreenshotUpload = async () => {
    if (!screenshot || !selectedGame) {
      setError('Veuillez sélectionner une capture d’écran et un jeu');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(screenshot.type)) {
      setError('Seuls les fichiers JPEG, PNG et WEBP sont autorisés');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('gameId', selectedGame._id);
      formData.append('screenshot', screenshot);
      await api.post('/api/student/game/score', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setScreenshot(null);
      setSelectedGame(null);
      document.getElementById('screenshot-input').value = '';
      setError('');
      alert('Capture de score soumise avec succès');
      const res = await api.get('/api/student/scores/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { gameId: selectedGame._id },
      });
      setScores(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’envoi de la capture');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          title="Retour au tableau de bord"
        >
          🏠 Retour
        </button>
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Jeux Éducatifs
        </h2>
        <button
          onClick={() => navigate('/mes-scores')} // Changed from /student/games to /mes-scores
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Voir mes scores
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}

      {/* Sections */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-indigo-800 mb-4">Choisis une catégorie :</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {sections.map((section) => (
            <button
              key={section._id}
              onClick={() => handleSectionClick(section._id)}
              className={`flex items-center p-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${
                selectedSection === section._id 
                  ? 'bg-purple-600 text-white border-2 border-yellow-300' 
                  : 'bg-white text-purple-800 border-2 border-transparent hover:border-purple-300'
              }`}
            >
              {section.image && (
                <img
                  src={`https://kara-back.onrender.com${section.image}`}
                  alt={section.name}
                  className="w-12 h-12 mr-3 object-contain"
                />
              )}
              <span className="font-bold">{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-indigo-800 mb-6">Choisis ton jeu :</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <div 
              key={game._id} 
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={`https://kara-back.onrender.com${game.image}`}
                alt={game.name}
                className="w-full h-48 object-contain bg-indigo-50 p-4"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-purple-800 mb-3">{game.name}</h3>
                <button
                  onClick={() => handlePlayGame(game)}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
                >
                  Jouer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshot Upload Section */}
      {selectedGame && (
        <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-6 mb-10">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            Soumettre une capture d'écran pour <span className="text-pink-600">{selectedGame.name}</span>
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label className="flex-1 bg-white p-4 rounded-lg border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50 transition-colors duration-300">
              <input
                id="screenshot-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setScreenshot(e.target.files[0] || null)}
                className="hidden"
              />
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-blue-700 font-medium">
                  {screenshot ? screenshot.name : "Clique pour choisir une image"}
                </span>
              </div>
            </label>
            <button
              onClick={handleScreenshotUpload}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105"
            >
              Soumettre
            </button>
          </div>
        </div>
      )}

      {/* Scores Section */}
      {selectedGame && scores.length > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 shadow-inner">
          <h3 className="text-2xl font-bold text-purple-800 mb-6">
            Mes scores pour <span className="text-indigo-600">{selectedGame.name}</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Capture d'écran</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scores.map((score) => (
                  <tr key={score._id} className="hover:bg-purple-50 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <a
                        href={`https://kara-back.onrender.com${score.screenshot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <img
                          src={`https://kara-back.onrender.com${score.screenshot}`}
                          alt="Score screenshot"
                          className="w-24 h-auto rounded border-2 border-purple-200 hover:border-purple-400 transition-colors duration-300"
                        />
                      </a>
                    </td>
                    <td className="py-4 px-4 text-purple-900 font-medium">
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        score.reviewed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {score.reviewed ? 'Revu ✓' : 'En attente...'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJeu;
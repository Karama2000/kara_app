import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/SuivreScore.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'https://kara-back.onrender.com',
});

const SuivreScore = ({ userId }) => {
  const [scores, setScores] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesRes = await api.get('/api/game/games', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setGames(gamesRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des jeux');
      }
    };
    fetchGames();
  }, [userId]);

  const handleGameSelect = async (gameId) => {
    setSelectedGame(gameId);
    try {
      const res = await api.get(`/api/game/scores/game/${gameId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setScores(res.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des scores');
    }
  };

  const handleMarkReviewed = async (scoreId) => {
    try {
      await api.put(`/api/game/scores/${scoreId}/review`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setScores(scores.map((score) =>
        score._id === scoreId ? { ...score, reviewed: true } : score
      ));
      alert('Score marqué comme revu');
    } catch (err) {
      setError('Erreur lors de la mise à jour du score');
    }
  };
  const handleBackToDashboard = () => {
    navigate('/teacher-dashboard');
  };
return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">
          <span className="inline-block mr-2">🎮</span>
          Suivi des Scores des Élèves
          <span className="inline-block ml-2">🏆</span>
        </h1>
        {error && (
          <p className="text-red-500 bg-red-100 p-3 rounded-lg inline-block animate-shake">
            ⚠️ {error}
          </p>
        )}
        <button
                    onClick={handleBackToDashboard}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />           🏠 Retour

                  </button>
      </div>

      <div className="mb-8 flex justify-center">
        <select
          value={selectedGame}
          onChange={(e) => handleGameSelect(e.target.value)}
          className="px-6 py-3 rounded-full bg-white border-2 border-yellow-400 text-purple-800 font-bold shadow-lg hover:bg-yellow-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]"
          style={{ backgroundSize: '20px' }}
        >
          <option value="" className="text-purple-800">Sélectionner un jeu</option>
          {games.map((game) => (
            <option key={game._id} value={game._id} className="text-purple-800">
              {game.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-purple-300 animate-float">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <tr>
              <th className="py-4 px-6 text-left rounded-tl-3xl font-bold text-lg">👦 Élève</th>
              <th className="py-4 px-6 text-left font-bold text-lg">📸 Capture d'écran</th>
              <th className="py-4 px-6 text-left font-bold text-lg">📅 Date</th>
              <th className="py-4 px-6 text-left font-bold text-lg">🔍 Statut</th>
              <th className="py-4 px-6 text-left rounded-tr-3xl font-bold text-lg">✨ Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {scores.map((score) => (
              <tr key={score._id} className="hover:bg-purple-50 transition-colors duration-200">
                <td className="py-4 px-6 font-medium text-purple-900">
                  <div className="flex items-center">
                    <span className="bg-yellow-200 p-2 rounded-full mr-3">👧</span>
                    <span>{`${score.user?.prenom} ${score.user?.nom}`}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <a
                    href={`https://kara-back.onrender.com${score.screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transform hover:scale-105 transition-transform duration-200"
                  >
                    <img
                      src={`https://kara-back.onrender.com${score.screenshot}`}
                      alt="Score screenshot"
                      className="w-24 h-auto rounded-lg border-2 border-purple-200 shadow-md"
                    />
                  </a>
                </td>
                <td className="py-4 px-6 text-purple-800">
                  <div className="flex items-center">
                    <span className="bg-blue-100 p-2 rounded-full mr-3">🗓️</span>
                    <span>{new Date(score.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {score.reviewed ? (
                    <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Revu ✅
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      En attente ⏳
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {!score.reviewed ? (
                    <button
                      onClick={() => handleMarkReviewed(score._id)}
                      className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 flex items-center"
                    >
                      <span className="mr-2">✏️</span>
                      Marquer comme revu
                    </button>
                  ) : (
                    <span className="text-green-600 font-bold flex items-center">
                      <span className="text-2xl mr-2">🎉</span>
                      Bravo!
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

export default SuivreScore;
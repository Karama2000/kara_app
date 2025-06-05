import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/ScoreGame.css';

const api = axios.create({
  baseURL: 'https://kara-back.onrender.com',
});

const ScoreGame = ({ userId }) => {
  const [scores, setScores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresRes = await api.get('/api/student/scores/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setScores(scoresRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des scores');
      }
    };
    fetchScores();
  }, [userId]);

 return (
  <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-pink-100 p-6">
    <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
        Mes Scores 🏆
      </span>
    </h2>
    
    {error && (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-bounce">
        <p className="font-medium">{error}</p>
      </div>
    )}

    <div className="overflow-x-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-6xl mx-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <th className="py-3 px-4 text-left rounded-tl-xl">Jeu 🎮</th>
            <th className="py-3 px-4 text-left">Capture d'écran 📸</th>
            <th className="py-3 px-4 text-left">Date 📅</th>
            <th className="py-3 px-4 text-left rounded-tr-xl">Statut 🏷️</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {scores.map((score) => (
            <tr 
              key={score._id} 
              className="hover:bg-purple-50 transition-colors duration-150"
            >
              <td className="py-4 px-4 font-medium text-indigo-700">
                {score.game?.name || "Jeu inconnu"}
              </td>
              <td className="py-4 px-4">
                <a
                  href={`https://kara-back.onrender.com${score.screenshot}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transform hover:scale-105 transition-transform"
                >
                  <div className="relative group">
                    <img
                      src={`https://kara-back.onrender.com${score.screenshot}`}
                      alt="Score screenshot"
                      className="w-24 h-auto rounded-lg border-2 border-purple-200 shadow-sm group-hover:border-purple-400 transition-colors"
                    />
                    <div className="absolute inset-0 bg-purple-500 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-bold bg-purple-600 px-2 py-1 rounded-lg text-xs transition-opacity">
                        Voir en grand
                      </span>
                    </div>
                  </div>
                </a>
              </td>
              <td className="py-4 px-4 text-gray-600">
                {new Date(score.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  score.reviewed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {score.reviewed ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Revu ✅
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      En attente ⏳
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {scores.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">😢</span>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Aucun score enregistré
          </h3>
          <p className="text-gray-500">
            Jouez à des jeux pour voir vos scores apparaître ici !
          </p>
        </div>
      )}
    </div>
  </div>
);
};

export default ScoreGame;
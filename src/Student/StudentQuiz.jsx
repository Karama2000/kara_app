import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/StudentQuizzes.css';

const StudentQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [quizzes, setQuizzes] = useState({ facile: [], moyen: [], difficile: [] });
  const [unlockedLevels, setUnlockedLevels] = useState({ facile: true, moyen: false, difficile: false });
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await axios.get('https://kara-back.onrender.com/api/student/quizs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Quizzes response:', response.data);
      setQuizzes(response.data.quizzes);
      setUnlockedLevels(response.data.unlockedLevels);
      setError('');
      setWarning('');
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Impossible de charger les quiz');
      }
    }
  }, [token, navigate]);

  useEffect(() => {
  if (!token) {
    navigate('/login');
  } else {
    fetchQuizzes();
  }
}, [token, navigate, fetchQuizzes, location.state?.refresh]); // Keep location.state.refresh
  const selectQuiz = (quizId) => {
    navigate(`/student/quizs/play/${quizId}`);
  };
 const goBack = () => {
    navigate('/student-dashboard');
  };
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header */}
      <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
        Liste des Quiz
      </h2>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md" aria-live="assertive">
          {error}
        </div>
      )}
      {warning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg shadow-md" aria-live="polite">
          {warning}
        </div>
      )}

      {/* Quiz Selection */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8">
          <button 
            onClick={goBack} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center"
            title="Retour"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
                      🏠 Retour

          </button>
        </div>

        {/* Easy Quizzes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
            <h3 className="text-xl font-bold text-white">Quiz Facile</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {quizzes.facile.map((quiz) => (
              <li key={quiz._id} className="p-4 hover:bg-green-50 transition-colors duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-bold text-lg text-gray-800">{quiz.titre}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {quiz.submissions?.length > 0 ? (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        Complété ({quiz.submissions[quiz.submissions.length - 1].percentage.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800">
                        Non complété
                      </span>
                    )}
                    <button
                      onClick={() => selectQuiz(quiz._id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                      aria-label={`Jouer le quiz ${quiz.titre}`}
                    >
                      {quiz.submissions?.length > 0 ? 'Voir/Réessayer' : 'Commencer'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Medium Quizzes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`p-4 ${unlockedLevels.moyen ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
            <h3 className="text-xl font-bold text-white">
              Quiz Moyen {!unlockedLevels.moyen && <span className="text-yellow-200">(Verrouillé)</span>}
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {quizzes.moyen.map((quiz) => (
              <li key={quiz._id} className="p-4 hover:bg-yellow-50 transition-colors duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-bold text-lg text-gray-800">{quiz.titre}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {quiz.submissions?.length > 0 ? (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        Complété ({quiz.submissions[quiz.submissions.length - 1].percentage.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800">
                        Non complété
                      </span>
                    )}
                    <button
                      onClick={() => selectQuiz(quiz._id)}
                      disabled={!unlockedLevels.moyen}
                      className={`px-4 py-2 font-bold rounded-lg shadow-md transition-all duration-300 ${
                        unlockedLevels.moyen
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      aria-label={`Jouer le quiz ${quiz.titre}`}
                    >
                      {quiz.submissions?.length > 0 ? 'Voir/Réessayer' : 'Commencer'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Hard Quizzes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`p-4 ${unlockedLevels.difficile ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
            <h3 className="text-xl font-bold text-white">
              Quiz Difficile {!unlockedLevels.difficile && <span className="text-yellow-200">(Verrouillé)</span>}
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {quizzes.difficile.map((quiz) => (
              <li key={quiz._id} className="p-4 hover:bg-red-50 transition-colors duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-bold text-lg text-gray-800">{quiz.titre}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {quiz.submissions?.length > 0 ? (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        Complété ({quiz.submissions[quiz.submissions.length - 1].percentage.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800">
                        Non complété
                      </span>
                    )}
                    <button
                      onClick={() => selectQuiz(quiz._id)}
                      disabled={!unlockedLevels.difficile}
                      className={`px-4 py-2 font-bold rounded-lg shadow-md transition-all duration-300 ${
                        unlockedLevels.difficile
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      aria-label={`Jouer le quiz ${quiz.titre}`}
                    >
                      {quiz.submissions?.length > 0 ? 'Voir/Réessayer' : 'Commencer'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentQuiz;
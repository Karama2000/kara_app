import React, { useState, useEffect, useCallback } from 'react';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm';
import { useNavigate } from 'react-router-dom';
import '../Styles/StudentResult.css';

const StudentResult = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [quizResults, setQuizResults] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [gameScores, setGameScores] = useState([]);
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch Quiz Results
      const quizResponse = await axios.get('https://kara-back.onrender.com/api/student/quizs', config);
      const quizzes = [
        ...(quizResponse.data.quizzes?.facile || []),
        ...(quizResponse.data.quizzes?.moyen || []),
        ...(quizResponse.data.quizzes?.difficile || []),
      ].filter(quiz => quiz.submissions?.length > 0);
      setQuizResults(quizzes);

      // Fetch Lesson Progress
      const lessonResponse = await axios.get('https://kara-back.onrender.com/api/student/lessons', config);
      setLessonProgress(lessonResponse.data);

      // Fetch Game Scores
      const scoreResponse = await axios.get('https://kara-back.onrender.com/api/student/scores/user', config);
      setGameScores(scoreResponse.data);

      // Fetch Test Submissions
      const testResponse = await axios.get('https://kara-back.onrender.com/api/student/tests', config);
      setTestSubmissions(testResponse.data.filter(test => test.submission));

      setError('');
    } catch (error) {
      console.error('Error fetching results:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { state: { error: 'Session expirée, veuillez vous reconnecter.' } });
      } else {
        setError(error.response?.data?.message || 'Erreur lors du chargement des résultats.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { error: 'Vous devez être connecté.' } });
    } else {
      fetchResults();
    }
  }, [token, navigate, fetchResults]);

  const openModal = (type, data) => {
    setModalContent({ type, data });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const goBack = () => {
    navigate('/student-dashboard');
  };

  const renderModalContent = () => {
    if (!modalContent) return null;

    switch (modalContent.type) {
      case 'quiz':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4">Résultats des Quiz</h3>
            {modalContent.data.length === 0 ? (
              <p className="text-gray-500 italic">Aucun résultat de quiz disponible.</p>
            ) : (
              <ul className="space-y-4">
                {modalContent.data.map(quiz => (
                  <li key={quiz._id} className="p-4 bg-white rounded-lg shadow-md">
                    <p className="font-bold text-lg text-gray-800">{quiz.titre}</p>
                    <p className="text-gray-600">Difficulté: {quiz.difficulty}</p>
                    <p className="text-gray-600">
                      Score: {quiz.submissions[quiz.submissions.length - 1].score}/{quiz.submissions[quiz.submissions.length - 1].total} (
                      {quiz.submissions[quiz.submissions.length - 1].percentage.toFixed(2)}%)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'lesson':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4">Avancement des Cours</h3>
            {modalContent.data.length === 0 ? (
              <p className="text-gray-500 italic">Aucun progrès de leçon disponible.</p>
            ) : (
              <ul className="space-y-4">
                {modalContent.data.map(lesson => (
                  <li key={lesson._id} className="p-4 bg-white rounded-lg shadow-md">
                    <p className="font-bold text-lg text-gray-800">{lesson.title}</p>
                    <p className="text-gray-600">
                      Statut: {lesson.progress.status === 'not_started' ? 'Non commencé' : lesson.progress.status === 'in_progress' ? 'En cours' : 'Terminé'}
                    </p>
                    <p className="text-gray-600">Page: {lesson.progress.currentPage || 1}/{lesson.totalPages || 1}</p>
                    {lesson.progress.notes && <p className="text-gray-600">Notes: {lesson.progress.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'score':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4">Scores des Jeux</h3>
            {modalContent.data.length === 0 ? (
              <p className="text-gray-500 italic">Aucun score de jeu disponible.</p>
            ) : (
              <ul className="space-y-4">
                {modalContent.data.map(score => (
                  <li key={score._id} className="p-4 bg-white rounded-lg shadow-md">
                    <p className="font-bold text-lg text-gray-800">{score.game?.name || 'Jeu inconnu'}</p>
                    <p className="text-gray-600">
                      Date: {new Date(score.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-600">
                      Statut: {score.reviewed ? 'Revu ✅' : 'En attente ⏳'}
                    </p>
                    {score.screenshot && (
                      <a
                        href={`https://kara-back.onrender.com${score.screenshot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Voir la capture
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'test':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4">Soumissions des Tests</h3>
            {modalContent.data.length === 0 ? (
              <p className="text-gray-500 italic">Aucune soumission de test disponible.</p>
            ) : (
              <ul className="space-y-4">
                {modalContent.data.map(test => (
                  <li key={test._id} className="p-4 bg-white rounded-lg shadow-md">
                    <p className="font-bold text-lg text-gray-800">{test.title}</p>
                    <p className="text-gray-600">Statut: {test.submission?.status || 'Non soumis'}</p>
                    {test.submission?.submittedFile && (
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${test.submission.submittedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Voir la soumission
                      </a>
                    )}
                    {test.submission?.feedback && <p className="text-gray-600">Feedback: {test.submission.feedback}</p>}
                    {test.submission?.correctionFile && (
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${test.submission.correctionFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        Télécharger la correction
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white text-center">Mes Résultats</h1>
        </div>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-lg font-medium text-purple-700">Chargement...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md" aria-live="assertive">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        </div>
      )}

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

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quiz Results Card */}
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => openModal('quiz', quizResults)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openModal('quiz', quizResults)}
          aria-label="Voir les résultats des quiz"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
            <h3 className="text-xl font-bold text-white">Résultats des Quiz</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600">Consultez vos scores et performances dans les quiz.</p>
            <span className="inline-block mt-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              {quizResults.length} quiz complétés
            </span>
          </div>
        </div>

        {/* Lesson Progress Card */}
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => openModal('lesson', lessonProgress)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openModal('lesson', lessonProgress)}
          aria-label="Voir l'avancement des cours"
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <h3 className="text-xl font-bold text-white">Avancement des Cours</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600">Suivez votre progression dans les leçons.</p>
            <span className="inline-block mt-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              {lessonProgress.length} leçons
            </span>
          </div>
        </div>

        {/* Game Scores Card */}
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => openModal('score', gameScores)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openModal('score', gameScores)}
          aria-label="Voir les scores des jeux"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <h3 className="text-xl font-bold text-white">Scores des Jeux</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600">Découvrez vos scores dans les jeux éducatifs.</p>
            <span className="inline-block mt-4 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
              {gameScores.length} scores
            </span>
          </div>
        </div>

        {/* Test Submissions Card */}
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => openModal('test', testSubmissions)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openModal('test', testSubmissions)}
          aria-label="Voir les soumissions des tests"
        >
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
            <h3 className="text-xl font-bold text-white">Soumissions des Tests</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600">Vérifiez l'état de vos soumissions de tests.</p>
            <span className="inline-block mt-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
              {testSubmissions.length} soumissions
            </span>
          </div>
        </div>
      </div>

      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Détails</h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200"
                aria-label="Fermer la fenêtre"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResult;
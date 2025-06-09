import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faClipboardCheck,
  faBell,
  faMoon,
  faSun,
  faArrowLeft,
  faFilter,
  faExclamationCircle,
  faSignOutAlt,
  faExclamationTriangle,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LogoutButton from '../Components/LogOut';
import '../Styles/ProgresEnfant.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgresEnfant = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const [childrenProgress, setChildrenProgress] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('https://kara-back.onrender.com/api/parent/progress', config);
        console.log('Progress response:', JSON.stringify(response.data, null, 2));
        // Validate data
        response.data.forEach((child) => {
          if (!child.nom || !child.prenom) {
            console.warn(`Child ${child.childId} has missing nom or prenom:`, child);
          }
          child.lessons?.forEach((lesson) => {
            if (!lesson.title || lesson.title.includes('non disponible')) {
              console.warn(`Lesson ${lesson.lessonId} for child ${child.childId} has invalid title:`, lesson);
            }
          });
          child.quizzes?.forEach((quiz) => {
            if (!quiz.title || quiz.title.includes('non disponible')) {
              console.warn(`Quiz ${quiz.quizId} for child ${child.childId} has invalid title:`, quiz);
            }
          });
          child.tests?.forEach((test) => {
            if (!test.title || test.title.includes('non disponible')) {
              console.warn(`Test ${test.testId} for child ${child.childId} has invalid title:`, test);
            }
          });
        });
        setChildrenProgress(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching progress:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Erreur lors du chargement des progrès.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProgress();
    else navigate('/login');
  }, [token, navigate]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleFilterChange = (type) => setFilterType(type);

  const handleDeleteProgress = async () => {
    try {
      setError('');
      setSuccess('');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.delete('https://kara-back.onrender.com/api/parent/progress', config);
      console.log('Delete progress response:', response.data);
      setSuccess(response.data.message);
      setChildrenProgress([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting progress:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Erreur lors de la suppression des progrès.');
      setShowDeleteConfirm(false);
    }
  };

  const sidebarLinks = [
    { label: 'Tableau de Bord', path: '/parent-dashboard', icon: faBook },
    { label: 'Progrès des enfants', path: '/parent/progress', icon: faClipboardCheck },
    { label: 'Notifications', path: '/parent/notifications', icon: faBell },
  ];

  // Function to generate chart data, excluding invalid quizzes
  const getChartData = (child) => {
    const validQuizzes = child.quizzes?.filter((q) => q.quizId !== 'N/A' && !q.title.includes('non disponible')) || [];
    return {
      labels: ['Leçons terminées', 'Score moyen des quiz', 'Tests réussis'],
      datasets: [
        {
          label: 'Progrès (%)',
          data: [
            (child.lessons?.filter((l) => l.status === 'completed').length || 0) / (child.lessons?.length || 1) * 100,
            (validQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / (validQuizzes.length || 1)) || 0,
            (child.tests?.filter((t) => t.status === 'passed').length || 0) / (child.tests?.length || 1) * 100,
          ],
          backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
          borderColor: ['#388E3C', '#1976D2', '#F57C00'],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Pourcentage (%)',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Résumé des Progrès de l\'Enfant',
      },
    },
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Sidebar */}
      <div
        className={`fixed h-full transition-all duration-300 ease-in-out z-20 
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${darkMode ? 'bg-gray-800' : 'bg-indigo-700 text-white'}`}
      >
        <button
          onClick={toggleSidebar}
          className={`p-4 w-full flex ${sidebarOpen ? 'justify-end' : 'justify-center'}`}
          aria-label="Toggle sidebar"
        >
          <span className="text-xl">{sidebarOpen ? '✕' : '☰'}</span>
        </button>
        <div className="p-4">
          {sidebarOpen && <h2 className="text-xl font-bold mb-6">Menu Parent</h2>}
          <ul className="space-y-3">
            {sidebarLinks.map((link, index) => (
              <li
                key={index}
                onClick={() => navigate(link.path)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  ${link.path === '/parent/progress' ? 
                    (darkMode ? 'bg-indigo-600' : 'bg-indigo-600 bg-opacity-90') : 
                    (darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-600 hover:bg-opacity-70')}
                  ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <FontAwesomeIcon icon={link.icon} className="text-lg" />
                {sidebarOpen && <span className="ml-3">{link.label}</span>}
              </li>
            ))}
            <li className={`${sidebarOpen ? '' : 'flex justify-center'}`}>
              <LogoutButton
                className={`p-3 rounded-lg w-full flex ${sidebarOpen ? '' : 'justify-center'}`}
                icon={<FontAwesomeIcon icon={faSignOutAlt} />}
              />
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-10 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/parent-dashboard')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors
                ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}
              title="Retour au tableau de bord"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              🏠 Retour
            </button>

            <h1 className="text-2xl font-bold flex items-center">
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className={`mr-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
              />
              Progrès des Enfants
            </h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-full transition-colors
                  ${darkMode ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </button>
              <LogoutButton
                className={`flex items-center px-4 py-2 rounded-lg transition-colors
                  ${darkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                icon={<FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />}
                label="Déconnexion"
              />
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="container mx-auto px-6 py-8">
          <h3 className={`text-xl mb-8 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
            Bienvenue, {prenom && nom ? `${prenom} ${nom}` : 'Parent'}
          </h3>

          {/* Success/Error Messages */}
          {success && (
            <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`}>
              <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              {error}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <h3 className="text-lg font-semibold mb-4">
                  Confirmer la suppression
                </h3>
                <p className="mb-6">
                  Êtes-vous sûr de vouloir supprimer tous les progrès (leçons, quiz, tests) de vos enfants ? Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteProgress}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg">Chargement des progrès...</p>
            </div>
          ) : childrenProgress.length === 0 ? (
            <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'}`}>
              <p className="text-lg">Aucun progrès enregistré pour vos enfants.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Delete Progress Button */}
              <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors
                    ${darkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                  Supprimer tous les progrès
                </button>
              </div>

              {/* Filter Section */}
              <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h4 className="flex items-center text-lg font-semibold mb-4">
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filtrer par :
                </h4>
                <div className="flex flex-wrap gap-3">
                  {['all', 'lessons', 'quizzes', 'tests'].map((type) => (
                    <button
                      key={type}
                      className={`px-4 py-2 rounded-full transition-colors
                        ${filterType === type ? 
                          (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : 
                          (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                      onClick={() => handleFilterChange(type)}
                    >
                      {type === 'all' ? 'Tout' : 
                       type === 'lessons' ? 'Leçons' :
                       type === 'quizzes' ? 'Quiz' : 'Tests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Children Progress */}
              {childrenProgress.map((child) => {
                // Filter valid quizzes for display
                const validQuizzes = child.quizzes?.filter((q) => q.quizId !== 'N/A' && !q.title.includes('non disponible')) || [];
                const hasInvalidQuizzes = child.quizzes?.some((q) => q.quizId === 'N/A' || q.title.includes('non disponible'));

                return (
                  <div
                    key={child.childId}
                    className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-1">
                        {child.prenom && child.nom ? `${child.prenom} ${child.nom}` : 'Enfant non identifié'}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <p><strong className={darkMode ? 'text-indigo-300' : 'text-indigo-600'}>Niveau:</strong> {child.niveau || 'Non spécifié'}</p>
                        <p><strong className={darkMode ? 'text-indigo-300' : 'text-indigo-600'}>Classe:</strong> {child.classe || 'Non spécifié'}</p>
                        <p><strong className={darkMode ? 'text-indigo-300' : 'text-indigo-600'}>Numéro d'inscription:</strong> {child.numInscript || 'Non spécifié'}</p>
                      </div>
                    </div>

                    {/* Progress Chart */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Résumé des Progrès</h4>
                      <div className="w-full max-w-md mx-auto">
                        <Bar data={getChartData(child)} options={chartOptions} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Lessons */}
                      {(filterType === 'all' || filterType === 'lessons') && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            Leçons
                          </h4>
                          {child.lessons?.length > 0 ? (
                            <div className="grid gap-3">
                              {child.lessons.map((lesson) => (
                                <div
                                  key={lesson.lessonId}
                                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium">
                                      {lesson.title.includes('non disponible') ? (
                                        <span className="flex items-center">
                                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-yellow-500" />
                                          {lesson.title}
                                        </span>
                                      ) : (
                                        lesson.title
                                      )}
                                    </span>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full 
                                      ${lesson.status === 'completed' ? 
                                        (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') :
                                        (darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800')}`}
                                    >
                                      {lesson.status === 'completed' ? 'Terminé' : lesson.status || 'En cours'}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-sm flex flex-wrap gap-4">
                                    {lesson.currentPage !== undefined && (
                                      <span><strong>Page:</strong> {lesson.currentPage}</span>
                                    )}
                                    {lesson.completionDate && (
                                      <span><strong>Terminé:</strong> {new Date(lesson.completionDate).toLocaleDateString('fr-FR')}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              Aucune leçon enregistrée.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quizzes */}
                      {(filterType === 'all' || filterType === 'quizzes') && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            Quiz
                          </h4>
                          {hasInvalidQuizzes && (
                            <div className={`p-4 mb-4 rounded-lg ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                              Certaines soumissions de quiz sont invalides ou font référence à des quiz supprimés.
                            </div>
                          )}
                          {validQuizzes.length > 0 ? (
                            <div className="grid gap-3">
                              {validQuizzes.map((quiz) => (
                                <div
                                  key={quiz.quizId}
                                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-medium">{quiz.title}</span>
                                      <span
                                        className={`ml-2 px-2 py-1 text-xs rounded-full 
                                        ${darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'}`}
                                      >
                                        {quiz.difficulty || 'Inconnu'}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm font-medium
                                      ${quiz.percentage >= 80 ? 
                                        (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') :
                                        quiz.percentage >= 50 ?
                                        (darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                                        (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800')}`}
                                    >
                                      {quiz.score}/{quiz.total} ({quiz.percentage?.toFixed(2) || 'N/A'}%)
                                    </span>
                                  </div>
                                  {quiz.submittedAt && (
                                    <div className="mt-2 text-sm">
                                      <span><strong>Soumis:</strong> {new Date(quiz.submittedAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              Aucun quiz valide soumis.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Tests */}
                      {(filterType === 'all' || filterType === 'tests') && (
                        <div>
                          <h4 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            Tests
                          </h4>
                          {child.tests?.length > 0 ? (
                            <div className="grid gap-3">
                              {child.tests.map((test) => (
                                <div
                                  key={test.testId}
                                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium">
                                      {test.title.includes('non disponible') ? (
                                        <span className="flex items-center">
                                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-yellow-500" />
                                          {test.title}
                                        </span>
                                      ) : (
                                        test.title
                                      )}
                                    </span>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full 
                                      ${test.status === 'passed' ? 
                                        (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') :
                                        test.status === 'failed' ?
                                        (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800') :
                                        (darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800')}`}
                                    >
                                      {test.status === 'passed' ? 'Réussi' : test.status === 'failed' ? 'Échoué' : test.status || 'Inconnu'}
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-2 text-sm">
                                    {test.feedback && (
                                      <p><strong>Feedback:</strong> {test.feedback}</p>
                                    )}
                                    {test.submittedAt && (
                                      <p><strong>Soumis:</strong> {new Date(test.submittedAt).toLocaleDateString('fr-FR')}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              Aucun test soumis.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProgresEnfant;
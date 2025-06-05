import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faBook,
  faClipboardCheck,
  faLanguage,
  faQuestionCircle,
  faGamepad,
  faChartLine,
  faEnvelope,
  faMoon,
  faSun,
  faUsers,
  faUserClock
} from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut';

// Import des images (assurez-vous d'avoir ces fichiers)
import lessonImage from '../Assets/images/dashboard/books-stack.jpg';
import testImage from '../Assets/images/dashboard/test.avif';
import vocabImage from '../Assets/images/dashboard/vocabulary.avif';
import messageImage from '../Assets/images/dashboard/message.avif';
import dashboardBg from '../Assets/images/dashboard/dashboard-bg-tea.avif';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const prenom = localStorage.getItem('prenom');
  const nom = localStorage.getItem('nom');
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalTests: 0,
    totalSubmissions: 0,
    totalCategories: 0,
    totalVocab: 0,
    totalQuizzes: 0,
    totalGames: 0,
    unreadMessages: 0,
    unreadNotifications: 0
  });
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const [
          lessonsRes,
          testsRes,
          submissionsRes,
          categoriesRes,
          vocabRes,
          messagesRes,
          notificationsRes
        ] = await Promise.all([
          axios.get('https://kara-back.onrender.com/api/lessons', config),
          axios.get('https://kara-back.onrender.com/api/tests', config),
          axios.get('https://kara-back.onrender.com/api/tests/submissions', config),
          axios.get('https://kara-back.onrender.com/api/categories', config),
          axios.get('https://kara-back.onrender.com/api/vocab', config),
          axios.get('https://kara-back.onrender.com/api/messages/unread-count', config),
          axios.get('https://kara-back.onrender.com/api/notifications', config)
        ]);

        const notificationsData = Array.isArray(notificationsRes.data.notifications)
          ? notificationsRes.data.notifications
          : [];

        setStats({
          totalLessons: lessonsRes.data.length,
          totalTests: testsRes.data.length,
          totalSubmissions: submissionsRes.data.length,
          totalCategories: categoriesRes.data.length,
          totalVocab: vocabRes.data.length,
          unreadMessages: messagesRes.data.count || 0,
          unreadNotifications: notificationsData.filter((n) => !n.read).length
        });
      } catch (error) {
        setError('Erreur lors du chargement des données: ' + (error.response?.data?.message || error.message));
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    if (token) {
      fetchTeacherData();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Configuration des graphiques
  const barOptions = {
    chart: { 
      id: 'teacher-bar-chart',
      foreColor: darkMode ? '#FFFFFF' : '#4B5563',
      toolbar: { show: false }
    },
    xaxis: { 
      categories: ['Leçons', 'Tests', 'Soumissions', 'Catégories', 'Vocabulaire'],
      labels: { style: { colors: [darkMode ? '#E5E7EB' : '#6B7280'] } }
    },
    colors: ['#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
    plotOptions: {
      bar: { borderRadius: 10, distributed: true }
    },
    dataLabels: { enabled: false },
    theme: { mode: darkMode ? 'dark' : 'light' }
  };

  const donutOptions = {
    labels: ['Leçons', 'Tests', 'Catégories', 'Vocabulaire'],
    colors: ['#7C3AED', '#F59E0B', '#10B981', '#3B82F6'],
    legend: { position: 'bottom', labels: { colors: darkMode ? '#FFFFFF' : undefined } },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: darkMode ? '#FFFFFF' : '#6B7280'
            }
          }
        }
      }
    },
    theme: { mode: darkMode ? 'dark' : 'light' }
  };

  const chartData = [
    stats.totalLessons,
    stats.totalTests,
    stats.totalSubmissions,
    stats.totalCategories,
    stats.totalVocab
  ];

  const donutData = [
    stats.totalLessons,
    stats.totalTests,
    stats.totalCategories,
    stats.totalVocab
  ];

  return (
<div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* En-tête avec image de fond */}
      <div 
        className="flex items-center justify-between p-6 rounded-xl shadow mb-6 relative overflow-hidden"
        style={{ 
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0  opacity-70"></div>
        <div className="relative z-10 text-white">
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Enseignant</h2>
<p className="text-lg font-semibold text-gray-800">
  Bonjour {prenom && nom ? `${prenom} ${nom}` : 'Enseignant'} !
</p>
  </div>
        <div className="relative z-10 flex items-center space-x-4">
          <button
            onClick={() => navigate('/teacher/messages')}
            className="relative p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            title="Messages"
          >
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
            {stats.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {stats.unreadMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/teacher/notifications')}
            className="relative p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            title="Notifications"
          >
            <FontAwesomeIcon icon={faBell} size="lg" />
            {stats.unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {stats.unreadNotifications}
              </span>
            )}
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
          </button>
          <LogoutButton className="text-white hover:text-gray-200" />
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => navigate('/teacher/lessons')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{ borderTop: '8px solid #7C3AED' }}
        >
          <img src={lessonImage} alt="Leçons" className="w-16 h-16 mb-4 rounded-full object-cover" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Leçons</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalLessons}</p>
          <div className="mt-2 text-indigo-400">
            <FontAwesomeIcon icon={faBook} size="lg" />
          </div>
        </div>

        <div
          onClick={() => navigate('/teacher/tests')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{ borderTop: '8px solid #F59E0B' }}
        >
          <img src={testImage} alt="Tests" className="w-16 h-16 mb-4 rounded-full object-cover" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tests</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.totalTests}</p>
          <div className="mt-2 text-yellow-400">
            <FontAwesomeIcon icon={faClipboardCheck} size="lg" />
          </div>
        </div>

        <div
          onClick={() => navigate('/teacher/categories')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{ borderTop: '8px solid #10B981' }}
        >
          <img src={vocabImage} alt="Vocabulaire" className="w-16 h-16 mb-4 rounded-full object-cover" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vocabulaire</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalCategories}</p>
          <div className="mt-2 text-green-400">
            <FontAwesomeIcon icon={faLanguage} size="lg" />
          </div>
        </div>

        <div
          onClick={() => navigate('/teacher/messages')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{ borderTop: '8px solid #3B82F6' }}
        >
          <img src={messageImage} alt="Messages" className="w-16 h-16 mb-4 rounded-full object-cover" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Messages</p>
          <p className="text-3xl font-bold text-blue-500">{stats.unreadMessages}</p>
          <div className="mt-2 text-blue-400">
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
            Statistiques des activités
          </h3>
          <Chart
            options={barOptions}
            series={[{ name: 'Total', data: chartData }]}
            type="bar"
            height={300}
          />
        </div>
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Répartition des contenus
          </h3>
          <Chart
            options={donutOptions}
            series={donutData}
            type="donut"
            height={300}
          />
        </div>
      </div>

      {/* Cartes de fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/teacher/quizzes')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quiz</h3>
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Créez et gérez des quiz interactifs pour vos élèves.</p>
        </div>

        <div
          onClick={() => navigate('/teacher/jeux')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FontAwesomeIcon icon={faGamepad} size="lg" />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Jeux éducatifs</h3>
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Proposez des jeux pour un apprentissage ludique.</p>
        </div>

        <div
          onClick={() => navigate('/teacher/progress')}
          className={`p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FontAwesomeIcon icon={faChartLine} size="lg" />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Progrès des élèves</h3>
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Suivez et analysez les performances de vos élèves.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  faBars,
  faTimes,
  faUserGraduate,
  faMedal,
  faCheckCircle,
  faTrophy,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import LogoutButton from '../Components/LogOut.jsx';
import dashboardBg from '../Assets/images/dashboard/fond-plat-journee-nationale-sciences_23-2149283132.avif';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const prenom = localStorage.getItem('prenom');
  const nom = localStorage.getItem('nom');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    quizStats: [],
    gameStats: [],
    vocabularyStats: {},
    testStats: []
  });
  const [loading, setLoading] = useState(true);

  // Chart refs
  const quizChartRef = useRef(null);
  const vocabularyChartRef = useRef(null);
  const gamesChartRef = useRef(null);
  const testChartRef = useRef(null);

  useEffect(() => {
    const fetchStudentData = async () => {
  try {
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // 1. Modifiez vos appels API pour extraire explicitement .data
    const [
      { data: notificationsData }, 
      { data: messagesData },
      { data: quizzesData },
      { data: gamesData },
      { data: vocabularyData },
      { data: testsData }
    ] = await Promise.all([
      axios.get('https://kara-back.onrender.com/api/notifications', config),
      axios.get('https://kara-back.onrender.com/api/messages/unread-count', config),
      axios.get('https://kara-back.onrender.com/api/student/quizs', config),
      axios.get('https://kara-back.onrender.com/api/student/game/sections', config),
      axios.get('https://kara-back.onrender.com/api/student/categories', config),
      axios.get('https://kara-back.onrender.com/api/student/tests', config)
    ]);

    // 2. Traitement sécurisé avec vérifications
    // Notifications
    const notifications = Array.isArray(notificationsData?.notifications) 
      ? notificationsData.notifications 
      : [];
    
    setUnreadNotifications(notifications.filter(n => !n.read).length);
    setUnreadMessages(messagesData?.count || 0);

    // Quizzes (exemple complet)
    const quizStats = Array.isArray(quizzesData) 
      ? quizzesData.map(quiz => ({
          name: quiz.title,
          score: quiz.submissions?.length > 0 
            ? quiz.submissions[quiz.submissions.length - 1].percentage 
            : null,
          attempts: quiz.submissions?.length || 0
        }))
      : [];

    // Games
    const gameStats = Array.isArray(gamesData?.sections)
      ? gamesData.sections.map(section => ({
          name: section.name,
          gamesCompleted: section.games?.filter(g => g.completed).length || 0,
          totalGames: section.games?.length || 0
        }))
      : [];

    // Vocabulary
    const vocabularyStats = {
      categories: Array.isArray(vocabularyData) ? vocabularyData.length : 0,
      wordsLearned: Array.isArray(vocabularyData)
        ? vocabularyData.reduce((acc, cat) => acc + (cat.vocabulary?.length || 0), 0)
        : 0
    };

    // Tests
    const testStats = Array.isArray(testsData)
      ? testsData.map(test => ({
          name: test.title,
          passed: test.submission?.status === 'passed',
          score: test.submission?.score || 0
        }))
      : [];

    setStats({ quizStats, gameStats, vocabularyStats, testStats });
    
  } catch (error) {
    setError(`Erreur lors du chargement: ${error.message}`);
    console.error("Détails de l'erreur:", error.response?.data || error);
  } finally {
    setLoading(false);
  }
};

    if (token) {
      fetchStudentData();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      if (quizChartRef.current) quizChartRef.current.destroy();
      if (vocabularyChartRef.current) vocabularyChartRef.current.destroy();
      if (gamesChartRef.current) gamesChartRef.current.destroy();
      if (testChartRef.current) testChartRef.current.destroy();
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Chart data for quizzes
  const quizChartData = {
    labels: stats.quizStats.map(quiz => quiz.name),
    datasets: [{
      label: 'Score (%)',
      data: stats.quizStats.map(quiz => quiz.score || 0),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC24A', '#FF6B6B', '#47B8E0', '#7C4DFF'
      ],
      borderColor: darkMode ? '#374151' : '#F3F4F6',
      borderWidth: 1
    }]
  };

  // Chart data for games progress
  const gamesChartData = {
    labels: stats.gameStats.map(game => game.name),
    datasets: [{
      label: 'Jeux complétés',
      data: stats.gameStats.map(game => 
        game.totalGames > 0 ? (game.gamesCompleted / game.totalGames) * 100 : 0
      ),
      backgroundColor: '#4BC0C0',
      borderColor: darkMode ? '#374151' : '#F3F4F6',
      borderWidth: 1,
      fill: true
    }]
  };

  // Chart data for vocabulary
  const vocabularyChartData = {
    labels: ['Catégories', 'Mots appris'],
    datasets: [{
      data: [stats.vocabularyStats.categories, stats.vocabularyStats.wordsLearned],
      backgroundColor: ['#FFCE56', '#36A2EB'],
      hoverBackgroundColor: ['#FFB347', '#2583C7']
    }]
  };

  // Chart data for test results
  const testChartData = {
    labels: stats.testStats.map(test => test.name),
    datasets: [{
      label: 'Score (%)',
      data: stats.testStats.map(test => test.score),
      borderColor: '#9966FF',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderWidth: 2,
      pointBackgroundColor: '#9966FF',
      pointBorderColor: '#fff',
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#9966FF',
      pointHoverBorderColor: '#fff',
      pointHitRadius: 10,
      pointBorderWidth: 2,
      fill: true
    }]
  };

  const sidebarLinks = [
    { label: 'Tableau de Bord', path: '/student-dashboard', icon: faBook },
    { label: 'Leçons', path: '/student/lessons', icon: faBook },
    { label: 'Tests', path: '/student/tests', icon: faClipboardCheck },
    { label: 'Vocabulaire', path: '/student/categorie', icon: faLanguage },
    { label: 'Quizzes', path: '/student/quizs', icon: faQuestionCircle },
    { label: 'Jeux', path: '/student/games', icon: faGamepad },
    { label: 'Résultats', path: '/student/results', icon: faChartLine },
    { label: 'Messages', path: '/student/messages', icon: faEnvelope },
    { label: 'Notifications', path: '/student/notifications', icon: faBell },
  ];

  // Chart render functions
  const renderQuizChart = () => (
    <Bar 
      ref={quizChartRef}
      data={quizChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const quiz = stats.quizStats[context.dataIndex];
                return `Tentatives: ${quiz.attempts}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: darkMode ? '#fff' : '#333'
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: darkMode ? '#fff' : '#333'
            },
            grid: {
              display: false
            }
          }
        }
      }}
    />
  );

  const renderVocabularyChart = () => (
    <Doughnut 
      ref={vocabularyChartRef}
      data={vocabularyChartData}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: darkMode ? '#fff' : '#333'
            }
          }
        }
      }}
    />
  );

  const renderGamesChart = () => (
    <Bar 
      ref={gamesChartRef}
      data={gamesChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: darkMode ? '#fff' : '#333',
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: darkMode ? '#fff' : '#333'
            },
            grid: {
              display: false
            }
          }
        }
      }}
    />
  );

  const renderTestChart = () => (
    <Line 
      ref={testChartRef}
      data={testChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: darkMode ? '#fff' : '#333'
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: darkMode ? '#fff' : '#333'
            },
            grid: {
              display: false
            }
          }
        }
      }}
    />
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
      

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
    <header className="sticky top-0 z-10 ">
  <div 
        className="flex items-center justify-between p-6 rounded-xl shadow mb-6 relative overflow-hidden"
    style={{ 
      backgroundImage: `url(${dashboardBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}
  >
    {/* Overlay pour améliorer la lisibilité */}
    <div className={`absolute inset-0  transition-all duration-300`}></div>
    
    <div className="container mx-auto flex justify-between items-center relative z-10">
      <button 
        onClick={toggleSidebar} 
        className="md:hidden text-indigo-600 dark:text-white focus:outline-none hover:scale-110 transition-transform bg-white/80 dark:bg-gray-800/80 p-2 rounded-full"
        aria-label="Toggle sidebar"
      >
        <FontAwesomeIcon icon={faBars} className="hover:rotate-90 transition-transform" />
      </button>
      
      <h3 className="text-xl font-bold text-indigo-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors bg-white/70 dark:bg-gray-800/70 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm">
        Tableau de Bord Étudiant
      </h3>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => navigate('/student/messages')}
          className="relative p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors group backdrop-blur-sm shadow-sm"
          title="Messages"
        >
          <FontAwesomeIcon 
            icon={faEnvelope} 
            className="text-indigo-600 dark:text-white group-hover:scale-110 transition-transform" 
          />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full animate-pulse">
              {unreadMessages}
            </span>
          )}
        </button>
        
        <button
          onClick={() => navigate('/student/notifications')}
          className="relative p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors group backdrop-blur-sm shadow-sm"
          title="Notifications"
        >
          <FontAwesomeIcon 
            icon={faBell} 
            className="text-indigo-600 dark:text-white group-hover:scale-110 transition-transform" 
          />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full animate-bounce">
              {unreadNotifications}
            </span>
          )}
        </button>
        
       
        
        <LogoutButton className="hidden md:block hover:scale-105 transition-transform bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm" />
      </div>
    </div>
  </div>
</header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-700'} animate-shake`}>
              {error}
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2 animate-fadeIn">
              Bienvenue, {prenom && nom ? `${prenom} ${nom}` : 'Utilisateur'} !
            </h2>
            <p className="text-lg animate-fadeIn delay-100">
              Votre progression et vos statistiques
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Quiz Stats */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} animate-pulse`}>
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes complétés</p>
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.quizStats.filter(q => q.score !== null).length} / {stats.quizStats.length}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Game Stats */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-green-900' : 'bg-green-100'} animate-pulse`}>
                  <FontAwesomeIcon icon={faGamepad} className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jeux complétés</p>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.gameStats.reduce((acc, section) => acc + section.gamesCompleted, 0)}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Vocabulary Stats */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} animate-pulse`}>
                  <FontAwesomeIcon icon={faLanguage} className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mots appris</p>
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.vocabularyStats.wordsLearned}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Test Stats */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} animate-pulse`}>
                  <FontAwesomeIcon icon={faClipboardCheck} className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tests réussis</p>
                  <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.testStats.filter(t => t.passed).length} / {stats.testStats.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quiz Performance */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300`}>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-blue-500 animate-spin-slow" />
                Performances aux Quiz
              </h3>
              <div className="h-64">
                {renderQuizChart()}
              </div>
            </div>
            
            {/* Vocabulary Progress */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300`}>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faLanguage} className="mr-2 text-purple-500 animate-bounce" />
                Progrès du Vocabulaire
              </h3>
              <div className="h-64">
                {renderVocabularyChart()}
              </div>
            </div>
            
            {/* Game Progress */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300`}>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faGamepad} className="mr-2 text-green-500 animate-pulse" />
                Progrès des Jeux
              </h3>
              <div className="h-64">
                {renderGamesChart()}
              </div>
            </div>
            
            {/* Test Results */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-all duration-300`}>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faClipboardCheck} className="mr-2 text-yellow-500 animate-spin-slow" />
                Résultats des Tests
              </h3>
              <div className="h-64">
                {renderTestChart()}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-2xl font-bold mb-4 flex items-center animate-fadeIn">
            <FontAwesomeIcon icon={faBolt} className="mr-2 text-indigo-500 animate-pulse" />
            Actions Rapides
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { icon: faBook, title: 'Consulter les cours', desc: 'Apprenez de nouveaux concepts', path: '/student/lessons', color: 'bg-blue-100 text-blue-600', hover: 'hover:bg-blue-200' },
              { icon: faClipboardCheck, title: 'Passer des tests', desc: 'Testez vos connaissances', path: '/student/tests', color: 'bg-purple-100 text-purple-600', hover: 'hover:bg-purple-200' },
              { icon: faLanguage, title: 'Consulter le vocabulaire', desc: 'Enregistrez votre vocabulaire', path: '/student/categorie', color: 'bg-green-100 text-green-600', hover: 'hover:bg-green-200' },
              { icon: faQuestionCircle, title: 'Passer des quiz', desc: 'Participez à des quiz amusants', path: '/student/quizs', color: 'bg-yellow-100 text-yellow-600', hover: 'hover:bg-yellow-200' },
              { icon: faChartLine, title: 'Voir les résultats', desc: 'Suivez vos progrès', path: '/student/results', color: 'bg-red-100 text-red-600', hover: 'hover:bg-red-200' },
              { icon: faGamepad, title: 'Jouer à des jeux', desc: 'Apprenez en jouant!', path: '/student/games', color: 'bg-indigo-100 text-indigo-600', hover: 'hover:bg-indigo-200' },
              { icon: faEnvelope, title: 'Messages', desc: 'Contactez vos enseignants', path: '/student/messages', color: 'bg-pink-100 text-pink-600', hover: 'hover:bg-pink-200', badge: unreadMessages },
            ].map((item) => (
              <div
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`p-6 rounded-xl shadow-md cursor-pointer transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : `${item.color} ${item.hover}`} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${darkMode ? 'bg-gray-700' : item.color.replace('100', '200')} group-hover:scale-110 transition-transform`}>
                  <FontAwesomeIcon icon={item.icon} className={`text-xl ${darkMode ? 'text-white' : item.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
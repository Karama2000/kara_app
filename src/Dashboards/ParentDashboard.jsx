import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faClipboardCheck,
  faBell,
  faUser,
  faMoon,
  faSun,
  faEnvelope,
  faSync,
  faSignOutAlt,
  faBars,
  faTimes,
  faUserGraduate,
  faChartLine,
  faComments,
  faHome,
  faTrashAlt,
  faCheckCircle,
  faExclamationCircle,
  faSchool,
  faChild
} from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut.jsx';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const [children, setChildren] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [latestMessageSender, setLatestMessageSender] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [childrenResponse, notificationsResponse, messagesResponse, latestMessageResponse] = await Promise.all([
        axios.get('https://kara-back.onrender.com/api/parent/children', config),
        axios.get('https://kara-back.onrender.com/api/notifications', config),
        axios.get('https://kara-back.onrender.com/api/messages/unread-count', config),
        axios.get('https://kara-back.onrender.com/api/messages/received', config)
      ]);
      setChildren(Array.isArray(childrenResponse.data) ? childrenResponse.data : []);
      setNotifications(Array.isArray(notificationsResponse.data.notifications) ? notificationsResponse.data.notifications : []);
      setUnreadMessages(messagesResponse.data.count || 0);
      const messagesData = Array.isArray(latestMessageResponse.data) ? latestMessageResponse.data : [];
      const unread = messagesData.filter(msg => !msg.read);
      if (unread.length > 0) {
        setLatestMessageSender(unread[0].sender?._id || null);
      } else {
        setLatestMessageSender(null);
      }
      setError('');
    } catch (error) {
      console.error('Détails de l\'erreur:', error.response ? error.response.data : error.message);
      setError('Erreur lors du chargement des données: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    } else {
      navigate('/login');
    }
  }, [token, navigate, fetchData]);

  const handleMarkAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`https://kara-back.onrender.com/api/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map((notif) =>
        notif._id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      setError('Erreur lors de la mise à jour de la notification.');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`https://kara-back.onrender.com/api/notifications/${id}`, config);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      setError('Erreur lors de la suppression de la notification.');
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete('https://kara-back.onrender.com/api/notifications', config);
        setNotifications([]);
      } catch (error) {
        setError('Erreur lors de la suppression de toutes les notifications.');
      }
    }
  };

  const handleRefreshNotifications = () => fetchData();
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleViewNotifications = () => navigate('/parent/notifications');
  
const sidebarLinks = [
    { label: 'Tableau de Bord', path: '/parent-dashboard', icon: faHome, color: 'text-indigo-500' },
    { label: 'Progrès des enfants', path: '/parent/progress', icon: faChartLine, color: 'text-emerald-500' },
    { label: 'Notifications', path: '/parent/notifications', icon: faBell, color: 'text-amber-500' },
    { label: 'Messages', path: latestMessageSender ? `/parent/messages?recipient=${latestMessageSender}` : '/parent/messages', icon: faComments, color: 'text-blue-500' }
  ];

  return (
 <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700 text-indigo-400' : 'hover:bg-gray-100 text-indigo-600'}`}
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
            </button>
            <h1 className="text-xl font-bold flex items-center">
              <FontAwesomeIcon 
                icon={faUser} 
                className={`mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} 
              />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de Bord Parent
              </span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleViewNotifications}
              className={`relative p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-amber-400' : 'hover:bg-gray-100 text-amber-600'}`}
              title="Notifications"
            >
              <FontAwesomeIcon icon={faBell} size="lg" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <button
              onClick={handleRefreshNotifications}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
              title="Rafraîchir"
            >
              <FontAwesomeIcon icon={faSync} size="lg" />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
            </button>
            
            <LogoutButton
              className={`flex items-center space-x-1 ${darkMode ? 'hover:text-red-400 text-red-500' : 'hover:text-red-600 text-red-700'} font-medium`}
              icon={<FontAwesomeIcon icon={faSignOutAlt} />}
              label="Déconnexion"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transform transition-transform duration-200 ease-in-out 
          fixed md:static z-20 w-64 h-full ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'} 
          shadow-lg md:shadow-none`}
        >
          <div className="p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-6 pt-2 flex items-center">
              <FontAwesomeIcon 
                icon={faUserGraduate} 
                className={`mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} 
              />
              <span>Menu Parent</span>
            </h2>
            <nav className="flex-1">
              <ul className="space-y-1">
                {sidebarLinks.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => {
                        navigate(link.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${
                        window.location.pathname === link.path ? (darkMode ? 'bg-gray-700 shadow-md' : 'bg-indigo-50 shadow-md') : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={link.icon} 
                          className={`mr-3 text-lg ${link.color} ${window.location.pathname === link.path ? 'opacity-100' : 'opacity-80'}`} 
                        />
                        <span className={window.location.pathname === link.path ? 'font-semibold' : ''}>
                          {link.label}
                        </span>
                      </div>
                      {(link.label === 'Messages' && unreadMessages > 0) && (
                        <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                          {unreadMessages}
                        </span>
                      )}
                      {(link.label === 'Notifications' && notifications.filter(n => !n.read).length > 0) && (
                        <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto p-4">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} border ${darkMode ? 'border-gray-600' : 'border-indigo-100'}`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-indigo-100'} mr-3`}>
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className={`text-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} 
                    />
                  </div>
                  <div>
                    <p className="font-medium">{prenom} {nom}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>Compte Parent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" 
              onClick={toggleSidebar}
            />
          )}

          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FontAwesomeIcon 
              icon={faHome} 
              className={`mr-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} 
            />
            <span>Bienvenue, {prenom && nom ? `${prenom} ${nom}` : 'Parent'}</span>
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p>Chargement en cours...</p>
            </div>
          ) : error ? (
            <div className={`p-4 mb-6 rounded-lg flex items-center ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Children Section */}
              <section className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center">
                    <FontAwesomeIcon 
                      icon={faChild} 
                      className={`mr-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} 
                    />
                    <span>Vos Enfants</span>
                  </h3>
                </div>
                
                {children.length === 0 ? (
                  <div className={`py-8 text-center rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FontAwesomeIcon 
                      icon={faSchool} 
                      className={`text-4xl mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} 
                    />
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucun enfant associé à votre compte.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children.map((child) => (
                      <div 
                        key={child._id} 
                        className={`rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                      >
                        <div className="relative h-40 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                          {child.imageUrl ? (
                            <img
                              src={child.imageUrl}
                              alt={`${child.prenom} ${child.nom}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FontAwesomeIcon 
                              icon={faUserGraduate} 
                              className="text-white text-6xl opacity-80" 
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg font-semibold flex items-center">
                            <FontAwesomeIcon 
                              icon={faChild} 
                              className={`mr-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} 
                            />
                            {child.prenom} {child.nom}
                          </h4>
                          <div className="mt-3 space-y-2 text-sm">
                            <p className="flex items-center">
                              <span className={`w-24 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Niveau:</span>
                              <span>{child.niveau || 'Non spécifié'}</span>
                            </p>
                            <p className="flex items-center">
                              <span className={`w-24 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Classe:</span>
                              <span>{child.classe || 'Non spécifié'}</span>
                            </p>
                            <p className="flex items-center">
                              <span className={`w-24 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inscription:</span>
                              <span>{child.numInscript || 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Progress and Messages Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Section */}
                <section className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-emerald-900' : 'bg-emerald-100'} mr-4`}>
                      <FontAwesomeIcon 
                        icon={faChartLine} 
                        className={`text-xl ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Suivi des Progrès</h3>
                      <p className="mt-1">Consultez les performances de vos enfants dans leurs leçons et quiz.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/parent/progress')}
                    className={`mt-4 px-4 py-2 rounded-lg flex items-center space-x-2 ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white transition-colors shadow-md hover:shadow-lg`}
                  >
                    <FontAwesomeIcon icon={faClipboardCheck} />
                    <span>Voir les Progrès</span>
                  </button>
                </section>

                {/* Messages Section */}
                <section className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} mr-4`}>
                      <FontAwesomeIcon 
                        icon={faComments} 
                        className={`text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Communication</h3>
                      <p className="mt-1">Contactez les enseignants ou l'administration pour toute question.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(latestMessageSender ? `/parent/messages?recipient=${latestMessageSender}` : '/parent/messages')}
                    className={`mt-4 px-4 py-2 rounded-lg flex items-center space-x-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors shadow-md hover:shadow-lg relative`}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>Envoyer un Message</span>
                    {unreadMessages > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                </section>
              </div>

              {/* Notifications Section */}
              <section className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center">
                    <FontAwesomeIcon 
                      icon={faBell} 
                      className={`mr-3 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} 
                    />
                    <span>Notifications Récentes</span>
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteAllNotifications}
                      className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${darkMode ? 'bg-amber-700 hover:bg-amber-800' : 'bg-amber-500 hover:bg-amber-600'} text-white text-sm transition-colors shadow`}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                      <span>Supprimer Tout</span>
                    </button>
                  </div>
                </div>
                
                {notifications.length === 0 ? (
                  <div className={`py-8 text-center rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FontAwesomeIcon 
                      icon={faBell} 
                      className={`text-4xl mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} 
                    />
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucune notification disponible.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="divide-y">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification._id}
                          className={`py-4 ${notification.read ? (darkMode ? 'text-gray-400' : 'text-gray-500') : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start">
                                {!notification.read && (
                                  <FontAwesomeIcon 
                                    icon={faExclamationCircle} 
                                    className={`mr-2 mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} 
                                  />
                                )}
                                <p>{notification.message}</p>
                              </div>
                              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {new Date(notification.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-gray-100 text-green-600'}`}
                                  title="Marquer comme lu"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification._id)}
                                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                                title="Supprimer"
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleViewNotifications}
                      className={`w-full mt-4 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${darkMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} text-white transition-colors shadow-md hover:shadow-lg`}
                    >
                      <FontAwesomeIcon icon={faBell} />
                      <span>Toutes les Notifications</span>
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
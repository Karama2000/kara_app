import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faClipboardCheck, faBook,faExclamationCircle,faTrash, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut';

const NotifParent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
const sidebarLinks = [
    { label: 'Tableau de Bord', path: '/parent-dashboard', icon: faBook },
    { label: 'Progrès des enfants', path: '/parent/progress', icon: faClipboardCheck },
    { label: 'Notifications', path: '/parent/notifications', icon: faBell }
  ];
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` }, params: { page, limit: 10 } };
      const response = await axios.get('https://kara-back.onrender.com/api/notifications', config);
      setNotifications(response.data.notifications || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setLoading(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors du chargement des notifications.';
      setError(errorMsg);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, page]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      navigate('/login');
    }
  }, [token, navigate, fetchNotifications]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

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

  const handleMarkAllAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('https://kara-back.onrender.com/api/notifications/read-all', {}, config);
      setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      setError('Erreur lors de la mise à jour des notifications.');
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
        setPage(1);
      } catch (error) {
        setError('Erreur lors de la suppression de toutes les notifications.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const progress = notifications.length ? (unreadCount / notifications.length) * 100 : 0;

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
                ${link.path === '/parent/notifications' ? 
                  (darkMode ? 'bg-indigo-600' : 'bg-indigo-600 bg-opacity-90') : 
                  (darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-600 hover:bg-opacity-70')}
                ${sidebarOpen ? '' : 'justify-center'}`}
            >
              <FontAwesomeIcon icon={link.icon} className="text-lg" />
              {sidebarOpen && <span className="ml-3">{link.label}</span>}
            </li>
          ))}
          <li className={`${sidebarOpen ? '' : 'flex justify-center'}`}>
            <LogoutButton className={`p-3 rounded-lg w-full flex ${sidebarOpen ? '' : 'justify-center'}`} />
          </li>
        </ul>
      </div>
    </div>

    {/* Main Content */}
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <FontAwesomeIcon 
              icon={faBell} 
              className={`mr-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} 
            />
            Notifications Parent
          </h1>
          
          
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Chargement en cours...</p>
          </div>
        ) : error ? (
          <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" /> 
            {error}
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <div className={`p-6 rounded-xl shadow-sm mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className="mb-4">
                {unreadCount} notification(s) non lue(s) sur {notifications.length}
              </p>
              
              <div className={`w-full h-3 rounded-full mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className={`h-full rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  className={`px-4 py-2 rounded-full transition-colors
                    ${filter === 'all' ? 
                      (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : 
                      (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                  onClick={() => setFilter('all')}
                >
                  Toutes
                </button>
                <button
                  className={`px-4 py-2 rounded-full transition-colors
                    ${filter === 'unread' ? 
                      (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : 
                      (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                  onClick={() => setFilter('unread')}
                >
                  Non lues
                </button>
                <button
                  className={`px-4 py-2 rounded-full transition-colors
                    ${filter === 'read' ? 
                      (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : 
                      (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                  onClick={() => setFilter('read')}
                >
                  Lues
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors
                    ${unreadCount === 0 ? 
                      (darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed') :
                      (darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600 text-white')}`}
                  title="Marquer tout comme lu"
                  disabled={unreadCount === 0}
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
                  Marquer tout comme lu
                </button>
                <button
                  onClick={handleDeleteAllNotifications}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors
                    ${darkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  title="Supprimer toutes les notifications"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Supprimer tout
                </button>
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className={`p-12 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'}`}>
                <FontAwesomeIcon 
                  icon={faBell} 
                  className={`text-4xl mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                />
                <p className="text-lg">Aucune notification disponible.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-5 rounded-xl shadow-sm transition-all
                        ${notification.read ? 
                          (darkMode ? 'bg-gray-700' : 'bg-white') : 
                          (darkMode ? 'bg-indigo-900 border-l-4 border-indigo-400' : 'bg-indigo-50 border-l-4 border-indigo-600')}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`mb-2 ${notification.read ? '' : 'font-semibold'}`}>
                            {notification.message}
                          </p>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className={`p-2 rounded-lg transition-colors
                                ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                              title="Marquer comme lu"
                            >
                              <FontAwesomeIcon icon={faClipboardCheck} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className={`p-2 rounded-lg transition-colors
                              ${darkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                            title="Supprimer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg transition-colors
                      ${page === 1 ? 
                        (darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed') :
                        (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200')}`}
                  >
                    Précédent
                  </button>
                  <span className="text-sm">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg transition-colors
                      ${page === totalPages ? 
                        (darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed') :
                        (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200')}`}
                  >
                    Suivant
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  </div>
);
};

export default NotifParent;
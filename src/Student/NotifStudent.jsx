import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faClipboardCheck, faTrash, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Notifications.css';

const NotifStudent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [filter, setFilter] = useState('all');

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
const goBack = () => {
    navigate('/student-dashboard');
  };
return (
  <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800'}`}>
    <header className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FontAwesomeIcon 
            icon={faBell} 
            className={`text-2xl ${darkMode ? 'text-yellow-400' : 'text-purple-600'}`} 
          />
          <span>Notifications Élève</span>
        </h1>
       
      </div>
    </header>
   
    <main className="container mx-auto px-4 py-6">
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
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div className={`w-12 h-12 border-4 ${darkMode ? 'border-yellow-400' : 'border-purple-500'} border-t-transparent rounded-full animate-spin`}></div>
          <p className="text-lg">Chargement...</p>
        </div>
      ) : error ? (
        <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
          {error}
        </div>
      ) : (
        <>
          <div className={`p-6 mb-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <p className="text-lg mb-4">
              {unreadCount} notification(s) non lue(s) sur {notifications.length}
            </p>
            
            <div className={`h-4 mb-6 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div 
                className={`h-full ${darkMode ? 'bg-yellow-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                className={`px-4 py-2 rounded-full font-medium ${filter === 'all' 
                  ? darkMode 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-purple-600 text-white'
                  : darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-purple-100 hover:bg-purple-200'}`}
                onClick={() => setFilter('all')}
              >
                Toutes
              </button>
              <button
                className={`px-4 py-2 rounded-full font-medium ${filter === 'unread' 
                  ? darkMode 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-purple-600 text-white'
                  : darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-purple-100 hover:bg-purple-200'}`}
                onClick={() => setFilter('unread')}
              >
                Non lues
              </button>
              <button
                className={`px-4 py-2 rounded-full font-medium ${filter === 'read' 
                  ? darkMode 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-purple-600 text-white'
                  : darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-purple-100 hover:bg-purple-200'}`}
                onClick={() => setFilter('read')}
              >
                Lues
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${unreadCount === 0 
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode 
                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                    : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
                title="Marquer tout comme lu"
                disabled={unreadCount === 0}
              >
                <FontAwesomeIcon icon={faClipboardCheck} /> 
                <span>Marquer tout comme lu</span>
              </button>
              <button
                onClick={handleDeleteAllNotifications}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${darkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-white' 
                  : 'bg-red-100 hover:bg-red-200 text-red-800'}`}
                title="Supprimer toutes les notifications"
              >
                <FontAwesomeIcon icon={faTrash} /> 
                <span>Supprimer tout</span>
              </button>
            </div>
          </div>
          
          {filteredNotifications.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-12 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <FontAwesomeIcon 
                icon={faBell} 
                className={`text-5xl mb-4 ${darkMode ? 'text-yellow-400' : 'text-purple-400'}`} 
              />
              <p className="text-xl">Aucune notification disponible.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-5 rounded-xl shadow-md flex justify-between items-start ${notification.read 
                      ? darkMode 
                        ? 'bg-gray-700' 
                        : 'bg-white'
                      : darkMode 
                        ? 'bg-gray-700 border-l-4 border-yellow-400' 
                        : 'bg-white border-l-4 border-purple-500'}`}
                  >
                    <div className="notification-content">
                      <p className={`text-lg ${notification.read ? '' : 'font-bold'}`}>
                        {notification.message}
                      </p>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className={`p-2 rounded-lg ${darkMode 
                            ? 'bg-green-700 hover:bg-green-600 text-white' 
                            : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
                          title="Marquer comme lu"
                        >
                          <FontAwesomeIcon icon={faClipboardCheck} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className={`p-2 rounded-lg ${darkMode 
                          ? 'bg-red-700 hover:bg-red-600 text-white' 
                          : 'bg-red-100 hover:bg-red-200 text-red-800'}`}
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${page === 1 
                    ? darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode 
                      ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-800'}`}
                >
                  Précédent
                </button>
                <span className="font-medium">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${page === totalPages 
                    ? darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode 
                      ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-800'}`}
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
);
};

export default NotifStudent;
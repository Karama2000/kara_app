import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faClipboardCheck, faTrash, faMoon, faSun, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Notifications.css';

const NotifTeacher = () => {
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
 const handleBackToDashboard = () => {
    navigate('/teacher-dashboard');
  };
return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
    {/* Header */}
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">
          <span className={`p-3 rounded-full mr-3 ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-white text-purple-600'}`}>
            🔔
          </span>
          Notifications Enseignant
        </h1>
       <button
                   onClick={handleBackToDashboard}
                   className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
                 >
                   <FontAwesomeIcon icon={faArrowLeft} />           🏠 Retour

                 </button>
      </div>

    {/* Main Content */}
    <main className="container mx-auto p-4 max-w-6xl">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className={`w-16 h-16 border-4 ${darkMode ? 'border-purple-500' : 'border-purple-600'} border-t-transparent rounded-full animate-spin mb-4`}></div>
          <p className={`text-lg ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Chargement en cours...</p>
        </div>
      ) : error ? (
        <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'} flex items-center animate-shake`}>
          <span className="text-2xl mr-3">⚠️</span>
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <>
          {/* Summary Section */}
          <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
              <p className={`text-lg font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                <span className="font-bold">{unreadCount}</span> notification(s) non lue(s) sur <span className="font-bold">{notifications.length}</span>
              </p>
              
              {/* Progress Bar */}
              <div className="w-full md:w-auto flex-grow">
                <div className={`h-4 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full ${darkMode ? 'bg-purple-500' : 'bg-gradient-to-r from-purple-400 to-indigo-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${darkMode ? 
                  (filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600') : 
                  (filter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${darkMode ? 
                  (filter === 'unread' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600') : 
                  (filter === 'unread' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
              >
                Non lues
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${darkMode ? 
                  (filter === 'read' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600') : 
                  (filter === 'read' ? 'bg-green-400 text-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
              >
                Lues
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${darkMode ? 
                  (unreadCount === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white') : 
                  (unreadCount === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white')}`}
              >
                <span className="mr-2">✅</span> Marquer tout comme lu
              </button>
              <button
                onClick={handleDeleteAllNotifications}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${darkMode ? 
                  'bg-red-600 hover:bg-red-700 text-white' : 
                  'bg-red-500 hover:bg-red-600 text-white'}`}
              >
                <span className="mr-2">🗑️</span> Supprimer tout
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-12 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <span className={`text-6xl mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>🔔</span>
              <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucune notification disponible</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-5 rounded-xl transition-all ${darkMode ? 
                      (notification.read ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 border-l-4 border-yellow-400 hover:bg-gray-600') : 
                      (notification.read ? 'bg-white hover:bg-gray-50 shadow-sm' : 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 shadow-md')}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className={`text-lg ${notification.read ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'text-white font-semibold' : 'text-gray-800 font-semibold')}`}>
                          {notification.message}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ⏱️ {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className={`p-2 rounded-full ${darkMode ? 
                              'bg-yellow-500 hover:bg-yellow-400 text-gray-900' : 
                              'bg-yellow-300 hover:bg-yellow-400 text-gray-800'}`}
                            title="Marquer comme lu"
                          >
                            ✅
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className={`p-2 rounded-full ${darkMode ? 
                            'bg-red-600 hover:bg-red-500 text-white' : 
                            'bg-red-400 hover:bg-red-500 text-white'}`}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg mb-2 sm:mb-0 ${darkMode ? 
                    (page === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500 text-white') : 
                    (page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}`}
                >
                  ← Précédent
                </button>
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg mt-2 sm:mt-0 ${darkMode ? 
                    (page === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500 text-white') : 
                    (page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}`}
                >
                  Suivant →
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

export default NotifTeacher;
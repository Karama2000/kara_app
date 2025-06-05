import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowLeft, faEye } from '@fortawesome/free-solid-svg-icons';
import AdminHeader from './AdminHeader';
import kidsImage from '../Assets/images/dashboard/user-profile.avif';

const ManagePendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const fetchPendingUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://kara-back.onrender.com/api/pending-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingUsers(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError("❌ Impossible de charger les utilisateurs en attente.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [navigate]);

  const approveUser = async (id) => {
    if (window.confirm('✅ Approuver cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://kara-back.onrender.com/api/approve-user/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingUsers(pendingUsers.filter((user) => user._id !== id));
        alert('Utilisateur approuvé avec succès');
      } catch {
        alert("❌ Erreur lors de l'approbation.");
      }
    }
  };

  const rejectUser = async (id) => {
    if (window.confirm('🗑️ Rejeter cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://kara-back.onrender.com/api/reject-user/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingUsers(pendingUsers.filter((user) => user._id !== id));
        alert('Utilisateur rejeté avec succès');
      } catch {
        alert("❌ Erreur lors du rejet.");
      }
    }
  };

  const viewUserDetails = (id) => navigate(`/user-details/${id}`);
  const goToDashboard = () => navigate('/admin-dashboard');

  // Fonction pour obtenir l'identifiant spécifique selon le rôle
  const getIdentifier = (user) => {
    switch (user.role) {
      case 'eleve':
        return user.numInscript || 'N/A';
      case 'enseignant':
        return user.matricule || 'N/A';
      case 'parent':
        return user.numTell || 'N/A';
      default:
        return 'N/A';
    }
  };

  // Fonction pour formater le rôle
  const formatRole = (role) => {
    switch (role) {
      case 'eleve': return 'Élève';
      case 'enseignant': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'admin': return 'Admin';
      default: return role || 'Non défini';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <AdminHeader title="👥 Gestion des Utilisateurs en Attente" />

      <img
        src={kidsImage}
        alt="pending"
        className="w-24 mx-auto mb-6 animate-bounce"
      />

      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Retour
        </button>
      </div>

      {loading && <p className="text-blue-600 animate-pulse">⏳ Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && pendingUsers.length === 0 && (
        <p className="text-gray-600">🙈 Aucun utilisateur en attente.</p>
      )}

      {pendingUsers.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-green-100 text-green-700">
              <tr>
                <th className="px-6 py-3 text-left">👤 Nom</th>
                <th className="px-6 py-3 text-left">👤 Prénom</th>
                <th className="px-6 py-3 text-left">🎭 Rôle</th>
                <th className="px-6 py-3 text-left">📧 Email</th>
                <th className="px-6 py-3 text-left">🔢 Identifiant</th>
                <th className="px-6 py-3 text-center">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingUsers.map((user) => (
                <tr key={user._id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4">{user.nom || 'Non défini'}</td>
                  <td className="px-6 py-4">{user.prenom || 'Non défini'}</td>
                  <td className="px-6 py-4">{formatRole(user.role)}</td>
                  <td className="px-6 py-4">{user.email || 'Non défini'}</td>
                  <td className="px-6 py-4">{getIdentifier(user)}</td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => approveUser(user._id)}
                      className="text-green-600 hover:text-green-800 transition"
                      title="Approuver"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={() => rejectUser(user._id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Rejeter"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button
                      onClick={() => viewUserDetails(user._id)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Voir détails"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePendingUsers;
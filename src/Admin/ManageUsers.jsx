import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faArrowLeft, faUserPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import AdminHeader from './AdminHeader';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('https://kara-back.onrender.com/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError("❌ Erreur lors de la récupération des utilisateurs");
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, token]);

  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const response = await axios.get('https://kara-back.onrender.com/api/niveaux', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNiveaux(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des niveaux:', error);
        setError("❌ Erreur lors de la récupération des niveaux");
      }
    };
    fetchNiveaux();
  }, [token]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedNiveau) {
        try {
          const response = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${selectedNiveau}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClasses(response.data);
          setSelectedClasse('');
        } catch (error) {
          console.error('Erreur lors de la récupération des classes:', error);
          setError("❌ Erreur lors de la récupération des classes");
          setClasses([]);
        }
      } else {
        setClasses([]);
        setSelectedClasse('');
      }
    };
    fetchClasses();
  }, [selectedNiveau, token]);

  const deleteUser = async (id) => {
    if (window.confirm('🗑️ Supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`https://kara-back.onrender.com/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== id));
        alert('✅ Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        setError("❌ Erreur lors de la suppression de l'utilisateur");
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    }
  };

  const editUser = (id) => navigate(`/edit-user/${id}`);
  const viewUserDetails = (id) => navigate(`/user-details/${id}`);
  const addUser = () => navigate('/add-user');
  const goToDashboard = () => navigate('/admin-dashboard');

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (imageUrl) => {
    const baseUrl = 'https://kara-back.onrender.com/Uploads';
    const timestamp = new Date().getTime(); // Pour éviter le cache
    if (!imageUrl) {
      return '/images/placeholder.png';
    }
    if (imageUrl.startsWith('http')) {
      return `${imageUrl}?t=${timestamp}`;
    }
    return `${baseUrl}/${imageUrl}?t=${timestamp}`;
  };

  let filteredUsers = users;

  if (searchQuery) {
    filteredUsers = filteredUsers.filter((user) =>
      `${user.nom || ''} ${user.prenom || ''} ${user.email || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }

  if (selectedRole) {
    filteredUsers = filteredUsers.filter((user) => user.role === selectedRole);
  }

  if (selectedRole === 'eleve') {
    if (selectedNiveau) {
      filteredUsers = filteredUsers.filter((user) => user.niveau?._id === selectedNiveau);
    }
    if (selectedClasse) {
      filteredUsers = filteredUsers.filter((user) => user.classe?._id === selectedClasse);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <AdminHeader title="👥 Gestion des Utilisateurs" />

      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> 🏠 Retour
        </button>
      </div>

      {loading && <p className="text-blue-600 animate-pulse">⏳ Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-6 grid md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            className="w-full pl-10 pr-4 py-2 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={addUser}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faUserPlus} /> Ajouter un utilisateur
        </button>
      </div>

      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-green-700 mb-1">Rôle :</label>
          <select
            className="w-full p-2 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setSelectedNiveau('');
              setSelectedClasse('');
            }}
          >
            <option value="">👤 Tous les rôles</option>
            <option value="admin">👨‍💼 Admin</option>
            <option value="enseignant">👩‍🏫 Enseignant</option>
            <option value="parent">👪 Parent</option>
            <option value="eleve">🧒 Élève</option>
          </select>
        </div>

        {selectedRole === 'eleve' && (
          <>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Niveau :</label>
              <select
                className="w-full p-2 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
              >
                <option value="">📚 Tous les niveaux</option>
                {niveaux.map((niveau) => (
                  <option key={niveau._id} value={niveau._id}>
                    {niveau.nom}
                  </option>
                ))}
              </select>
            </div>
            {selectedNiveau && (
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Classe :</label>
                <select
                  className="w-full p-2 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                  value={selectedClasse}
                  onChange={(e) => setSelectedClasse(e.target.value)}
                >
                  <option value="">🏫 Toutes les classes</option>
                  {classes.map((classe) => (
                    <option key={classe._id} value={classe._id}>
                      {classe.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {filteredUsers.length > 0 ? (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-green-100 text-green-700">
              <tr>
                <th className="px-6 py-3 text-left">👤 Photo</th>
                <th className="px-6 py-3 text-left">📛 Nom</th>
                <th className="px-6 py-3 text-left">📧 Email</th>
                <th className="px-6 py-3 text-left">🎭 Rôle</th>
                {selectedRole === 'eleve' && (
                  <>
                    <th className="px-6 py-3 text-left">🏫 Classe</th>
                    <th className="px-6 py-3 text-left">📚 Niveau</th>
                  </>
                )}
                {selectedRole === 'parent' && (
                  <th className="px-6 py-3 text-left">👶 Enfants</th>
                )}
                <th className="px-6 py-3 text-center">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4">
                    <img
                      src={getImageUrl(user.imageUrl)}
                      alt={`${user.nom || ''} ${user.prenom || ''}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                      onError={(e) => {
                        console.warn(`Erreur de chargement de l'image pour l'utilisateur ${user._id}: ${user.imageUrl}`);
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">{user.nom || '-'} {user.prenom || ''}</td>
                  <td className="px-6 py-4">{user.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {user.role || '-'}
                    </span>
                  </td>
                  {selectedRole === 'eleve' && (
                    <>
                      <td className="px-6 py-4">{user.classe?.nom || '-'}</td>
                      <td className="px-6 py-4">{user.niveau?.nom || '-'}</td>
                    </>
                  )}
                  {selectedRole === 'parent' && (
                    <td className="px-6 py-4">
                      {user.enfants?.length
                        ? user.enfants.map((e) => `${e.nom} ${e.prenom}`).join(', ')
                        : 'Aucun enfant'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => editUser(user._id)}
                      className="text-yellow-600 hover:text-yellow-800 transition"
                      title="Modifier"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Supprimer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      onClick={() => viewUserDetails(user._id)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Détails"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-6">🙈 Aucun utilisateur trouvé</p>
      )}
    </div>
  );
};

export default ManageUsers;
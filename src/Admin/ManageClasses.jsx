import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faArrowLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import AdminHeader from './AdminHeader';

import schoolIllustration from '../Assets/images/dashboard/school.avif';
import studentIllustration from '../Assets/images/dashboard/kids-learning.avif';

const ManageClasses = () => {
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setLoading(true);
    axios.get('https://kara-back.onrender.com/api/niveaux', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setNiveaux(response.data))
      .catch(error => {
        console.error('Erreur niveaux', error);
        setError("❌ Impossible de charger les niveaux");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (selectedNiveau) {
      setLoading(true);
      axios.get(`https://kara-back.onrender.com/api/classes/niveau/${selectedNiveau}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(response => {
          setClasses(response.data);
          setSelectedClasse('');
          setEleves([]);
        })
        .catch(error => {
          console.error('Erreur classes', error);
          setError("❌ Impossible de charger les classes");
          setClasses([]);
          setEleves([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedNiveau]);

  useEffect(() => {
    if (selectedClasse) {
      setLoading(true);
      axios.get(`https://kara-back.onrender.com/api/classes/${selectedClasse}/eleves`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(response => {
          const fetched = Array.isArray(response.data) ? response.data : [];
          setEleves(fetched);
        })
        .catch(error => {
          console.error('Erreur élèves:', error);
          setError("❌ Impossible de charger les élèves");
          setEleves([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedClasse]);

  const handlePassStatus = async (eleveId, hasPassed) => {
    if (window.confirm(hasPassed ? '✅ Marquer cet élève comme admis ?' : '❌ Marquer cet élève comme non admis ?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('https://kara-back.onrender.com/api/classes/eleve/pass', {
          eleveId,
          hasPassed
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(res.data.message);

        if (selectedClasse) {
          const elevesResponse = await axios.get(`https://kara-back.onrender.com/api/classes/${selectedClasse}/eleves`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEleves(Array.isArray(elevesResponse.data) ? elevesResponse.data : []);
        }

        if (selectedNiveau) {
          const classesResponse = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${selectedNiveau}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClasses(classesResponse.data);
        }
      } catch (error) {
        console.error('Erreur statut élève:', error);
        alert(error.response?.data?.message || '❌ Erreur de mise à jour');
      }
    }
  };

  const editClasse = (id) => navigate(`/edit-class/${id}`);
  const viewClasseDetails = (id) => navigate(`/class-details/${id}`);
  const goToDashboard = () => navigate('/admin-dashboard');

  const deleteClasse = async (id) => {
    if (window.confirm('🗑️ Supprimer cette classe ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://kara-back.onrender.com/api/classes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(classes.filter(classe => classe._id !== id));
        setSelectedClasse('');
        setEleves([]);
        alert('✅ Classe supprimée avec succès');
      } catch (error) {
        console.error('Erreur suppression', error);
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <AdminHeader title="🏫 Gestion des Classes" />

      <img
        src={schoolIllustration}
        alt="classes"
        className="w-24 mx-auto mb-6 animate-bounce"
      />

      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faArrowLeft} />           🏠 Retour

        </button>
      </div>

      {loading && <p className="text-blue-600 animate-pulse">⏳ Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select
          value={selectedNiveau}
          onChange={(e) => setSelectedNiveau(e.target.value)}
          className="border-2 border-green-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
        >
          <option value="">📚 Sélectionner un niveau</option>
          {niveaux.map(n => <option key={n._id} value={n._id}>{n.nom}</option>)}
        </select>

        <select
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
          disabled={!selectedNiveau}
          className="border-2 border-green-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
        >
          <option value="">🏫 Sélectionner une classe</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
        </select>
      </div>

      {selectedClasse && (
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
            <img src={studentIllustration} alt="Élèves" className="w-8 h-8" />
            Élèves de la classe
          </h3>
          
          {eleves.length === 0 ? (
            <p className="text-gray-600">🙈 Aucun élève trouvé.</p>
          ) : (
            <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-green-100 text-green-700">
                  <tr>
                    <th className="px-6 py-3 text-left">👤 Nom</th>
                    <th className="px-6 py-3 text-left">📊 Statut</th>
                    <th className="px-6 py-3 text-center">⚙️ Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eleves.map(eleve => (
                    <tr key={eleve._id} className="hover:bg-green-50 transition">
                      <td className="px-6 py-4">{eleve.nom || 'Non défini'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${eleve.hasPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {eleve.hasPassed ? 'Admis' : 'Non admis'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-3">
                        <button
                          onClick={() => handlePassStatus(eleve._id, true)}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Marquer comme admis"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          onClick={() => handlePassStatus(eleve._id, false)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Marquer comme non admis"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {classes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
            🏫 Classes du niveau
          </h3>
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-100 text-green-700">
                <tr>
                  <th className="px-6 py-3 text-left">🏫 Classe</th>
                  <th className="px-6 py-3 text-center">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.map(classe => (
                  <tr key={classe._id} className="hover:bg-green-50 transition">
                    <td className="px-6 py-4 font-medium">{classe.nom}</td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button
                        onClick={() => viewClasseDetails(classe._id)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Voir détails"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => editClasse(classe._id)}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                        title="Modifier"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => deleteClasse(classe._id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;
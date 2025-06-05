import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import puzzleImage from '../Assets/images/dashboard/puzzle.jpg';

const ManageUnits = () => {
  const [units, setUnits] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const response = await axios.get('https://kara-back.onrender.com/api/admin/programs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrograms(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('❌ Impossible de charger les programmes.');
        }
      }
    };

    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const response = await axios.get('https://kara-back.onrender.com/api/units', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnits(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('❌ Impossible de charger les unités.');
        }
        setLoading(false);
      }
    };

    fetchPrograms();
    fetchUnits();
  }, [navigate]);

  const deleteUnit = async (id) => {
    if (window.confirm("🗑️ Supprimer cette unité ?")) {
      setDeletingId(id);
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        await axios.delete(`https://kara-back.onrender.com/api/units/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnits(units.filter((unit) => unit._id !== id));
        alert('✅ Unité supprimée avec succès');
      } catch (error) {
        alert('❌ Erreur lors de la suppression');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const editUnit = (id) => navigate(`/edit-unit/${id}`);
  const viewUnitDetails = (id) => navigate(`/unit-details/${id}`);
  const addUnit = () => navigate('/add-unit');
  const goToDashboard = () => navigate('/admin-dashboard');

  const filteredUnits = selectedProgram
    ? units.filter(
        (unit) =>
          (unit.programId?._id === selectedProgram) || (unit.programId === selectedProgram)
      )
    : units;

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <AdminHeader title="🎓 Gestion des Unités" />

      {/* Illustration */}
      <img
        src={puzzleImage}
        alt="education"
        className="w-24 mx-auto mb-6 animate-bounce"
      />

      {/* Buttons */}
      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          🏠 Retour
        </button>

        <button
          onClick={addUnit}
          className="ml-auto px-5 py-2 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg"
        >
          ➕ Ajouter une Unité
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        {programs.length === 0 ? (
          <p className="text-gray-500">🙁 Aucun programme disponible.</p>
        ) : (
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="border border-purple-300 rounded px-4 py-2 w-full max-w-xs bg-purple-50 text-purple-800"
          >
            <option value="">🎯 Tous les programmes</option>
            {programs.map((program) => (
              <option key={program._id} value={program._id}>
                {program.title} ({program.niveauId?.nom || 'Niveau ?'})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      {loading && <p className="text-blue-600 animate-pulse">⏳ Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && filteredUnits.length === 0 && (
        <p className="text-gray-600">🙈 Aucune unité trouvée.</p>
      )}

      {/* Table */}
      {filteredUnits.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-100 text-blue-700">
              <tr>
                <th className="px-6 py-3 text-left">📘 Titre</th>
                <th className="px-6 py-3 text-left">🎓 Programme</th>
                <th className="px-6 py-3 text-left">📝 Description</th>
                <th className="px-6 py-3 text-center">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUnits.map((unit) => {
                const program = programs.find(
                  (p) => p._id === (unit.programId?._id || unit.programId)
                );
                return (
                  <tr key={unit._id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4">{unit.title}</td>
                    <td className="px-6 py-4">
                      {program
                        ? `${program.title} (${program.niveauId?.nom || 'Niveau ?'})`
                        : 'Non spécifié'}
                    </td>
                    <td className="px-6 py-4">{unit.description || 'Aucune description'}</td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button
                        onClick={() => editUnit(unit._id)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                        title="✏️ Éditer"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteUnit(unit._id)}
                        className="text-red-600 hover:text-red-800 transition"
                        disabled={deletingId === unit._id}
                        title="🗑️ Supprimer"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => viewUnitDetails(unit._id)}
                        className="text-green-600 hover:text-green-800 transition"
                        title="👁️ Voir détails"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUnits;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBookOpen, faTasks, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut';

// Import des images
import unitImage from '../Assets/images/dashboard/learning-unit.avif';
import booksImage from '../Assets/images/dashboard/books-stack.jpg';

const AddUnit = () => {
  const [formData, setFormData] = useState({
    programId: '',
    title: '',
    description: '',
  });
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('https://kara-back.onrender.com/api/admin/programs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrograms(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des programmes', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(error.response?.data?.message || 'Impossible de charger les programmes.');
        }
      }
    };
    fetchPrograms();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post('https://kara-back.onrender.com/api/units', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Unité créée avec succès ! 🎉');
      navigate('/manage-units');
    } catch (error) {
      console.error('Erreur lors de la création de l\'unité', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Erreur lors de la création de l\'unité');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/manage-units');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center px-4 py-8 relative">
      <div className="absolute top-6 right-6">
        <LogoutButton />
      </div>

      {/* Bouton retour avec style amélioré */}
      <button 
        onClick={goBack}
        className="absolute top-6 left-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xl" />
          🏠 Retour
      </button>

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border-t-8 border-blue-500 relative overflow-hidden mt-10">
        {/* Décoration visuelle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full opacity-20"></div>
        
        <div className="flex flex-col items-center mb-6">
          <img src={unitImage} alt="Unité d'apprentissage" className="w-24 h-24 mb-4" />
          <h2 className="text-3xl font-bold text-center text-blue-600">
            <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
            Nouvelle Unité
          </h2>
          <p className="text-gray-500 mt-2 text-center">Créez une nouvelle unité d'apprentissage</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl border-l-4 border-red-500">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-xl border-l-4 border-blue-500 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Création en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2 text-lg">
              Programme <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="programId"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Choisissez un programme</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.title} ({program.niveauId?.nom || 'Niveau non spécifié'})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-4 text-blue-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2 text-lg">
              Titre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Les animaux, Les nombres..."
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <FontAwesomeIcon icon={faTasks} className="absolute right-4 top-4 text-blue-300" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2 text-lg">
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez cette unité (optionnel)"
                rows={4}
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
              <FontAwesomeIcon icon={faAlignLeft} className="absolute right-4 top-4 text-blue-300" />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
              } text-white font-bold flex items-center justify-center`}
            >
              <img src={booksImage} alt="Livres" className="w-6 h-6 mr-2" />
              {loading ? 'Création en cours...' : "Créer l'Unité"}
            </button>
          </div>
        </form>
      </div>

      {/* Message décoratif en bas de page */}
      <p className="mt-8 text-gray-500 text-center max-w-md">
        "Chaque unité est une nouvelle aventure d'apprentissage !"
      </p>
    </div>
  );
};

export default AddUnit;
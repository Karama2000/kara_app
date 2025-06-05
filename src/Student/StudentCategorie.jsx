import React, { useState, useEffect } from 'react';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faArrowLeft,faExclamationCircle,faSearch,faFolderOpen,faImage,faArrowRight } from '@fortawesome/free-solid-svg-icons';
import '../Styles/StudentCategories.css';

const StudentCategories = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get('https://kara-back.onrender.com/api/student/categories', config);
        setCategories(response.data);
        setFilteredCategories(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setError(error.response?.data?.message || 'Erreur lors du chargement des catégories.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCategories();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    setFilteredCategories(
      categories.filter(category =>
        category.nom.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, categories]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const navigateToVocabList = (category) => {
    navigate(`/student/vocab/${category._id}?categorieName=${encodeURIComponent(category.nom)}`);
  };

  const playSavedAudio = (audioPath) => {
    if (audioPath) {
      const audio = new Audio(`https://kara-back.onrender.com/uploads/${audioPath}`);
      audio.play().catch(err => {
        setError('Erreur de lecture audio: ' + err.message);
      });
    }
  };

  const goBack = () => {
    navigate('/student-dashboard');
  };

 return (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white text-center drop-shadow-md">
          Catégories de Vocabulaire 🎨📚
        </h1>
      </div>
    </header>

    <main className="container mx-auto px-4 py-8">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-purple-700 font-medium">Chargement en cours...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg flex items-start gap-3 animate-shake">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-xl mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
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
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-white p-4 rounded-xl shadow-md">
       
        
        <div className="relative flex-grow w-full">
          <input
            type="text"
            placeholder="🔍 Rechercher une catégorie..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full py-3 px-6 pr-12 border-2 border-purple-200 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
          <span className="absolute right-4 top-3 text-purple-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">
        Explore les Catégories 🗂️
      </h2>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faFolderOpen} className="text-3xl text-purple-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Aucune catégorie trouvée
          </h3>
          <p className="text-gray-500">
            Essayez de modifier votre recherche ou revenez plus tard !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map(category => (
            <div
              key={category._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => navigateToVocabList(category)}
            >
              <div className="relative">
                {category.imageUrl ? (
                  <img
                    src={`https://kara-back.onrender.com/uploads/${category.imageUrl}`}
                    alt={category.nom}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-purple-300" />
                  </div>
                )}
                
                {category.audioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSavedAudio(category.audioUrl);
                    }}
                    className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                    title="Jouer l'audio"
                  >
                    <FontAwesomeIcon icon={faVolumeUp} />
                  </button>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                  {category.nom}
                  <span className="ml-2 text-purple-500">→</span>
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Clique pour explorer
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-purple-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  </div>
);
};

export default StudentCategories;
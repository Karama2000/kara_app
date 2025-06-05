import React, { useState, useEffect, useRef } from 'react';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../Styles/StudentVocabulary.css';

const StudentVocabulary = () => {
  const { categorieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [vocab, setVocab] = useState([]);
  const [filteredVocab, setFilteredVocab] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get('categorieName');
    setCategoryName(decodeURIComponent(name || 'Catégorie'));
  }, [location]);

  useEffect(() => {
    const fetchVocab = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(
          `https://kara-back.onrender.com/api/student/vocab?categorieId=${categorieId}`,
          config
        );
        setVocab(response.data);
        setFilteredVocab(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du vocabulaire:', error);
        setError(error.response?.data?.message || 'Erreur lors du chargement du vocabulaire.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token && categorieId) {
      fetchVocab();
    } else {
      navigate('/login');
    }
  }, [token, categorieId, navigate]);

  useEffect(() => {
    setFilteredVocab(
      vocab.filter(v => v.mot.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, vocab]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const showVocabDetails = (vocabItem) => {
    setSelectedVocab(vocabItem);
  };

  const closeVocabDetails = () => {
    setSelectedVocab(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioRef.current = new Audio(`https://kara-back.onrender.com/uploads/${audioUrl}`);
    audioRef.current.play().catch(err => {
      setError('Erreur de lecture audio: ' + err.message);
    });
  };

  const goBack = () => {
    navigate('/student/categorie');
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            Vocabulaire - <span className="text-yellow-300">{categoryName}</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg font-medium text-purple-700">Chargement...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          
          
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un mot..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm"
            />
          </div>
        </div>

        {/* Vocabulary Section */}
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-6">
          Vocabulaire
        </h2>

        {filteredVocab.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="mt-4 text-xl text-gray-600">Aucun mot trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredVocab.map(vocabItem => (
              <div
                key={vocabItem._id}
                onClick={() => showVocabDetails(vocabItem)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              >
                {/* Image Preview */}
                {vocabItem.imageUrl && (
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    <img
                      src={`https://kara-back.onrender.com/uploads/${vocabItem.imageUrl}`}
                      alt={vocabItem.mot}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                )}
                
                <div className="p-4 relative">
                  <h3 className="text-lg font-bold text-center text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    {vocabItem.mot}
                  </h3>
                  
                  {/* Audio Button */}
                  {vocabItem.audioUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(vocabItem.audioUrl);
                      }}
                      className="absolute -top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all duration-300"
                      title="Jouer le mot"
                      aria-label={`Jouer le mot ${vocabItem.mot}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vocabulary Modal */}
        {selectedVocab && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-labelledby="modal-title" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative">
              {/* Close Button */}
              <button
                onClick={closeVocabDetails}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full p-2 transition-colors duration-300"
                title="Fermer"
                aria-label="Fermer la fenêtre"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {/* Modal Content */}
              <div className="p-6">
                {/* Large Image */}
                {selectedVocab.imageUrl && (
                  <div className="mb-6 bg-gray-100 rounded-lg p-4 flex justify-center">
                    <img
                      src={`https://kara-back.onrender.com/uploads/${selectedVocab.imageUrl}`}
                      alt={selectedVocab.mot}
                      className="h-48 object-contain"
                    />
                  </div>
                )}

                <h2 id="modal-title" className="text-3xl font-bold text-center text-indigo-800 mb-2">
                  {selectedVocab.mot}
                </h2>

                <div className="mb-6 text-center">
                  <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    Catégorie: {selectedVocab.categorieId?.nom || 'N/A'}
                  </span>
                </div>

                {/* Audio Button */}
                {selectedVocab.audioUrl && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => playAudio(selectedVocab.audioUrl)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center transition-all duration-300 transform hover:scale-105"
                      title="Jouer le mot"
                      aria-label={`Jouer le mot ${selectedVocab.mot}`}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"></path>
                      </svg>
                      Jouer le mot
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentVocabulary;
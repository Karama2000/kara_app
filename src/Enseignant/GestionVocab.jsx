import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faArrowLeft, faVolumeUp, faMicrophone, faStop, faTimes,faExclamationCircle,faSave,faCheckCircle,faSearch,faUpload } from '@fortawesome/free-solid-svg-icons';
import '../Styles/GestionVocab.css';
import vocabIllustration from '../Assets/images/dashboard/test.avif';

const GestionVocab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vocabs, setVocabs] = useState([]);
  const [filteredVocabs, setFilteredVocabs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    mot: '',
    categorieId: '',
    imageFile: null,
    audioFile: null,
    existingImage: null,
    existingAudio: null,
  });
  const [editingVocabId, setEditingVocabId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categorieId = params.get('categorieId');
    const categorieName = params.get('categorieName');
    if (categorieId) {
      setFormData((prev) => ({ ...prev, categorieId }));
      setCategoryName(decodeURIComponent(categorieName || ''));
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté.');
          return;
        }
        const params = new URLSearchParams(location.search);
        const categorieId = params.get('categorieId');
        const [categoriesRes, vocabRes] = await Promise.all([
          axios.get('https://kara-back.onrender.com/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://kara-back.onrender.com/api/vocab', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCategories(categoriesRes.data);
        const allVocabs = vocabRes.data;
        setVocabs(allVocabs);
        setFilteredVocabs(
          categorieId
            ? allVocabs.filter((vocab) => vocab.categorieId?._id === categorieId)
            : allVocabs
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des données.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location, success]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setFormData((prev) => ({
          ...prev,
          audioFile: new File([blob], 'recorded_audio.wav', { type: 'audio/wav' }),
        }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Accès au microphone refusé ou non supporté : ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (name === 'imageFile' && !file.type.match(/image\/(jpeg|png)/)) {
        setError('Seuls les fichiers JPEG et PNG sont autorisés pour les images.');
        return;
      }
      if (name === 'audioFile' && !file.type.match(/audio\/(mpeg|wav|ogg|opus)/)) {
        setError('Seuls les fichiers MP3, WAV, OGG et OPUS sont autorisés pour l\'audio.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('La taille du fichier ne doit pas dépasser 10MB.');
        return;
      }

      if (name === 'audioFile') {
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        audioRef.current = new Audio(url);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
    setError('');
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        setError('Erreur lors de la lecture de l\'audio : ' + err.message);
      });
    } else if (formData.existingAudio) {
      const audio = new Audio(`https://kara-back.onrender.com/uploads/${formData.existingAudio}`);
      audio.play().catch((err) => {
        setError('Erreur lors de la lecture de l\'audio : ' + err.message);
      });
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploadProgress(0);

    if (!formData.mot.trim()) {
      setError('Veuillez entrer un mot.');
      return;
    }
    if (!formData.categorieId) {
      setError('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!formData.imageFile && !formData.existingImage) {
      setError('Veuillez fournir une image.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('mot', formData.mot);
      formDataToSend.append('categorieId', formData.categorieId);

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      } else if (formData.existingImage) {
        formDataToSend.append('existingImage', formData.existingImage);
      }

      if (formData.audioFile) {
        formDataToSend.append('audio', formData.audioFile);
      } else if (formData.existingAudio) {
        formDataToSend.append('existingAudio', formData.existingAudio);
      }

      // Log pour déboguer
      for (let pair of formDataToSend.entries()) {
        console.log(`FormData: ${pair[0]} => ${pair[1]}`);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
        timeout: 60000,
      };

      if (editingVocabId) {
        await axios.put(
          `https://kara-back.onrender.com/api/vocab/${editingVocabId}`,
          formDataToSend,
          config
        );
        setSuccess('Vocabulaire mis à jour avec succès.');
      } else {
        await axios.post('https://kara-back.onrender.com/api/vocab', formDataToSend, config);
        setSuccess('Vocabulaire créé avec succès.');
      }

      const vocabRes = await axios.get('https://kara-back.onrender.com/api/vocab', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allVocabs = vocabRes.data;
      setVocabs(allVocabs);

      const params = new URLSearchParams(location.search);
      const categorieId = params.get('categorieId');
      setFilteredVocabs(
        categorieId
          ? allVocabs.filter((vocab) => vocab.categorieId?._id === categorieId)
          : allVocabs
      );

      setFormData({
        mot: '',
        categorieId: formData.categorieId,
        imageFile: null,
        audioFile: null,
        existingImage: null,
        existingAudio: null,
      });
      setEditingVocabId(null);
      setShowForm(false);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      let errorMessage = 'Erreur lors de la soumission.';
      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = 'Fichier trop volumineux (max 10MB).';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = err.response.data?.message || `Erreur serveur (${err.response.status}).`;
        }
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Requête expirée (60s).';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Erreur réseau.';
      }
      setError(errorMessage);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleEdit = (vocab) => {
    setFormData({
      mot: vocab.mot,
      categorieId: vocab.categorieId?._id || formData.categorieId,
      imageFile: null,
      audioFile: null,
      existingImage: vocab.imageUrl || null,
      existingAudio: vocab.audioUrl || null,
    });
    setEditingVocabId(vocab._id);
    setShowForm(true);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce vocabulaire ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://kara-back.onrender.com/api/vocab/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVocabs(vocabs.filter((v) => v._id !== id));
      setFilteredVocabs(filteredVocabs.filter((v) => v._id !== id));
      setSuccess('Vocabulaire supprimé avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du vocabulaire.');
    }
  };

  const showVocabDetails = (vocab) => {
    setSelectedVocab(vocab);
  };

  const closeVocabDetails = () => {
    setSelectedVocab(null);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setFormData({
      mot: '',
      categorieId: formData.categorieId,
      imageFile: null,
      audioFile: null,
      existingImage: null,
      existingAudio: null,
    });
    setEditingVocabId(null);
    setError('');
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const goBack = () => {
    navigate('/teacher/categories');
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredVocabs(
      vocabs.filter(
        (vocab) =>
          vocab.mot.toLowerCase().includes(query) &&
          (!formData.categorieId || vocab.categorieId?._id === formData.categorieId)
      )
    );
  };

  const playSavedAudio = (audioPath) => {
    const audio = new Audio(`https://kara-back.onrender.com/uploads/${audioPath}`);
    audio.play().catch((err) => {
      setError('Erreur lors de la lecture de l\'audio : ' + err.message);
    });
  };

 return (
  <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-green-700">
        📚 Vocabulaire - {categoryName || 'Sélectionner une catégorie'}
      </h1>
    </header>

    {isLoading && (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-2 text-gray-600">Chargement en cours...</p>
      </div>
    )}

    {error && (
      <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
        {error}
      </div>
    )}

    {success && (
      <div className="p-4 mb-6 bg-green-100 border-l-4 border-green-500 text-green-700">
        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
        {success}
      </div>
    )}

    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex gap-3">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
          title="Retour aux catégories"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
          title="Ajouter un vocabulaire"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      
      <div className="relative w-full md:w-64">
        <input
          type="text"
          placeholder="Rechercher un mot..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border-2 border-green-300 rounded-full focus:ring-green-500 focus:border-green-500 shadow-sm"
        />
        <FontAwesomeIcon 
          icon={faSearch} 
          className="absolute left-3 top-3 text-gray-400"
        />
      </div>
    </div>

    {showForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">
              {editingVocabId ? '✏️ Modifier le vocabulaire' : '➕ Créer un vocabulaire'}
            </h2>
            <button 
              onClick={toggleForm} 
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Mot *</label>
                <input
                  type="text"
                  name="mot"
                  value={formData.mot}
                  onChange={handleInputChange}
                  required
                  className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Catégorie *</label>
                <select
                  name="categorieId"
                  value={formData.categorieId}
                  onChange={handleInputChange}
                  required
                  className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Image {!editingVocabId && '*'}
              </label>
              {formData.existingImage && (
                <p className="text-sm text-gray-500 mb-2">
                  Image actuelle: {formData.existingImage}
                </p>
              )}
              <input
                type="file"
                name="imageFile"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                required={!editingVocabId && !formData.existingImage}
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Audio</label>
              
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label 
                    htmlFor="audioFile" 
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition"
                  >
                    <FontAwesomeIcon icon={faUpload} />
                    Téléverser
                  </label>
                  <input
                    id="audioFile"
                    type="file"
                    name="audioFile"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg w-full transition"
                    >
                      <FontAwesomeIcon icon={faMicrophone} />
                      Enregistrer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg w-full transition"
                    >
                      <FontAwesomeIcon icon={faStop} />
                      Arrêter
                    </button>
                  )}
                </div>

                <div>
                  {(formData.audioFile || formData.existingAudio || audioBlob) && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={playAudio}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                      >
                        <FontAwesomeIcon icon={faVolumeUp} />
                        Lire
                      </button>
                      <button
                        type="button"
                        onClick={stopAudio}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                      >
                        <FontAwesomeIcon icon={faStop} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {formData.audioFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Fichier sélectionné: {formData.audioFile.name}
                </p>
              )}
              {formData.existingAudio && !formData.audioFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Audio actuel: {formData.existingAudio}
                </p>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingVocabId ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={editingVocabId ? faSave : faPlus} />
                    {editingVocabId ? 'Mettre à jour' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
      <img src={vocabIllustration} alt="Vocabulaires" className="w-8 h-8" />
      Vocabulaires
    </h2>

    {filteredVocabs.length === 0 ? (
      <p className="text-gray-600 py-8 text-center">🙈 Aucun vocabulaire trouvé.</p>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVocabs.map((vocab) => (
          <div
            key={vocab._id}
            className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition cursor-pointer"
            onClick={() => showVocabDetails(vocab)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-green-700">{vocab.mot}</h3>
              {vocab.audioUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSavedAudio(vocab.audioUrl);
                  }}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition"
                  title="Lire le mot"
                  aria-label={`Lire le mot ${vocab.mot}`}
                >
                  <FontAwesomeIcon icon={faVolumeUp} />
                </button>
              )}
            </div>

            {vocab.imageUrl && (
              <img
                src={`https://kara-back.onrender.com/uploads/${vocab.imageUrl}`}
                alt={vocab.mot}
                className="w-full h-32 object-contain mb-3 rounded-lg border border-gray-200"
              />
            )}

            <p className="text-gray-600 mb-4">
              <span className="font-medium">Catégorie:</span> {vocab.categorieId?.nom || 'N/A'}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(vocab);
                }}
                className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-full transition"
                title="Modifier le vocabulaire"
                aria-label={`Modifier le vocabulaire ${vocab.mot}`}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(vocab._id);
                }}
                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                title="Supprimer le vocabulaire"
                aria-label={`Supprimer le vocabulaire ${vocab.mot}`}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showVocabDetails(vocab);
                }}
                className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition"
                title="Voir les détails"
                aria-label={`Voir les détails de ${vocab.mot}`}
              >
                <FontAwesomeIcon icon={faEye} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {selectedVocab && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">{selectedVocab.mot}</h2>
            <button 
              onClick={closeVocabDetails} 
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {selectedVocab.imageUrl && (
            <img
              src={`https://kara-back.onrender.com/uploads/${selectedVocab.imageUrl}`}
              alt={selectedVocab.mot}
              className="w-full h-48 object-contain mb-4 rounded-lg border border-gray-200"
            />
          )}

          <p className="text-gray-600 mb-2">
            <span className="font-medium">Catégorie:</span> {selectedVocab.categorieId?.nom || 'N/A'}
          </p>

          {selectedVocab.audioUrl && (
            <button
              onClick={() => playSavedAudio(selectedVocab.audioUrl)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full mt-4 transition"
              title="Lire le mot"
            >
              <FontAwesomeIcon icon={faVolumeUp} />
              Lire le mot
            </button>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default GestionVocab;
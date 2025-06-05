import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit,faBook,faSave, faTrash, faVolumeUp, faMicrophone, faStop, faArrowLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import categoryIllustration from '../Assets/images/dashboard/lesson.avif';
import folderIllustration from '../Assets/images/dashboard/test.avif';

const GestionCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    imageFile: null,
    audioFile: null,
    existingImage: null,
    existingAudio: null
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté.');
          return;
        }
        const res = await axios.get('https://kara-back.onrender.com/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
        setFilteredCategories(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des catégories.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [success]);

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
        setFormData(prev => ({ ...prev, audioFile: new File([blob], 'recorded_audio.wav', { type: 'audio/wav' }) }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Accès au microphone refusé ou non supporté: ' + err.message);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (name === 'imageFile' && !file.type.match(/image\/(jpeg|png)/)) {
        setError('Seuls les fichiers JPEG et PNG sont autorisés pour les images');
        return;
      }
      if (name === 'audioFile' && !file.type.match(/audio\/(mpeg|wav|ogg|opus)/)) {
        setError('Seuls les fichiers MP3, WAV, OGG et OPUS sont autorisés pour l\'audio');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('La taille du fichier ne doit pas dépasser 50MB');
        return;
      }

      if (name === 'audioFile') {
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        audioRef.current = new Audio(url);
      }
    }

    setFormData(prev => ({ ...prev, [name]: file }));
    setError('');
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        setError('Erreur de lecture audio: ' + err.message);
      });
    } else if (formData.existingAudio) {
      const audio = new Audio(`https://kara-back.onrender.com/uploads/${formData.existingAudio}`);
      audio.play().catch(err => {
        setError('Erreur de lecture audio: ' + err.message);
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

    if (!formData.nom.trim()) {
      setError('Veuillez entrer un nom de catégorie');
      return;
    }
    if (!formData.imageFile && !formData.existingImage) {
      setError('Veuillez fournir une image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile); // Changé de 'imageUrl' à 'image'
      } else if (formData.existingImage) {
        formDataToSend.append('existingImage', formData.existingImage);
      }

      if (formData.audioFile) {
        formDataToSend.append('audio', formData.audioFile);
      } else if (formData.existingAudio) {
        formDataToSend.append('existingAudio', formData.existingAudio);
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

      if (editingCategoryId) {
        await axios.put(
          `https://kara-back.onrender.com/api/categories/${editingCategoryId}`,
          formDataToSend,
          config
        );
        setSuccess('Catégorie mise à jour avec succès');
      } else {
        await axios.post(
          'https://kara-back.onrender.com/api/categories',
          formDataToSend,
          config
        );
        setSuccess('Catégorie créée avec succès');
      }

      const categoriesRes = await axios.get('https://kara-back.onrender.com/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categoriesRes.data);
      setFilteredCategories(categoriesRes.data);

      setFormData({
        nom: '',
        imageFile: null,
        audioFile: null,
        existingImage: null,
        existingAudio: null,
      });
      setEditingCategoryId(null);
      setShowForm(false);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      let errorMessage = 'Erreur lors de la soumission';
      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = 'Fichier trop volumineux (max 10MB)';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = err.response.data?.message || `Erreur serveur (${err.response.status})`;
        }
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Requête expirée (60s)';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Erreur réseau';
      }
      setError(errorMessage);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      nom: category.nom,
      imageFile: null,
      audioFile: null,
      existingImage: category.imageUrl || null,
      existingAudio: category.audioUrl || null
    });
    setEditingCategoryId(category._id);
    setShowForm(true);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://kara-back.onrender.com/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(categories.filter(c => c._id !== id));
      setFilteredCategories(filteredCategories.filter(c => c._id !== id));
      setSuccess('Catégorie supprimée avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de la catégorie.');
    }
  };

  const navigateToVocabList = (category) => {
    navigate(`/teacher/vocab?categorieId=${category._id}&categorieName=${encodeURIComponent(category.nom)}`);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setFormData({
      nom: '',
      imageFile: null,
      audioFile: null,
      existingImage: null,
      existingAudio: null
    });
    setEditingCategoryId(null);
    setError('');
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const goBack = () => {
    navigate('/teacher-dashboard');
  };

  const playSavedAudio = (audioPath) => {
    const audio = new Audio(`https://kara-back.onrender.com/uploads/${audioPath}`);
    audio.play().catch(err => {
      setError('Erreur de lecture audio: ' + err.message);
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCategories(
      categories.filter(category =>
        category.nom.toLowerCase().includes(query)
      )
    );
  };

 return (
  <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-green-700">📁 Gestion des Catégories</h1>
      <div className="flex gap-4">
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faPlus} /> Ajouter une Catégorie
        </button>
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faArrowLeft} />           🏠 Retour

        </button>
      </div>
    </div>

    <img
      src={categoryIllustration} // Remplacez par votre illustration
      alt="Catégories"
      className="w-24 mx-auto mb-6 animate-bounce"
    />

    {isLoading && <p className="text-blue-600 animate-pulse">⏳ Chargement...</p>}
    {error && <p className="text-red-600">{error}</p>}
    {success && <p className="text-green-600">{success}</p>}

    <div className="mb-8">
      <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
        <img src={folderIllustration} alt="Catégories" className="w-8 h-8" />
        Mes Catégories
      </h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher une catégorie..."
          value={searchQuery}
          onChange={handleSearch}
          className="border-2 border-green-300 rounded-full px-4 py-2 w-full max-w-md focus:ring-green-500 focus:border-green-500 shadow-sm"
        />
      </div>
      
      {filteredCategories.length === 0 ? (
        <p className="text-gray-600">🙈 Aucune catégorie trouvée.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="mb-4">
                {category.imageUrl && (
                  <img
                    src={`https://kara-back.onrender.com/uploads/${category.imageUrl}`}
                    alt={category.nom}
                    className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-200"
                  />
                )}
                <h3 className="text-lg font-semibold text-green-700 mb-2">{category.nom}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {category.audioUrl && (
                  <button
                    onClick={() => playSavedAudio(category.audioUrl)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faVolumeUp} /> Écouter
                  </button>
                )}
                <button
                  onClick={() => handleEdit(category)}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1 text-sm"
                >
                  <FontAwesomeIcon icon={faEdit} /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1 text-sm"
                >
                  <FontAwesomeIcon icon={faTrash} /> Supprimer
                </button>
                <button
                  onClick={() => navigateToVocabList(category)}
                  className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center gap-1 text-sm"
                >
                  <FontAwesomeIcon icon={faBook} /> Vocabulaire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {showForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            {editingCategoryId ? '✏️ Modifier la Catégorie' : '➕ Ajouter une Catégorie'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Image {!editingCategoryId && '*'}
                {formData.existingImage && (
                  <span className="text-sm text-gray-500 ml-2">Actuelle: {formData.existingImage}</span>
                )}
              </label>
              <input
                type="file"
                name="imageFile"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                required={!editingCategoryId && !formData.existingImage}
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Audio</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="file"
                  name="audioFile"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faMicrophone} /> Enregistrer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faStop} /> Arrêter
                  </button>
                )}
                {(formData.audioFile || formData.existingAudio || audioBlob) && (
                  <button
                    type="button"
                    onClick={playAudio}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faVolumeUp} /> Écouter
                  </button>
                )}
              </div>
              {formData.existingAudio && !formData.audioFile && (
                <p className="text-sm text-gray-500 mt-1">Audio actuel: {formData.existingAudio}</p>
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

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
              >
                <FontAwesomeIcon icon={editingCategoryId ? faSave : faPlus} />
                {editingCategoryId ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default GestionCategories;
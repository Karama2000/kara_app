import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUser, 
  faUserTie, 
  faChild, 
  faPhone, 
  faIdCard, 
  faGraduationCap,
  faUsers,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LogoutButton from '../Components/LogOut';
import userImage from '../Assets/images/dashboard/user-profile.avif';
import booksImage from '../Assets/images/dashboard/books-stack.jpg';

const AddUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    role: '', 
    nom: '', 
    prenom: '', 
    email: '', 
    password: '',
    numTell: '', 
    numInscript: '', 
    matricule: '',
    specialite: '', 
    niveau: '', 
    classe: '',
    enfants: [{ eleveId: '', niveau: '', classe: '' }],
  });

  const [imageFile, setImageFile] = useState(null);
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState({});
  const [eleves, setEleves] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const response = await axios.get('https://kara-back.onrender.com/api/niveaux', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNiveaux(response.data);
      } catch (error) {
        setError('Erreur lors de la récupération des niveaux');
      }
    };
    fetchNiveaux();
  }, [token]);

  const fetchClasses = async (niveauId, index = null) => {
    if (!niveauId) return;
    try {
      const response = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${niveauId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses((prev) => ({ ...prev, [niveauId]: response.data }));
      if (index !== null) {
        const updated = [...formData.enfants];
        updated[index].classe = '';
        updated[index].eleveId = '';
        setFormData((prev) => ({ ...prev, enfants: updated }));
      }
    } catch (error) {
      setError('Erreur lors de la récupération des classes');
    }
  };

  const fetchEleves = async (classeId, index) => {
    if (!classeId) return;
    try {
      const response = await axios.get(`https://kara-back.onrender.com/api/eleves/classe/${classeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEleves((prev) => ({ ...prev, [classeId]: response.data }));
      const updated = [...formData.enfants];
      updated[index].eleveId = '';
      setFormData((prev) => ({ ...prev, enfants: updated }));
    } catch (error) {
      setError('Erreur lors de la récupération des élèves');
    }
  };

  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;
    if (index !== null && field) {
      const updated = [...formData.enfants];
      updated[index][field] = value;
      setFormData((prev) => ({ ...prev, enfants: updated }));
      if (field === 'niveau') fetchClasses(value, index);
      else if (field === 'classe') fetchEleves(value, index);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === 'niveau') fetchClasses(value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageFile(file);
      setError('');
    } else {
      setImageFile(null);
      setError('Seuls les fichiers JPEG, PNG et WEBP sont autorisés.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des enfants pour le rôle parent
    if (formData.role === 'parent' && formData.enfants.some(enfant => !enfant.eleveId || !enfant.niveau || !enfant.classe)) {
      setError('Veuillez remplir tous les champs pour chaque enfant');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'enfants' && formData.role === 'parent') {
        val.forEach((enfant) => {
          if (enfant.eleveId) formDataToSend.append('enfants[]', enfant.eleveId);
        });
      } else if (Array.isArray(val)) {
        val.forEach((v) => formDataToSend.append(`${key}[]`, v));
      } else if (val) {
        formDataToSend.append(key, val);
      }
    });
    if (imageFile) formDataToSend.append('imageUrl', imageFile);

    try {
      await axios.post('https://kara-back.onrender.com/api/user', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Utilisateur créé avec succès ! 🎉');
      navigate('/manage-users');
    } catch (error) {
      console.error('Erreur lors de la création:', error.response?.data);
      setError(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const addEnfant = () => {
    if (formData.enfants.length < 4) {
      setFormData(prev => ({
        ...prev,
        enfants: [...prev.enfants, { eleveId: '', niveau: '', classe: '' }]
      }));
    }
  };

  const removeEnfant = (index) => {
    if (formData.enfants.length > 1) {
      setFormData(prev => ({
        ...prev,
        enfants: prev.enfants.filter((_, i) => i !== index)
      }));
    }
  };

  const goBack = () => {
    navigate('/manage-users');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center px-4 py-8 relative">
      <div className="absolute top-6 right-6">
        <LogoutButton />
      </div>

      <button 
        onClick={goBack}
        className="absolute top-6 left-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xl" />
        🏠 Retour
      </button>

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl border-t-8 border-blue-500 relative overflow-hidden mt-10">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full opacity-20"></div>
        
        <div className="flex flex-col items-center mb-6">
          <img src={userImage} alt="Utilisateur" className="w-24 h-24 mb-4 rounded-full object-cover" />
          <h2 className="text-3xl font-bold text-center text-blue-600">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Nouvel Utilisateur
          </h2>
          <p className="text-gray-500 mt-2 text-center">Créez un nouveau compte utilisateur</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2 text-lg">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2 text-lg">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2 text-lg">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2 text-lg">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2 text-lg">
              Rôle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="parent">Parent</option>
                <option value="eleve">Élève</option>
                <option value="enseignant">Enseignant</option>
              </select>
              <div className="absolute right-4 top-4 text-blue-300">
                <FontAwesomeIcon icon={faUser} />
              </div>
            </div>
          </div>

          {formData.role === 'parent' && (
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Téléphone
                </label>
                <input
                  type="text"
                  name="numTell"
                  value={formData.numTell}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600 flex items-center">
                  <FontAwesomeIcon icon={faChild} className="mr-2" />
                  Enfants
                </h3>
                
                {formData.enfants.map((enfant, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="relative">
                        <label className="block text-gray-700 font-medium mb-2">
                          Niveau
                        </label>
                        <select
                          value={enfant.niveau}
                          onChange={(e) => handleChange(e, index, 'niveau')}
                          className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                          <option value="">Sélectionnez un niveau</option>
                          {niveaux.map((niveau) => (
                            <option key={niveau._id} value={niveau._id}>{niveau.nom}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <label className="block text-gray-700 font-medium mb-2">
                          Classe
                        </label>
                        <select
                          value={enfant.classe}
                          onChange={(e) => handleChange(e, index, 'classe')}
                          disabled={!enfant.niveau}
                          className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                          <option value="">Sélectionnez une classe</option>
                          {(classes[enfant.niveau] || []).map((classe) => (
                            <option key={classe._id} value={classe._id}>{classe.nom}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <label className="block text-gray-700 font-medium mb-2">
                          Élève
                        </label>
                        <select
                          value={enfant.eleveId}
                          onChange={(e) => handleChange(e, index, 'eleveId')}
                          disabled={!enfant.classe}
                          className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                          <option value="">Sélectionnez un élève</option>
                          {(eleves[enfant.classe] || []).map((eleve) => (
                            <option key={eleve._id} value={eleve._id}>{eleve.nom} {eleve.prenom}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      {formData.enfants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEnfant(index)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                      {index === formData.enfants.length - 1 && formData.enfants.length < 4 && (
                        <button
                          type="button"
                          onClick={addEnfant}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Ajouter un enfant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.role === 'eleve' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                  Numéro d'inscription
                </label>
                <input
                  type="text"
                  name="numInscript"
                  value={formData.numInscript}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                  Niveau
                </label>
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="">Sélectionnez un niveau</option>
                  {niveaux.map((niveau) => (
                    <option key={niveau._id} value={niveau._id}>{niveau.nom}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  <FontAwesomeIcon icon={faUsers} className="mr-2" />
                  Classe
                </label>
                <select
                  name="classe"
                  value={formData.classe}
                  onChange={handleChange}
                  disabled={!formData.niveau}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="">Sélectionnez une classe</option>
                  {(classes[formData.niveau] || []).map((classe) => (
                    <option key={classe._id} value={classe._id}>{classe.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formData.role === 'enseignant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                  Matricule
                </label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                  Spécialité
                </label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2 text-lg">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Photo de profil
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                Choisir un fichier
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
              {imageFile && (
                <span className="text-green-600">{imageFile.name}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Formats acceptés : JPEG, PNG, WEBP</p>
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
              {loading ? 'Création en cours...' : "Créer l'Utilisateur"}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-gray-500 text-center max-w-md">
        "Chaque utilisateur est une nouvelle opportunité d'apprentissage !"
      </p>
    </div>
  );
};

export default AddUser;
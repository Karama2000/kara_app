import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'eleve',
    nom: '',
    prenom: '',
    numInscript: '',
    matricule: '',
    numTell: '',
    niveau: '',
    classe: '',
    specialite: '',
    selectedNiveaux: [],
    selectedClasses: [],
    enfants: [],
    parentNiveau: '',
    parentClasse: '',
  });

  const [niveauxOptions, setNiveauxOptions] = useState([]);
  const [classesOptions, setClassesOptions] = useState([]);
  const [elevesOptions, setElevesOptions] = useState([]);
  const [loadingNiveaux, setLoadingNiveaux] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingEleves, setLoadingEleves] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNiveaux = async () => {
      setLoadingNiveaux(true);
      try {
        const response = await axios.get('https://kara-back.onrender.com/api/niveaux');
        setNiveauxOptions(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Erreur chargement niveaux:", error);
        setError('Impossible de charger les niveaux.');
        setNiveauxOptions([]);
      } finally {
        setLoadingNiveaux(false);
      }
    };
    fetchNiveaux();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      let niveauId;
      if (formData.role === 'eleve') {
        niveauId = formData.niveau;
      } else if (formData.role === 'parent') {
        niveauId = formData.parentNiveau;
      } else if (formData.role === 'enseignant' && formData.selectedNiveaux.length > 0) {
        niveauId = formData.selectedNiveaux[0]; // Use first selected level for teachers
      }

      if (!niveauId) {
        setClassesOptions([]);
        return;
      }

      setLoadingClasses(true);
      try {
        const response = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${niveauId}`);
        setClassesOptions(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Erreur chargement classes:", error);
        setError('Impossible de charger les classes.');
        setClassesOptions([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [formData.niveau, formData.parentNiveau, formData.selectedNiveaux, formData.role]);

  useEffect(() => {
  const fetchEleves = async () => {
    if (formData.role !== 'parent' || !formData.parentNiveau) {
      setElevesOptions([]);
      return;
    }

    setLoadingEleves(true);
    try {
      let response;
      if (formData.parentClasse) {
        // Fetch students by class if a class is selected
        response = await axios.get(`https://kara-back.onrender.com/api/eleves/classe/${formData.parentClasse}`);
      } else {
        // Fallback to fetching students by level if no class is selected
        response = await axios.get('https://kara-back.onrender.com/api/eleves', {
          params: { niveau: formData.parentNiveau },
        });
      }
      setElevesOptions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur chargement élèves:", error);
      setError('Impossible de charger la liste des élèves.');
      setElevesOptions([]);
    } finally {
      setLoadingEleves(false);
    }
  };

  fetchEleves();
}, [formData.role, formData.parentNiveau, formData.parentClasse]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && {
        niveau: '',
        classe: '',
        parentNiveau: '',
        parentClasse: '',
        selectedNiveaux: [],
        selectedClasses: [],
        enfants: [],
        numInscript: '',
        matricule: '',
        numTell: '',
        specialite: '',
      }),
      ...(name === 'niveau' && formData.role === 'eleve' && { classe: '' }),
      ...(name === 'parentNiveau' && { parentClasse: '', enfants: [] }),
      ...(name === 'parentClasse' && { enfants: [] }),
    }));
  };

  const handleMultiSelectChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((option) => option.value);
    const name = e.target.name;
    setFormData((prev) => ({
      ...prev,
      [name]: options,
      ...(name === 'selectedNiveaux' && { selectedClasses: [] }),
    }));
  };

  const getIdentifierPlaceholder = () => {
    switch (formData.role) {
      case 'eleve': return 'Numéro d\'inscription';
      case 'enseignant': return 'Matricule';
      case 'parent': return 'Numéro de téléphone';
      case 'admin': return 'Email';
      default: return 'Identifiant';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const requiredFields = ['nom', 'prenom', 'email', 'password', 'role'];
    if (formData.role === 'eleve') {
      requiredFields.push('niveau', 'numInscript');
    } else if (formData.role === 'enseignant') {
      requiredFields.push('specialite', 'matricule');
    } else if (formData.role === 'parent') {
      requiredFields.push('numTell', 'parentNiveau');
      if (elevesOptions.length > 0) {
        requiredFields.push('enfants');
      }
    }

    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        setError(`Le champ ${field} est requis.`);
        setLoading(false);
        return;
      }
    }

    try {
      const data = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'eleve' && {
          numInscript: formData.numInscript,
          niveau: formData.niveau,
          classe: formData.classe || null,
        }),
        ...(formData.role === 'enseignant' && {
          matricule: formData.matricule,
          specialite: formData.specialite,
          selectedNiveaux: formData.selectedNiveaux,
          selectedClasses: formData.selectedClasses,
        }),
        ...(formData.role === 'parent' && {
          numTell: formData.numTell,
          enfants: formData.enfants,
        }),
      };

      const response = await axios.post('https://kara-back.onrender.com/api/auth/register', data);
      setSuccess(response.data.message);
      setFormData({
        email: '',
        password: '',
        role: 'eleve',
        nom: '',
        prenom: '',
        numInscript: '',
        matricule: '',
        numTell: '',
        niveau: '',
        classe: '',
        specialite: '',
        selectedNiveaux: [],
        selectedClasses: [],
        enfants: [],
        parentNiveau: '',
        parentClasse: '',
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center p-4">
      <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-yellow-200 opacity-30 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-green-200 opacity-30 animate-float animation-delay-2000"></div>
      
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-2xl">
        <div className="bg-gradient-to-r bg-pink-500 opacity-60 p-6 text-center">
          <h2 className="text-3xl font-bold text-white">Inscription</h2>
          <p className="text-white/90 mt-1">Rejoins l'aventure !</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
              <p>{success} {formData.role !== 'admin' ? 'Veuillez vérifier votre email pour confirmer votre inscription.' : ''}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="nom"
                  placeholder="Ton nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
                />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  name="prenom"
                  placeholder="Ton prénom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
                />
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Ton email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Ton mot de passe secret"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
                />
              </div>
              
              <div className="relative">
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg appearance-none"
                >
                  <option value="eleve">Élève</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  name={formData.role === 'eleve' ? 'numInscript' : 
                        formData.role === 'enseignant' ? 'matricule' : 'numTell'}
                  placeholder={getIdentifierPlaceholder()}
                  value={formData.role === 'eleve' ? formData.numInscript : 
                         formData.role === 'enseignant' ? formData.matricule : formData.numTell}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
                />
              </div>
            </div>

            {formData.role === 'eleve' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="relative">
                  <select
                    name="niveau"
                    value={formData.niveau}
                    onChange={handleInputChange}
                    disabled={loadingNiveaux || niveauxOptions.length === 0}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg appearance-none"
                  >
                    <option value="">Choisis ton niveau</option>
                    {loadingNiveaux ? (
                      <option>Chargement...</option>
                    ) : niveauxOptions.length === 0 ? (
                      <option>Aucun niveau disponible</option>
                    ) : (
                      niveauxOptions.map((niveau) => (
                        <option key={niveau._id} value={niveau._id}>
                          {niveau.nom}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    name="classe"
                    value={formData.classe}
                    onChange={handleInputChange}
                    disabled={loadingClasses || !formData.niveau || classesOptions.length === 0}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg appearance-none"
                  >
                    <option value="">Choisis ta classe</option>
                    {loadingClasses ? (
                      <option>Chargement...</option>
                    ) : classesOptions.length === 0 ? (
                      <option>Aucune classe disponible</option>
                    ) : (
                      classesOptions.map((classe) => (
                        <option key={classe._id} value={classe._id}>
                          {classe.nom}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'enseignant' && (
              <div className="space-y-4 mt-4">
                <div className="relative">
                  <input
                    type="text"
                    name="specialite"
                    placeholder="Ta spécialité"
                    value={formData.specialite}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      name="selectedNiveaux"
                      multiple
                      value={formData.selectedNiveaux}
                      onChange={handleMultiSelectChange}
                      disabled={loadingNiveaux || niveauxOptions.length === 0}
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg h-auto min-h-[3rem]"
                    >
                      <option value="" disabled>Choisis les niveaux</option>
                      {loadingNiveaux ? (
                        <option>Chargement...</option>
                      ) : niveauxOptions.length === 0 ? (
                        <option>Aucun niveau disponible</option>
                      ) : (
                        niveauxOptions.map((niveau) => (
                          <option key={niveau._id} value={niveau._id}>
                            {niveau.nom}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="selectedClasses"
                      multiple
                      value={formData.selectedClasses}
                      onChange={handleMultiSelectChange}
                      disabled={loadingClasses || formData.selectedNiveaux.length === 0 || classesOptions.length === 0}
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg h-auto min-h-[3rem]"
                    >
                      <option value="" disabled>Choisis les classes</option>
                      {loadingClasses ? (
                        <option>Chargement...</option>
                      ) : classesOptions.length === 0 ? (
                        <option>Aucune classe disponible</option>
                      ) : (
                        classesOptions.map((classe) => (
                          <option key={classe._id} value={classe._id}>
                            {classe.nom}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'parent' && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      name="parentNiveau"
                      value={formData.parentNiveau}
                      onChange={handleInputChange}
                      disabled={loadingNiveaux || niveauxOptions.length === 0}
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg appearance-none"
                    >
                      <option value="">Niveau de ton enfant</option>
                      {loadingNiveaux ? (
                        <option>Chargement...</option>
                      ) : niveauxOptions.length === 0 ? (
                        <option>Aucun niveau disponible</option>
                      ) : (
                        niveauxOptions.map((niveau) => (
                          <option key={niveau._id} value={niveau._id}>
                            {niveau.nom}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="parentClasse"
                      value={formData.parentClasse}
                      onChange={handleInputChange}
                      disabled={loadingClasses || !formData.parentNiveau || classesOptions.length === 0}
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg appearance-none"
                    >
                      <option value="">Classe de ton enfant (optionnel)</option>
                      {loadingClasses ? (
                        <option>Chargement...</option>
                      ) : classesOptions.length === 0 ? (
                        <option>Aucune classe disponible</option>
                      ) : (
                        classesOptions.map((classe) => (
                          <option key={classe._id} value={classe._id}>
                            {classe.nom}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionne tes enfants (maintenez Ctrl pour plusieurs)
                  </label>
                  <select
                    name="enfants"
                    multiple
                    value={formData.enfants}
                    onChange={handleMultiSelectChange}
                    disabled={loadingEleves || !formData.parentNiveau || elevesOptions.length === 0}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg h-auto min-h-[3rem]"
                  >
                    {loadingEleves ? (
                      <option>Chargement...</option>
                    ) : elevesOptions.length === 0 ? (
                      <option>Aucun élève disponible</option>
                    ) : (
                      elevesOptions.map((eleve) => (
                        <option key={eleve._id} value={eleve._id}>
                          {eleve.nom} {eleve.prenom}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-r bg-pink-500 opacity-60 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 ${
                  loading ? 'opacity-70' : 'hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </span>
                ) : (
                  "Commencer l'aventure !"
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-gray-200 mt-6">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-pink-600 hover:text-purple-800 font-bold">
                Connecte-toi ici !
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

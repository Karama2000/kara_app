import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import unitIllustration from '../Assets/images/dashboard/learning-unit.avif';
import submitIcon from '../Assets/images/dashboard/submit.avif';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: '',
    numTell: '',
    niveau: '',
    classe: '',
    numInscript: '',
    matricule: '',
    specialite: '',
    selectedNiveaux: [],
    selectedClasses: [],
    enfants: [],
  });

  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState({});
  const [eleves, setEleves] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const getTokenOrRedirect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  const fetchClasses = useCallback(async (niveauId, enfantIndex = null) => {
    const token = getTokenOrRedirect();
    if (!token || !niveauId) return;
    
    try {
      const response = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${niveauId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!isMounted.current) return;

      setClasses((prev) => ({
        ...prev,
        [niveauId]: response.data,
      }));

      if (enfantIndex !== null) {
        setFormData(prev => ({
          ...prev,
          enfants: prev.enfants.map((enfant, i) => 
            i === enfantIndex ? { ...enfant, classe: '', eleveId: '' } : enfant
          )
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Erreur lors de la récupération des classes:', error);
        setError('Erreur lors de la récupération des classes');
      }
    }
  }, []);

  const fetchClassesForEnseignant = useCallback(async (niveauIds) => {
    const token = getTokenOrRedirect();
    if (!token) return;
    
    try {
      const classesByNiveau = {};
      for (const niveauId of niveauIds) {
        const response = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${niveauId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        classesByNiveau[niveauId] = response.data;
      }

      if (!isMounted.current) return;

      setClasses(classesByNiveau);
      setFormData(prev => ({
        ...prev,
        selectedClasses: prev.selectedClasses.filter(classeId =>
          Object.values(classesByNiveau)
            .flat()
            .some(classe => classe._id === classeId)
        )
      }));
    } catch (error) {
      if (isMounted.current) {
        console.error('Erreur lors de la récupération des classes:', error);
        setError('Erreur lors de la récupération des classes');
      }
    }
  }, []);

  const fetchEleves = useCallback(async (classeId, enfantIndex) => {
    const token = getTokenOrRedirect();
    if (!token || !classeId) return;
    
    try {
      const response = await axios.get(`https://kara-back.onrender.com/api/eleves/classe/${classeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!isMounted.current) return;

      setEleves(prev => ({
        ...prev,
        [classeId]: response.data,
      }));

      setFormData(prev => ({
        ...prev,
        enfants: prev.enfants.map((enfant, i) => 
          i === enfantIndex ? { ...enfant, eleveId: '' } : enfant
        )
      }));
    } catch (error) {
      if (isMounted.current) {
        console.error('Erreur lors de la récupération des élèves:', error);
        setError('Erreur lors de la récupération des élèves');
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id || !isValidObjectId(id)) {
      setError('ID utilisateur invalide');
      setLoading(false);
      return;
    }

    const token = getTokenOrRedirect();
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const niveauxResponse = await axios.get('https://kara-back.onrender.com/api/niveaux', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNiveaux(niveauxResponse.data);

        const userResponse = await axios.get(`https://kara-back.onrender.com/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const user = userResponse.data;
        const newFormData = {
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          password: '',
          role: user.role || '',
          numTell: user.numTell || '',
          niveau: user.niveau?._id?.toString() || '',
          classe: user.classe?._id?.toString() || '',
          numInscript: user.numInscript || '',
          matricule: user.matricule || '',
          specialite: user.specialite || '',
          selectedNiveaux: Array.isArray(user.niveaux) ? user.niveaux.map(n => n._id.toString()) : [],
          selectedClasses: Array.isArray(user.classes) ? user.classes.map(c => c._id.toString()) : [],
          enfants: Array.isArray(user.enfants) && user.enfants.length > 0 
            ? user.enfants.map(enfant => ({
                eleveId: enfant._id?.toString() || '',
                niveau: enfant.niveau?._id?.toString() || '',
                classe: enfant.classe?._id?.toString() || '',
              }))
            : [{ eleveId: '', niveau: '', classe: '' }],
        };

        setFormData(newFormData);
        setCurrentImageUrl(user.imageUrl || '');

        if (user.role === 'parent') {
          for (const [index, enfant] of newFormData.enfants.entries()) {
            if (enfant.niveau) await fetchClasses(enfant.niveau, index);
            if (enfant.classe) await fetchEleves(enfant.classe, index);
          }
        } else if (user.role === 'eleve' && user.niveau?._id) {
          await fetchClasses(user.niveau._id);
        } else if (user.role === 'enseignant' && newFormData.selectedNiveaux.length > 0) {
          await fetchClassesForEnseignant(newFormData.selectedNiveaux);
        }

        setLoading(false);
      } catch (error) {
        if (isMounted.current) {
          console.error('Erreur:', error);
          setError(error.response?.data?.message || 'Erreur lors du chargement');
          setLoading(false);
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      }
    };

    fetchData();
  }, [id, navigate, fetchClasses, fetchClassesForEnseignant, fetchEleves]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'niveau') {
      fetchClasses(value);
    }
  };

  const handleEnfantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      enfants: prev.enfants.map((enfant, i) => 
        i === index ? { ...enfant, [field]: value } : enfant
      )
    }));

    if (field === 'niveau') {
      fetchClasses(value, index);
    } else if (field === 'classe') {
      fetchEleves(value, index);
    }
  };

  const handleNiveauxChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, selectedNiveaux: selected }));
    fetchClassesForEnseignant(selected);
  };

  const handleClassesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, selectedClasses: selected }));
  };

  const addEnfant = () => {
    setFormData(prev => ({
      ...prev,
      enfants: [...prev.enfants, { eleveId: '', niveau: '', classe: '' }]
    }));
  };

  const removeEnfant = (index) => {
    if (formData.enfants.length > 1) {
      setFormData(prev => ({
        ...prev,
        enfants: prev.enfants.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Seuls les fichiers JPEG, JPG, PNG et WEBP sont autorisés');
        return;
      }
      setImageFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidObjectId(id)) {
      setError('ID utilisateur invalide');
      return;
    }

    const token = getTokenOrRedirect();
    if (!token) return;

    if (formData.role === 'parent') {
      const invalidEnfants = formData.enfants.filter(
        enfant => !enfant.niveau || !enfant.classe || !enfant.eleveId
      );
      if (invalidEnfants.length > 0) {
        setError('Veuillez remplir tous les champs pour chaque enfant');
        return;
      }
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'enfants' && formData.role === 'parent') {
        value.forEach(enfant => {
          if (enfant.eleveId) formDataToSend.append('enfants[]', enfant.eleveId);
        });
      } else if (key === 'selectedNiveaux' || key === 'selectedClasses') {
        value.forEach(id => formDataToSend.append(`${key}[]`, id));
      } else if (value && key !== 'password') {
        formDataToSend.append(key, value);
      }
    });

    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }

    if (imageFile) {
      formDataToSend.append('imageUrl', imageFile);
    }

    try {
      await axios.put(`https://kara-back.onrender.com/api/user/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Utilisateur mis à jour avec succès');
      navigate('/manage-users');
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const goBack = () => navigate('/manage-users');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center text-xl text-purple-800">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={goBack}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-white to-purple-50 py-10 px-4 flex flex-col items-center">
      <div
        className="absolute left-6 top-6 cursor-pointer text-purple-600 hover:text-purple-900 transition"
        onClick={goBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} size="2x" />
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-3xl w-full">
        <img src={unitIllustration} alt="Modifier utilisateur" className="rounded-xl w-full h-48 object-cover mb-6" />

        <h2 className="text-3xl font-semibold text-center text-purple-800 mb-6">Modifier l'Utilisateur</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nouveau mot de passe (facultatif)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Image de profil</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
            {currentImageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Image actuelle :</p>
                <img
                  src={currentImageUrl.includes('http') ? currentImageUrl : `https://kara-back.onrender.com/Uploads/${currentImageUrl}`}
                  alt="Profile"
                  className="max-w-[100px] rounded-full border border-gray-200"
                  onError={(e) => (e.target.src = '/images/placeholder.png')}
                />
              </div>
            )}
          </div>

          {formData.role === 'parent' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Numéro de téléphone</label>
                <input
                  type="text"
                  name="numTell"
                  value={formData.numTell}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-purple-700 mb-3">Enfants ({formData.enfants.length})</h3>
                {formData.enfants.map((enfant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Niveau</label>
                      <select
                        value={enfant.niveau}
                        onChange={(e) => handleEnfantChange(index, 'niveau', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Sélectionner un niveau</option>
                        {niveaux.map((niveau) => (
                          <option key={niveau._id} value={niveau._id}>
                            {niveau.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    {enfant.niveau && classes[enfant.niveau] && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Classe</label>
                        <select
                          value={enfant.classe}
                          onChange={(e) => handleEnfantChange(index, 'classe', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Sélectionner une classe</option>
                          {classes[enfant.niveau].map((classe) => (
                            <option key={classe._id} value={classe._id}>
                              {classe.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {enfant.classe && eleves[enfant.classe] && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Élève</label>
                        <select
                          value={enfant.eleveId}
                          onChange={(e) => handleEnfantChange(index, 'eleveId', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Sélectionner un élève</option>
                          {eleves[enfant.classe].map((eleve) => (
                            <option key={eleve._id} value={eleve._id}>
                              {eleve.nom} {eleve.prenom}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.enfants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEnfant(index)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center"
                      >
                        <RemoveIcon fontSize="small" className="mr-1" />
                        Supprimer cet enfant
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEnfant}
                  className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                >
                  <AddIcon fontSize="small" className="mr-1" />
                  Ajouter un enfant
                </button>
              </div>
            </>
          )}

          {formData.role === 'eleve' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Numéro d'inscription</label>
                <input
                  type="text"
                  name="numInscript"
                  value={formData.numInscript}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Niveau</label>
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Sélectionner un niveau</option>
                  {niveaux.map((niveau) => (
                    <option key={niveau._id} value={niveau._id}>
                      {niveau.nom}
                    </option>
                  ))}
                </select>
              </div>

              {formData.niveau && classes[formData.niveau] && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Classe</label>
                  <select
                    name="classe"
                    value={formData.classe}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes[formData.niveau].map((classe) => (
                      <option key={classe._id} value={classe._id}>
                        {classe.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {formData.role === 'enseignant' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Matricule</label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Spécialité</label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Niveaux</label>
                <select
                  multiple
                  value={formData.selectedNiveaux}
                  onChange={handleNiveauxChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {niveaux.map((niveau) => (
                    <option key={niveau._id} value={niveau._id}>
                      {niveau.nom}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs options</p>
              </div>

              {formData.selectedNiveaux.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Classes</label>
                  <select
                    multiple
                    value={formData.selectedClasses}
                    onChange={handleClassesChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {Object.values(classes)
                      .flat()
                      .map((classe) => (
                        <option key={classe._id} value={classe._id}>
                          {classe.nom}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs options</p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition shadow-md w-full mt-6"
          >
            <img src={submitIcon} alt="Soumettre" className="w-5 h-5" />
            Mettre à jour l'Utilisateur
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
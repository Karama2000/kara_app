import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChalkboardTeacher, faUserGraduate, faUsers } from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut';

import booksStackImage from '../Assets/images/dashboard/books-stack.jpg';
import classroomImage from '../Assets/images/dashboard/classroom.avif';

import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';

const EditClasse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [classe, setClasse] = useState({ nom: '', niveauId: '', enseignants: [], eleves: [] });
  const [niveaux, setNiveaux] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [niveauxRes, enseignantsRes, elevesRes, classeRes] = await Promise.all([
          axios.get('https://kara-back.onrender.com/api/niveaux'),
          axios.get('https://kara-back.onrender.com/api/enseignants'),
          axios.get('https://kara-back.onrender.com/api/eleves'),
          axios.get(`https://kara-back.onrender.com/api/classes/${id}`),
        ]);

        setNiveaux(niveauxRes.data);
        setEnseignants(enseignantsRes.data);
        setEleves(elevesRes.data);
        setClasse({
          nom: classeRes.data.nom,
          niveauId: classeRes.data.niveau?._id || '',
          enseignants: classeRes.data.enseignants?.map((e) => e._id) || [],
          eleves: classeRes.data.eleves?.map((e) => e._id) || [],
        });
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClasse((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name) => (e) => {
    setClasse((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://kara-back.onrender.com/api/classes/${id}`, classe);
      alert('Classe modifiée avec succès');
      navigate(userId ? `/user-details/${userId}` : '/manage-classes');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const goBack = () => navigate(userId ? `/user-details/${userId}` : '/manage-classes');

  if (loading) return <div className="text-center mt-10 text-lg">Chargement...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute top-6 right-6">
        <LogoutButton />
      </div>

      <button onClick={goBack} className="absolute top-6 left-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xl" /> Retour
      </button>

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl border-t-8 border-indigo-500 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full opacity-20"></div>

        <div className="flex flex-col items-center mb-6">
          <img src={classroomImage} alt="Classe" className="w-24 h-24 mb-4 rounded-full" />
          <h2 className="text-3xl font-bold text-center text-indigo-600">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2" /> Modifier Classe
          </h2>
          <p className="text-gray-500 mt-2 text-center">Modifiez les détails de la classe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            fullWidth
            label="Nom de la classe"
            name="nom"
            value={classe.nom}
            onChange={handleChange}
            required
            variant="outlined"
          />

          <FormControl fullWidth>
            <InputLabel id="niveau-label">Niveau</InputLabel>
            <Select
              labelId="niveau-label"
              name="niveauId"
              value={classe.niveauId}
              onChange={handleChange}
              required
            >
              {niveaux.map((niveau) => (
                <MenuItem key={niveau._id} value={niveau._id}>{niveau.nom}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="enseignants-label">Enseignants</InputLabel>
            <Select
              labelId="enseignants-label"
              multiple
              value={classe.enseignants}
              onChange={handleMultiSelectChange('enseignants')}
              renderValue={(selected) =>
                enseignants
                  .filter((e) => selected.includes(e._id))
                  .map((e) => e.nom)
                  .join(', ')
              }
            >
              {enseignants.map((enseignant) => (
                <MenuItem key={enseignant._id} value={enseignant._id}>
                  <Checkbox checked={classe.enseignants.includes(enseignant._id)} />
                  <ListItemText primary={enseignant.nom} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="eleves-label">Élèves</InputLabel>
            <Select
              labelId="eleves-label"
              multiple
              value={classe.eleves}
              onChange={handleMultiSelectChange('eleves')}
              renderValue={(selected) =>
                eleves
                  .filter((e) => selected.includes(e._id))
                  .map((e) => e.nom)
                  .join(', ')
              }
            >
              {eleves.map((eleve) => (
                <MenuItem key={eleve._id} value={eleve._id}>
                  <Checkbox checked={classe.eleves.includes(eleve._id)} />
                  <ListItemText primary={eleve.nom} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <img src={booksStackImage} alt="Livres" className="w-6 h-6 mr-2" />
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-gray-500 text-center max-w-md">
        "Améliorer une classe, c'est enrichir l'avenir de chaque élève."
      </p>
    </div>
  );
};

export default EditClasse;
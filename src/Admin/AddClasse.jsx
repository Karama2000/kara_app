import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChalkboardTeacher, faSchool } from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut';

// Import des images
import classroomImage from '../Assets/images/dashboard/classroom.avif';
import booksStackImage from '../Assets/images/dashboard/books-stack.jpg';

const AddClass = () => {
  const [nom, setNom] = useState('');
  const [niveauId, setNiveauId] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://kara-back.onrender.com/api/niveaux')
      .then((response) => setNiveaux(response.data))
      .catch((error) => console.error('Erreur lors de la récupération des niveaux', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClass = { nom, niveauId };

    try {
      await axios.post('https://kara-back.onrender.com/api/classe', newClass);
      alert('Classe ajoutée avec succès !');
      navigate('/manage-classes');
    } catch (error) {
      console.error("Erreur lors de l'ajout de la classe", error);
      alert("Une erreur est survenue lors de l'ajout de la classe");
    }
  };

  const goBack = () => {
    navigate('/manage-classes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4 py-8 relative">
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

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border-t-8 border-indigo-500 relative overflow-hidden">
        {/* Décoration visuelle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full opacity-20"></div>
        
        <div className="flex flex-col items-center mb-6">
          <img src={classroomImage} alt="Salle de classe" className="w-24 h-24 mb-4" />
          <h2 className="text-3xl font-bold text-center text-indigo-600">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2" />
            Nouvelle Classe
          </h2>
          <p className="text-gray-500 mt-2 text-center">Remplissez les informations pour créer une nouvelle classe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2 text-lg">Nom de la classe</label>
            <div className="relative">
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="Ex: CP1, Maternelle A..."
              />
              <FontAwesomeIcon icon={faSchool} className="absolute right-4 top-4 text-indigo-300" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-lg">Niveau associé</label>
            <div className="relative">
              <select
                value={niveauId}
                onChange={(e) => setNiveauId(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl appearance-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                <option value="">Choisissez un niveau</option>
                {niveaux.map((niveau) => (
                  <option key={niveau._id} value={niveau._id}>
                    {niveau.nom}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-4 text-indigo-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <img src={booksStackImage} alt="Livres" className="w-6 h-6 mr-2" />
              Créer la classe
            </button>
          </div>
        </form>
      </div>

      {/* Message décoratif en bas de page */}
      <p className="mt-8 text-gray-500 text-center max-w-md">
        "Chaque nouvelle classe est une nouvelle aventure éducative !"
      </p>
    </div>
  );
};

export default AddClass;
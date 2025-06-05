import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserTie, faUserGraduate, faChalkboard } from '@fortawesome/free-solid-svg-icons';
import classroomImage from '../Assets/images/dashboard/classroom.avif';
import teacherImage from '../Assets/images/dashboard/books-stack.jpg';

const ClasseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classe, setClasse] = useState(null);
  const [enseignants, setEnseignants] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasseDetails = async () => {
      try {
        const classeRes = await axios.get(`https://kara-back.onrender.com/api/classes/${id}`);
        setClasse(classeRes.data);

        const enseignantsRes = await axios.get(`https://kara-back.onrender.com/api/classes/${id}/enseignants`);
        setEnseignants(enseignantsRes.data);

        const elevesRes = await axios.get(`https://kara-back.onrender.com/api/classes/${id}/eleves`);
        setEleves(elevesRes.data);

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
        setError('Une erreur est survenue lors du chargement des détails de la classe.');
        setLoading(false);
      }
    };
    fetchClasseDetails();
  }, [id]);

  const goBack = () => navigate('/manage-classes');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">{error}</div>
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow">Classe non trouvée</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-10 relative">
      <button 
        onClick={goBack}
        className="absolute top-6 left-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xl" />
          🏠 Retour
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-t-8 border-indigo-500 relative overflow-hidden">
        {/* Décorations visuelles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full opacity-20"></div>

        <div className="flex flex-col items-center mb-6">
          <img src={classroomImage} alt="Classe" className="w-24 h-24 mb-4 rounded-full shadow" />
          <h1 className="text-3xl font-bold text-indigo-600 text-center">
            <FontAwesomeIcon icon={faChalkboard} className="mr-2" />
            Détails de la Classe
          </h1>
          <p className="text-gray-500 text-center mt-2">Découvrez les informations associées à cette classe</p>
        </div>

        {/* Section Informations générales */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4 border-b pb-2">Informations générales</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Nom :</strong> {classe.nom || 'Non spécifié'}</li>
            <li><strong>Niveau :</strong> {classe.niveau?.nom || 'Non spécifié'}</li>
            <li><strong>Cycle :</strong> {classe.niveau?.cycle || 'Non spécifié'}</li>
          </ul>
        </section>

        {/* Section Enseignants */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4 border-b pb-2">Enseignants</h2>
          {enseignants.length > 0 ? (
            <ul className="space-y-2">
              {enseignants.map((e) => (
                <li key={e._id} className="bg-indigo-50 p-3 rounded-xl shadow-sm flex items-center">
                  <FontAwesomeIcon icon={faUserTie} className="text-indigo-400 mr-2" />
                  {e.nom} {e.prenom}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun enseignant associé</p>
          )}
        </section>

        {/* Section Élèves */}
        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4 border-b pb-2">Élèves</h2>
          {eleves.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eleves.map((e) => (
                <li key={e._id} className="bg-purple-50 p-3 rounded-xl shadow-sm flex items-center">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-purple-400 mr-2" />
                  {e.nom} {e.prenom}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun élève inscrit</p>
          )}
        </section>
      </div>

      <p className="mt-8 text-center text-gray-500 max-w-md mx-auto">
        "Une classe bien dirigée est un univers où chacun trouve sa place."
      </p>
    </div>
  );
};

export default ClasseDetails;

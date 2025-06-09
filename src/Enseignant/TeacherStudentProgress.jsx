import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamationCircle, faSearch, faSync } from '@fortawesome/free-solid-svg-icons';

const TeacherStudentProgress = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [progress, setProgress] = useState([]);
  const [filteredProgress, setFilteredProgress] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les niveaux
  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('https://kara-back.onrender.com/api/niveaux', config);
        setNiveaux(response.data);
      } catch (error) {
        setError(error.response?.data?.data?.code || 'Erreur lors du chargement des niveaux.');
      }
    };

    if (token) {
      fetchNiveaux();
    } else {
      navigate('/login');
    }
  }, [navigate, token]);

  // Récupérer les classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedNiveau) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${selectedNiveau}`, config);
          setClasses(response.data);
        } catch (error) {
          setError(error.response?.data?.data?.code || 'Erreur lors du chargement des classes.');
        }
      } else {
        setClasses([]);
        setSelectedClasse('');
      }
    };

    fetchClasses();
  }, [selectedNiveau, token]);

  // Récupérer les progrès
  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('https://kara-back.onrender.com/api/tests/student-progress', config);
      setProgress(response.data);
      setFilteredProgress(response.data);
    } catch (error) {
      setError(error.response?.data?.data?.code || 'Erreur lors du chargement des progrès.');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProgress();
    } else {
      navigate('/login');
    }
  }, [navigate, token]);

  // Filtrer les progrès
  useEffect(() => {
    let filtered = [...progress];

    if (searchQuery) {
      filtered = filtered.filter((studentProgress) =>
        `${studentProgress.student.prenom} ${studentProgress.student.nom}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedNiveau) {
      filtered = filtered.filter(
        (studentProgress) => studentProgress.student.niveau === selectedNiveau
      );
    }

    if (selectedClasse) {
      filtered = filtered.filter(
        (studentProgress) => studentProgress.student.classe === selectedClasse
      );
    }

    setFilteredProgress(filtered);
  }, [searchQuery, selectedNiveau, selectedClasse, progress]);

  const handleBack = () => {
    navigate('/teacher-dashboard');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchProgress();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">
          <span className="inline-block mr-3">📈</span>
          Progrès des Élèves
          <span className="inline-block ml-3">👩‍🎓</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
            title="Actualiser les données"
          >
            <FontAwesomeIcon icon={faSync} /> Actualiser
          </button>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Retour
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-3 pl-10 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
          </div>
          <select
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
            className="p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
          >
            <option value="">Tous les niveaux</option>
            {niveaux.map((niveau) => (
              <option key={niveau._id} value={niveau._id}>
                {niveau.nom}
              </option>
            ))}
          </select>
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
            disabled={!selectedNiveau}
          >
            <option value="">Toutes les classes</option>
            {classes.map((classe) => (
              <option key={classe._id} value={classe._id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <span className="ml-4 text-xl font-bold text-blue-700">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-3 text-2xl" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {filteredProgress.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <p className="text-gray-500 text-xl flex flex-col items-center justify-center">
              <span className="text-6xl mb-4">🔍</span>
              Aucun progrès trouvé
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgress.map((studentProgress) => (
              <div
                key={studentProgress.student.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 text-white">
                  <h3 className="text-xl font-bold flex items-center">
                    <span className="bg-white text-blue-500 p-2 rounded-full mr-3">👤</span>
                    {`${studentProgress.student.prenom} ${studentProgress.student.nom}`}
                  </h3>
                  <div className="flex mt-2">
                    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full mr-2">
                      Niveau: {niveaux.find((n) => n._id === studentProgress.student.niveau)?.nom || 'Inconnu'}
                    </span>
                    {studentProgress.student.classe && (
                      <span className="bg-blue-700 text-white text-sm font-semibold px-3 py-1 rounded-full">
                        Classe: {classes.find((c) => c._id === studentProgress.student.classe)?.nom || 'Inconnue'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-5">
                    <h4 className="text-md font-bold text-blue-800 mb-3 flex items-center border-b-2 border-blue-100 pb-2">
                      <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full mr-2">📚</span>
                      Leçons
                    </h4>
                    {studentProgress.lessons.length === 0 ? (
                      <p className="text-gray-500 flex items-center">
                        <span className="mr-2">😴</span>
                        Aucune leçon suivie
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {studentProgress.lessons.map((lesson) => (
                          <div
                            key={lesson.lessonId}
                            className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-300"
                          >
                            <div className="flex justify-between items-start">
                              <strong className="text-blue-800">{lesson.lessonTitle}</strong>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  lesson.status === 'not_started'
                                    ? 'bg-gray-200 text-gray-700'
                                    : lesson.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {lesson.status === 'not_started'
                                  ? 'Non commencé'
                                  : lesson.status === 'in_progress'
                                  ? 'En cours ⏳'
                                  : 'Terminé ✅'}
                              </span>
                            </div>
                            <p className="text-sm text-blue-600 mt-1">
                              <span className="font-semibold">Page :</span> {lesson.currentPage || 'N/A'}
                            </p>
                            {lesson.notes && (
                              <div className="mt-2 bg-white p-2 rounded text-sm border-blue-100">
                                <span className="font-semibold text-blue-700">📝 Notes :</span>{' '}
                                {lesson.notes}
                              </div>
                            )}
                            {lesson.completionDate && (
                              <p className="text-sm text-blue-600 mt-1">
                                <span className="font-semibold">Terminé le :</span>{' '}
                                {new Date(lesson.completionDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-md font-bold text-purple-800 mb-3 flex items-center border-b-2 border-purple-100 pb-2">
                      <span className="bg-purple-100 text-purple-600 p-2 rounded-full mr-2">📝</span>
                      Tests
                    </h4>
                    {studentProgress.tests.length === 0 ? (
                      <p className="text-gray-500 text-center">
                        <span className="mr-2">📝</span>
                        Aucun test soumis
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {studentProgress.tests.map((test) => (
                          <div
                            key={test.testId}
                            className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-300"
                          >
                            <div className="flex justify-between">
                              <strong className="text-purple-800">{test.testTitle}</strong>
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  test.status === 'non_soumis'
                                    ? 'bg-gray-200 text-gray-700'
                                    : test.status === 'soumis'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {test.status === 'non_soumis'
                                  ? 'Non soumis'
                                  : test.status === 'soumis'
                                  ? 'Soumis 📤'
                                  : 'Corrigé ✔️'}
                              </span>
                            </div>
                            {test.submittedAt && (
                              <p className="text-sm text-purple-600 mt-1">
                                <span className="font-semibold">Soumis le :</span>{' '}
                                {new Date(test.submittedAt).toLocaleDateString()}
                              </p>
                            )}
                            {test.feedback && (
                              <div className="mt-2 p-2 bg-white rounded-lg text-sm border-purple-100">
                                <span className="font-semibold text-purple-700">💬 Feedback :</span>{' '}
                                {test.feedback}
                              </div>
                            )}
                            {test.correctionFile && (
                              <a
                                href={`https://kara-back.onrender.com/uploads/${test.correctionFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 bg-purple-100 p-1 px-3 rounded-full text-sm hover:bg-purple-200 text-purple-800 transition-colors duration-300"
                              >
                                <span className="mr-2">📥</span>
                                Télécharger la correction
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

export default TeacherStudentProgress;
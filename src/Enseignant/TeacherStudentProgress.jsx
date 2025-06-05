// src/Components/TeacherStudentProgress.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const TeacherStudentProgress = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get('https://kara-back.onrender.com/api/tests/student-progress', config);
        setProgress(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Erreur lors du chargement des progrès.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    if (token) {
      fetchProgress();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleBack = () => {
    navigate('/teacher-dashboard');
  };

return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
    {/* Header */}
      <div className="flex items-center justify-between mb-6">
          
          <h1 className="text-2xl font-bold text-green-700">
            <span className="inline-block mr-3">📈</span>
            Progrès des Élèves
            <span className="inline-block ml-3">👩‍🎓</span>
          </h1>
          <button
                      onClick={handleBack}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />           🏠 Retour

                    </button>
        </div>

    {/* Main Content */}
    <main className="container mx-auto max-w-7xl">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-shake flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* No Data */}
      {progress.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <p className="text-gray-500 text-xl flex flex-col items-center justify-center">
            <span className="text-6xl mb-4">🔍</span>
            Aucun progrès trouvé
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {progress.map((studentProgress) => (
            <div 
              key={studentProgress.student.id} 
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
            >
              {/* Student Header */}
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <span className="bg-white text-blue-500 p-2 rounded-full mr-3">👤</span>
                  {studentProgress.student.prenom} {studentProgress.student.nom}
                </h3>
                <div className="flex mt-2">
                  <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full mr-2">
                    Niveau: {studentProgress.student.niveau}
                  </span>
                  {studentProgress.student.classe && (
                    <span className="bg-blue-700 text-white text-sm px-3 py-1 rounded-full">
                      Classe: {studentProgress.student.classe}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                {/* Lessons Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center border-b-2 border-blue-100 pb-2">
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
                          className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-300"
                        >
                          <div className="flex justify-between items-start">
                            <strong className="text-blue-800">{lesson.lessonTitle}</strong>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              lesson.status === 'not_started' ? 'bg-gray-200 text-gray-700' :
                              lesson.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {lesson.status === 'not_started' ? 'Non commencé' : 
                               lesson.status === 'in_progress' ? 'En cours ⏳' : 
                               'Terminé ✅'}
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 mt-1">
                            <span className="font-semibold">Page:</span> {lesson.currentPage}
                          </p>
                          {lesson.notes && (
                            <div className="mt-1 bg-white p-2 rounded text-sm border border-blue-100">
                              <span className="font-semibold text-blue-700">📝 Notes:</span> {lesson.notes}
                            </div>
                          )}
                          {lesson.completionDate && (
                            <p className="text-xs text-blue-500 mt-1">
                              <span className="font-semibold">Terminé le:</span> {new Date(lesson.completionDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tests Section */}
                <div>
                  <h4 className="text-lg font-bold text-purple-800 mb-3 flex items-center border-b-2 border-purple-100 pb-2">
                    <span className="bg-purple-100 text-purple-600 p-2 rounded-full mr-2">📝</span>
                    Tests
                  </h4>
                  {studentProgress.tests.length === 0 ? (
                    <p className="text-gray-500 flex items-center">
                      <span className="mr-2">😯</span>
                      Aucun test soumis
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {studentProgress.tests.map((test) => (
                        <div 
                          key={test.testId} 
                          className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-300"
                        >
                          <div className="flex justify-between items-start">
                            <strong className="text-purple-800">{test.testTitle}</strong>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              test.status === 'non_soumis' ? 'bg-gray-200 text-gray-700' :
                              test.status === 'soumis' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {test.status === 'non_soumis' ? 'Non soumis' : 
                               test.status === 'soumis' ? 'Soumis 📤' : 
                               'Corrigé ✔️'}
                            </span>
                          </div>
                          {test.submittedAt && (
                            <p className="text-sm text-purple-600 mt-1">
                              <span className="font-semibold">Soumis le:</span> {new Date(test.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                          {test.feedback && (
                            <div className="mt-1 bg-white p-2 rounded text-sm border border-purple-100">
                              <span className="font-semibold text-purple-700">💬 Feedback:</span> {test.feedback}
                            </div>
                          )}
                          {test.correctionFile && (
                            <a
                              href={`https://kara-back.onrender.com/uploads/${test.correctionFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm font-medium py-1 px-3 rounded-full transition-colors duration-300"
                            >
                              <span className="mr-1">📥</span>
                              Télécharger correction
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
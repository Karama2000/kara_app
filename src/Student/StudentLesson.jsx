import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../Styles/StudentLessons.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const StudentLessons = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [progressStatus, setProgressStatus] = useState('not_started');
  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastPageReached, setLastPageReached] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get('https://kara-back.onrender.com/api/student/lessons', config);
        setLessons(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Erreur lors du chargement des leçons.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    if (token) {
      fetchLessons();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setProgressStatus(lesson.progress.status);
    setNotes(lesson.progress.notes || '');
    setCurrentPage(lesson.progress.currentPage || 1);
    setTotalPages(lesson.totalPages || 1);
    setLastPageReached(lesson.progress.currentPage >= lesson.totalPages);
    setError('');
    setSuccess('');
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setTotalPages(numPages);
    setLastPageReached(currentPage >= numPages);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setLastPageReached(newPage >= totalPages);
    if (progressStatus === 'not_started') {
      setProgressStatus('in_progress');
    }
  };

  const handleUpdateProgress = async () => {
    if (progressStatus === 'completed' && !lastPageReached) {
      setError('Vous devez atteindre la dernière page pour marquer la leçon comme terminée.');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.post(
        'https://kara-back.onrender.com/api/student/lessons/progress',
        {
          lessonId: selectedLesson._id,
          status: progressStatus,
          notes: notes.trim(),
          currentPage,
        },
        config
      );

      setLessons(lessons.map((lesson) =>
        lesson._id === selectedLesson._id
          ? { ...lesson, progress: response.data }
          : lesson
      ));
      setError('');
      setSuccess('Progression mise à jour avec succès !');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de la progression.');
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };
 const goBack = () => {
    navigate('/student-dashboard');
  };
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Header */}
      <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
        Consulter les Leçons
      </h2>

      {/* Status Messages */}
      {error && (
        <div 
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      {success && (
        <div 
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-md"
          aria-live="assertive"
        >
          {success}
        </div>
      )}

      {/* Lessons Container */}
      <div className="flex flex-col lg:flex-row gap-6">
  <div className="mb-8">
          <button 
            onClick={goBack} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center"
            title="Retour"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
                      🏠 Retour

          </button>
        </div>        <div className="lg:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <h3 className="text-xl font-bold text-white">Liste des Leçons</h3>
          </div>
          <div className="p-4">
            {lessons.length === 0 ? (
              <p className="text-gray-500 italic">Aucune leçon disponible.</p>
            ) : (
              <ul className="space-y-2">
                {lessons.map((lesson) => (
                  <li
                    key={lesson._id}
                    onClick={() => handleSelectLesson(lesson)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectLesson(lesson)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex justify-between items-center ${
                      selectedLesson?._id === lesson._id
                        ? 'bg-purple-100 border-2 border-purple-400 shadow-inner'
                        : 'bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Sélectionner la leçon ${lesson.title}`}
                  >
                    <span className="font-medium text-gray-800">{lesson.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      lesson.progress.status === 'not_started'
                        ? 'bg-yellow-100 text-yellow-800'
                        : lesson.progress.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {lesson.progress.status === 'not_started'
                        ? 'Non commencé'
                        : lesson.progress.status === 'in_progress'
                        ? 'En cours'
                        : 'Terminé'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Lesson Details */}
        {selectedLesson && (
          <div className="lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <h3 className="text-xl font-bold text-white">{selectedLesson.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-50 p-3 rounded-lg flex-1 min-w-[200px]">
                  <p className="text-sm text-blue-600 font-semibold">Programme</p>
                  <p className="text-gray-800">{selectedLesson.programId?.title || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg flex-1 min-w-[200px]">
                  <p className="text-sm text-purple-600 font-semibold">Unité</p>
                  <p className="text-gray-800">{selectedLesson.unitId?.title || 'N/A'}</p>
                </div>
              </div>

              {/* PDF Viewer or Text Content */}
              {selectedLesson.mediaFile && selectedLesson.mediaFile.endsWith('.pdf') ? (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <Document
                    file={`https://kara-back.onrender.com/Uploads/${selectedLesson.mediaFile}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                  >
                    <Page 
                      pageNumber={currentPage} 
                      className="shadow-md"
                    />
                  </Document>
                  <div className="flex items-center justify-between mt-4 bg-blue-50 p-2 rounded-lg">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage <= 1
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      aria-label="Page précédente"
                    >
                      ← Précédent
                    </button>
                    <span className="font-medium text-gray-700">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage >= totalPages
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      aria-label="Page suivante"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="font-bold text-gray-700 mb-2">Contenu:</p>
                  {selectedLesson.content ? (
                    <>
                      <div className="content-page bg-white p-4 rounded-lg shadow-inner mb-4">
                        {selectedLesson.content}
                      </div>
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                        <button
                          disabled={currentPage <= 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage <= 1
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                          aria-label="Page précédente"
                        >
                          ← Précédent
                        </button>
                        <span className="font-medium text-gray-700">
                          Page {currentPage} sur {totalPages}
                        </span>
                        <button
                          disabled={currentPage >= totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage >= totalPages
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                          aria-label="Page suivante"
                        >
                          Suivant →
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Aucun contenu textuel</p>
                  )}
                </div>
              )}

              {/* Media File Link */}
              {selectedLesson.mediaFile && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="font-bold text-indigo-700 mb-1">Fichier:</p>
                  <a
                    href={`https://kara-back.onrender.com/Uploads/${selectedLesson.mediaFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                    aria-label={`Voir le fichier de la leçon ${selectedLesson.title}`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    Voir le fichier ({selectedLesson.mediaFile})
                  </a>
                </div>
              )}

              {/* Progress Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
                <h4 className="text-lg font-bold text-green-800 mb-3">Progression</h4>
                <div className="space-y-4">
                  <select
                    value={progressStatus}
                    onChange={(e) => setProgressStatus(e.target.value)}
                    className="w-full p-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    aria-label="Statut de la progression"
                  >
                    <option value="not_started">Non commencé</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed" disabled={!lastPageReached}>
                      Terminé
                    </option>
                  </select>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes..."
                    rows={4}
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    aria-label="Notes sur la progression"
                  />

                  <button
                    onClick={handleUpdateProgress}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                    aria-label="Mettre à jour la progression"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLessons;
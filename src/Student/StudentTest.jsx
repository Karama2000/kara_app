import React, { useState, useEffect } from 'react';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUpload, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../Styles/StudentTests.css';

const StudentTests = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submissionForm, setSubmissionForm] = useState({
    testId: '',
    submittedFile: null,
    submissionId: '',
    isEditing: false,
  });

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get('https://kara-back.onrender.com/api/student/tests', config);
        console.log('Tests reçus:', JSON.stringify(response.data, null, 2));
        setTests(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tests:', error);
        setError(error.response?.data?.message || 'Erreur lors du chargement des tests.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTests();
    } else {
      setError('Aucun token trouvé. Veuillez vous connecter.');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleFileChange = (e) => {
    setSubmissionForm({ ...submissionForm, submittedFile: e.target.files[0] });
    setError('');
  };

  const handleSubmit = async (e, testId, submissionId = null) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('testId', testId);
      if (!submissionForm.submittedFile) {
        throw new Error('Aucun fichier sélectionné.');
      }
      formData.append('submittedFile', submissionForm.submittedFile);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      let response;
      if (submissionId && submissionForm.isEditing) {
        response = await axios.put(`https://kara-back.onrender.com/api/student/tests/submission/${submissionId}`, formData, config);
      } else {
        response = await axios.post('https://kara-back.onrender.com/api/student/tests/submit', formData, config);
      }

      setTests(tests.map(test =>
        test._id === testId
          ? { ...test, submission: response.data }
          : test
      ));
      setSuccess(`Soumission ${submissionId && submissionForm.isEditing ? 'mise à jour' : 'envoyée'} avec succès.`);
      setSubmissionForm({ testId: '', submittedFile: null, submissionId: '', isEditing: false });
      e.target.reset();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error.response?.data || error);
      setError(error.response?.data?.message || error.message || 'Erreur lors de la soumission du test.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmission = (testId, submission) => {
    setSubmissionForm({
      testId,
      submittedFile: null,
      submissionId: submission._id,
      isEditing: true,
    });
  };

  const handleDeleteSubmission = async (submissionId, testId) => {
    if (!submissionId) {
      setError('ID de soumission manquant ou invalide.');
      console.error('Erreur : submissionId est undefined', { submissionId, testId });
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`https://kara-back.onrender.com/api/student/tests/submission/${submissionId}`, config);
      setTests(tests.map(test =>
        test._id === testId
          ? { ...test, submission: null }
          : test
      ));
      setSuccess('Soumission supprimée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error.response?.data || error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression de la soumission.');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Mes Tests</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg font-medium text-purple-700">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {success}
            </div>
          </div>
        )}

        <div className="mb-8">
          <button 
            onClick={goBack} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center"
            title="Retour"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour
          </button>
        </div>

        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-6">
          Tests Disponibles
        </h2>

        {tests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="mt-4 text-xl text-gray-600">Aucun test trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <div key={test._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-indigo-800 mb-2">{test.title}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="flex items-start">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">Leçon</span>
                      <span>{test.lessonId?.title || 'N/A'}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2">Programme</span>
                      <span>{test.programId?.title || 'N/A'}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mr-2">Unité</span>
                      <span>{test.unitId?.title || 'N/A'}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Contenu</span>
                      <span>{test.content || 'Aucun contenu'}</span>
                    </p>
                  </div>

                  {test.mediaFile && (
                    <div className="mb-4">
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${test.mediaFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Télécharger le test
                      </a>
                    </div>
                  )}

                  <div className={`mb-4 p-3 rounded-lg ${
                    test.submission?.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : test.submission?.status === 'corrected'
                      ? 'bg-green-100 text-green-800'
                      : test.submission?.status === 'submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className="font-bold">Statut:</span> {test.submission?.status || 'non soumis'}
                  </div>

                  {test.submission?.submittedFile && (
                    <div className="mb-4">
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${test.submission.submittedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Voir ma soumission
                      </a>
                    </div>
                  )}

                  {test.submission?.feedback && (
                    <div className="mb-4 bg-indigo-50 p-3 rounded-lg">
                      <span className="font-bold text-indigo-700">Feedback:</span> {test.submission.feedback}
                    </div>
                  )}

                  {test.submission?.correctionFile && (
                    <div className="mb-4">
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${test.submission.correctionFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Télécharger la correction
                      </a>
                    </div>
                  )}

                  {(!test.submission || (test.submission?.status !== 'corrected')) && (
                    <form onSubmit={(e) => handleSubmit(e, test._id, test.submission?._id)} className="mt-4">
                      <div className="mb-4">
                        <label htmlFor={`file-${test._id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          {test.submission ? 'Modifier la soumission' : 'Soumettre le test complété'}
                        </label>
                        <div className="flex items-center">
                          <label className="flex-1 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-200 transition-colors duration-300">
                            <input
                              id={`file-${test._id}`}
                              type="file"
                              accept="image/jpeg,image/png,application/pdf,audio/mpeg,audio/wav,audio/ogg"
                              onChange={handleFileChange}
                              disabled={submitting}
                              className="hidden"
                            />
                            <div className="flex items-center justify-center">
                              <FontAwesomeIcon icon={faUpload} className="mr-2" />
                              Choisir un fichier
                            </div>
                          </label>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={submitting || !submissionForm.submittedFile}
                        className={`w-full py-2 px-4 rounded-lg font-bold shadow-md transition-all duration-300 ${
                          submitting || !submissionForm.submittedFile
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white transform hover:scale-105'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <FontAwesomeIcon icon={faUpload} className="mr-2" />
                          {submitting ? 'Soumission en cours...' : test.submission ? 'Mettre à jour' : 'Soumettre'}
                        </div>
                      </button>
                    </form>
                  )}

                  {test.submission && test.submission._id && test.submission.status !== 'corrected' && (
                    <button
                      onClick={() => {
                        console.log('Submission avant suppression:', test.submission);
                        handleDeleteSubmission(test.submission._id, test._id);
                      }}
                      disabled={submitting}
                      className="mt-4 w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-md transition-all duration-300 flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2" />
                      Supprimer la soumission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentTests;
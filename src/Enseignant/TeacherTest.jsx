import React, { useState, useEffect } from 'react';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUpload, faDownload, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../Styles/TeacherTest.css';

const TeacherTest = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [correctionForm, setCorrectionForm] = useState({
    submissionId: '',
    feedback: '',
    correctionFile: null,
    isEditing: false,
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get('https://kara-back.onrender.com/api/tests/submissions', config);
        setSubmissions(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Erreur lors du chargement des soumissions.');
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSubmissions();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleCorrectionInputChange = (e) => {
    const { name, value } = e.target;
    setCorrectionForm({ ...correctionForm, [name]: value });
  };

  const handleCorrectionFileChange = (e) => {
    setCorrectionForm({ ...correctionForm, correctionFile: e.target.files[0] });
    setError('');
  };

  const handleCorrectionSubmit = async (e, submissionId, isEditing = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('feedback', correctionForm.feedback);
      formData.append('status', 'corrected');
      if (correctionForm.correctionFile) {
        formData.append('correctionFile', correctionForm.correctionFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios[isEditing ? 'put' : 'post'](
        `https://kara-back.onrender.com/api/tests/${submissionId}/feedback`,
        formData,
        config
      );

      setSubmissions(submissions.map(sub =>
        sub._id === submissionId ? response.data : sub
      ));
      setSuccess(`Feedback ${isEditing ? 'mis à jour' : 'soumis'} avec succès.`);
      setCorrectionForm({ submissionId: '', feedback: '', correctionFile: null, isEditing: false });
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la soumission du feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (submission) => {
    setCorrectionForm({
      submissionId: submission._id,
      feedback: submission.feedback || '',
      correctionFile: null,
      isEditing: true,
    });
  };

  const handleDeleteFeedback = async (submissionId) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.delete(`https://kara-back.onrender.com/api/tests/${submissionId}/feedback`, config);

      setSubmissions(submissions.map(sub =>
        sub._id === submissionId ? response.data.submission : sub
      ));
      setSuccess('Feedback supprimé avec succès.');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression du feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/teacher/tests');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">📚 Gérer les Soumissions</h1>
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour
        </button>
      </div>

      <main className="container mx-auto max-w-7xl">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500 flex items-center justify-center">
              <span className="text-gray-500 text-xl">🌀</span>
            </div>
            <span className="ml-4 text-gray-700 font-bold text-xl">Chargement en cours...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-lg animate-shake flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <p className="font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 mb-6 rounded-lg animate-pulse flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <p className="font-bold">{success}</p>
          </div>
        )}

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="bg-gray-200 p-3 rounded-full mr-4">📝</span>
          Soumissions des Étudiants
        </h2>

        {submissions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <p className="text-gray-500 text-xl flex items-center justify-center">
              <span className="text-4xl mr-3">😕</span>
              Aucune soumission trouvée.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map(sub => (
              <div 
                key={sub._id} 
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                      <span className="bg-gray-100 p-2 rounded-full mr-3">📋</span>
                      {sub.testId?.title || 'N/A'}
                    </h3>
                    <p className="text-gray-700 mb-1 flex items-center">
                      <span className="bg-gray-100 p-1 rounded-full mr-2">👤</span>
                      <span className="font-semibold">ID Anonyme:</span> 
                      <span className="ml-1 text-blue-500">{sub.anonymousId}</span>
                    </p>
                    <p className="text-gray-700 mb-1 flex items-center">
                      <span className="bg-gray-100 p-1 rounded-full mr-2">⏱️</span>
                      <span className="font-semibold">Soumis le:</span> 
                      <span className="ml-1">{new Date(sub.submittedAt).toLocaleString()}</span>
                    </p>
                  </div>

                  {sub.submittedFile && (
                    <div className="mb-4">
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${sub.submittedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-full transition-colors duration-300"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Télécharger la soumission
                      </a>
                    </div>
                  )}

                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      sub.status === 'submitted' ? 'bg-gray-100 text-gray-800' : 
                      sub.status === 'corrected' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        sub.status === 'submitted' ? 'bg-gray-500' : 
                        sub.status === 'corrected' ? 'bg-green-500' : 
                        'bg-gray-500'
                      }`}></span>
                      Statut: {sub.status}
                    </span>
                  </div>

                  {sub.feedback && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-gray-800 flex items-center">
                        <span className="text-xl mr-2">💬</span>
                        Feedback:
                      </p>
                      <p className="text-gray-700 mt-1">{sub.feedback}</p>
                    </div>
                  )}

                  {sub.correctionFile && (
                    <div className="mb-4">
                      <a
                        href={`https://kara-back.onrender.com/Uploads/${sub.correctionFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-full transition-colors duration-300"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Télécharger la correction
                      </a>
                    </div>
                  )}

                  {(sub.status === 'submitted' || sub.status === 'corrected') && (
                    <form onSubmit={(e) => handleCorrectionSubmit(e, sub._id, sub.status === 'corrected')} className="mt-4">
                      <div className="mb-4">
                        <label htmlFor={`feedback-${sub._id}`} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <span className="text-xl mr-2">✏️</span>
                          Feedback
                        </label>
                        <textarea
                          id={`feedback-${sub._id}`}
                          name="feedback"
                          value={correctionForm.submissionId === sub._id ? correctionForm.feedback : sub.feedback || ''}
                          onChange={handleCorrectionInputChange}
                          onFocus={() => setCorrectionForm({ ...correctionForm, submissionId: sub._id })}
                          rows="4"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor={`file-${sub._id}`} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <span className="text-xl mr-2">📎</span>
                          Fichier de correction
                        </label>
                        <div className="relative">
                          <input
                            id={`file-${sub._id}`}
                            type="file"
                            accept="image/jpeg,image/png,application/pdf,audio/mpeg,audio/wav,audio/ogg"
                            onChange={handleCorrectionFileChange}
                            disabled={submitting}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-gray-100 file:text-gray-700
                              hover:file:bg-gray-200
                              transition-colors duration-300
                              disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:transform-none flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={sub.status === 'corrected' ? faEdit : faUpload} className="mr-2" />
                        {submitting ? 'Envoi en cours...' : sub.status === 'corrected' ? 'Mettre à jour le feedback' : 'Soumettre la correction'}
                      </button>
                    </form>
                  )}

                  {sub.status === 'corrected' && (
                    <button
                      onClick={() => handleDeleteFeedback(sub._id)}
                      disabled={submitting}
                      className="mt-4 w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-md transition-all duration-300 flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2" />
                      Supprimer le feedback
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

export default TeacherTest;
import React, { useState, useEffect } from 'react';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faUpload,
  faEdit,
  faTrash,
  faSave,
  faExclamationCircle,
  faCheckCircle,
  faArrowLeft,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import submissionIllustration from '../Assets/images/dashboard/lesson.avif';

const GestionTests = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tests, setTests] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    lessonId: '',
    programId: '',
    unitId: '',
    title: '',
    content: '',
    mediaFile: null,
  });
  const [feedbackForm, setFeedbackForm] = useState({
    submissionId: '',
    feedback: '',
    status: 'corrected',
    correctionFile: null,
    isEditing: false,
  });
  const [editingTestId, setEditingTestId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError('Vous devez être connecté.');
          navigate('/login');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [programsRes, lessonsRes, testsRes, submissionsRes] = await Promise.all([
          axios.get('https://kara-back.onrender.com/api/programs', config),
          axios.get('https://kara-back.onrender.com/api/lessons', config),
          axios.get('https://kara-back.onrender.com/api/tests', config),
          axios.get('https://kara-back.onrender.com/api/tests/submissions', config),
        ]);

        setPrograms(programsRes.data);
        setLessons(lessonsRes.data);
        setTests(testsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des données.');
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate, token]);

  const getFilteredUnits = () => {
    if (!formData.programId) return [];
    const program = programs.find((p) => p._id === formData.programId);
    return program?.units || [];
  };

  const getFilteredLessons = () => {
    if (!formData.programId && !formData.unitId) return lessons;
    return lessons.filter((lesson) => {
      const matchesProgram = !formData.programId || lesson.programId?._id === formData.programId;
      const matchesUnit = !formData.unitId || lesson.unitId?._id === formData.unitId;
      return matchesProgram && matchesUnit;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'programId' && { unitId: '', lessonId: '' }),
      ...(name === 'unitId' && { lessonId: '' }),
    }));
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, mediaFile: e.target.files[0] });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('lessonId', formData.lessonId);
      formDataToSend.append('programId', formData.programId);
      formDataToSend.append('unitId', formData.unitId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.mediaFile) {
        formDataToSend.append('mediaFile', formData.mediaFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      let res;
      if (editingTestId) {
        res = await axios.put(`https://kara-back.onrender.com/api/tests/${editingTestId}`, formDataToSend, config);
        setTests(tests.map((test) => (test._id === editingTestId ? res.data : test)));
        setSuccess('Test mis à jour avec succès.');
      } else {
        res = await axios.post('https://kara-back.onrender.com/api/tests', formDataToSend, config);
        setTests([...tests, res.data]);
        setSuccess('Test créé avec succès.');
      }

      setFormData({ lessonId: '', programId: '', unitId: '', title: '', content: '', mediaFile: null });
      setEditingTestId(null);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission du test.');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (test) => {
    setFormData({
      lessonId: test.lessonId?._id || '',
      programId: test.programId?._id || '',
      unitId: test.unitId?._id || '',
      title: test.title,
      content: test.content || '',
      mediaFile: null,
    });
    setEditingTestId(test._id);
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`https://kara-back.onrender.com/api/tests/${id}`, config);
      setTests(tests.filter((test) => test._id !== id));
      setSubmissions(submissions.filter((sub) => sub.testId._id !== id));
      setSuccess('Test supprimé avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du test.');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeedbackFileChange = (e) => {
    setFeedbackForm((prev) => ({ ...prev, correctionFile: e.target.files[0] }));
    setError('');
  };

  const handleFeedbackSubmit = async (e, submissionId, isEditing = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('feedback', feedbackForm.feedback);
      formDataToSend.append('status', 'corrected');
      if (feedbackForm.correctionFile) {
        formDataToSend.append('correctionFile', feedbackForm.correctionFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios[isEditing ? 'put' : 'post'](
        `https://kara-back.onrender.com/api/tests/${submissionId}/feedback`,
        formDataToSend,
        config
      );

      setSubmissions(submissions.map((sub) => (sub._id === submissionId ? response.data : sub)));
      setSuccess(`Feedback ${isEditing ? 'mis à jour' : 'soumis'} avec succès.`);
      setFeedbackForm({ submissionId: '', feedback: '', status: 'corrected', correctionFile: null, isEditing: false });
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission du feedback.');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (submission) => {
    setFeedbackForm({
      submissionId: submission._id,
      feedback: submission.feedback || '',
      status: submission.status || 'corrected',
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

      setSubmissions(submissions.map((sub) => (sub._id === submissionId ? response.data.submission : sub)));
      setSuccess('Feedback supprimé avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du feedback.');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigateToSubmissions = () => {
    navigate('/teacher/test-submissions');
  };

  const goToDashboard = () => {
    navigate('/teacher-dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <FontAwesomeIcon
        icon={faArrowLeft}
        onClick={goToDashboard}
        className="text-2xl text-yellow-600 hover:text-yellow-700 cursor-pointer transition transform hover:scale-110 mb-4"
        aria-label="Retour au tableau de bord enseignant"
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">📝 Gestion des Tests</h1>
        <button
          onClick={handleNavigateToSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
          title="Gérer les soumissions"
        >
          <FontAwesomeIcon icon={faArrowRight} /> Gérer les Soumissions
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center">
          <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 flex items-center">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          {success}
        </div>
      )}

      {/* Formulaire de création/modification de test */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
          <span className="text-2xl mr-2">{editingTestId ? '✏️' : '➕'}</span>
          {editingTestId ? 'Modifier le Test' : 'Créer un Nouveau Test'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="programId" className="block text-gray-700 mb-2">
                Programme
              </label>
              <select
                id="programId"
                name="programId"
                value={formData.programId}
                onChange={handleInputChange}
                required
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              >
                <option value="">Sélectionner un programme</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.title} (Niveau: {program.niveauId?.nom || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unitId" className="block text-gray-700 mb-2">
                Unité
              </label>
              <select
                id="unitId"
                name="unitId"
                value={formData.unitId}
                onChange={handleInputChange}
                required
                disabled={!formData.programId}
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm disabled:bg-gray-100"
              >
                <option value="">Sélectionner une unité</option>
                {getFilteredUnits().map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lessonId" className="block text-gray-700 mb-2">
                Leçon
              </label>
              <select
                id="lessonId"
                name="lessonId"
                value={formData.lessonId}
                onChange={handleInputChange}
                required
                disabled={!formData.unitId}
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm disabled:bg-gray-100"
              >
                <option value="">Sélectionner une leçon</option>
                {getFilteredLessons().map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-gray-700 mb-2">
              Titre du Test
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              placeholder="Entrez le titre du test"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-gray-700 mb-2">
              Contenu
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              placeholder="Entrez le contenu du test"
              rows="4"
            />
          </div>

          <div>
            <label htmlFor="mediaFile" className="block text-gray-700 mb-2">
              Fichier Média
            </label>
            <input
              id="mediaFile"
              type="file"
              name="mediaFile"
              accept="image/jpeg,image/png,application/pdf,audio/mpeg,audio/wav,audio/ogg"
              onChange={handleFileChange}
              className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
            }`}
          >
            <FontAwesomeIcon icon={editingTestId ? faEdit : faSave} />
            {submitting ? 'Envoi en cours...' : editingTestId ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      </div>

      {/* Liste des tests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
          <span className="text-2xl mr-2">📋</span>
          Tests Existants
        </h2>
        {tests.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-500">Aucun test trouvé.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{test.title}</h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Leçon:</span> {test.lessonId?.title || 'N/A'}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Programme:</span> {test.programId?.title || 'N/A'}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Unité:</span> {test.unitId?.title || 'N/A'}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Contenu:</span> {test.content || 'Aucun contenu'}
                </p>
                {test.mediaFile && (
                  <a
                    href={`https://kara-back.onrender.com/Uploads/${test.mediaFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Télécharger le fichier
                  </a>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(test)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition"
                    title="Modifier"
                  >
                    <FontAwesomeIcon icon={faEdit} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition disabled:bg-gray-400"
                    title="Supprimer"
                  >
                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gestion des soumissions */}
      <div>
        <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
          <span className="text-2xl mr-2">📤</span>
          Soumissions des Élèves
        </h2>
        {submissions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <img src={submissionIllustration} alt="Aucune soumission" className="mx-auto h-32 mb-4" />
            <p className="text-gray-500">Aucune soumission trouvée.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{sub.testId?.title || 'N/A'}</h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">ID Anonyme:</span> {sub.anonymousId}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Soumis le:</span>{' '}
                  {new Date(sub.submittedAt).toLocaleString()}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Statut:</span> {sub.status}
                </p>
                {sub.submittedFile && (
                  <a
                    href={`https://kara-back.onrender.com/Uploads/${sub.submittedFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Télécharger la soumission
                  </a>
                )}
                {sub.feedback && (
                  <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-800">Feedback:</p>
                    <p className="text-gray-600">{sub.feedback}</p>
                  </div>
                )}
                {sub.correctionFile && (
                  <a
                    href={`https://kara-back.onrender.com/Uploads/${sub.correctionFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 mb-4 inline-block"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Télécharger la correction
                  </a>
                )}
                {(sub.status === 'submitted' || sub.status === 'corrected') && (
                  <form
                    onSubmit={(e) => handleFeedbackSubmit(e, sub._id, sub.status === 'corrected')}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor={`feedback-${sub._id}`} className="block text-gray-700 mb-2">
                        Feedback
                      </label>
                      <textarea
                        id={`feedback-${sub._id}`}
                        name="feedback"
                        value={
                          feedbackForm.submissionId === sub._id ? feedbackForm.feedback : sub.feedback || ''
                        }
                        onChange={handleFeedbackChange}
                        onFocus={() => setFeedbackForm({ ...feedbackForm, submissionId: sub._id })}
                        required
                        className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                        rows="4"
                        placeholder="Entrez votre feedback"
                      />
                    </div>
                    <div>
                      <label htmlFor={`correctionFile-${sub._id}`} className="block text-gray-700 mb-2">
                        Fichier de Correction
                      </label>
                      <input
                        id={`correctionFile-${sub._id}`}
                        type="file"
                        name="correctionFile"
                        accept="image/jpeg,image/png,application/pdf,audio/mpeg,audio/wav,audio/ogg"
                        onChange={handleFeedbackFileChange}
                        className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 ${
                        submitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={sub.status === 'corrected' ? faEdit : faUpload} />
                      {submitting
                        ? 'Envoi en cours...'
                        : sub.status === 'corrected'
                        ? 'Mettre à jour'
                        : 'Soumettre'}
                    </button>
                  </form>
                )}
                {sub.status === 'corrected' && (
                  <button
                    onClick={() => handleDeleteFeedback(sub._id)}
                    disabled={submitting}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition transform hover:scale-105 shadow-lg disabled:bg-gray-400"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer le Feedback
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionTests;
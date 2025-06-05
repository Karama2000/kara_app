import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faUpload, faEdit, faTrash, faSave, faExclamationCircle, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import submissionIllustration from '../Assets/images/dashboard/lesson.avif';
import testIllustration from '../Assets/images/dashboard/test.avif';

const GestionTests = () => {
  const navigate = useNavigate();
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
    status: 'corrigé',
    correctionFile: null,
  });
  const [editingTestId, setEditingTestId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
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
  }, [navigate]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté.');
        navigate('/login');
        return;
      }

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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté.');
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`https://kara-back.onrender.com/api/tests/${id}`, config);
      setTests(tests.filter((test) => test._id !== id));
      setSuccess('Test supprimé avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du test.');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const handleFeedbackChange = (e, submissionId) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({
      ...prev,
      submissionId,
      [name]: value,
    }));
  };

  const handleFeedbackFileChange = (e) => {
    setFeedbackForm((prev) => ({
      ...prev,
      correctionFile: e.target.files[0],
    }));
    setError('');
  };

  const handleFeedbackSubmit = async (e, submissionId) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté.');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('feedback', feedbackForm.feedback);
      formDataToSend.append('status', feedbackForm.status);
      if (feedbackForm.correctionFile) {
        formDataToSend.append('correctionFile', feedbackForm.correctionFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post(
        `https://kara-back.onrender.com/api/tests/${submissionId}/feedback`,
        formDataToSend,
        config
      );

      setSubmissions(submissions.map((sub) => (sub._id === submissionId ? response.data : sub)));
      setSuccess('Feedback soumis avec succès.');
      setFeedbackForm({ submissionId: '', feedback: '', status: 'corrigé', correctionFile: null });
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission du feedback.');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
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
      className="text-2xl text-yellow-600 hover:text-yellow-700 cursor-pointer transition transform hover:scale-110"
      aria-label="Retour au tableau de bord enseignant"
    />

    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-green-700">📝 Gestion des Tests</h1>
      <div className="flex gap-4">
        <button
          onClick={handleNavigateToSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
          title="Gérer les soumissions"
        >
          <FontAwesomeIcon icon={faArrowRight} /> Gérer les Soumissions
        </button>
      </div>
    </div>

    {error && (
      <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
        {error}
      </div>
    )}

    {success && (
      <div className="p-4 mb-6 bg-green-100 border-l-4 border-green-500 text-green-700">
        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
        {success}
      </div>
    )}

    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
      <h2 className="text-xl font-semibold text-green-700 mb-4">
        {editingTestId ? '✏️ Modifier le Test' : '➕ Créer un Nouveau Test'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Programme</label>
            <select
              name="programId"
              value={formData.programId}
              onChange={handleInputChange}
              required
              className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
            >
              <option value="">Sélectionner un programme</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.title} {program.niveauId?.name ? `(${program.niveauId.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Unité</label>
            <select
              name="unitId"
              value={formData.unitId}
              onChange={handleInputChange}
              required
              disabled={!formData.programId || getFilteredUnits().length === 0}
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
            <label className="block text-gray-700 mb-2">Leçon</label>
            <select
              name="lessonId"
              value={formData.lessonId}
              onChange={handleInputChange}
              required
              disabled={!formData.unitId || getFilteredLessons().length === 0}
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
          <label className="block text-gray-700 mb-2">Titre du test</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Contenu</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows="5"
            className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Fichier média</label>
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} />
            {editingTestId ? 'Mettre à jour' : 'Créer'} le test
          </button>
        </div>
      </form>
    </div>

    <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
      <img src={testIllustration} alt="Tests" className="w-8 h-8" />
      Mes Tests
    </h2>

    {tests.length === 0 ? (
      <p className="text-gray-600">🙈 Aucun test trouvé.</p>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-green-700 mb-2">{test.title}</h3>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Leçon:</span> {test.lessonId?.title || 'N/A'}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Programme:</span> {test.programId?.title || 'N/A'}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Unité:</span> {test.unitId?.title || 'N/A'}
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium">Contenu:</span> {test.content || 'Aucun contenu'}
            </p>

            {test.mediaFile && (
              <div className="mb-3">
                <span className="font-medium">Média:</span>
                {test.mediaFile.match(/\.(jpg|png)$/i) ? (
                  <img
                    src={`https://kara-back.onrender.com/uploads/${test.mediaFile}`}
                    alt="Media"
                    className="mt-2 rounded-lg max-w-full h-auto border border-gray-200"
                  />
                ) : (
                  <a
                    href={`https://kara-back.onrender.com/uploads/${test.mediaFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline block mt-1"
                  >
                    Voir le fichier
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEdit(test)}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1 text-sm"
              >
                <FontAwesomeIcon icon={faEdit} /> Modifier
              </button>
              <button
                onClick={() => handleDelete(test._id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1 text-sm"
              >
                <FontAwesomeIcon icon={faTrash} /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    <h2 className="text-xl font-semibold text-green-700 mt-12 mb-4 flex items-center gap-2">
      <img src={submissionIllustration} alt="Soumissions" className="w-8 h-8" />
      Soumissions des Élèves
    </h2>

    {submissions.length === 0 ? (
      <p className="text-gray-600">🙈 Aucune soumission trouvée.</p>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.map((submission) => (
          <div key={submission._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-green-700 mb-2">{submission.testId?.title || 'N/A'}</h3>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Élève:</span> {submission.studentId?.username || 'N/A'}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Statut:</span> 
              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                submission.status === 'corrigé' ? 'bg-green-100 text-green-800' :
                submission.status === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {submission.status}
              </span>
            </p>

            {submission.submittedFile && (
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Fichier soumis:</span>
                <a
                  href={`https://kara-back.onrender.com/uploads/${submission.submittedFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Voir le fichier
                </a>
              </p>
            )}

            {submission.correctionFile && (
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Correction:</span>
                <a
                  href={`https://kara-back.onrender.com/uploads/${submission.correctionFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Voir le fichier
                </a>
              </p>
            )}

            <p className="text-gray-600 mb-3">
              <span className="font-medium">Feedback:</span> {submission.feedback || 'Aucun feedback'}
            </p>

            {submission.status !== 'corrigé' && (
              <form onSubmit={(e) => handleFeedbackSubmit(e, submission._id)} className="space-y-3 mt-4">
                <div>
                  <label className="block text-gray-700 mb-2">Feedback</label>
                  <textarea
                    name="feedback"
                    value={feedbackForm.submissionId === submission._id ? feedbackForm.feedback : ''}
                    onChange={(e) => handleFeedbackChange(e, submission._id)}
                    onFocus={() => setFeedbackForm({ ...feedbackForm, submissionId: submission._id })}
                    rows="3"
                    required
                    className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Fichier de correction</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFeedbackFileChange}
                    className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Statut</label>
                  <select
                    name="status"
                    value={feedbackForm.submissionId === submission._id ? feedbackForm.status : submission.status}
                    onChange={(e) => handleFeedbackChange(e, submission._id)}
                    onFocus={() => setFeedbackForm({ ...feedbackForm, submissionId: submission._id })}
                    className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                  >
                    <option value="passé">Passé</option>
                    <option value="en attente">En attente</option>
                    <option value="corrigé">Corrigé</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition transform hover:scale-105 shadow-lg flex items-center gap-2 w-full justify-center"
                >
                  <FontAwesomeIcon icon={faUpload} /> Soumettre Feedback
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default GestionTests;
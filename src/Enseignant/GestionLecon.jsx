import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faArrowLeft, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import AddLessonModal from './AddLessonModal';

import lessonIllustration from '../Assets/images/dashboard/lesson.avif';
import testIllustration from '../Assets/images/dashboard/test.avif';

const GestionLecon = () => {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    programId: '',
    unitId: '',
    title: '',
    content: '',
    mediaFile: null,
  });
  const [testFormData, setTestFormData] = useState({
    lessonId: '',
    programId: '',
    unitId: '',
    title: '',
    content: '',
    mediaFile: null,
  });
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('❌ Vous devez être connecté.');
          navigate('/login');
          return;
        }

        const [programsRes, lessonsRes] = await Promise.all([
          axios.get('https://kara-back.onrender.com/api/programs', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://kara-back.onrender.com/api/lessons', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPrograms(programsRes.data);
        setLessons(lessonsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || '❌ Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'programId' && { unitId: '' }),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name, file.type); // Débogage
      setFormData({ ...formData, mediaFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('programId', formData.programId);
      formDataToSend.append('unitId', formData.unitId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.mediaFile) {
        formDataToSend.append('mediaFile', formData.mediaFile);
        console.log('Fichier envoyé:', formData.mediaFile.name); // Débogage
      }

      let res;
      if (editingLessonId) {
        res = await axios.put(`https://kara-back.onrender.com/api/lessons/${editingLessonId}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setLessons(lessons.map((lesson) => (lesson._id === editingLessonId ? res.data : lesson)));
        setSuccess('✅ Leçon mise à jour avec succès.');
      } else {
        res = await axios.post('https://kara-back.onrender.com/api/lessons', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setLessons([...lessons, res.data]);
        setSuccess('✅ Leçon créée avec succès.');
      }

      setFormData({ programId: '', unitId: '', title: '', content: '', mediaFile: null });
      setEditingLessonId(null);
      setShowLessonModal(false);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Erreur lors de la soumission.');
      console.error('Erreur soumission:', err.response?.data); // Débogage
    }
  };

  const handleTestInputChange = (e) => {
    const { name, value } = e.target;
    setTestFormData({ ...testFormData, [name]: value });
  };

  const handleTestFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Fichier test sélectionné:', file.name, file.type); // Débogage
      setTestFormData({ ...testFormData, mediaFile: file });
    }
  };

  const openTestModal = (lessonId, test = null) => {
    const lesson = lessons.find((l) => l._id === lessonId);
    if (!lesson) {
      setError('❌ Leçon non trouvée.');
      return;
    }
    if (test) {
      setTestFormData({
        lessonId,
        programId: lesson.programId?._id || '',
        unitId: lesson.unitId?._id || '',
        title: test.title,
        content: test.content || '',
        mediaFile: null,
      });
      setEditingTestId(test._id);
    } else {
      setTestFormData({
        lessonId,
        programId: lesson.programId?._id || '',
        unitId: lesson.unitId?._id || '',
        title: '',
        content: '',
        mediaFile: null,
      });
      setEditingTestId(null);
    }
    setShowTestModal(true);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('lessonId', testFormData.lessonId);
      formDataToSend.append('programId', testFormData.programId);
      formDataToSend.append('unitId', testFormData.unitId);
      formDataToSend.append('title', testFormData.title);
      formDataToSend.append('content', testFormData.content);
      if (testFormData.mediaFile) {
        formDataToSend.append('mediaFile', testFormData.mediaFile);
        console.log('Fichier test envoyé:', testFormData.mediaFile.name); // Débogage
      }

      let res;
      if (editingTestId) {
        res = await axios.put(`https://kara-back.onrender.com/api/tests/${editingTestId}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setLessons(lessons.map((lesson) => {
          if (lesson._id === testFormData.lessonId) {
            return {
              ...lesson,
              tests: lesson.tests.map((test) => (test._id === editingTestId ? res.data : test)),
            };
          }
          return lesson;
        }));
        setSuccess('✅ Test mis à jour avec succès.');
      } else {
        res = await axios.post('https://kara-back.onrender.com/api/tests', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setLessons(lessons.map((lesson) => {
          if (lesson._id === testFormData.lessonId) {
            return {
              ...lesson,
              tests: [...(lesson.tests || []), res.data],
            };
          }
          return lesson;
        }));
        setSuccess('✅ Test créé avec succès.');
      }

      setTestFormData({ lessonId: '', programId: '', unitId: '', title: '', content: '', mediaFile: null });
      setEditingTestId(null);
      setShowTestModal(false);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Erreur lors de la soumission du test.');
      console.error('Erreur soumission test:', err.response?.data); // Débogage
    }
  };

  const handleEdit = (lesson) => {
    setFormData({
      programId: lesson.programId?._id || '',
      unitId: lesson.unitId?._id || '',
      title: lesson.title,
      content: lesson.content || '',
      mediaFile: null,
    });
    setEditingLessonId(lesson._id);
    setShowLessonModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('🗑️ Supprimer cette leçon ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://kara-back.onrender.com/api/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(lessons.filter((lesson) => lesson._id !== id));
        setSuccess('✅ Leçon et tests associés supprimés avec succès.');
      } catch (err) {
        setError(err.response?.data?.message || '❌ Erreur lors de la suppression.');
      }
    }
  };

  const handleTestDelete = async (lessonId, testId) => {
    if (window.confirm('🗑️ Supprimer ce test ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://kara-back.onrender.com/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(lessons.map((lesson) => {
          if (lesson._id === lessonId) {
            return {
              ...lesson,
              tests: lesson.tests.filter((test) => test._id !== testId),
            };
          }
          return lesson;
        }));
        setSuccess('✅ Test supprimé avec succès.');
      } catch (err) {
        setError(err.response?.data?.message || '❌ Erreur lors de la suppression du test.');
      }
    }
  };

  const closeTestModal = () => {
    setShowTestModal(false);
    setTestFormData({ lessonId: '', programId: '', unitId: '', title: '', content: '', mediaFile: null });
    setEditingTestId(null);
    setError('');
  };

  const handleBackToDashboard = () => {
    navigate('/teacher-dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-[Comic Neue, Poppins, sans-serif]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">📚 Gestion des Leçons</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setFormData({ programId: '', unitId: '', title: '', content: '', mediaFile: null });
              setEditingLessonId(null);
              setShowLessonModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition transform hover:scale-105 shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} /> Ajouter une Leçon
          </button>
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition transform hover:scale-105 shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> 🏠 Retour
          </button>
        </div>
      </div>

      <img
        src={lessonIllustration}
        alt="Leçons"
        className="w-24 mx-auto mb-6 animate-bounce"
      />

      {loading && <p className="text-blue-600 animate-pulse">⏳ Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
          <img src={testIllustration} alt="Tests" className="w-8 h-8" />
          Mes Leçons
        </h2>
        
        {lessons.length === 0 ? (
          <p className="text-gray-600">🙈 Aucune leçon trouvée.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
                <h3 className="text-lg font-semibold text-green-700 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Programme:</span> {lesson.programId?.title || 'N/A'}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Unité:</span> {lesson.unitId?.title || 'N/A'}
                </p>
                <p className="text-gray-600 mb-3">
                  <span className="font-medium">Contenu:</span> {lesson.content ? lesson.content.substring(0, 50) + (lesson.content.length > 50 ? '...' : '') : 'Aucun contenu'}
                </p>
                
                {lesson.mediaFile && (
                  <div className="mb-3">
                    <span className="font-medium">Média:</span>
                    {lesson.mediaFile.endsWith('.jpg') || lesson.mediaFile.endsWith('.png') || lesson.mediaFile.endsWith('.jpeg') ? (
                      <img
                        src={`https://kara-back.onrender.com/uploads/${lesson.mediaFile}`}
                        alt="Media"
                        className="mt-2 rounded-lg max-w-full h-auto border border-gray-200"
                      />
                    ) : (
                      <a
                        href={`https://kara-back.onrender.com/uploads/${lesson.mediaFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline block mt-1"
                      >
                        Voir le fichier
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faEdit} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center justify-between">
                    <span>Tests Associés</span>
                    <button
                      onClick={() => openTestModal(lesson._id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1 text-sm"
                    >
                      <FontAwesomeIcon icon={faPlus} /> Ajouter un Test
                    </button>
                  </h4>
                  
                  {lesson.tests && lesson.tests.length > 0 ? (
                    <ul className="space-y-3">
                      {lesson.tests.map((test) => (
                        <li key={test._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="mb-2">
                            <strong className="text-gray-700">{test.title}</strong>
                            <p className="text-gray-600 text-sm">{test.content || 'Aucun contenu'}</p>
                            {test.mediaFile && (
                              <div className="mt-1">
                                {test.mediaFile.endsWith('.jpg') || test.mediaFile.endsWith('.png') || test.mediaFile.endsWith('.jpeg') ? (
                                  <img
                                    src={`https://kara-back.onrender.com/uploads/${test.mediaFile}`}
                                    alt="Test Media"
                                    className="mt-1 rounded-lg max-w-full h-auto border border-gray-200"
                                  />
                                ) : (
                                  <a
                                    href={`https://kara-back.onrender.com/uploads/${test.mediaFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-sm"
                                  >
                                    Voir le fichier
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openTestModal(lesson._id, test)}
                              className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1 text-xs"
                            >
                              <FontAwesomeIcon icon={faEdit} /> Modifier
                            </button>
                            <button
                              onClick={() => handleTestDelete(lesson._id, test._id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1 text-xs"
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">🙈 Aucun test associé.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddLessonModal
        showModal={showLessonModal}
        setShowModal={setShowLessonModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        programs={programs}
        editingLessonId={editingLessonId}
        error={error}
        setError={setError}
      />

      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-green-700 mb-4">
              {editingTestId ? '✏️ Modifier le Test' : '➕ Ajouter un Test'}
            </h2>
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Titre du test</label>
                <input
                  type="text"
                  name="title"
                  value={testFormData.title}
                  onChange={handleTestInputChange}
                  required
                  className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Contenu</label>
                <textarea
                  name="content"
                  value={testFormData.content}
                  onChange={handleTestInputChange}
                  rows="5"
                  className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Fichier média</label>
                <input
                  type="file"
                  name="mediaFile"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleTestFileChange}
                  className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeTestModal}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  <FontAwesomeIcon icon={faTimes} /> Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={editingTestId ? faSave : faPlus} />
                  {editingTestId ? 'Mettre à jour' : 'Créer'} le test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionLecon;
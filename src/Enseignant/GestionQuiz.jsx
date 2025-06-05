import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AudioRecorder from './AudioRecorder';
import '../Styles/GestionQuizzes.css';

const GestionQuiz = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState({
    titre: '',
    difficulty: 'facile',
    questions: [
      {
        enonce: '',
        type: 'true_false',
        reponses: [
          { texte: 'True', estCorrecte: true, image: null, existingImage: null },
          { texte: 'False', estCorrecte: false, image: null, existingImage: null },
        ],
        image: null,
        audio: null,
        existingImage: null,
        existingAudio: null,
      },
    ],
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://kara-back.onrender.com/api/quizs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setErrors({ fetch: 'Erreur lors de la récupération des quiz' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
  }, [token, navigate, fetchQuizzes]);

  const validateFile = (file, type) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!file) return true;
    if (type === 'image' && !file.type.startsWith('image/')) {
      return 'Seuls les fichiers image sont autorisés';
    }
    if (type === 'audio' && !file.type.startsWith('audio/')) {
      return 'Seuls les fichiers audio sont autorisés';
    }
    if (file.size > maxSize) {
      return 'Le fichier est trop volumineux (max 5MB)';
    }
    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!quiz.titre.trim()) {
      newErrors.titre = 'Le titre du quiz est requis';
    }
    if (!['facile', 'moyen', 'difficile'].includes(quiz.difficulty)) {
      newErrors.difficulty = 'Niveau de difficulté invalide';
    }
    quiz.questions.forEach((q, qIndex) => {
      if (!q.enonce.trim()) {
        newErrors[`question_${qIndex}_enonce`] = 'L’énoncé de la question est requis';
      }
      if (!['multiple_choice', 'true_false', 'matching'].includes(q.type)) {
        newErrors[`question_${qIndex}_type`] = 'Type de question invalide';
      }
      if (!Array.isArray(q.reponses) || q.reponses.length === 0) {
        newErrors[`question_${qIndex}_reponses`] = 'Au moins une réponse est requise';
      }
      if (q.image) {
        const imageValidation = validateFile(q.image, 'image');
        if (imageValidation !== true) {
          newErrors[`question_${qIndex}_image`] = imageValidation;
        }
      }
      if (q.audio) {
        const audioValidation = validateFile(q.audio, 'audio');
        if (audioValidation !== true) {
          newErrors[`question_${qIndex}_audio`] = audioValidation;
        }
      }
      if (q.type === 'multiple_choice') {
        if (q.reponses.length < 2) {
          newErrors[`question_${qIndex}_reponses`] = 'Au moins deux réponses sont requises';
        }
        const correctCount = q.reponses.filter((r) => r.estCorrecte).length;
        if (correctCount !== 1) {
          newErrors[`question_${qIndex}_correct`] = 'Une seule réponse doit être correcte';
        }
      } else if (q.type === 'true_false') {
        if (
          q.reponses.length !== 2 ||
          !q.reponses.every((r) => ['True', 'False'].includes(r.texte))
        ) {
          newErrors[`question_${qIndex}_reponses`] = 'Deux réponses (Vrai/Faux) sont requises';
        }
        const correctCount = q.reponses.filter((r) => r.estCorrecte).length;
        if (correctCount !== 1) {
          newErrors[`question_${qIndex}_correct`] = 'Une seule réponse doit être correcte';
        }
      } else if (q.type === 'matching') {
        if (q.reponses.length < 4 || q.reponses.length % 2 !== 0) {
          newErrors[`question_${qIndex}_reponses`] = 'Un nombre pair de réponses (minimum 4) est requis';
        }
        for (let i = 0; i < q.reponses.length; i += 2) {
          const left = q.reponses[i];
          const right = q.reponses[i + 1];
          if (!left || left.side !== 'left' || !right || right.side !== 'right') {
            newErrors[`question_${qIndex}_pair_${i}`] = 'Chaque paire doit avoir un élément gauche et droit';
          }
          if (!left.texte.trim()) {
            newErrors[`response_${qIndex}_${i}`] = 'Le texte de l’élément gauche est requis';
          }
          if (!right.texte.trim()) {
            newErrors[`response_${qIndex}_${i + 1}`] = 'Le texte de l’élément droit est requis';
          }
        }
      }
      q.reponses.forEach((r, rIndex) => {
        if (!r.texte.trim() && q.type !== 'true_false') {
          newErrors[`response_${qIndex}_${rIndex}`] = 'Le texte de la réponse est requis';
        }
        if (r.image) {
          const imageValidation = validateFile(r.image, 'image');
          if (imageValidation !== true) {
            newErrors[`response_${qIndex}_${rIndex}_image`] = imageValidation;
          }
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('titre', quiz.titre);
    formData.append('difficulty', quiz.difficulty);
    const cleanQuestions = quiz.questions.map((q) => ({
      enonce: q.enonce,
      type: q.type,
      reponses: q.reponses.map((r) => ({
        texte: r.texte,
        estCorrecte: r.estCorrecte,
        existingImage: r.existingImage,
        side: r.side,
        matchedResponseId: r.side === 'left' && q.type === 'matching' ? `right${Math.floor(r.index / 2) + 1}` : null,
      })),
      existingImage: q.existingImage,
      existingAudio: q.existingAudio,
    }));
    formData.append('questions', JSON.stringify(cleanQuestions));

    quiz.questions.forEach((q, qIndex) => {
      if (q.image) formData.append(`question_image_${qIndex}`, q.image);
      if (q.audio) formData.append(`question_audio_${qIndex}`, q.audio);
      q.reponses.forEach((r, rIndex) => {
        if (r.image) formData.append(`response_image_${qIndex}_${rIndex}`, r.image);
      });
    });

    try {
      let response;
      if (editingId) {
        response = await axios.put(`https://kara-back.onrender.com/api/quizs/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Quiz mis à jour avec succès.');
      } else {
        response = await axios.post('https://kara-back.onrender.com/api/quizs', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Quiz créé avec succès.');
      }
      setQuizzes((prev) =>
        editingId
          ? prev.map((q) => (q._id === editingId ? response.data : q))
          : [...prev, response.data]
      );
      setQuiz({
        titre: '',
        difficulty: 'facile',
        questions: [
          {
            enonce: '',
            type: 'true_false',
            reponses: [
              { texte: 'True', estCorrecte: true, image: null, existingImage: null },
              { texte: 'False', estCorrecte: false, image: null, existingImage: null },
            ],
            image: null,
            audio: null,
            existingImage: null,
            existingAudio: null,
          },
        ],
      });
      setEditingId(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du quiz', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setErrors({ submit: error.response?.data?.message || 'Erreur inconnue lors de la soumission' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (quizData) => {
    setQuiz({
      titre: quizData.titre,
      difficulty: quizData.difficulty || 'facile',
      questions: quizData.questions.map((q, qIndex) => ({
        enonce: q.enonce,
        type: q.type,
        reponses: q.reponses.map((r, rIndex) => ({
          texte: r.texte,
          estCorrecte: r.estCorrecte,
          image: null,
          existingImage: r.imageUrl,
          side: q.type === 'matching' ? (rIndex % 2 === 0 ? 'left' : 'right') : undefined,
          matchedResponseId: q.type === 'matching' && rIndex % 2 === 0 ? `right${rIndex / 2 + 1}` : null,
          index: rIndex,
        })),
        image: null,
        audio: null,
        existingImage: q.imageUrl,
        existingAudio: q.audioUrl,
      })),
    });
    setEditingId(quizData._id);
    setErrors({});
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`https://kara-back.onrender.com/api/quizs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      setSuccess('Quiz supprimé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression du quiz', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setErrors({ delete: 'Erreur lors de la suppression du quiz' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          enonce: '',
          type: 'true_false',
          reponses: [
            { texte: 'True', estCorrecte: true, image: null, existingImage: null, index: 0 },
            { texte: 'False', estCorrecte: false, image: null, existingImage: null, index: 1 },
          ],
          image: null,
          audio: null,
          existingImage: null,
          existingAudio: null,
        },
      ],
    });
  };

  const removeQuestion = (qIndex) => {
    if (quiz.questions.length === 1) return;
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((_, index) => index !== qIndex),
    });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex][field] = value;
    if (field === 'type') {
      if (value === 'true_false') {
        newQuestions[qIndex].reponses = [
          { texte: 'True', estCorrecte: true, image: null, existingImage: null, index: 0 },
          { texte: 'False', estCorrecte: false, image: null, existingImage: null, index: 1 },
        ];
      } else if (value === 'multiple_choice') {
        newQuestions[qIndex].reponses = [
          { texte: '', estCorrecte: true, image: null, existingImage: null, index: 0 },
          { texte: '', estCorrecte: false, image: null, existingImage: null, index: 1 },
        ];
      } else if (value === 'matching') {
        newQuestions[qIndex].reponses = [
          { texte: '', estCorrecte: false, image: null, existingImage: null, side: 'left', matchedResponseId: 'right1', index: 0 },
          { texte: '', estCorrecte: false, image: null, existingImage: null, side: 'right', matchedResponseId: null, index: 1 },
          { texte: '', estCorrecte: false, image: null, existingImage: null, side: 'left', matchedResponseId: 'right2', index: 2 },
          { texte: '', estCorrecte: false, image: null, existingImage: null, side: 'right', matchedResponseId: null, index: 3 },
        ];
      }
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleResponseChange = (qIndex, rIndex, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].reponses[rIndex][field] = value;
    if (field === 'estCorrecte' && value && newQuestions[qIndex].type === 'multiple_choice') {
      newQuestions[qIndex].reponses = newQuestions[qIndex].reponses.map((r, i) => ({
        ...r,
        estCorrecte: i === rIndex,
      }));
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addResponse = (qIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].reponses.push({
      texte: '',
      estCorrecte: false,
      image: null,
      existingImage: null,
      index: newQuestions[qIndex].reponses.length,
    });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addMatchingPair = (qIndex) => {
    const newQuestions = [...quiz.questions];
    const pairIndex = newQuestions[qIndex].reponses.length / 2 + 1;
    newQuestions[qIndex].reponses.push(
      { texte: '', estCorrecte: false, image: null, existingImage: null, side: 'left', matchedResponseId: `right${pairIndex}`, index: newQuestions[qIndex].reponses.length },
      { texte: '', estCorrecte: false, image: null, existingImage: null, side: 'right', matchedResponseId: null, index: newQuestions[qIndex].reponses.length + 1 }
    );
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const removeResponse = (qIndex, rIndex) => {
    const newQuestions = [...quiz.questions];
    if (newQuestions[qIndex].type === 'multiple_choice' && newQuestions[qIndex].reponses.length <= 2) return;
    if (newQuestions[qIndex].type === 'matching' && newQuestions[qIndex].reponses.length <= 4) return;
    if (newQuestions[qIndex].type === 'matching') {
      const isLeft = newQuestions[qIndex].reponses[rIndex].side === 'left';
      const pairIndex = isLeft ? rIndex : rIndex - 1;
      newQuestions[qIndex].reponses.splice(pairIndex, 2);
      newQuestions[qIndex].reponses.forEach((r, i) => {
        r.index = i;
        if (r.side === 'left') {
          r.matchedResponseId = `right${i / 2 + 1}`;
        } else {
          r.matchedResponseId = null;
        }
      });
    } else {
      newQuestions[qIndex].reponses.splice(rIndex, 1);
      newQuestions[qIndex].reponses.forEach((r, i) => (r.index = i));
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const clearMedia = async (qIndex, type, rIndex = null) => {
    const newQuestions = [...quiz.questions];
    let mediaUrl;
    if (rIndex !== null) {
      mediaUrl = newQuestions[qIndex].reponses[rIndex][`existing${type.charAt(0).toUpperCase() + type.slice(1)}`];
      newQuestions[qIndex].reponses[rIndex][type] = null;
      newQuestions[qIndex].reponses[rIndex][`existing${type.charAt(0).toUpperCase() + type.slice(1)}`] = null;
    } else {
      mediaUrl = newQuestions[qIndex][`existing${type.charAt(0).toUpperCase() + type.slice(1)}`];
      newQuestions[qIndex][type] = null;
      newQuestions[qIndex][`existing${type.charAt(0).toUpperCase() + type.slice(1)}`] = null;
    }
    setQuiz({ ...quiz, questions: newQuestions });
    setSuccess(`Média (${type === 'image' ? 'image' : 'audio'}) supprimé avec succès.`);

    if (mediaUrl) {
      try {
        await axios.delete(`https://kara-back.onrender.com/api/quizs/media/${mediaUrl}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Erreur lors de la suppression du média', error);
        setErrors({ media: 'Erreur lors de la suppression du fichier média' });
      }
    }
  };

return (
  <div className="container mx-auto p-4 max-w-4xl">
    <h2 className="text-2xl font-bold mb-6 text-center">
      {editingId ? 'Modifier le Quiz' : 'Créer un Quiz'}
    </h2>
    
    {/* Messages d'état */}
    {isLoading && <p className="text-blue-500 text-center mb-4" aria-live="polite">Chargement...</p>}
    {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center" aria-live="polite">{success}</p>}
    {errors.submit && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center" aria-live="assertive">{errors.submit}</p>}
    {errors.fetch && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center" aria-live="assertive">{errors.fetch}</p>}
    {errors.delete && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center" aria-live="assertive">{errors.delete}</p>}

    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
      {/* Titre du quiz */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quiz-title">
          Titre du quiz
        </label>
        <input
          id="quiz-title"
          type="text"
          placeholder="Entrez le titre du quiz"
          value={quiz.titre}
          onChange={(e) => setQuiz({ ...quiz, titre: e.target.value })}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.titre ? 'border-red-500' : ''}`}
          aria-invalid={!!errors.titre}
          aria-describedby={errors.titre ? 'quiz-title-error' : undefined}
        />
        {errors.titre && <p id="quiz-title-error" className="text-red-500 text-xs italic mt-1">{errors.titre}</p>}
      </div>

      {/* Difficulté */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quiz-difficulty">
          Niveau de difficulté
        </label>
        <select
          id="quiz-difficulty"
          value={quiz.difficulty}
          onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value })}
          className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.difficulty ? 'border-red-500' : ''}`}
          aria-invalid={!!errors.difficulty}
          aria-describedby={errors.difficulty ? 'quiz-difficulty-error' : undefined}
        >
          <option value="facile">Facile</option>
          <option value="moyen">Moyen</option>
          <option value="difficile">Difficile</option>
        </select>
        {errors.difficulty && <p id="quiz-difficulty-error" className="text-red-500 text-xs italic mt-1">{errors.difficulty}</p>}
      </div>

      {/* Questions */}
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} className="border border-gray-200 rounded-lg p-4 mb-6" role="region" aria-labelledby={`question-${qIndex}`}>
          <h3 id={`question-${qIndex}`} className="text-lg font-semibold mb-4">Question {qIndex + 1}</h3>
          
          {/* Type de question */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`question-type-${qIndex}`}>
              Type de question
            </label>
            <select
              id={`question-type-${qIndex}`}
              value={q.type}
              onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
              className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[`question_${qIndex}_type`] ? 'border-red-500' : ''}`}
              aria-invalid={!!errors[`question_${qIndex}_type`]}
              aria-describedby={errors[`question_${qIndex}_type`] ? `question-type-error-${qIndex}` : undefined}
            >
              <option value="true_false">Vrai/Faux</option>
              <option value="multiple_choice">Choix multiples</option>
              <option value="matching">Relier par flèche</option>
            </select>
            {errors[`question_${qIndex}_type`] && (
              <p id={`question-type-error-${qIndex}`} className="text-red-500 text-xs italic mt-1">{errors[`question_${qIndex}_type`]}</p>
            )}
          </div>

          {/* Énoncé */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`question-enonce-${qIndex}`}>
              Énoncé
            </label>
            <input
              id={`question-enonce-${qIndex}`}
              type="text"
              placeholder="Entrez l'énoncé de la question"
              value={q.enonce}
              onChange={(e) => handleQuestionChange(qIndex, 'enonce', e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[`question_${qIndex}_enonce`] ? 'border-red-500' : ''}`}
              aria-invalid={!!errors[`question_${qIndex}_enonce`]}
              aria-describedby={errors[`question_${qIndex}_enonce`] ? `question-enonce-error-${qIndex}` : undefined}
            />
            {errors[`question_${qIndex}_enonce`] && (
              <p id={`question-enonce-error-${qIndex}`} className="text-red-500 text-xs italic mt-1">{errors[`question_${qIndex}_enonce`]}</p>
            )}
          </div>

          {/* Réponses */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Réponses</label>
            
            {q.type === 'true_false' ? (
              <div className="space-y-2">
                {q.reponses.map((r, rIndex) => (
                  <div key={rIndex} className="flex items-center gap-4">
                    <input 
                      type="text" 
                      value={r.texte} 
                      readOnly 
                      className="shadow appearance-none border rounded py-2 px-3 text-gray-700 bg-gray-100" 
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct_${qIndex}`}
                        checked={r.estCorrecte}
                        onChange={() => handleResponseChange(qIndex, rIndex, 'estCorrecte', true)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span>Correcte</span>
                    </label>
                  </div>
                ))}
                {errors[`question_${qIndex}_correct`] && (
                  <p className="text-red-500 text-xs italic mt-1">{errors[`question_${qIndex}_correct`]}</p>
                )}
              </div>
            ) : q.type === 'multiple_choice' ? (
              <div className="space-y-4">
                {q.reponses.map((r, rIndex) => (
                  <div key={rIndex} className="border border-gray-200 rounded p-3">
                    <div className="flex flex-wrap gap-4 mb-2">
                      <input
  type="text"
  placeholder={`Réponse ${rIndex + 1}`}
  value={r.texte}
  onChange={(e) => handleResponseChange(qIndex, rIndex, 'texte', e.target.value)}
  className={`shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 min-w-[200px] ${
    errors[`response_${qIndex}_${rIndex}`] ? 'border-red-500' : ''
  }`}
  aria-invalid={!!errors[`response__${qIndex}_${rIndex}`]}
  aria-describedby={
    errors[`response_${qIndex}_${rIndex}`] 
      ? `response-${qIndex}-${rIndex}-error` 
      : undefined
  }
/>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={r.estCorrecte}
                          onChange={() => handleResponseChange(qIndex, rIndex, 'estCorrecte', true)}
                          className="form-radio h-4 w-4 text-blue-600"
                          aria-label={`Marquer la réponse ${rIndex + 1} comme correcte`}
                        />
                        <span>Correcte</span>
                      </label>
                    </div>

                    {/* Image pour la réponse */}
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm mb-1">Image (optionnelle)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleResponseChange(qIndex, rIndex, 'image', e.target.files[0])}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        aria-describedby={errors[`response_${qIndex}_${rIndex}_image`] ? `response-image-${qIndex}-${rIndex}-error` : undefined}
                      />
                      {r.existingImage && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={`https://kara-back.onrender.com/Uploads/${r.existingImage}`}
                            alt={`Réponse ${rIndex + 1}`}
                            className="h-16 object-contain border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => clearMedia(qIndex, 'image', rIndex)}
                            className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                            aria-label={`Supprimer l'image de la réponse ${rIndex + 1}`}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                      {r.image && <p className="text-green-500 text-sm mt-1">Image ajoutée</p>}
                      {errors[`response_${qIndex}_${rIndex}_image`] && (
                        <p id={`response-image-${qIndex}-${rIndex}-error`} className="text-red-500 text-xs italic mt-1">{errors[`response_${qIndex}_${rIndex}_image`]}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeResponse(qIndex, rIndex)}
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                      disabled={q.reponses.length <= 2}
                      aria-label={`Supprimer la réponse ${rIndex + 1}`}
                    >
                      Supprimer cette réponse
                    </button>
                    {errors[`response_${qIndex}_${rIndex}`] && (
                      <p id={`response-${qIndex}-${rIndex}-error`} className="text-red-500 text-xs italic mt-1">{errors[`response_${qIndex}_${rIndex}`]}</p>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addResponse(qIndex)}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm mt-2"
                  aria-label="Ajouter une nouvelle réponse"
                >
                  Ajouter une réponse
                </button>

                {errors[`question_${qIndex}_reponses`] && (
                  <p className="text-red-500 text-xs italic mt-2">{errors[`question_${qIndex}_reponses`]}</p>
                )}
                {errors[`question_${qIndex}_correct`] && (
                  <p className="text-red-500 text-xs italic mt-2">{errors[`question_${qIndex}_correct`]}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 font-bold text-sm mb-2">
                  <span>Élément gauche</span>
                  <span></span>
                  <span>Élément droit</span>
                </div>
                
                {q.reponses
                  .reduce((pairs, _, index, arr) => {
                    if (index % 2 === 0) pairs.push([arr[index], arr[index + 1]]);
                    return pairs;
                  }, [])
                  .map((pair, pairIndex) => (
                    <div key={pairIndex} className="border border-gray-200 rounded p-3">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        {/* Élément gauche */}
                        <div>
                          <input
                            type="text"
                            placeholder={`Gauche ${pairIndex + 1}`}
                            value={pair[0].texte}
                            onChange={(e) =>
                              handleResponseChange(qIndex, pair[0].index, 'texte', e.target.value)
                            }
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[`response_${qIndex}_${pair[0].index}`] ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors[`response_${qIndex}_${pair[0].index}`]}
                            aria-describedby={errors[`response_${qIndex}_${pair[0].index}`] ? `response-${qIndex}-${pair[0].index}-error` : undefined}
                          />
                          
                          {/* Image gauche */}
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleResponseChange(qIndex, pair[0].index, 'image', e.target.files[0])
                              }
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-1 file:px-2
                                file:rounded-md file:border-0
                                file:text-xs file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                              aria-describedby={errors[`response_${qIndex}_${pair[0].index}_image`] ? `response-image-${qIndex}_${pair[0].index}-error` : undefined}
                            />
                            {pair[0].existingImage && (
                              <div className="mt-1 flex items-center gap-1">
                                <img
                                  src={`https://kara-back.onrender.com/Uploads/${pair[0].existingImage}`}
                                  alt={`Gauche ${pairIndex + 1}`}
                                  className="h-12 object-contain border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => clearMedia(qIndex, 'image', pair[0].index)}
                                  className="bg-red-500 hover:bg-red-700 text-white py-0.5 px-1 rounded text-xs"
                                  aria-label={`Supprimer l'image de l'élément gauche ${pairIndex + 1}`}
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                            {pair[0].image && <p className="text-green-500 text-xs mt-1">Image ajoutée</p>}
                            {errors[`response_${qIndex}_${pair[0].index}_image`] && (
                              <p id={`response-image-${qIndex}-${pair[0].index}-error`} className="text-red-500 text-xs italic mt-1">{errors[`response_${qIndex}_${pair[0].index}_image`]}</p>
                            )}
                          </div>
                          
                          {errors[`response_${qIndex}_${pair[0].index}`] && (
                            <p id={`response-${qIndex}-${pair[0].index}-error`} className="text-red-500 text-xs italic mt-1">{errors[`response_${qIndex}_${pair[0].index}`]}</p>
                          )}
                        </div>

                        {/* Flèche */}
                        <div className="text-center text-xl">→</div>

                        {/* Élément droit */}
                        <div>
                          <input
                            type="text"
                            placeholder={`Droit ${pairIndex + 1}`}
                            value={pair[1].texte}
                            onChange={(e) =>
                              handleResponseChange(qIndex, pair[1].index, 'texte', e.target.value)
                            }
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[`response_${qIndex}_${pair[1].index}`] ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors[`response_${qIndex}_${pair[1].index}`]}
                            aria-describedby={errors[`response_${qIndex}_${pair[1].index}`] ? `response-${qIndex}-${pair[1].index}-error` : undefined}
                          />
                          
                          {/* Image droit */}
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleResponseChange(qIndex, pair[1].index, 'image', e.target.files[0])
                              }
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-1 file:px-2
                                file:rounded-md file:border-0
                                file:text-xs file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                              aria-describedby={errors[`response_${qIndex}_${pair[1].index}_image`] ? `response-image-${qIndex}_${pair[1].index}-error` : undefined}
                            />
                            {pair[1].existingImage && (
                              <div className="mt-1 flex items-center gap-1">
                                <img
                                  src={`https://kara-back.onrender.com/Uploads/${pair[1].existingImage}`}
                                  alt={`Droit ${pairIndex + 1}`}
                                  className="h-12 object-contain border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => clearMedia(qIndex, 'image', pair[1].index)}
                                  className="bg-red-500 hover:bg-red-700 text-white py-0.5 px-1 rounded text-xs"
                                  aria-label={`Supprimer l'image de l'élément droit ${pairIndex + 1}`}
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                            {pair[1].image && <p className="text-green-500 text-xs mt-1">Image ajoutée</p>}
                            {errors[`response_${qIndex}_${pair[1].index}_image`] && (
                              <p id={`response-image-${qIndex}-${pair[1].index}-error`} className="text-red-500 text-xs italic mt-1">{errors[`response_${qIndex}_${pair[1].index}_image`]}</p>
                            )}
                          </div>
                          
                          {errors[`response_${qIndex}_${pair[1].index}`] && (
                            <p id={`response-${qIndex}-${pair[1].index}-error`} className="text-red-500 text-xs italic mt-1">{errors[`response_${qIndex}_${pair[1].index}`]}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Paire correcte : {pair[0].texte || 'Gauche'} → {pair[1].texte || 'Droit'}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeResponse(qIndex, pair[0].index)}
                        className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm mt-2"
                        disabled={q.reponses.length <= 4}
                        aria-label={`Supprimer la paire ${pairIndex + 1}`}
                      >
                        Supprimer la paire
                      </button>
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={() => addMatchingPair(qIndex)}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm mt-2"
                  aria-label="Ajouter une nouvelle paire"
                >
                  Ajouter une paire
                </button>

                {errors[`question_${qIndex}_reponses`] && (
                  <p className="text-red-500 text-xs italic mt-2">{errors[`question_${qIndex}_reponses`]}</p>
                )}
                {Object.keys(errors)
                  .filter((key) => key.startsWith(`question_${qIndex}_pair_`))
                  .map((key) => (
                    <p key={key} className="text-red-500 text-xs italic mt-1">{errors[key]}</p>
                  ))}
              </div>
            )}
          </div>

          {/* Médias pour la question */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Médias (optionnels)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleQuestionChange(qIndex, 'image', e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  aria-describedby={errors[`question_${qIndex}_image`] ? `question-image-${qIndex}-error` : undefined}
                />
                {q.existingImage && (
                  <div className="mt-2 flex items-start gap-2">
                    <img
                      src={`https://kara-back.onrender.com/Uploads/${q.existingImage}`}
                      alt={`Question ${qIndex + 1}`}
                      className="h-20 object-contain border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => clearMedia(qIndex, 'image')}
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                      aria-label={`Supprimer l'image de la question ${qIndex + 1}`}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
                {q.image && <p className="text-green-500 text-sm mt-1">Image ajoutée pour la question</p>}
                {errors[`question_${qIndex}_image`] && (
                  <p id={`question-image-${qIndex}-error`} className="text-red-500 text-xs italic mt-1">{errors[`question_${qIndex}_image`]}</p>
                )}
              </div>

              {/* Audio */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Audio</label>
                <AudioRecorder
                  onAudioRecorded={(blob) => handleQuestionChange(qIndex, 'audio', blob)}
                />
                {q.existingAudio && (
                  <div className="mt-2 flex items-start gap-2">
                    <audio
                      controls
                      src={`https://kara-back.onrender.com/Uploads/${q.existingAudio}`}
                      className="h-10"
                    />
                    <button
                      type="button"
                      onClick={() => clearMedia(qIndex, 'audio')}
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                      aria-label={`Supprimer l'audio de la question ${qIndex + 1}`}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
                {q.audio && <p className="text-green-500 text-sm mt-1">Audio ajouté pour la question</p>}
                {errors[`question_${qIndex}_audio`] && (
                  <p id={`question-audio-${qIndex}-error`} className="text-red-500 text-xs italic mt-1">{errors[`question_${qIndex}_audio`]}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeQuestion(qIndex)}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
            disabled={quiz.questions.length === 1}
            aria-label={`Supprimer la question ${qIndex + 1}`}
          >
            Supprimer la question
          </button>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button 
          type="button" 
          onClick={addQuestion} 
          className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
          aria-label="Ajouter une nouvelle question"
        >
          Ajouter une question
        </button>
        
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50" 
          disabled={isLoading}
          aria-label={editingId ? 'Modifier le quiz' : 'Créer le quiz'}
        >
          {editingId ? 'Modifier' : 'Créer'} le quiz
        </button>
      </div>
    </form>

    {/* Liste des quiz */}
    <h2 className="text-2xl font-bold mb-4 text-center">Liste des Quiz</h2>
    {quizzes.length === 0 ? (
      <p className="text-center text-gray-500">Aucun quiz trouvé.</p>
    ) : (
      <ul className="space-y-2">
        {quizzes.map((q) => (
          <li key={q._id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">
              {q.titre} <span className="text-gray-600">({q.difficulty})</span>
            </span>
            <div className="space-x-2">
              <button 
                onClick={() => handleEdit(q)} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm"
                aria-label={`Modifier le quiz ${q.titre}`}
              >
                Modifier
              </button>
              <button 
                onClick={() => handleDelete(q._id)} 
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                aria-label={`Supprimer le quiz ${q.titre}`}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
};

export default GestionQuiz;
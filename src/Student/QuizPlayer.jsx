import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../Styles/StudentQuizzes.css';

const QuizPlayer = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const token = localStorage.getItem('token');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [drawingPair, setDrawingPair] = useState(null);
  const [showResults, setShowResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const matchingContainerRef = useRef(null);

  const fetchQuiz = useCallback(async (isRetake = false) => {
    try {
      const response = await axios.get(`https://kara-back.onrender.com/api/quizs/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setSelectedQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill([]));
      setResults(new Array(response.data.questions.length).fill(null));
      setSelectedPairs([]);
      setCurrentQuestionIndex(0);
      setError('');
      setWarning('');
      setDrawingPair(null);

      if (!isRetake) {
        const quizResponse = await axios.get('https://kara-back.onrender.com/api/student/quizs', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        const quiz = quizResponse.data.quizzes.facile.find((q) => q._id === quizId) ||
                     quizResponse.data.quizzes.moyen.find((q) => q._id === quizId) ||
                     quizResponse.data.quizzes.difficile.find((q) => q._id === quizId);
        if (quiz?.submissions?.length > 0) {
          setShowResults(quiz.submissions[quiz.submissions.length - 1]);
        } else {
          setShowResults(null);
        }
      } else {
        setShowResults(null);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Impossible de charger le quiz sélectionné. Vérifiez votre connexion ou réessayez.');
      }
    }
  }, [quizId, token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchQuiz(false); // Initial fetch, not a retake
    }
  }, [token, quizId, navigate, fetchQuiz]);

  const retakeQuiz = useCallback(() => {
    fetchQuiz(true);
  }, [fetchQuiz]);

  const handleAnswerChange = (qIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = [value];
    setAnswers(newAnswers);
  };

  const handleStartPair = (leftIndex) => {
    if (!drawingPair && !isSubmitting) {
      setDrawingPair({ left: leftIndex });
    }
  };

  const handleEndPair = (rightIndex) => {
    if (drawingPair && !isSubmitting) {
      const leftIndex = drawingPair.left;
      const leftResponse = selectedQuiz.questions[currentQuestionIndex].reponses[leftIndex * 2];
      const rightResponse = selectedQuiz.questions[currentQuestionIndex].reponses[rightIndex * 2 + 1];
      const pair = {
        left: leftIndex,
        right: rightIndex,
        leftId: leftResponse._id,
        rightId: rightResponse._id,
        leftText: leftResponse.texte,
        rightText: rightResponse.texte,
      };

      const existingPairIndex = selectedPairs.findIndex(
        (p) => p.left === leftIndex || p.right === rightIndex
      );
      if (existingPairIndex === -1) {
        const newPairs = [...selectedPairs, pair];
        setSelectedPairs(newPairs);
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = newPairs.map((p) => ({
          leftId: p.leftId,
          rightId: p.rightId,
        }));
        setAnswers(newAnswers);
      }
      setDrawingPair(null);
    }
  };

  const handleRemovePair = (index) => {
    if (!isSubmitting) {
      const newPairs = selectedPairs.filter((_, i) => i !== index);
      setSelectedPairs(newPairs);
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = newPairs.map((p) => ({
        leftId: p.leftId,
        rightId: p.rightId,
      }));
      setAnswers(newAnswers);
    }
  };

  const submitAnswer = useCallback(async () => {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];

    // Validate answers
    if (currentQuestion.type === 'matching' && selectedPairs.length === 0) {
      setError('Veuillez sélectionner au moins une correspondance.');
      throw new Error('No matching pairs selected');
    }
    if (['multiple_choice', 'true_false'].includes(currentQuestion.type) &&
        (!answers[currentQuestionIndex] || answers[currentQuestionIndex].length === 0)) {
      setError('Veuillez sélectionner une réponse.');
      throw new Error('No answer selected');
    }

    // Move to next question if not the last one
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedPairs([]);
      setDrawingPair(null);
      setError('');
      return;
    }

    // Submit quiz (last question)
    try {
      if (!selectedQuiz?._id || !selectedQuiz.questions.every(q => q._id)) {
        setError('Données du quiz invalides.');
        throw new Error('Invalid quiz data');
      }

      const submissionData = {
        quizId: selectedQuiz._id,
        responses: selectedQuiz.questions.map((q, i) => ({
          questionId: q._id,
          selectedResponseIds: q.type !== 'matching' ? answers[i] || [] : [],
          matchingPairs: q.type === 'matching' ? (answers[i] || []).map(p => ({
            leftId: p.leftId,
            rightId: p.rightId
          })) : []
        }))
      };

      console.log('Submitting quiz with data:', JSON.stringify(submissionData, null, 2));

      setIsSubmitting(true);
      await axios.post(
        'https://kara-back.onrender.com/api/student/quizs/submit',
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 2000
        }
      );
      console.log('Quiz submitted successfully');
      navigate('/student/quizs', { state: { refresh: true } });
    } catch (error) {
      console.error('Submission error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Erreur lors de la soumission du quiz. Veuillez réessayer.');
        navigate('/student/quizs', { state: { refresh: true } });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestionIndex, selectedQuiz, answers, selectedPairs, token, navigate]);

  const resetQuiz = useCallback(() => {
    navigate('/student/quizs', { state: { refresh: true } });
  }, [navigate]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  };

  const getArrowPosition = (pair) => {
    const leftElement = matchingContainerRef.current?.querySelector(
      `.matching-left .matching-item[data-index="${pair.left}"]`
    );
    const rightElement = matchingContainerRef.current?.querySelector(
      `.matching-right .matching-item[data-index="${pair.right}"]`
    );
    if (leftElement && rightElement) {
      const leftRect = leftElement.getBoundingClientRect();
      const rightRect = rightElement.getBoundingClientRect();
      const containerRect = matchingContainerRef.current.getBoundingClientRect();
      const x1 = leftRect.right - containerRect.left;
      const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
      const x2 = rightRect.left - containerRect.left;
      const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
      return { x1, y1, x2, y2 };
    }
    return null;
  };

 const getShuffledMatchingResponses = useMemo(() => {
    if (!selectedQuiz || !selectedQuiz.questions[currentQuestionIndex]) return { left: [], right: [] };
    const responses = selectedQuiz.questions[currentQuestionIndex].reponses;
    const leftItems = responses.filter((_, i) => i % 2 === 0).map((r, index) => ({ ...r, originalIndex: index }));
    const rightItems = responses.filter((_, i) => i % 2 !== 0).map((r, index) => ({ ...r, originalIndex: index }));

    // Shuffle left items
    const shuffledLeft = shuffleArray(leftItems);

    // Shuffle right items, ensuring no correct pair is opposite
    const shuffledRight = [...rightItems];
    let validShuffle = false;
    const maxAttempts = 100; // Prevent infinite loops
    let attempts = 0;

    while (!validShuffle && attempts < maxAttempts) {
      shuffleArray(shuffledRight);
      validShuffle = shuffledLeft.every((leftItem, index) => {
        const correctRightIndex = leftItem.originalIndex; // Correct right item for this left item
        const rightItem = shuffledRight[index];
        return rightItem.originalIndex !== correctRightIndex; // Ensure they don't align
      });
      attempts++;
    }

    // If no valid shuffle is found, offset the right items by one to ensure misalignment
    if (!validShuffle) {
      const offsetRight = [...shuffledRight.slice(1), shuffledRight[0]];
      return { left: shuffledLeft, right: offsetRight };
    }

    return { left: shuffledLeft, right: shuffledRight };
  }, [selectedQuiz, currentQuestionIndex]);

  const { left: shuffledLeft, right: shuffledRight } = getShuffledMatchingResponses;

  if (!selectedQuiz) {
    return <div>Loading...</div>;
  }

 return (
  <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4 md:p-8">
    <h2 className="text-3xl font-bold text-center mb-6 text-purple-700 drop-shadow-md">
      Passer un Quiz
    </h2>
    
    {/* Messages d'état */}
    {error && (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-bounce" role="alert">
        <p aria-live="assertive">{error}</p>
      </div>
    )}
    {warning && (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg" role="alert">
        <p aria-live="polite">{warning}</p>
      </div>
    )}
    {isSubmitting && (
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-lg flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p aria-live="polite">Soumission en cours...</p>
      </div>
    )}

    {showResults ? (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto animate-fade-in">
        <h3 className="text-2xl font-bold text-center text-purple-600 mb-4">
          Résultats du Quiz: {selectedQuiz.titre}
        </h3>
        
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl text-center mb-6">
          <p className="text-3xl font-bold mb-2">
            Score: {showResults.score} / {showResults.total}
          </p>
          <p className="text-xl">({showResults.percentage.toFixed(2)}%)</p>
          <p className="mt-4 text-lg">
            Niveau suivant recommandé: <span className="font-bold">{showResults.nextLevel}</span>
          </p>
        </div>

        {warning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
            <p aria-live="polite">{warning}</p>
          </div>
        )}

        <ul className="space-y-4 mb-8">
          {showResults.results.map((result, index) => (
            <li 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${result.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
            >
              <p className="font-bold text-lg mb-2">Question: {result.question}</p>
              <p className="mb-1"><span className="font-semibold">Votre réponse:</span> {result.selectedAnswer}</p>
              <p className={`font-semibold ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                Statut: {result.isCorrect ? 'Correcte ✓' : 'Incorrecte ✗'}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={resetQuiz} 
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
            aria-label="Retour à la liste des quiz"
          >
            Retour aux quiz
          </button>
          <button
            onClick={retakeQuiz}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
            aria-label="Recommencer le quiz"
          >
            Recommencer le quiz
          </button>
        </div>
      </div>
    ) : (
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto" 
        ref={matchingContainerRef} 
        role="region" 
        aria-labelledby="quiz-question"
      >
        <h3 id="quiz-question" className="text-2xl font-bold text-center mb-4 text-purple-600">
          {selectedQuiz.titre} 
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
            selectedQuiz.difficulty === 'Facile' ? 'bg-green-100 text-green-800' :
            selectedQuiz.difficulty === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {selectedQuiz.difficulty}
          </span>
        </h3>

        <div className="question-block bg-blue-50 rounded-xl p-6 mb-6">
          <h4 className="text-xl font-semibold mb-4">
            Question {currentQuestionIndex + 1}: {selectedQuiz.questions[currentQuestionIndex].enonce}
          </h4>
          
          {selectedQuiz.questions[currentQuestionIndex].imageUrl && (
            <img
              src={`https://kara-back.onrender.com/Uploads/${selectedQuiz.questions[currentQuestionIndex].imageUrl}`}
              alt={`Question ${currentQuestionIndex + 1}`}
              className="max-w-full h-auto rounded-lg shadow-md mb-4 mx-auto"
            />
          )}
          
          {selectedQuiz.questions[currentQuestionIndex].audioUrl && (
            <audio
              controls
              src={`https://kara-back.onrender.com/Uploads/${selectedQuiz.questions[currentQuestionIndex].audioUrl}`}
              className="w-full mb-4"
            />
          )}

          {selectedQuiz.questions[currentQuestionIndex].type === 'multiple_choice' || 
           selectedQuiz.questions[currentQuestionIndex].type === 'true_false' ? (
            <div className="answer-options grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedQuiz.questions[currentQuestionIndex].reponses.map((r, rIndex) => (
                <div 
                  key={r._id} 
                  className={`answer-option p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    answers[currentQuestionIndex]?.includes(r._id) 
                      ? 'border-purple-500 bg-purple-100 scale-105 shadow-md' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleAnswerChange(currentQuestionIndex, r._id)}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQuestionIndex}`}
                      value={r._id}
                      checked={answers[currentQuestionIndex]?.includes(r._id) || false}
                      onChange={() => {}}
                      disabled={isSubmitting}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-lg">{r.texte}</span>
                  </label>
                  
                  {r.imageUrl && (
                    <img
                      src={`https://kara-back.onrender.com/Uploads/${r.imageUrl}`}
                      alt={`Réponse ${rIndex + 1}`}
                      className="mt-2 max-w-full h-auto rounded-lg mx-auto"
                    />
                  )}
                  
                  {r.audioUrl && (
                    <audio
                      controls
                      src={`https://kara-back.onrender.com/Uploads/${r.audioUrl}`}
                      className="w-full mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="matching-container">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="matching-left bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-bold text-center mb-4 text-blue-700">Éléments à relier</h4>
                  <div className="space-y-3">
                    {shuffledLeft.map((r, rIndex) => (
                      <div
                        key={r._id}
                        className={`matching-item p-3 rounded-lg cursor-pointer transition-all ${
                          drawingPair?.left === r.originalIndex 
                            ? 'bg-purple-200 border-2 border-purple-500' 
                            : 'bg-white border border-gray-200 hover:border-purple-300'
                        }`}
                        data-index={r.originalIndex}
                        onClick={() => handleStartPair(r.originalIndex)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartPair(r.originalIndex)}
                        aria-label={`Sélectionner l'élément gauche ${r.texte}`}
                      >
                        <span className="font-medium">{r.texte}</span>
                        {r.imageUrl && (
                          <img
                            src={`https://kara-back.onrender.com/Uploads/${r.imageUrl}`}
                            alt={`Gauche ${rIndex + 1}`}
                            className="mt-2 max-w-full h-auto rounded"
                          />
                        )}
                        {r.audioUrl && (
                          <audio
                            controls
                            src={`https://kara-back.onrender.com/Uploads/${r.audioUrl}`}
                            className="w-full mt-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="matching-right bg-green-50 p-4 rounded-xl">
                  <h4 className="font-bold text-center mb-4 text-green-700">Correspondances</h4>
                  <div className="space-y-3">
                    {shuffledRight.map((r, rIndex) => (
                      <div
                        key={r._id}
                        className={`matching-item p-3 rounded-lg cursor-pointer transition-all ${
                          drawingPair ? 'hover:bg-green-100 hover:border-green-300' : ''
                        } ${
                          selectedPairs.some(p => p.right === r.originalIndex) 
                            ? 'bg-green-100 border-2 border-green-400' 
                            : 'bg-white border border-gray-200'
                        }`}
                        data-index={r.originalIndex}
                        onClick={() => handleEndPair(r.originalIndex)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleEndPair(r.originalIndex)}
                        aria-label={`Sélectionner l'élément droit ${r.texte}`}
                      >
                        <span className="font-medium">{r.texte}</span>
                        {r.imageUrl && (
                          <img
                            src={`https://kara-back.onrender.com/Uploads/${r.imageUrl}`}
                            alt={`Droit ${rIndex + 1}`}
                            className="mt-2 max-w-full h-auto rounded"
                          />
                        )}
                        {r.audioUrl && (
                          <audio
                            controls
                            src={`https://kara-back.onrender.com/Uploads/${r.audioUrl}`}
                            className="w-full mt-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <svg className="connections w-full h-0">
                {selectedPairs.map((pair, index) => {
                  const pos = getArrowPosition(pair);
                  if (pos) {
                    return (
                      <g key={index}>
                        <line
                          x1={pos.x1}
                          y1={pos.y1}
                          x2={pos.x2}
                          y2={pos.y2}
                          stroke="#8b5cf6"
                          strokeWidth="3"
                          strokeDasharray="5,5"
                          markerEnd="url(#arrowhead)"
                        />
                        <circle
                          cx={pos.x1}
                          cy={pos.y1}
                          r="6"
                          fill="#8b5cf6"
                          onClick={() => handleRemovePair(index)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleRemovePair(index)}
                          aria-label={`Supprimer la paire ${pair.leftText} -> ${pair.rightText}`}
                          className="cursor-pointer hover:fill-purple-700"
                        />
                      </g>
                    );
                  }
                  return null;
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                  </marker>
                </defs>
              </svg>
              
              <div className="selected-pairs bg-yellow-50 p-4 rounded-xl mb-6">
                <h4 className="font-bold text-center mb-3 text-yellow-700">Paires sélectionnées :</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedPairs.map((pair, index) => (
                    <div 
                      key={index} 
                      className="selected-pair bg-white px-3 py-2 rounded-full border border-yellow-200 flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-sm">{`${pair.leftText} → ${pair.rightText}`}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePair(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                        aria-label={`Supprimer la paire ${pair.leftText} -> ${pair.rightText}`}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {results[currentQuestionIndex] && (
            <div
              className={`p-4 rounded-lg text-center font-bold text-lg mb-4 ${
                results[currentQuestionIndex].isCorrect 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
              aria-live="polite"
            >
              {results[currentQuestionIndex].isCorrect ? 'Correcte! 🎉' : 'Incorrecte! 😢'}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={async () => {
              try {
                await submitAnswer();
              } catch (error) {
                console.error('Submit error:', error);
              }
            }}
            className={`px-6 py-3 font-bold rounded-full transition-all transform hover:scale-105 shadow-lg ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : currentQuestionIndex === selectedQuiz.questions.length - 1 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
            }`}
            aria-label={currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Terminer le quiz' : 'Question suivante'}
            disabled={isSubmitting}
          >
            {currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Terminer le quiz 🏁' : 'Suivant ➡️'}
          </button>
          
          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
            aria-label="Annuler le quiz"
            disabled={isSubmitting}
          >
            Annuler
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default QuizPlayer;
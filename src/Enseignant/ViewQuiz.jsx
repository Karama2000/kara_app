import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ViewQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const token = localStorage.getItem('token');
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`https://kara-back.onrender.com/api/quizs/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération du quiz', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Erreur lors de la récupération du quiz');
          setIsLoading(false);
        }
      }
    };

    fetchQuiz();
  }, [token, quizId, navigate]);

  if (isLoading) {
    return <div className="text-center text-xl">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg" role="alert">
        <p aria-live="assertive">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center text-xl">Quiz non trouvé.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4 md:p-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-purple-700 drop-shadow-md">
        Détails du Quiz : {quiz.titre}
      </h2>

      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-lg font-semibold">
            Difficulté :{' '}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                quiz.difficulty === 'facile'
                  ? 'bg-green-100 text-green-800'
                  : quiz.difficulty === 'moyen'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {quiz.difficulty}
            </span>
          </p>
        </div>

        <h3 className="text-2xl font-bold mb-4 text-purple-600">Questions</h3>
        {quiz.questions.map((q, qIndex) => (
          <div
            key={q._id}
            className="border border-gray-200 rounded-lg p-4 mb-6"
            role="region"
            aria-labelledby={`question-${qIndex}`}
          >
            <h4 id={`question-${qIndex}`} className="text-lg font-semibold mb-2">
              Question {qIndex + 1} : {q.enonce}
            </h4>
            <p className="text-sm text-gray-600 mb-2">Type : {q.type}</p>
            <p className="text-sm text-gray-600 mb-2">Durée : {q.duration} secondes</p>

            {q.imageUrl && (
              <img
                src={`https://kara-back.onrender.com/Uploads/${q.imageUrl}`}
                alt={`Question ${qIndex + 1}`}
                className="max-w-full h-auto rounded-lg mb-4"
              />
            )}

            {q.audioUrl && (
              <audio
                controls
                src={`https://kara-back.onrender.com/Uploads/${q.audioUrl}`}
                className="w-full mb-4"
              />
            )}

            <div className="ml-4">
              <h5 className="font-semibold mb-2">Réponses :</h5>
              {q.type === 'matching' ? (
                <div className="grid grid-cols-2 gap-4">
                  {q.reponses
                    .reduce((pairs, r, index) => {
                      if (index % 2 === 0) pairs.push([r, q.reponses[index + 1]]);
                      return pairs;
                    }, [])
                    .map((pair, pairIndex) => (
                      <div key={pairIndex} className="flex items-center gap-2">
                        <div>
                          <p>
                            Gauche : {pair[0].texte}{' '}
                            {pair[0].estCorrecte && <span className="text-green-600">✓</span>}
                          </p>
                          {pair[0].imageUrl && (
                            <img
                              src={`https://kara-back.onrender.com/Uploads/${pair[0].imageUrl}`}
                              alt={`Gauche ${pairIndex + 1}`}
                              className="max-w-xs h-auto rounded mt-2"
                            />
                          )}
                        </div>
                        <span className="mx-2">→</span>
                        <div>
                          <p>
                            Droite : {pair[1].texte}{' '}
                            {pair[1].estCorrecte && <span className="text-green-600">✓</span>}
                          </p>
                          {pair[1].imageUrl && (
                            <img
                              src={`https://kara-back.onrender.com/Uploads/${pair[1].imageUrl}`}
                              alt={`Droit ${pairIndex + 1}`}
                              className="max-w-xs h-auto rounded mt-2"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-2">
                  {q.reponses.map((r, rIndex) => (
                    <li key={r._id}>
                      {r.texte} {r.estCorrecte && <span className="text-green-600">✓</span>}
                      {r.imageUrl && (
                        <img
                          src={`https://kara-back.onrender.com/Uploads/${r.imageUrl}`}
                          alt={`Réponse ${rIndex + 1}`}
                          className="max-w-xs h-auto rounded mt-2"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate('/teacher/quizs')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
            aria-label="Retour à la gestion des quiz"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuiz;

import React, { useState } from 'react';
import '../Styles/GestionQuizzes.css'; // Réutilise les styles de GestionQuiz pour cohérence

const AudioRecorder = ({ onRecord, questionIndex }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        onRecord(blob, questionIndex); // Passe le blob et l’index de la question au parent
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Erreur lors de l’accès au microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="audio-recorder">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`btn ${recording ? 'btn-delete' : 'btn-add-option'}`}
        disabled={!navigator.mediaDevices}
      >
        {recording ? 'Arrêter l’enregistrement' : 'Enregistrer un audio'}
      </button>
      {audioUrl && (
        <div className="audio-preview">
          <audio controls src={audioUrl} className="audio-player" />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../Components/NavBar';
import '../Styles/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  console.log('Token extrait de l\'URL:', token); // Log pour débogage
  const [identifier, setIdentifier] = useState(''); // Changed from login to identifier
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('https://kara-back.onrender.com/api/auth/reset-password', { identifier });
      setSuccess(response.data.message);
    } catch (error) {
      console.error('Erreur dans handleRequestReset:', error);
      setError(error.response?.data?.message || 'Erreur lors de la demande de réinitialisation');
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    console.log('Envoi de la requête avec token:', token, 'et newPassword:', newPassword); // Log pour débogage
    try {
      const response = await axios.post('https://kara-back.onrender.com/api/auth/reset-password-confirm', {
        token,
        newPassword,
      });
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Erreur dans handleConfirmReset:', error);
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  };

return (
  <div className="min-h-screen bg-warm flex items-center justify-center p-4">
    {/* Bulles décoratives */}
    <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-yellow-200 opacity-30 animate-float"></div>
    <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-green-200 opacity-30 animate-float animation-delay-2000"></div>
    
    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md">
      {/* Header coloré */}
      <div className="bg-gradient-to-r bg-pink-500 opacity-60 p-6 text-center">
        <h2 className="text-3xl font-bold text-white">
          {token ? "Réinitialiser le mot de passe" : "Mot de passe oublié"}
        </h2>
        <p className="text-white/90 mt-1">
          {token ? "Créez un nouveau mot de passe sécurisé" : "Récupérez votre accès en quelques étapes"}
        </p>
      </div>
      
      <div className="p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            <p>{success}</p>
          </div>
        )}

        {token ? (
          <form onSubmit={handleConfirmReset} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r bg-pink-500 opacity-60 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Réinitialiser
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Email/Numéro d'inscription/Matricule/Téléphone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r bg-pink-500 opacity-60 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Envoyer
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-gray-200 mt-6">
          <p className="text-gray-600">
            Retour à la page de connexion ?{' '}
            <Link to="/login" className="text-pink-600 hover:text-purple-800 font-bold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
};

export default ResetPassword;
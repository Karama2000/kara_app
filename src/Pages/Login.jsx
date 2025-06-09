import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://kara-back.onrender.com/api/auth/login', { email, password });
      const { token, role, nom, prenom } = response.data;

      if (!token || !role) {
        setError('Erreur lors de la connexion. Veuillez réessayer.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('nom', nom);
      localStorage.setItem('prenom', prenom);

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'enseignant') {
        navigate('/teacher-dashboard');
      } else if (role === 'eleve') {
        navigate('/student-dashboard');
      } else if (role === 'parent') {
        navigate('/parent-dashboard');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion';
      if (errorMessage.includes('en attente de validation')) {
        setError(`${errorMessage}. Veuillez patienter ou contacter l'administrateur.`);
      } else {
        setError(errorMessage);
      }
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
          <h2 className="text-3xl font-bold text-white">Connexion</h2>
          <p className="text-white/90 mt-1">Bienvenue petit explorateur !</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ton adresse email"
                autoComplete="username"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ton mot de passe secret"
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none rounded-t-lg text-lg"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <Link to="/reset-password" className="text-pink-600 hover:text-purple-800 text-sm font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r bg-pink-500 opacity-60 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              C'est parti !
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-pink-600 hover:text-purple-800 font-bold">
                  Rejoins l'aventure !
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
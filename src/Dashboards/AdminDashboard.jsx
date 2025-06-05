import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserClock, faSchool, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../Components/LogOut';

// Importez vos images (assurez-vous d'avoir ces fichiers dans votre dossier d'images)
import kidsImage from '../Assets/images/dashboard/kids-learning.avif';
import booksImage from '../Assets/images/dashboard/books-stack.jpg';
import teacherImage from '../Assets/images/dashboard/teacher.avif';
import puzzleImage from '../Assets/images/dashboard/puzzle.jpg';
import dashboardBg from '../Assets/images/dashboard/dashboard-bg.avif';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalNiveaux: 0,
    totalUnits: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, pendingRes, niveauxRes, unitsRes] = await Promise.all([
          axios.get('https://kara-back.onrender.com/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://kara-back.onrender.com/api/pending-users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://kara-back.onrender.com/api/niveaux'),
          axios.get('https://kara-back.onrender.com/api/units', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          totalUsers: usersRes.data.length,
          pendingUsers: pendingRes.data.length,
          totalNiveaux: niveauxRes.data.length,
          totalUnits: unitsRes.data.length,
        });
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques :', err);
      }
    };

    fetchStats();
  }, [token]);

  // Configuration graphiques avec des couleurs plus enfantines
  const barOptions = {
    chart: {
      id: 'bar-chart',
      foreColor: '#4B5563',
      toolbar: { show: false }
    },
    xaxis: {
      categories: ['Utilisateurs', 'En attente', 'Niveaux', 'Unités'],
      labels: { style: { colors: ['#6B7280'] } }
    },
    colors: ['#7C3AED', '#F59E0B', '#10B981', '#EF4444'],
    plotOptions: {
      bar: { borderRadius: 10, distributed: true }
    },
    dataLabels: { enabled: false }
  };

  const donutOptions = {
    labels: ['Utilisateurs', 'En attente', 'Niveaux', 'Unités'],
    colors: ['#7C3AED', '#F59E0B', '#10B981', '#EF4444'],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#6B7280'
            }
          }
        }
      }
    }
  };

  const chartData = [
    stats.totalUsers,
    stats.pendingUsers,
    stats.totalNiveaux,
    stats.totalUnits,
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      {/* En-tête avec une image d'arrière-plan enfant-friendly */}
      <div
        className="flex items-center justify-between p-6 rounded-xl shadow mb-6 relative overflow-hidden"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0  opacity-90"></div>
        <div className="relative z-10 text-white">
          <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord Éducatif</h2>
          <p className="text-lg font-bold">Bonjour {prenom && nom ? `${prenom} ${nom}` : 'Super Admin'} !</p>
        </div>
        <div className="relative z-10">
          <LogoutButton />
        </div>
      </div>

      {/* Statistiques brutes avec des images et des couleurs vives */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => navigate('/manage-users')}
          className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center"
          style={{ borderTop: '8px solid #7C3AED' }}
        >
          <img src={kidsImage} alt="Enfants apprenant" className="w-16 h-16 mb-4" />
          <p className="text-gray-600 text-lg">Utilisateurs</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
          <div className="mt-2 text-indigo-400">
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </div>
        </div>

        <div
          onClick={() => navigate('/manage-pending-users')}
          className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center"
          style={{ borderTop: '8px solid #F59E0B' }}
        >
          <img src={teacherImage} alt="Professeur" className="w-16 h-16 mb-4" />
          <p className="text-gray-600 text-lg">En attente</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.pendingUsers}</p>
          <div className="mt-2 text-yellow-400">
            <FontAwesomeIcon icon={faUserClock} size="lg" />
          </div>
        </div>

        <div
          onClick={() => navigate('/manage-classes')}
          className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center"
          style={{ borderTop: '8px solid #10B981' }}
        >
          <img src={booksImage} alt="Pile de livres" className="w-16 h-16 mb-4" />
          <p className="text-gray-600 text-lg">Niveaux</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalNiveaux}</p>
          <div className="mt-2 text-green-400">
            <FontAwesomeIcon icon={faSchool} size="lg" />
          </div>
        </div>

        <div
          onClick={() => navigate('/manage-units')}
          className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center"
          style={{ borderTop: '8px solid #EF4444' }}
        >
          <img src={puzzleImage} alt="Pièces de puzzle" className="w-16 h-16 mb-4" />
          <p className="text-gray-600 text-lg">Unités</p>
          <p className="text-3xl font-bold text-red-500">{stats.totalUnits}</p>
          <div className="mt-2 text-red-400">
            <FontAwesomeIcon icon={faLayerGroup} size="lg" />
          </div>
        </div>
      </div>

      {/* Graphiques avec des styles plus ludiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
            Statistiques - Activités
          </h3>
          <Chart
            options={barOptions}
            series={[{ name: 'Total', data: chartData }]}
            type="bar"
            height={300}
          />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Répartition - Camembert
          </h3>
          <Chart
            options={donutOptions}
            series={chartData}
            type="donut"
            height={300}
          />
        </div>
      </div>

      {/* Section supplémentaire pour un look plus enfantin */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-indigo-600 mb-4">Bienvenue dans votre espace éducatif !</h3>
        <p className="text-gray-600 mb-4">
          Gérez facilement les utilisateurs, les niveaux et les unités d'apprentissage pour créer une expérience éducative amusante et engageante.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/manage-users')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
          >
            Commencer la gestion
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
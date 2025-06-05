// src/Components/AdminHeader.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../Components/LogOut';

const AdminHeader = ({ title }) => {
  const prenom = localStorage.getItem('prenom');
  const nom = localStorage.getItem('nom');

  return (
    <header className="flex justify-between items-center bg-gray-100 text-gray-800 p-4 rounded-lg shadow mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm opacity-90">Bienvenue, {prenom} {nom}</p>
      </div>
      <LogoutButton />
    </header>
  );
};

export default AdminHeader;

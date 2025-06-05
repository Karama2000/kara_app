import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const AddLessonModal = ({
  showModal,
  setShowModal,
  formData,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  programs,
  editingLessonId,
  error,
  setError,
  accept, // Ajout de la prop accept
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-700">
            {editingLessonId ? '✏️ Modifier la Leçon' : '➕ Créer une Nouvelle Leçon'}
          </h2>
          <button
            onClick={() => {
              setShowModal(false);
              setError('');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Programme</label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleInputChange}
                required
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              >
                <option value="">📋 Sélectionner un programme</option>
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
                disabled={!formData.programId}
                className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
              >
                <option value="">📚 Sélectionner une unité</option>
                {formData.programId &&
                  programs
                    .find((program) => program._id === formData.programId)
                    ?.units?.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.title}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Titre de la leçon</label>
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
              name="mediaFile"
              accept={accept} // Utilisation de la prop accept
              onChange={handleFileChange}
              className="border-2 border-green-300 rounded-lg px-4 py-2 w-full focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setError('');
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              <FontAwesomeIcon icon={faTimes} /> Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <FontAwesomeIcon icon={editingLessonId ? faSave : faPlus} />
              {editingLessonId ? 'Mettre à jour' : 'Créer'} la leçon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLessonModal;
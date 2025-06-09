import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../Styles/Messages.css';
import {
  faArrowLeft,
  faEnvelope,
  faSearch,
  faTrash,
  faPaperPlane,
  faMicrophone,
  faFilm,
  faFile,
  faImage,
  faLayerGroup,
  faUsers,
  faUserFriends,
  faGraduationCap,
  faChalkboardTeacher,
  faFolder,
  faCircle,
  faTimes,
  faPhotoVideo,
  faImages,
  faMusic,
  faFileAlt,
  faCommentAlt,
  faExclamationCircle,
  faSpinner,
  faComments
} from '@fortawesome/free-solid-svg-icons';

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const [messages, setMessages] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [niveau, setNiveau] = useState('');
  const [classe, setClasse] = useState('');
  const [recording, setRecording] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [unreadSenders, setUnreadSenders] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  // Fonction utilitaire pour formater l'URL de l'image
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return 'https://via.placeholder.com/50?text=User';
    }
    if (!imageUrl.startsWith('http')) {
      return `https://kara-back.onrender.com/Uploads/${imageUrl}`;
    }
    return imageUrl;
  };

  // Récupérer le paramètre recipient de l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipient = params.get('recipient');
    if (recipient) {
      setRecipientId(recipient);
    }
  }, [location]);

  // Récupérer les expéditeurs de messages non lus et utilisateurs
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch unread senders
        const unreadResponse = await axios.get('https://kara-back.onrender.com/api/messages/unread-senders', config);
        setUnreadSenders(unreadResponse.data);

        // Fetch users based on role
        let filteredUsers = [];
        let niveauxData = [];

        if (role === 'enseignant') {
          const niveauxResponse = await axios.get('https://kara-back.onrender.com/api/niveaux', config);
          niveauxData = niveauxResponse.data;
          setNiveaux(niveauxData);

          const usersResponse = await axios.get('https://kara-back.onrender.com/api/users', config);
          let allUsers = usersResponse.data;

          if (niveau && classe) {
            filteredUsers = allUsers.filter(user =>
              user.role === 'eleve'
                ? user.niveau?._id === niveau && user.classe?._id === classe
                : user.role === 'parent'
            );
            const eleveIds = filteredUsers
              .filter(user => user.role === 'eleve')
              .map(user => user._id);
            const parentsWithChildren = allUsers.filter(user =>
              user.role === 'parent' &&
              user.enfants?.some(childId => eleveIds.includes(childId.toString()))
            );
            const existingUserIds = new Set(filteredUsers.map(user => user._id.toString()));
            filteredUsers = [
              ...filteredUsers,
              ...parentsWithChildren.filter(user => !existingUserIds.has(user._id.toString()))
            ];
          } else {
            filteredUsers = allUsers.filter(user => user.role === 'parent' || user.role === 'eleve');
          }
        } else if (role === 'eleve' || role === 'parent') {
          const usersResponse = await axios.get('https://kara-back.onrender.com/api/messages/teachers', config);
          filteredUsers = usersResponse.data;
          if (!filteredUsers || filteredUsers.length === 0) {
            setError('Aucun enseignant disponible.');
          }
        }

        // Formater les URLs des images pour tous les utilisateurs
        filteredUsers = filteredUsers.map(user => ({
          ...user,
          imageUrl: formatImageUrl(user.imageUrl),
          unreadCount: unreadResponse.data.find(sender => sender._id === user._id)?.unreadCount || 0
        }));

        setUsers(filteredUsers);

        // Automatically select the first unread sender if no recipient is set
        if (unreadResponse.data.length > 0 && !recipientId) {
          setRecipientId(unreadResponse.data[0]._id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        let errorMessage = 'Erreur lors du chargement des données.';
        if (error.response) {
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/login');
            return;
          } else if (error.response.status === 500) {
            errorMessage = 'Erreur serveur lors de la récupération des données. Veuillez réessayer plus tard.';
          } else {
            errorMessage = error.response.data?.message || error.message;
          }
        } else {
          errorMessage = 'Erreur réseau. Veuillez vérifier votre connexion.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInitialData();
    } else {
      navigate('/login');
    }
  }, [token, navigate, role, niveau, classe, recipientId]);

  useEffect(() => {
    if (niveau && role === 'enseignant') {
      const fetchClasses = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const classesResponse = await axios.get(`https://kara-back.onrender.com/api/classes/niveau/${niveau}`, config);
          setClasses(classesResponse.data);
        } catch (error) {
          setError('Erreur lors du chargement des classes.');
        }
      };
      fetchClasses();
    } else {
      setClasses([]);
    }
  }, [niveau, token, role]);

  const fetchConversation = useCallback(async () => {
    if (!recipientId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const messagesResponse = await axios.get(`https://kara-back.onrender.com/api/messages/conversation/${recipientId}`, config);
      // Formater les URLs des images pour les messages
      const formattedMessages = messagesResponse.data.map(msg => ({
        ...msg,
        sender: {
          ...msg.sender,
          imageUrl: formatImageUrl(msg.sender.imageUrl),
        },
        recipient: {
          ...msg.recipient,
          imageUrl: formatImageUrl(msg.recipient.imageUrl),
        },
      }));
      setMessages(formattedMessages);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Mark messages as read
      const unreadMessages = formattedMessages.filter(msg => msg.recipient._id === userId && !msg.read);
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg =>
            axios.put(`https://kara-back.onrender.com/api/messages/${msg._id}/read`, {}, config)
          )
        );
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            unreadMessages.some(unread => unread._id === msg._id) ? { ...msg, read: true } : msg
          )
        );
        // Refresh unread senders
        const unreadResponse = await axios.get('https://kara-back.onrender.com/api/messages/unread-senders', config);
        setUnreadSenders(unreadResponse.data);
      }
    } catch (error) {
      setError('Erreur lors du chargement de la conversation.');
    }
  }, [token, recipientId, userId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!recipientId) {
      setError('Veuillez sélectionner un destinataire.');
      return;
    }
    if (!content && !imageFile && !audioFile && !docFile) {
      setError('Veuillez entrer un message ou joindre un fichier.');
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      const formData = new FormData();
      formData.append('recipientId', recipientId);
      if (content) formData.append('content', content);
      if (imageFile) formData.append('image', imageFile);
      if (audioFile) formData.append('audio', audioFile);
      if (docFile) formData.append('file', docFile);

      const response = await axios.post('https://kara-back.onrender.com/api/messages', formData, config);

      const newMessages = Array.isArray(response.data) ? response.data : [response.data];
      const updatedMessages = newMessages.map(msg => ({
        ...msg,
        sender: {
          _id: userId,
          prenom: localStorage.getItem('prenom'),
          nom: localStorage.getItem('nom'),
          role,
          imageUrl: formatImageUrl(localStorage.getItem('imageUrl')),
        },
        recipient: users.find(u => u._id === recipientId),
      }));
      setMessages(prev => [...prev, ...updatedMessages]);
      setContent('');
      setImageFile(null);
      setAudioFile(null);
      setDocFile(null);
      setFileError('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'envoi du message.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`https://kara-back.onrender.com/api/messages/${id}/read`, {}, config);
      setMessages(messages.map(msg => msg._id === id ? { ...msg, read: true } : msg));
      // Refresh unread senders
      const unreadResponse = await axios.get('https://kara-back.onrender.com/api/messages/unread-senders', config);
      setUnreadSenders(unreadResponse.data);
    } catch (error) {
      setError('Erreur lors de la mise à jour du message.');
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`https://kara-back.onrender.com/api/messages/${id}`, config);
      setMessages(messages.filter(msg => msg._id !== id));
    } catch (error) {
      setError('Erreur lors de la suppression du message.');
    }
  };

  const handleFileChange = (type) => (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = {
        image: ['image/jpeg', 'image/jpg', 'image/png'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
        file: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      };

      if (!allowedTypes[type].includes(selectedFile.type)) {
        setFileError(`Type de fichier non supporté pour ${type}. Seuls ${allowedTypes[type].join(', ')} sont autorisés.`);
        if (type === 'image') setImageFile(null);
        if (type === 'audio') setAudioFile(null);
        if (type === 'file') setDocFile(null);
        return;
      }
      if (selectedFile.size > maxSize) {
        setFileError(`Fichier trop volumineux pour ${type} (max 10MB).`);
        if (type === 'image') setImageFile(null);
        if (type === 'audio') setAudioFile(null);
        if (type === 'file') setDocFile(null);
        return;
      }
      setFileError('');
      if (type === 'image') setImageFile(selectedFile);
      if (type === 'audio') setAudioFile(selectedFile);
      if (type === 'file') setDocFile(selectedFile);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/wav';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioFile = new File([audioBlob], `recording-${Date.now()}${mimeType === 'audio/webm' ? '.webm' : '.wav'}`, { type: mimeType });
        setAudioFile(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      setError('Erreur lors du démarrage de l\'enregistrement. Vérifiez les permissions du microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const getDashboardPath = () => {
    if (role === 'eleve') return '/student-dashboard';
    if (role === 'enseignant') return '/teacher-dashboard';
    return '/parent-dashboard';
  };

  const filteredUsers = users.filter(user =>
    `${user.prenom} ${user.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.unreadCount - a.unreadCount);

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    if (role === 'enseignant' && user.role === 'eleve') {
      const niveauNom = user.niveau?.nom || 'Non spécifié';
      const classeNom = user.classe?.nom || 'Non spécifié';
      if (!acc[niveauNom]) acc[niveauNom] = {};
      if (!acc[niveauNom][classeNom]) acc[niveauNom][classeNom] = [];
      acc[niveauNom][classeNom].push(user);
    } else {
      const group = role === 'parent' ? 'Enseignants' : user.role === 'enseignant' ? 'Enseignants' : 'Parents';
      if (!acc[group]) acc[group] = { [group]: [] };
      acc[group][group].push(user);
    }
    return acc;
  }, {});

  const sharedMedia = messages.filter(msg => msg.fileType !== 'text');

  return (
    <div className="messages-container bg-gradient-to-br from-blue-50 to-pink-50 min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-lg p-4 rounded-2xl mb-6 backdrop-blur-sm bg-opacity-80">
        <button
          onClick={() => navigate(getDashboardPath())}
          className="flex items-center gap-2 text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-4 py-2 rounded-xl shadow-md transition-all transform hover:-translate-x-1"
          title="Retour au tableau de bord"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-white text-lg" />
          <span className="font-medium">🏠 Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 flex items-center gap-3">
          <FontAwesomeIcon icon={faEnvelope} className="text-pink-500 text-2xl" />
          <span>Messagerie</span>
        </h1>
        <div className="w-10"></div> {/* Spacer pour l'équilibre */}
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-5 p-2 bg-gray-50 rounded-xl">
            <FontAwesomeIcon icon={faSearch} className="text-blue-500 ml-2" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
            />
          </div>

          {role === 'enseignant' && (
            <div className="mb-5 space-y-3">
              <div className="relative">
                <FontAwesomeIcon icon={faLayerGroup} className="absolute left-3 top-3 text-blue-400" />
                <select
                  value={niveau}
                  onChange={(e) => {
                    setNiveau(e.target.value);
                    setClasse('');
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 appearance-none bg-white"
                >
                  <option value="">Sélectionner un niveau</option>
                  {niveaux.map(n => (
                    <option key={n._id} value={n._id}>{n.nom}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <FontAwesomeIcon icon={faUsers} className="absolute left-3 top-3 text-blue-400" />
                <select
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 appearance-none bg-white"
                  disabled={!niveau}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[60vh] space-y-5 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
            {Object.keys(groupedUsers).length === 0 ? (
              <div className="text-center py-10">
                <FontAwesomeIcon icon={faUserFriends} className="text-gray-300 text-4xl mb-3" />
                <p className="text-gray-400">Aucun utilisateur disponible</p>
              </div>
            ) : (
              Object.keys(groupedUsers).map(group => (
                <div key={group} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-100">
                  <h3 className="text-blue-700 font-semibold mb-3 flex items-center gap-2">
                    {group === 'Étudiants' ? (
                      <FontAwesomeIcon icon={faGraduationCap} className="text-blue-500" />
                    ) : (
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-500" />
                    )}
                    {group}
                  </h3>
                  {Object.keys(groupedUsers[group]).map(subGroup => (
                    <div key={subGroup} className="mb-3">
                      {group !== subGroup && (
                        <h4 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FontAwesomeIcon icon={faFolder} className="text-xs" />
                          {subGroup}
                        </h4>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {groupedUsers[group][subGroup].map(user => (
                          <div
                            key={user._id}
                            onClick={() => setRecipientId(user._id)}
                            className={`cursor-pointer border rounded-xl px-3 py-2 flex items-center gap-3 shadow-sm transition-all hover:shadow-md w-full ${recipientId === user._id
                                ? 'bg-gradient-to-r from-pink-100 to-pink-50 border-pink-300'
                                : 'bg-white border-gray-200 hover:border-blue-200'
                              } ${user.unreadCount > 0 ? 'ring-2 ring-red-300' : ''}`}
                          >
                            <div className="relative">
                              <img
                                src={user.imageUrl}
                                alt={`${user.prenom} ${user.nom}`}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/50?text=User')}
                              />
                              {user.unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                  {user.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {user.prenom} {user.nom}
                              </p>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                                {user.unreadCount > 0 && (
                                  <span className="text-xs text-pink-500 animate-pulse">• Nouveau(x)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          {recipientId ? (
            <>
              {/* Conversation Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={formatImageUrl(users.find(u => u._id === recipientId)?.imageUrl)}
                      alt="Recipient"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/50?text=User')}
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {users.find(u => u._id === recipientId)?.prenom} {users.find(u => u._id === recipientId)?.nom}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCircle} className="text-xs text-green-400" />
                      En ligne
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMedia(!showMedia)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl shadow-sm transition-all"
                >
                  <FontAwesomeIcon icon={showMedia ? faTimes : faFilm} />
                  {showMedia ? 'Masquer médias' : 'Voir médias'}
                </button>
              </div>

              {/* Media View */}
              {showMedia ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhotoVideo} className="text-blue-500" />
                    Médias partagés
                  </h4>
                  {sharedMedia.length === 0 ? (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faImages} className="text-gray-300 text-4xl mb-3" />
                      <p className="text-gray-400">Aucun média partagé dans cette conversation</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {sharedMedia.map(media => (
                        <div key={media._id} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all">
                          {media.fileType === 'image' && (
                            <div className="relative pb-[100%] overflow-hidden rounded-md">
                              <img
                                src={`https://kara-back.onrender.com${media.fileUrl}`}
                                alt="Shared media"
                                className="absolute h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          {media.fileType === 'audio' && (
                            <div className="p-2 bg-blue-50 rounded-md">
                              <FontAwesomeIcon icon={faMusic} className="text-blue-500 text-xl mb-2" />
                              <audio controls src={`https://kara-back.onrender.com${media.fileUrl}`} className="w-full" />
                            </div>
                          )}
                          {media.fileType === 'file' && (
                            <a
                              href={`https://kara-back.onrender.com${media.fileUrl}`}
                              download
                              className="flex flex-col items-center p-3 text-center hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <FontAwesomeIcon icon={faFileAlt} className="text-blue-500 text-3xl mb-2" />
                              <span className="text-sm font-medium text-gray-700 truncate w-full">Document</span>
                            </a>
                          )}
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            {new Date(media.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="space-y-4 mb-6 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-10">
                        <FontAwesomeIcon icon={faCommentAlt} className="text-gray-300 text-4xl mb-3" />
                        <p className="text-gray-400">Aucun message dans cette conversation</p>
                        <p className="text-sm text-gray-400 mt-2">Envoyez le premier message !</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`p-4 rounded-2xl max-w-[80%] lg:max-w-[60%] shadow-sm ${message.sender._id === userId
                                ? 'bg-gradient-to-r from-blue-300 to-blue-400 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                          >
                            <div className="mb-1">
                              <span className="font-semibold text-sm">
                                {message.sender._id === userId ? 'Vous' : `${message.sender.prenom}`}
                              </span>
                            </div>

                            <div className="text-sm">
                              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                              {message.fileType === 'image' && (
                                <img
                                  src={`https://kara-back.onrender.com${message.fileUrl}`}
                                  className="mt-2 rounded-lg max-w-full h-auto max-h-60 object-cover border border-white/20"
                                />
                              )}
                              {message.fileType === 'audio' && (
                                <div className="mt-2 bg-white/20 p-2 rounded-lg">
                                  <audio controls src={`https://kara-back.onrender.com${message.fileUrl}`} className="w-full" />
                                </div>
                              )}
                              {message.fileType === 'file' && (
                                <a
                                  href={`https://kara-back.onrender.com${message.fileUrl}`}
                                  download
                                  className="inline-flex items-center gap-2 mt-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                >
                                  <FontAwesomeIcon icon={faFileAlt} />
                                  <span>Télécharger le fichier</span>
                                </a>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              <p className={`text-xs ${message.sender._id === userId ? 'text-white/70' : 'text-gray-500'}`}>
                                {new Date(message.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className="flex gap-3">
                                {message.recipient._id === userId && !message.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(message._id)}
                                    title="Marquer comme lu"
                                    className="hover:scale-110 transition-transform"
                                  >
                                    <FontAwesomeIcon
                                      icon={faEnvelope}
                                      className={message.sender._id === userId ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'}
                                    />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteMessage(message._id)}
                                  title="Supprimer"
                                  className="hover:scale-110 transition-transform"
                                >
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    className={message.sender._id === userId ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Form */}
                  <form onSubmit={handleSendMessage} className="mt-6 space-y-3">
                    <div className="relative">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Écrire un message..."
                        className="w-full border border-gray-200 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
                        rows="3"
                      />
                      <div className="absolute right-3 bottom-3 flex gap-2">
                        <button
                          type="button"
                          onClick={recording ? stopRecording : startRecording}
                          className={`p-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                          title={recording ? 'Arrêter l\'enregistrement' : 'Enregistrer un message vocal'}
                        >
                          <FontAwesomeIcon icon={faMicrophone} className={recording ? 'text-white' : 'text-gray-600'} />
                        </button>
                      </div>
                    </div>

                    {fileError && (
                      <div className="text-red-500 text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        <span>{fileError}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-3">
                        <label className="cursor-pointer p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors">
                          <FontAwesomeIcon icon={faImage} className="text-blue-500 text-lg" />
                          <input type="file" accept="image/*" onChange={handleFileChange('image')} className="hidden" />
                        </label>
                        <label className="cursor-pointer p-2 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors">
                          <FontAwesomeIcon icon={faFileAlt} className="text-purple-500 text-lg" />
                          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange('file')} className="hidden" />
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !recipientId || (!content && !imageFile && !audioFile && !docFile)}
                      >
                        <FontAwesomeIcon icon={loading ? faSpinner : faPaperPlane} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Envoi en cours...' : 'Envoyer'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <FontAwesomeIcon icon={faComments} className="text-gray-300 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Aucun destinataire sélectionné</h3>
              <p className="text-gray-400">Sélectionnez un contact pour commencer à discuter</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Messages;
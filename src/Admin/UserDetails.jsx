import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../Styles/UserDetails.css';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("ID de l'utilisateur manquant dans l'URL");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://kara-back.onrender.com/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const goBack = () => {
    navigate('/manage-users');
  };

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (imageUrl) => {
    const baseUrl = 'https://kara-back.onrender.com/Uploads';
    const timestamp = new Date().getTime(); // Pour éviter le cache
    if (!imageUrl) {
      return '/images/placeholder.png';
    }
    if (imageUrl.startsWith('http')) {
      return `${imageUrl}?t=${timestamp}`;
    }
    return `${baseUrl}/${imageUrl}?t=${timestamp}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="warning">Utilisateur non trouvé</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <FontAwesomeIcon
        icon={faArrowLeft}
        onClick={goBack}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          cursor: 'pointer',
          fontSize: '1.5rem',
        }}
      />
      <Typography variant="h4" gutterBottom>
        Détails de l'utilisateur
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Image de profil</Typography>
          <img
            src={getImageUrl(user.imageUrl)}
            alt={`${user.nom} ${user.prenom} profile`}
            style={{ maxWidth: '150px', borderRadius: '8px', marginTop: '10px' }}
            onError={(e) => {
              console.warn(`Erreur de chargement de l'image pour l'utilisateur ${user._id}: ${user.imageUrl}`);
              e.target.src = '/images/placeholder.png';
            }}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Informations générales</Typography>
        <List>
          <ListItem>
            <ListItemText primary="Nom" secondary={user.nom || 'Non spécifié'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Prénom" secondary={user.prenom || 'Non spécifié'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Email" secondary={user.email || 'Non spécifié'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Rôle" secondary={user.role || 'Non spécifié'} />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {user.role === 'parent' && (
          <>
            <Typography variant="h6">Informations spécifiques</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Numéro de téléphone"
                  secondary={user.numTell || 'Non spécifié'}
                />
              </ListItem>
            </List>
            <Typography variant="h6">Enfants</Typography>
            {user.enfants?.length ? (
              <List>
                {user.enfants.map((enfant) => (
                  <ListItem key={enfant._id}>
                    <ListItemText
                      primary={`${enfant.nom} ${enfant.prenom}`}
                      secondary={`Niveau: ${enfant.niveau?.nom || 'Non spécifié'}, Classe: ${enfant.classe?.nom || 'Non spécifié'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">Aucun enfant assigné</Typography>
            )}
          </>
        )}

        {user.role === 'eleve' && (
          <>
            <Typography variant="h6">Informations spécifiques</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Numéro d'inscription"
                  secondary={user.numInscript || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Niveau"
                  secondary={user.niveau?.nom || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Classe"
                  secondary={user.classe?.nom || 'Non spécifié'}
                />
              </ListItem>
            </List>
          </>
        )}

        {user.role === 'enseignant' && (
          <>
            <Typography variant="h6">Informations spécifiques</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Matricule"
                  secondary={user.matricule || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Spécialité"
                  secondary={user.specialite || 'Non spécifiée'}
                />
              </ListItem>
            </List>
            <Typography variant="h6">Niveaux</Typography>
            {user.niveaux?.length ? (
              <List>
                {user.niveaux.map((niveau) => (
                  <ListItem key={niveau._id}>
                    <ListItemText primary={niveau.nom} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">Aucun niveau assigné</Typography>
            )}
            <Typography variant="h6">Classes</Typography>
            {user.classes?.length ? (
              <List>
                {user.classes.map((classe) => (
                  <ListItem key={classe._id}>
                    <ListItemText primary={classe.nom} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">Aucune classe assignée</Typography>
            )}
          </>
        )}

        {user.role === 'admin' && (
          <Typography variant="body2" color="text.secondary">
            Aucune information spécifique pour le rôle Admin
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default UserDetails;
import React from 'react'; // Importation de React pour la création du composant
import { FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6"; // Importation des icônes pour téléphone, email, et localisation
import SocalIcons from '../../ui/socalIcons';

const ExtraInfo = () => { // Déclaration du composant ExtraInfo
    return (
        <div className="mt-5"> {/* Section contenant les informations supplémentaires */}
            <div>
                {/* Titre de la section */}
                <h4 className="text-xl font-bold text-[#385469]">Infos de contact</h4>
                {/* Liste des informations de contact */}
                <ul className="mt-5 flex flex-col gap-[15px]">
                    {/* Élément pour le numéro de téléphone */}
                    <li className='flex items-center gap-2'>
                        <FaPhone className="text-primary-foreground" /> {/* Icône de téléphone */}
                        <a href="tel:+16295550129" className="ml-2.5">+216 56 255 380</a> {/* Lien cliquable pour appeler */}
                    </li>
                    {/* Élément pour l'adresse email */}
                    <li className='flex items-center gap-2'>
                        <FaEnvelope className="text-primary-foreground" /> {/* Icône d'email */}
                        <a href="mailto:info@example.com" className="ml-2.5">karamighry@gmail.com</a> {/* Lien cliquable pour envoyer un email */}
                    </li>
                    {/* Élément pour la localisation */}
                    <li className='flex items-center gap-2'>
                        <FaLocationDot className="text-primary-foreground" /> {/* Icône de localisation */}
                        <a href="https://www.google.com/maps?q=6391+Elgin+St.+Celina,+10299" className="ml-2.5" target="_blank" rel="noopener noreferrer">Menzel Mhiri_Kairouan</a> {/* Lien vers Google Maps */}
                    </li>
                </ul>
            </div>
            {/* Section du bouton de devis */}
           
            {/* Affichage des icônes sociales */}
            <SocalIcons className={"w-11 h-11 bg-white text-muted-foreground"} />
        </div>
    );
}

export default ExtraInfo;

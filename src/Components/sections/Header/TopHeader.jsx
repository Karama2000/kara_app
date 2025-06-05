import React from 'react'; // Importation de React pour la création du composant
import { Link } from 'react-router-dom'; // Importation de Link pour la navigation
import { FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6"; // Importation des icônes pour téléphone, email, et localisation
import SocalIcons from '../../ui/socalIcons'; // Importation des icônes sociales

const TopHeader = () => { // Déclaration du composant TopHeader
    return (
        <div id="top-header" className="bg-destructive sm:block hidden"> {/* Affichage du header seulement sur les écrans 'sm' et plus grands */}
            <div className="container"> {/* Conteneur centré */}
                <div className="flex lg:flex-row flex-col justify-between items-center gap-2 py-[13px]"> {/* Disposition flexible en ligne sur les grands écrans et en colonne sur les petits écrans */}
                    <div>
                        <ul className="flex gap-7.5"> {/* Liste des éléments avec un espacement entre chaque élément */}
                            <li className='text-cream-foreground flex items-center gap-4'>
                                <FaPhone /> {/* Icône de téléphone */}
                                <a href="tel:+21656255380" className="ml-2.5">(+216) 56 255 380</a> {/* Lien pour appeler */}
                            </li>
                            <li className='text-cream-foreground flex items-center gap-4'>
                                <FaEnvelope /> {/* Icône d'email */}
                                <a href="mailto:karamamighry..gmail.com" className="ml-2.5">karamamighry@gmail.com</a> {/* Lien pour envoyer un email */}
                            </li>
                            <li className='text-cream-foreground flex items-center gap-4'>
                                <FaLocationDot /> {/* Icône de localisation */}
                                <a href="https://www.google.com/maps?q=Cité+Riadh,Menzel+Mhiri,+Kairouan_3114" target="_blank" rel="noopener noreferrer" className="ml-2.5">Cité Riadh, Menzel Mhiri, Kairouan_3114</a> {/* Lien vers Google Maps */}
                            </li>
                        </ul>
                    </div>
                    {/* Icônes sociales */}
                    <div>
                        <SocalIcons className={"text-xs"} /> {/* Affichage des icônes sociales avec une petite taille de texte */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopHeader;

import React from 'react';  // Importation de React pour créer le composant
import { FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6';  // Importation des icônes pour l'email, l'emplacement et le téléphone
import { Link } from 'react-router-dom';  // Importation de 'Link' pour la navigation
import Logo from '../../ui/logo';  // Importation du logo
import SocalIcons from '../..//ui/socalIcons';  // Importation des icônes sociales (réseaux sociaux)
import CopyRight from './copyRight';  // Importation du composant de droit d'auteur
import ScrollUp from './scrollUp';  // Importation du composant ScrollUp pour remonter la page
import SlideUp from '../../lib/animations/slideUp';  // Importation de l'animation SlideUp pour les effets d'animation

const Footer = () => {
    return (
        <footer className="pt-[70px] relative">  {/* Définition du footer avec un padding spécifique */}
            <div className="container">  {/* Conteneur principal du footer */}
                <div className="grid lg:grid-cols-[370px_auto_auto] sm:grid-cols-2 grid-cols-1 justify-between gap-7.5">  {/* Grille responsive pour le footer */}
                    
                    <SlideUp delay={2}>  {/* Animation du logo avec un délai */}
                        <Logo />  {/* Affichage du logo */}
                        <p className="pt-4">KaraLearn - Une plateforme éducative innovante pour les élèves, parents et enseignants.</p>  {/* Texte descriptif traduit */}
                        <SocalIcons prentClass={"gap-5 pt-7.5"} className={"w-9 h-9 bg-warm text-muted-foreground hover:text-cream-foreground hover:bg-green"} />  {/* Icônes sociales */}
                    </SlideUp>

                    <SlideUp delay={3}>  {/* Animation pour les pages */}
                        <h3 className="text-2xl font-semibold">Pages</h3>  {/* Titre pour la section des pages */}
                        <ul className="flex flex-col gap-[15px] pt-5 min-w-[203px]">  {/* Liste des liens de pages */}
                            <li><Link to="/aboutus" className="text-[#686868] transition-all duration-500 hover:ml-1 hover:text-primary-foreground">À propos de nous</Link></li>  {/* Lien vers la page "À propos" */}
                            <li><Link to="/services" className="text-[#686868] transition-all duration-500 hover:ml-1 hover:text-primary-foreground">Nos services</Link></li>  {/* Lien vers la page des services */}
                            <li><Link to="/blog" className="text-[#686868] transition-all duration-500 hover:ml-1 hover:text-primary-foreground">Derniers blogs et actualités</Link></li>  {/* Lien vers les derniers blogs */}
                            <li><Link to="/faq" className="text-[#686868] transition-all duration-500 hover:ml-1 hover:text-primary-foreground">FAQ</Link></li>  {/* Lien vers la page FAQ */}
                            <li><Link to="#" className="text-[#686868] transition-all duration-500 hover:ml-1 hover:text-primary-foreground">Notre équipe créative</Link></li>  {/* Lien vers l'équipe */}
                        </ul>
                    </SlideUp>

                    <SlideUp delay={4}>  {/* Animation pour la section Contact */}
                        <h3 className="text-2xl font-semibold">Contact</h3>  {/* Titre pour la section de contact */}
                        <ul className="flex flex-col gap-[15px] pt-5">  {/* Liste des informations de contact */}
                            <li>
                                <p className="text-[#686868] flex items-center gap-4">
                                    <span className="w-11 h-11 rounded-full border border-gray-200 flex justify-center items-center text-green-foreground"><FaLocationDot /></span>  {/* Icône d'emplacement */}
                                    <span className="max-w-[168px]">3114 Menzel Mhiri Kairouan_Tunisie</span>  {/* Adresse de contact */}
                                </p>
                            </li>
                            <li>
                                <p className="text-[#686868] flex items-center gap-4">
                                    <span className="w-11 h-11 rounded-full border border-gray-200 flex justify-center items-center text-green-foreground"><FaEnvelope /></span>  {/* Icône de l'email */}
                                    <Link to="">karamamighry@gmail.com</Link>  {/* Email de contact */}
                                </p>
                            </li>
                            <li>
                                <p className="text-[#686868] flex items-center gap-4">
                                    <span className="w-11 h-11 rounded-full border border-gray-200 flex justify-center items-center text-green-foreground"><FaPhone /></span>  {/* Icône du téléphone */}
                                    <Link to="">+216 56 255 380</Link>  {/* Numéro de téléphone */}
                                </p>
                            </li>
                        </ul>
                    </SlideUp>
                </div>
                <CopyRight />  {/* Affichage du composant de droits d'auteur */}
            </div>
            <ScrollUp />  {/* Affichage du bouton pour remonter la page */}
        </footer>
    );
}

export default Footer;  // Exportation du composant pour l'utiliser dans d'autres parties de l'application

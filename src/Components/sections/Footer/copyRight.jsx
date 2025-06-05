import { cn } from '../../lib/utils';  // Importation de la fonction 'cn' pour la gestion dynamique des classes CSS
import React from 'react';  // Importation de React pour créer le composant
import { Link } from 'react-router-dom';  // Importation de 'Link' de React Router pour la navigation

const CopyRight = ({ color }) => {  // Le composant accepte une prop 'color' pour personnaliser les couleurs
    return (
        <div className="pt-[75px] overflow-x-hidden">  {/* Conteneur principal avec du padding pour l'espacement supérieur */}
            <div className="flex lg:flex-row flex-col justify-between lg:items-center pt-7.5 pb-8 border-t border-t-white border-opacity-20">  {/* Conteneur avec une bordure supérieure */}
                
                {/* Affichage du texte de droit d'auteur avec animation de gauche à droite */}
                <p className={cn('wow fadeInLeft', color)} data-wow-delay=".3s">  
                    © <Link to="#">Yoursitename</Link> 2024 | Tous droits réservés
                </p>
                
                {/* Liste des liens avec une animation de droite à gauche */}
                <ul className="flex items-center gap-7.5 wow fadeInRight" data-wow-delay=".3s">
                    {/* Lien vers les conditions d'utilisation */}
                    <li>
                        <Link to="/terms-and-conditions" className={cn(``, color)}>Conditions d'utilisation</Link>
                    </li>
                    {/* Lien vers la politique de confidentialité */}
                    <li>
                        <Link to="/privacy-policy" className={cn(``, color)}>Politique de confidentialité</Link>
                    </li>
                    {/* Lien vers la page de contact */}
                    <li>
                        <Link to="/contact" className={cn(``, color)}>Contactez-nous</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default CopyRight;  // Exportation du composant pour qu'il puisse être utilisé ailleurs

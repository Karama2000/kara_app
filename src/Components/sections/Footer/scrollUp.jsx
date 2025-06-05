import React, { useEffect } from 'react';  // Importation de React et useEffect pour la gestion des effets secondaires
import { FaArrowUp } from 'react-icons/fa6';  // Importation de l'icône de flèche vers le haut

const ScrollUp = () => {
    useEffect(() => {  // useEffect est utilisé pour exécuter une action après que le composant soit monté
        const scroll_up = document.getElementById("scroll-up");  // Récupère l'élément HTML avec l'ID "scroll-up"
        
        // Ajoute un événement "click" pour faire défiler la page en haut
        scroll_up.addEventListener("click", () => {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });  // Défilement vers le haut avec un comportement fluide
        });
    }, []);  // Le tableau vide [] indique que cet effet s'exécute une seule fois, lors du montage du composant
    
    return (
        <div 
            id="scroll-up"  // L'élément a l'ID "scroll-up" pour être ciblé par le JavaScript
            className="absolute bottom-20 xl:left-[90%] left-1/2 -translate-x-1/2 w-12.5 h-12.5 rounded-full bg-primary text-cream-foreground flex justify-center items-center border-[3px] border-white cursor-pointer"
            // Positionnement absolu pour placer le bouton en bas de la page
            // Des classes Tailwind CSS sont utilisées pour la mise en forme : taille, forme (arrondi), couleurs, bordure, etc.
        >
            <FaArrowUp />  {/* Affiche l'icône de la flèche vers le haut */}
        </div>
    );
}

export default ScrollUp;  // Exportation du composant pour l'utiliser dans d'autres parties de l'application

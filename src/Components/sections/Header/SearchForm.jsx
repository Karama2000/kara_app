import { cn } from '../../lib/utils'; // Importation d'une fonction utilitaire pour conditionner les classes CSS
import React from 'react' // Importation de React pour la création du composant
import { FaXmark } from "react-icons/fa6"; // Importation de l'icône de fermeture

const SearchForm = ({ isSerchActive, setIsSerchActive, className }) => { // Déclaration du composant SearchForm
    return (
        <form action="#" className={cn(`${isSerchActive ? "opacity-100 visible" : "opacity-0 invisible"} transition-all duration-500 z-50 absolute left-0 bottom-0 w-full lg:h-[calc(100%-32%)] md:h-[calc(100%-50%)] h-[calc(100%-0%)]`, className)}>
            {/* Champ de recherche avec transition de visibilité */}
            <input type="text" name="search" id="search" placeholder="Search here" className="w-full h-full border border-gray-400 px-10 rounded-md outline-none" />
            {/* Icône de fermeture pour désactiver le formulaire de recherche */}
            <label htmlFor="search" className="absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setIsSerchActive(false)}>
                <FaXmark className='border-gray-400 text-xl' />
            </label>
        </form>
    )
}

export default SearchForm

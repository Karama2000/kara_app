import React, { useEffect, useState } from 'react' // Importation de React et des hooks useState et useEffect
import { Link, useLocation } from 'react-router-dom' // Importation de Link pour la navigation et useLocation pour obtenir l'URL actuelle
import { FaPlus, FaXmark } from "react-icons/fa6"; // Importation des icônes pour ajouter et fermer le menu
import logo from "../../../Assets/images/logo.png" // Importation du logo de l'application
import { menuList } from '../../lib/fackdata/menuList' // Importation de la liste des menus depuis un fichier de données
import ExtraInfo from './ExtraInfo'; // Importation du composant ExtraInfo pour afficher des informations supplémentaires

const MobileMenu = ({ isMobleMenuActive, setIsMobleMenuActive }) => { // Déclaration du composant MobileMenu avec des props pour gérer l'état du menu
    const [dropdownActive, setDropdownActive] = useState(null) // État pour savoir quel sous-menu est actif
    const {pathname} = useLocation() // Récupération du chemin actuel pour réinitialiser les sous-menus lors du changement de page

    useEffect(() => {
        setDropdownActive(null) // Réinitialisation du sous-menu actif lors du changement de page
        setIsMobleMenuActive(false) // Fermeture du menu mobile lors du changement de page
    }, [pathname]) // Le hook se déclenche à chaque changement de page (pathname)

    return (
        <div className="block xl:hidden"> {/* Le menu est visible uniquement sur les petits écrans */}
            <div className={`fixed left-0 top-0 w-full h-full bg-black/30 transition-all ${isMobleMenuActive ? "visible" : "invisible"}`}></div> {/* Overlay sombre */}
            <nav className={`bg-warm border-l-2 border-l-primary w-full max-w-md min-h-screen h-full overflow-y-auto p-7 shadow-md fixed  ${isMobleMenuActive ? "right-0" : "-right-full"} top-0 z-50 transition-all duration-500`}>
                <div className="flex justify-between items-center">
                    <a href="" className="flex items-center gap-1">
                        <img src={logo} alt="logo" /> {/* Affichage du logo */}
                        <span className="font-bold text-3xl ">KaraScolaire</span> {/* Nom de l'application */}
                    </a>
                    {/* Bouton pour fermer le menu mobile */}
                    <div className="bg-primary w-10 h-10 text-cream-foreground flex items-center justify-center rounded-[4px] left-4" onClick={() => setIsMobleMenuActive(false)}>
                        <FaXmark className="text-xl" />
                    </div>
                </div>

                <ul className="mt-6">
                    {menuList.map(({ dropDownMenu, id, label, path }) => { // Parcours de la liste des menus
                        return (
                            <li key={id} className="leading-[164%] relative w-full dropdown">
                                <Link onClick={() => setDropdownActive(dropdownActive === id ? null : id)} to={path} className="font-jost py-2.5 border-b border-b-slate-300 text-[#385469] flex justify-between items-center">
                                    <span>{label}</span>
                                    {/* Affichage de l'icône plus pour les menus avec sous-menu */}
                                    {dropDownMenu && dropDownMenu.length > 0 && <FaPlus />}
                                </Link>

                                {/* Affichage du sous-menu si présent */}
                                {dropDownMenu && dropDownMenu.length > 0 &&
                                    <ul className={`min-w-56 w-full transition-all duration-500 ${dropdownActive === id ? "max-h-[600px] overflow-auto pt-3 no-scrollbar" : "max-h-0 overflow-hidden"}`}>
                                        {dropDownMenu.map(({ id, label, path }) => {
                                            return (
                                                <li key={id}>
                                                    <Link to={path} className="text-[#385469] font-jost hover:text-secondary-foreground transition-all duration-500 py-2.5 px-6 block border-b border-b-slate-300">{label}</Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                }
                            </li>
                        )
                    })}
                </ul>
                <ExtraInfo /> {/* Affichage des informations supplémentaires (contact, etc.) */}
            </nav>
        </div>
    )
}

export default MobileMenu

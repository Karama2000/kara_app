import React from 'react'; // Importation de React pour créer un composant
import { Link } from 'react-router-dom' // Importation du composant Link pour la navigation
import { Button } from '@/components/ui/button' // Importation du composant Button pour les boutons personnalisés
import Logo from '@/components/ui/logo' // Importation du logo de l'application
import SocalIcons from '@/components/ui/socalIcons' // Importation des icônes sociales
import { FaArrowRight, FaEnvelope, FaLocationDot, FaPhone, FaXmark } from 'react-icons/fa6' // Importation des icônes nécessaires

const SideBar = ({ active, setActive }) => { // Composant Sidebar qui prend 'active' et 'setActive' comme props
    return (
        <div className="xl:block hidden"> {/* Le menu est affiché uniquement sur les écrans larges */}
            {/* Overlay sombre qui couvre l'écran quand le menu est actif */}
            <div className={`fixed left-0 top-0 w-full h-full bg-black/30 transition-all ${active ? "visible" : "invisible"}`} onClick={() => setActive(false)}></div>
            {/* Navigation avec une transition animée pour l'apparition et la disparition */}
            <nav className={`bg-warm border-l-2 border-l-primary w-full max-w-md min-h-screen h-full overflow-y-auto p-7 shadow-md fixed  ${active ? "right-0" : "-right-full"} top-0 z-50 transition-all duration-500`}>
                {/* Section du logo et du bouton de fermeture */}
                <div className="flex justify-between items-center">
                    <Logo /> {/* Affichage du logo */}
                    {/* Bouton pour fermer la sidebar, en changeant l'état 'active' */}
                    <div className="bg-primary w-10 h-10 text-cream-foreground flex items-center justify-center rounded-[4px] left-4 cursor-pointer " onClick={() => setActive(false)}>
                        <FaXmark className="text-xl" /> {/* Icône de fermeture */}
                    </div>
                </div>
                {/* Description ou message d'introduction */}
                <div className="mt-6">
                    <p>Its. sit amet, consectetur adipisicing elit. A rerum sit odit illo ducimus libero, fugiat saepe beatae ut quasi provident necessitatibus esse porro eligendi illum facilis quia.</p>
                </div>

                {/* Section de contact */}
                <div className="mt-5">
                    <div>
                        <h4 className="text-xl font-bold text-[#385469]">Contact Info</h4> {/* Titre de la section */}
                        {/* Liste des informations de contact */}
                        <ul className="mt-5 flex flex-col gap-[15px]">
                            <li className='flex items-center'>
                                <FaPhone className='text-primary-foreground' /> <a href="" className="ml-2.5">(629) 555-0129</a> {/* Icône et numéro de téléphone */}
                            </li>
                            <li className='flex items-center'>
                                <FaEnvelope className='text-primary-foreground' /> <a href="" className="ml-2.5">info@example.com</a> {/* Icône et adresse email */}
                            </li>
                            <li className='flex items-center'>
                                <FaLocationDot className='text-primary-foreground' /> <span className="ml-2.5">6391 Elgin St. Celina, 10299</span> {/* Icône et adresse physique */}
                            </li>
                        </ul>
                    </div>
                    {/* Bouton pour rediriger vers la page de contact */}
                    <div className="mt-5">
                        <Button asChild className="text-cream-foreground w-full">
                            <Link to={"/contact"}>Get A Quote <FaArrowRight /> </Link> {/* Lien vers la page de contact */}
                        </Button>
                    </div>
                    {/* Icônes sociales */}
                    <SocalIcons prentClass={"mt-6"} className={"w-11 h-11 text-muted-foreground bg-background hover:text-cream-foreground"} />
                </div>

            </nav>
        </div>
    )
}

export default SideBar

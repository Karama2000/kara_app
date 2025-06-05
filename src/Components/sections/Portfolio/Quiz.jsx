import React from 'react';  // Importation de React pour créer un composant
import quiz_1 from "../../../Assets/images/portfolio/Quiz/quiz1.jpeg";  // Importation des images du portfolio
import portfolio_2 from "../../../Assets/images/portfolio/JeuEduc/Quiz/quiz1.avif";  
import portfolio_3 from "../../../Assets/images/portfolio/JeuEduc/Quiz/quiz2.avif"
import portfolio_5 from "../../../Assets/images/portfolio/JeuEduc/Quiz/quiz3.avif";  
import portfolio_6 from "../../../Assets/images/portfolio/JeuEduc/Quiz/quiz4.jpg";  

const CardOne = ({ data_target }) => {  // Le composant accepte une prop 'data_target' qui détermine les cartes à afficher
    return (
        <div className={`grid lg:gap-7.5 gap-4 grid-cols-12 grid-rows-[277px] top-0 left-0 transition-all duration-500  ${(data_target === "quiz" ) ? "relative translate-y-0 visible opacity-100" : "absolute translate-y-10 invisible opacity-0"}`}>
            {/* Grille pour afficher les cartes en ligne avec des espacements et une animation de transition */}
            
            {/* Première carte */}
            <div className="sm:col-start-1 md:col-end-5 sm:col-end-7 col-span-full sm:row-span-2 relative group/card">
                <img src={quiz_1} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />  {/* Image de la carte */}
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-[calc(100%-60px)] bg-primary rounded-[10px] flex flex-col items-center justify-center opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500">
                    {/* Conteneur avec animation d'apparition au survol */}
                    <h5 className="text-center text-cream-foreground text-2xl font-medium">KaraLearn</h5>  {/* Titre en français */}
                    <p className="text-cream-foreground">L'éducation de l'avenir</p>  {/* Description */}
                </div>
            </div>

            {/* Deuxième carte */}
            <div className="md:col-start-5 md:col-end-10 sm:col-start-7 sm:col-end-13 col-span-full relative group/card">
                <img src={portfolio_2} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-[calc(100%-60px)] bg-primary rounded-[10px] flex flex-col items-center justify-center opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500">
                    <h5 className="text-center text-cream-foreground text-2xl font-medium">KaraLearn</h5>
                    <p className="text-cream-foreground">Education de qualité</p>
                </div>
            </div>

            {/* Troisième carte */}
            <div className="md:col-start-10 sm:col-start-7 sm:col-end-13 col-span-full relative group/card">
                <img src={portfolio_3} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-[calc(100%-60px)] bg-primary rounded-[10px] flex flex-col items-center justify-center opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500">
                    <h5 className="text-center text-cream-foreground text-2xl font-medium">KaraLearn</h5>
                    <p className="text-cream-foreground">Rêve de l'éducation</p>
                </div>
            </div>

            {/* Quatrième carte */}
            <div className="md:col-start-5 md:col-end-9 sm:col-start-1 sm:col-end-7 col-span-full relative group/card">
                <img src={portfolio_5} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-[calc(100%-60px)] bg-primary rounded-[10px] flex flex-col items-center justify-center opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500">
                    <h5 className="text-center text-cream-foreground text-2xl font-medium">KaraLearn</h5>
                    <p className="text-cream-foreground">Une éducation en fete</p>
                </div>
            </div>

            {/* Cinquième carte */}
            <div className="md:col-start-9 sm:col-span-6 sm:col-end-13 col-span-full relative group/card">
                <img src={portfolio_6} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-[calc(100%-60px)] bg-primary rounded-[10px] flex flex-col items-center justify-center opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500">
                    <h5 className="text-center text-cream-foreground text-2xl font-medium">KaraLearn</h5>
                    <p className="text-cream-foreground">La bonne éducation</p>
                </div>
            </div>

        </div>
    );
}

export default CardOne;  // Exportation du composant pour l'utiliser dans d'autres parties de l'application

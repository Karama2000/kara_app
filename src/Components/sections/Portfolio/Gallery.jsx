import SectionName from '../../ui/sectionName';
import Title from '../../ui/title';
import React, { useState } from 'react';
import CardOne from './Quiz';
import CardTwo from './Vocabulaire';
import CardThree from './JeuxEduc';
import CardFour from './Test';
import CardFive from './Leçons';
import SlideUp from '../../lib/animations/slideUp';

const categoryList = [
    {
        id: 1,
        label: "Vocabulaire",
        data_target: "vocabulaire"
    },
    {
        id: 2,
        label: "Quiz",
        data_target: "quiz"
    },
    {
        id: 3,
        label: "Leçons",
        data_target: "leçons"
    },
    {
        id: 4,
        label: "Jeux éducatifs",
        data_target: "jeu éducatifs"
    },
    {
        id: 5,
        label: "Test",
        data_target: "test"
    },
];

const Gallery = () => {
    const [activeTab, setActiveTab] = useState("quiz");

    return (
        <section className="lg:pt-15 lg:pb-15 pt-10 pb-10 portfolio">
            <div className="container">
                <div className="text-center flex flex-col items-center">
                    <SectionName>Derniers Projets</SectionName>
                    <Title size={"3.5xl"} className={"lg:max-w-[630px]"}>karaScolaire - Apprentissage interactif pour un avenir brillant</Title>
                </div>

                <div className="pt-10">
                    <ul className="flex items-center justify-center flex-wrap md:gap-7.5 gap-5">
                        {
                            categoryList.map(({ data_target, id, label }) => {
                                return (
                                    <li 
                                        key={id} 
                                        onClick={() => setActiveTab(data_target)}
                                        className={`px-5 py-2.5 text-xl font-700 border border-[#F2F2F2] rounded-[10px] font-jost cursor-pointer hover:bg-primary hover:text-cream-foreground transition-all duration-500 ${activeTab === data_target ? "bg-primary text-cream-foreground" : ""}`}
                                    >
                                        {label}
                                    </li>
                                )
                            })
                        }
                    </ul>

                    <SlideUp>
                        <div className="mt-[64px] overflow-hidden relative">
                            <CardOne data_target={activeTab} />
                            <CardTwo data_target={activeTab} />
                            <CardThree data_target={activeTab} />
                            <CardFour data_target={activeTab} />
                            <CardFive data_target={activeTab} />
                        </div>
                    </SlideUp>
                </div>
            </div>
        </section>
    );
}

export default Gallery;
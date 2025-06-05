import React from 'react';
import studentImg from "../../../Assets/images/newsletter/student.avif";
import eggShape from "../../../Assets/images/shapes/egg-shap.png";
import { Button } from '../../ui/button';
import { FaArrowRight } from "react-icons/fa6";
import Input from '../../ui/input';
import Title from '../../ui/title';
import SectionName from '../../ui/sectionName';

const NewsletterOne = () => {
    return (
        <section className="bg-[linear-gradient(180deg,_rgba(238,255,200,0.00)_0%,_#E9FFB6_100%)] overflow-x-hidden">
            <div className="bg-bottom bg-no-repeat bg-contain bg-newsletter-banner">
                <div className="container">
                    <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-7.5">
                        <div className="max-w-[598px] w-full order-1 lg:order-0 animate-left-right">
                            <div style={{ backgroundImage: `url(${eggShape})` }} className="bg-no-repeat bg-bottom bg-contain">
                                <img src={studentImg} alt="étudiant" className="mx-auto w-[410px] h-[602px]" />
                            </div>
                        </div>
                        <div className="lg:max-w-[530px] order-0 lg:order-1">
                            <SectionName className={'text-muted-foreground'}>Restez Connecté</SectionName>
                            <Title size={"3.5xl"}>Éducation qui stimule l'imagination et nourrit la curiosité</Title>
                            <div className="relative lg:mt-10 mt-5">
                                <Input type={"email"} placeholder="Entrez votre email" />
                                <Button className="absolute right-[10px] top-1/2 -translate-y-1/2 text-cream-foreground">
                                    S'inscrire <FaArrowRight />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterOne;
import React from 'react'
import { Link } from 'react-router-dom'
import Title from '../ui/title'
import about_img_1 from "../../Assets/images/about/about-1.avif"
import icreement from "../../Assets/images/about/icreement.png"
import shap_1 from "../../Assets/images/about/shap-1.png"
import customer from "../../Assets/images/about/customer.png"
import { Button } from '../ui/button'
import SectionName from '../ui/sectionName'
import { cn } from '../lib/utils'
import SlideUp from '../lib/animations/slideUp'
import SectionDescription from '../ui/sectionDescription'

const About = ({ gridClass, isAboutpage }) => {
    return (
        <section className="lg:pt-15 pt-10 lg:pb-15 pb-10">
            <div className="container">
                <div className={cn("grid lg:grid-cols-[60%_40%] grid-cols-1 items-center", gridClass)}>
                    <div className="relative">
                        <div className="flex sm:flex-row flex-col sm:items-end gap-6">
                            <SlideUp>
                                <div className="relative">
                                    <div>
                                        <img src={shap_1} alt="shap" />
                                    </div>
                                    <div className="ml-9">
                                        <img src={about_img_1} alt="about-bg" className="w-[320px] h-[414px]" />
                                    </div>
                                    <div className="absolute -bottom-12.5 left-0 bg-primary rounded-[10px] py-4 px-[22px] flex items-center gap-3">
                                        <div className="bg-background w-11 h-11 rounded-full flex justify-center items-center">
                                            <img src={customer} alt="customer" />
                                        </div>
                                        <div>
                                            <h6 className="text-cream-foreground font-bold text-2xl">5 000+</h6>
                                            <p className="text-cream-foreground">Clients satisfaits</p>
                                        </div>
                                    </div>
                                </div>
                            </SlideUp>
                            <div className="flex sm:flex-col gap-8">
                                <div className="bg-warm max-w-[212px] rounded-[11px] px-5 pt-[22px] pb-6 flex flex-col items-center justify-center text-center">
                                    <img src={icreement} alt="Accréditation karaScolaire" />
                                    <h6 className="text-xl font-bold">karaScolaire</h6>
                                    <p>Apprentissage personnalisé pour chaque élève</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${isAboutpage ? "" : "lg:max-w-[439px]"} pt-7.5`}>
                        <SectionName>À propos de nous</SectionName>
                        <Title size={"3.5xl"} className={"pb-5"}>Libérer le potentiel, un élève à la fois</Title>
                        <SectionDescription>
                            karaScolaire est une plateforme éducative innovante qui permet un apprentissage personnalisé pour chaque élève. Nos outils interactifs et multimédias offrent une expérience d'apprentissage engageante et dynamique. Grâce à nos ressources éducatives, les élèves peuvent progresser à leur propre rythme, renforcer leur autonomie et mieux mémoriser les informations.
                        </SectionDescription>
                        <div className='lg:mt-10 mt-7'>
                            <Button asChild variant="outline">
                                <Link to="/aboutus">Obtenir un devis</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
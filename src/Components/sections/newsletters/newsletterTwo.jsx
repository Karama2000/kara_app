import React from 'react'
import stay_thumb from "../../../Assets/images/newsletter/student.avif"
import stay_shape from "../../../Assets/images/newsletter/stay-shape.png"
import { Button } from '../../ui/button'
import Title from '../../ui/title'
import SectionName from '../../ui/sectionName'
import SectionDescription from '../../ui/sectionDescription'
import { Link } from 'react-router-dom'

const NewsletterTwo = () => {
    return (
        <section className="lg:pt-15 pt-10 ">
            <div className="bg-warm py-12.5 relative z-[1]">
                <div className="container">
                    <div className="flex md:flex-row flex-col justify-between items-center gap-10">
                        <div className="lg:max-w-[573px] max-w-[400px]">
                            <SectionName className={"text-muted-foreground"}>Restez avec karaScolaire</SectionName>
                            <Title size={"3.5xl"} className={"mt-2.5 max-w-[410px]"}>Le chemin vers la réussite passe par l’apprentissage du français</Title>
                            <SectionDescription className={"mt-5"}>Découvrez une plateforme éducative intuitive où les élèves apprennent le français de manière ludique et personnalisée, guidés par Karama Mighri, Professeur des Écoles Primaires.</SectionDescription>
                            <div className="mt-9">
                                <Button variant="pill" className="bg-primary border-primary hover:text-primary-foreground" asChild>
                                    <Link to={"/aboutus"} className="btn-rounded-full">En savoir plus</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <img src={stay_thumb} alt="élève-karascolaire" className='w-[289px] h-[321px]'/>
                        </div>
                    </div>
                </div>
                <div className="absolute left-0 bottom-0 z-[-1]">
                    <img src={stay_shape} alt="forme-stay" />
                </div>
            </div>
        </section>
    )
}

export default NewsletterTwo
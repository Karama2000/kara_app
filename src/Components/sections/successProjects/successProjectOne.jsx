import React from 'react'
import SectionName from '../../ui/sectionName'
import Title from '../../ui/title'
import { Button } from '../../ui/button'
import { Link } from 'react-router-dom'
import Kindergarden from '../../../Assets/icons/kindergarden'
import Book from '../../../Assets/icons/book'
import Blocks from '../../../Assets/icons/blocks'
import Chalkboard from '../../../Assets/icons/chalkboard'
import CardOne from './cardOne'
import SectionDescription from '../../ui/sectionDescription'

const SuccessProjectOne = () => {
    return (
        <section className="lg:pt-15 pt-10 lg:pb-15 pb-10">
            <div className="container">
                <div className="grid xl:grid-cols-2 lg:grid-cols-[40%_auto] grid-cols-1 gap-7.5">
                    <div className="lg:max-w-[600px]">
                        <SectionName className={"text-primary-foreground"}>Discussions Numériques</SectionName>
                        <Title size={"3.5xl"} className={"lg:max-w-[410px] pb-5"}>Investir dans l'éducation, c'est investir dans l'avenir</Title>
                        <SectionDescription>karaScolaire offre des outils interactifs pour stimuler la curiosité et l'engagement des élèves. Nos ressources pédagogiques favorisent un apprentissage personnalisé, renforçant la confiance et la réussite scolaire.</SectionDescription>
                        <Button asChild variant="outline" className="mt-10">
                            <Link to={"/contact"}>Obtenir un devis</Link>
                        </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-7.5">
                        <CardOne icon={<Kindergarden />} color={"bg-primary"} number={"20k"} title={"Élèves Actifs"} />
                        <CardOne icon={<Book />} color={"bg-destructive"} number={"12K"} title={"Cours Terminés"} />
                        <CardOne icon={<Blocks />} color={"bg-green"} number={"3K"} title={"Récompenses Obtenues"} />
                        <CardOne icon={<Chalkboard />} color={"bg-secondary"} number={"23K"} title={"Satisfaction des Parents"} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SuccessProjectOne
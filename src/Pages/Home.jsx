import React from 'react'
import { Helmet } from 'react-helmet'
import { ScrollRestoration } from 'react-router-dom'

import HeroOne from '../Components/sections/heros/heroOne'
import AboutOne from '../Components/sections/About'
import ServicesOne from '../Components/sections/services/servicesOne'
import Gallery from '../Components/sections/Portfolio/Gallery'
import Programs from '../Components/sections/programs'
import FaqComp from '../Components/sections/faqComp'
import Teams from '../Components/sections/teams/teams'
import Testimonial from '../Components/sections/testimonial'
import NewsletterOne from '../Components/sections/newsletters/newsletterOne'
import SuccessProjectOne from '../Components/sections/successProjects/successProjectOne'
import AgeOne from '../Components/sections/studentsAge/ageOne'

const Home = () => {
  return (
    <>
      <Helmet>
        <title>KaraScolaire -Une plateforme éducative innovante</title>
        <meta name="description" content="KaraScolaire -Une plateforme éducative innovante" />
      </Helmet>
      <main>
        <HeroOne />
        <SuccessProjectOne />
        <AboutOne isAboutpage={false} />
        <Programs />
        <Gallery />
        <ServicesOne />
        <FaqComp />
        <Teams />
        <AgeOne />
        <Testimonial />
        <NewsletterOne />
      </main>
      <ScrollRestoration/>
    </>
  )
}

export default Home
import React from 'react'
import { Helmet } from 'react-helmet'
import { ScrollRestoration } from 'react-router-dom'
import About from '../Components/sections/About'
import PageTitle from '../Components/sections/pageTitle'
import Testimonial from '../Components/sections/testimonial'
import NewsletterTwo from '../Components/sections/newsletters/newsletterTwo'

const AboutUs = () => {

  return (
    <>
      <Helmet>
        <title>KaraScolaire</title>
        <meta name="description" content="KaraScolaire: Une plateforme éducative innovante" />
      </Helmet>
      <main>
        <PageTitle pageName={"À propos"} breadcrumbCurrent={"À propos"} />
        <About gridClass={"lg:grid-cols-2"} isAboutpage={true} />
        <Testimonial />
        <NewsletterTwo />
      </main>
      <ScrollRestoration/>
    </>
  )
}

export default AboutUs
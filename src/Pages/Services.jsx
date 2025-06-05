import React from 'react'
import { Helmet } from 'react-helmet'
import { ScrollRestoration } from 'react-router-dom'
import ServicesTwo from '../Components/sections/services/servicesTwo'
import NewsletterTwo from '../Components/sections/newsletters/newsletterTwo'
import PageTitle from '../Components/sections/pageTitle'

const Services = () => {
  return (
    <>
      <Helmet>
        <title> KaraScolaire -Une plateforme éducative innovante</title>
        <meta name="description" content="KaraScolaire -Une plateforme éducative innovante" />
      </Helmet>
      <main>
        <PageTitle pageName={"Services"} breadcrumbCurrent={"Services"} />
        <ServicesTwo />
        <NewsletterTwo />
      </main>
      <ScrollRestoration/>
    </>
  )
}

export default Services
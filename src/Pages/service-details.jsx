import React from 'react'
import { Helmet } from 'react-helmet'
import { ScrollRestoration } from 'react-router-dom'
import NewsletterTwo from '../Components/sections/newsletters/newsletterTwo'
import PageTitle from '../Components/sections/pageTitle'
import ServiceArtical from '../Components/sections/services/serviceArtical'

const ServiceDetails = () => {
  return (
    <>
      <Helmet>
        <title>KaraScolaire -Une plateforme éducative innovante</title>
        <meta name="description" content="Ascent - Chindcare & Kids School React.js and Tailwind CSS Template" />
      </Helmet>
      <main>
        <PageTitle pageName={"Service Details"} breadcrumbCurrent={"Service Details"} />
        <ServiceArtical />
        <NewsletterTwo />
      </main>
      <ScrollRestoration />
    </>
  )
}

export default ServiceDetails
import React from 'react'
import { Helmet } from 'react-helmet'
import { ScrollRestoration } from 'react-router-dom'
import ContactAddress from '../Components/sections/contactAddress'
import GoogleMap from '../Components/sections/googleMap'
import NewsletterTwo from '../Components/sections/newsletters/newsletterTwo'
import PageTitle from '../Components/sections/pageTitle'
import ContactForm from '../Components/sections/contactForm'

const ContactUs = () => {
  return (
    <>
      <Helmet>
        <title>Karascolaire</title>
        <meta name="description" content="KaraScolaire: Une plateforme éducative innovante" />
      </Helmet>
      <main>
        <PageTitle pageName={"Contactez nous"} breadcrumbCurrent={"Contactez nous"} />
        <ContactAddress />
        <GoogleMap />
        <ContactForm />
        <NewsletterTwo />
      </main>
      <ScrollRestoration/>
    </>
  )
}

export default ContactUs
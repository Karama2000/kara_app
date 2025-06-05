import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderOne from '@/components/sections/Header/Header'
import FooterTwo from '@/components/sections/footers/footerTwo'

const LayoutThree = () => {
  return (
    <>
      <HeaderOne />
      <Outlet/>
      <FooterTwo/>
    </>
  )
}

export default LayoutThree
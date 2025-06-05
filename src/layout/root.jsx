import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderOne from '../Components/sections/Header/Header'
import FooterOne from '../Components/sections/Footer/footer'

const RootLayout = () => {

    return (
        <>
            <HeaderOne />
            <Outlet />
            <FooterOne />
        </>
    )
}

export default RootLayout
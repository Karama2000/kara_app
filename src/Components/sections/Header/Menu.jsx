import React from 'react'
import { Link } from 'react-router-dom'
import { FaAngleDown, FaUser, FaUserPlus } from "react-icons/fa6";
import { menuList } from '../../lib/fackdata/menuList'
import { Button } from '../../ui/button'

const Menu = () => {
    return (
        <nav className="xl:block hidden">
            <ul className="flex items-center gap-[25px]">
                {
                    menuList.map(({ dropDownMenu, id, label, path }) => {
                        // Check if the item is "Connexion" or "Inscription" to render as a button
                        if (label === "Connexion" || label === "Inscription") {
                            return (
                                <li key={id} className="leading-[164%]">
                                    <Button 
                                        asChild 
                                        variant={label === "Connexion" ? "primary" : "secondary"} 
                                        className="font-semibold text-lg font-jost flex items-center gap-1 py-5 px-4"
                                    >
                                        <Link to={path}>
                                            {label === "Connexion" && <FaUser className="text-sm mr-1" />}
                                            {label === "Inscription" && <FaUserPlus className="text-sm mr-1" />}
                                            {label}
                                        </Link>
                                    </Button>
                                </li>
                            )
                        }

                        // Render other menu items as links
                        return (
                            <li key={id} className="leading-[164%] relative group">
                                <Link to={path} className="font-semibold text-lg font-jost group-hover:text-primary-foreground transition-all duration-500 py-5 flex items-center gap-1">
                                    {label}
                                    {dropDownMenu && dropDownMenu.length > 0 && <FaAngleDown className='text-sm' />}
                                </Link>

                                {dropDownMenu && dropDownMenu.length > 0 && (
                                    <ul className="absolute top-full z-10 bg-background shadow-sm min-w-56 transition-all duration-500 opacity-0 invisible translate-y-5 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                                        {dropDownMenu.map(({ id, label, path }) => (
                                            <li key={id}>
                                                <Link to={path} className="font-semibold font-jost hover:text-cream-foreground hover:bg-primary transition-all duration-500 py-3 px-2.5 block border-b border-b-slate-300">{label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )
                    })
                }
            </ul>
        </nav>
    )
}

export default Menu
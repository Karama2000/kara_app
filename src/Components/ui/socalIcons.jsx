import React from 'react'
import { FaFacebookF, FaXTwitter, FaLinkedin, FaPinterestP } from "react-icons/fa6";
import { cn } from '../lib/utils';

const icons = [
    {
        id: 1,
        link: "https://www.facebook.com/karama.mighri.2025/",
        icon: <FaFacebookF />
    },
    {
        id: 2,
        link: "https://x.com/KMighry",
        icon: <FaXTwitter />
    },
    {
        id: 3,
        link: "https://www.linkedin.com/in/karama-mighri-77527624a/",
        icon: <FaLinkedin />
    },
    {
        id: 4,
        link: "https://fr.pinterest.com/karamamighry/",
        icon: <FaPinterestP />
    },
]

const SocalIcons = ({className, prentClass}) => {
    return (
        <ul className={cn("flex items-center gap-[14px]", prentClass)}>
            {
                icons.map(({ icon, id, link }) => {
                    return (
                        <li key={id}>
                            <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={cn('rounded-md w-6 h-6 flex items-center justify-center border border-white border-opacity-20 text-cream-foreground hover:bg-primary transition-all duration-500', className)}
                            >
                                {icon}
                            </a>
                        </li>
                    )
                })
            }
        </ul>
    )
}

export default SocalIcons
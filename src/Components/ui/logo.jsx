import React from 'react'
import { Link } from 'react-router-dom'
import logo from "../../Assets/logo.png"
import { cn } from '../lib/utils'

const Logo = ({ className, logoSize = "h-15" }) => {  // Ajout d'une prop logoSize avec valeur par défaut
  return (
    <Link to="/" className="flex items-center gap-1">
      <img 
        src={logo} 
        alt="Logo KaraScolaire" 
        className={cn("object-contain", logoSize)}  // Utilisation de la prop logoSize
      />
      <span className={cn("font-bold text-3xl", className)}>KaraScolaire</span>
    </Link>
  )
}

export default Logo
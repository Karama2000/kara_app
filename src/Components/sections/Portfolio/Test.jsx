import React from 'react'
import portfolio_1 from "../../../Assets/images/portfolio/Test/test1.avif"
import portfolio_2 from "../../../Assets/images/portfolio/Test/test2.avif"
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

const CardFour = ({data_target}) => {
    return (
        <div className={`grid lg:gap-7.5 gap-4 grid-cols-12 sm:grid-rows-[453px] top-0 left-0 transition-all duration-500 ${data_target === "test" ? "relative translate-y-0 visible opacity-100" : "absolute translate-y-10 invisible opacity-0"}`}>

            <div className="sm:col-start-1 sm:col-end-8 col-span-full relative group/card max-h-[453px]">
                <img src={portfolio_1} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[calc(100%-60px)] w-[calc(100%-60px)] opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500 bg-primary rounded-[10px] flex flex-col items-center justify-center">
                    <h5 className="text-center"><Link to={"/aboutus"} className="text-cream-foreground text-2xl font-medium">Exploring Minds Elementary  Best School</Link></h5>
                    <p className="text-cream-foreground">Dreamland Elementary</p>
                    <Link to={"/aboutus"} className="bg-background w-11 h-11 rounded-full flex justify-center items-center cursor-pointer absolute -bottom-5 left-1/2 -translate-x-1/2 overflow-hidden group">
                        <FaArrowRight className='text-destructive-foreground' />
                    </Link>
                </div>
            </div>


            <div className="sm:col-start-8 sm:col-end-13 col-span-full relative group/card max-h-[453px]">
                <img src={portfolio_2} alt="img" className="w-full h-full max-h-[300px] sm:max-h-full object-cover rounded-[10px]" />
                <div className="px-7.5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[calc(100%-60px)] w-[calc(100%-60px)] opacity-0 invisible group-hover/card:visible group-hover/card:opacity-80 transition-all duration-500 bg-primary rounded-[10px] flex flex-col items-center justify-center">
                    <h5 className="text-center"><Link to={"/aboutus"} className="text-cream-foreground text-2xl font-medium">Exploring Minds Elementary  Best School</Link></h5>
                    <p className="text-cream-foreground">Dreamland Elementary</p>
                    <Link to={"/aboutus"} className="bg-background w-11 h-11 rounded-full flex justify-center items-center cursor-pointer absolute -bottom-5 left-1/2 -translate-x-1/2 overflow-hidden group">
                        <FaArrowRight className='text-destructive-foreground' />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CardFour
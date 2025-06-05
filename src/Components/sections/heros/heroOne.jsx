import React from 'react'
import { Button } from '../../ui/button'
import boy_img_1 from "../../../Assets/images/banner/painting.jpg"
import boy_img_2 from "../../../Assets/images/banner/boy_img_2.jpg"
import painting from "../../../Assets/images/banner/painting.png"
import left_circle_1 from "../../../Assets/images/banner/left-circle-1.png"
import left_circle_2 from "../../../Assets/images/banner/left-circle-2.png"
import right_circle from "../../../Assets/images/banner/right-circle.png"
import shap from "../../../Assets/images/shapes/shap.png"
import { Link } from 'react-router-dom'
import ThreeLine from '../../../Assets/icons/threeLine'
import Title from '../../ui/title'

const HeroOne = () => {
  return (
    <section className="bg-warm pt-[78px] lg:mb-15 mb-10 relative">
      <div className="container relative">
        <div className="flex flex-col items-center text-center relative z-10">
          <Title size={"7.5xl"} className={"font-normal max-w-[776px]"}>
            <span className="relative">Éveillez les esprits avec <span className="absolute -left-6 top-1 text-3xl text-[#0A6375]"><ThreeLine /></span></span>
             <span className="font-bold text-destructive-foreground">karaScolaire</span>
          </Title>

          <div className="flex absolute right-[87px] top-14 animate-skw">
            <img src={shap} alt="shap-2" className="w-7.5 h-12.5 relative top-9" />
            <img src={shap} alt="shap-1" />
            <img src={shap} alt="shap-2" className="w-5 h-8 -mt-7" />
          </div>

          <p className="pt-5 max-w-[431px]">Découvrez une plateforme dynamique conçue pour stimuler la curiosité et favoriser un apprentissage interactif pour les élèves.</p>
          <div className="mt-6">
            <Button asChild variant={"secondary"} >
              <Link to="/aboutus">En savoir plus</Link>
            </Button>
          </div>
        </div>
        <div className="absolute left-2.5 lg:top-0 top-10 sm:block hidden animate-up-down">
          <img 
            src={boy_img_1} 
            alt="banner-img-1" 
            className="w-[260px] h-[365px] object-cover rounded-[125px]" 
          />
          <span className="absolute -left-2.5 top-[9px] border-2 border-primary rounded-[125px] w-full h-full"></span>
        </div>

        <div className="absolute right-0 bottom-0 pb-[71px] lg:block hidden animate-up-down">
          <img 
            src={boy_img_2} 
            alt="banner-img-2" 
            className="w-[260px] h-[365px] object-cover rounded-[125px]" 
          />
          <span className="absolute -left-2.5 top-[9px] border-2 border-secondary rounded-[125px] max-h-[369px] w-full h-full"></span>
        </div>

        <div className="lg:pt-[72px]">
        </div>
      </div>
      {/* <!-- circle shap --> */}
      <div className="lg:block hidden">
        <div className="absolute left-0 top-[60px] animate-left-right-2">
          <img src={left_circle_1} alt="img" />
        </div>
        <div className="absolute left-[37px] top-[186px] animate-left-right-2">
          <img src={left_circle_2} alt="img" />
        </div>
        <div className="absolute right-0 bottom-[165px] animate-up-down">
          <img src={right_circle} alt="img" />
        </div>
      </div>
      {/* <!-- circle shap --> */}
    </section>
  )
}

export default HeroOne
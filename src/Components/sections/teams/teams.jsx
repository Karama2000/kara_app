import SectionName from '../../ui/sectionName'
import Title from '../../ui/title'
import { teamData } from '../../lib/fackdata/teamData'
import React from 'react'
import TeamCard from './teamCard'

const Teams = () => {
  return (
    <section className="lg:pt-15 lg:pb-15 pt-10 pb-10">
      <div className="container">
        <div className="text-center flex flex-col items-center">
          <SectionName>Rencontrez Nos Experts</SectionName>
          <Title size={"3.5xl"} className={"lg:max-w-[520px]"}>Voyages éducatifs joyeux avec KaraScolaire</Title>
        </div>
        <div className="lg:pt-15 pt-10">
          <div className="flex justify-center">
            {teamData.map(({id, name, position, src}) => <TeamCard key={id} name={name} position={position} src={src} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Teams
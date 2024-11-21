import React from 'react'
import './Top.css'
import hero_image from '../Assets/bannerhome.png'

const Top = () => {
  return (
    <div className='top'>
        <div className="img">
            <img src={hero_image} alt="" />
        </div>
    </div>
  )
}

export default Top
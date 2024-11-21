import React from 'react'
import './Footer.css'
import bg from '../Assets/bg.png'
import fb from '../Assets/fb.png'
import ig from '../Assets/ig.png'
import viber from '../Assets/viber.png'
const Footer = () => {
  return (
    <div className='footer'>
       <div className="footer-logo">
            <img src={bg} alt="" />
        </div> 
        <div className="footer-social-icon">
            <div className="footer-icon-container">
                <img src={fb} alt="" />
            </div>
            <div className="footer-icon-container">
                <img src={ig} alt="" />
            </div><div className="footer-icon-container">
                <img src={viber} alt="" />
            </div>
        </div>
        <div className="footer-copyright">
            <hr />
            <p>Copyright @ 2024 - All Right Reserved.</p>
        </div>
    </div>
   
  )
}

export default Footer
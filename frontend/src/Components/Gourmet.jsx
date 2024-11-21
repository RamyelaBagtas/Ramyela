import React from 'react'
import Sgourmet from './Sdriedfish/Sgourmet'
import BSgourmet from './BSdriedfish/BSgourmet'
import RSgourmet from './RSdriedfish/RSgourmet'
import EXgourmet from './EXdriedfish/EXgourmet'
import Navbar from './Navbar/Navbar'
import Footer from './Footer/Footer'

const Gourmet = () => {
  return (
    <div>
      <Navbar/>
        <Sgourmet/>
        <BSgourmet/>
        <RSgourmet/>
        <EXgourmet/>
        <Footer/>
    </div>
  )
}

export default Gourmet
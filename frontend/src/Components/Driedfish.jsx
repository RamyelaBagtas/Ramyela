import React from 'react'
import RSdriedfish from './RSdriedfish/RSdriedfish'
import Navbar from './Navbar/Navbar'
import Sdriedfish from './Sdriedfish/Sdriedfish'
import EXdriedfish from './EXdriedfish/EXdriefish'
import BSdriedfish from './BSdriedfish/BSdriedfish'
import Footer from './Footer/Footer'

const Driedfish = () => {
  return (
    <div>
        <Navbar/>
        <Sdriedfish/>
        <BSdriedfish/>
        <RSdriedfish/>
        <EXdriedfish/>
        <Footer/>
    </div>
  )
}

export default Driedfish
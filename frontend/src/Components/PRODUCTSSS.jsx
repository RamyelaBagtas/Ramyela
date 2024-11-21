import React from 'react'
import BSproducts from './BSproducts/BSproducts'
import RSproducts from './RSproducts/RSproducts'
import EXproducts from './EXproducts/EXproducts'
import Sproducts from './Sproducts/Sproducts'
import Navbar from './Navbar/Navbar'
import Footer from './Footer/Footer'
import Top from './Top/Top'
import Nearby from './Nearby/Nearby'

const PRODUCTSSS = () => {
  return (
    <div>
      <Navbar/>
      <Top/>
      <Nearby/>
      <BSproducts/>
      <RSproducts/>
      <Footer/>
    </div>
  )
}

export default PRODUCTSSS
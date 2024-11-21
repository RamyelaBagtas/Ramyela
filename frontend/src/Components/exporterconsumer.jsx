import React from 'react'
import Top from './Top/Top'
import Nearby from './Nearby/Nearby'
import Navbar from './Navbar/Navbar'

const exporterconsumer = () => {
  return (
    <div>
        <Top/>
        <Nearby/>
        <Navbar/>
    </div>
  )
}

export default exporterconsumer
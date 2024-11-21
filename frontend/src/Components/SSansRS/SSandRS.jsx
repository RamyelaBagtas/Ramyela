import React from 'react'
import SupplierNearby from '../SupplierNearby/SupplierNearby'
import Top from '../Top/Top';
import RSSSnavbar from '../RSSSnavbar/RSSSnavbar';
import ForSeller from '../RSproducts/ForSeller';

const SSandRS = () => {
  return (
    <div>
      <RSSSnavbar/>
      <Top/>
      <SupplierNearby/>
      <ForSeller/>
    </div>
  )
}

export default SSandRS
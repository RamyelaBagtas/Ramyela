import React from 'react'
import Top from './Top/Top'
import Exportermapping from './Exportermapping/Exportermapping'
import Exporternavbar from './Exporternavbar/Exporternavbar'
import ExporterBSproducts from './BSproducts/ExporterBSproducts'
import ExporterRSproducts from './RSproducts/ExporterRSproducts'
import SupplierRSproducts from './RSproducts/SupplierRSproducts'

const Exporter = () => {
  return (
    <div>
      <Exporternavbar/>
      <Top/>
      <Exportermapping/>
      <SupplierRSproducts/>
      <ExporterBSproducts/>
      <ExporterRSproducts/>
    </div>
  )
}

export default Exporter
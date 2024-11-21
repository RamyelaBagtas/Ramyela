import React from 'react';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import './SupplierHome.css';

// Import your images
import productionImage from '../Assets/factory.png';
import fishImage from '../Assets/fish.png';
import orderImage from '../Assets/order-fulfillment.png';
import salesImage from '../Assets/profit-growth.png';
import inventoryImage from '../Assets/warehouse.png';
import wallpaperImage from '../Assets/wallpaperq.jpg'; // Add your wallpaper image here
import SupplierNavbar from '../ElseNavbar/SupplierNavbar';

const SupplierHome = () => {
  const navigate = useNavigate();

  return (
    <div>
      <SupplierNavbar />
      <div
        className="background-container"
        style={{ backgroundImage: `url(${wallpaperImage})` }}
      >
        <div className="button-container">
          <button className="management-button" onClick={() => navigate('/productionmanagement')}>
            <img src={productionImage} alt="Production Management" className="button-icon" />
            Production Management
          </button>
          <button className="management-button" onClick={() => navigate('/productmanagement')}>
            <img src={fishImage} alt="Products" className="button-icon" />
            Products
          </button>
          <button className="management-button" onClick={() => navigate('/supplierorders')}>
            <img src={orderImage} alt="Order Management" className="button-icon" />
            Orders
          </button>
          <button className="management-button" onClick={() => navigate('/salesmanagement')}>
            <img src={salesImage} alt="Sales Management" className="button-icon" />
            Sales Management
          </button>
          <button className="management-button" onClick={() => navigate('/inventorymanagement')}>
            <img src={inventoryImage} alt="Inventory Management" className="button-icon" />
            Inventory Management
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierHome;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import '../SupplierHome/SupplierHome.css';
import leftIcon from '../Assets/left-arrowback.png';

// Import your images
import productionImage from '../Assets/checkmark.png';
import fishImage from '../Assets/cancelled.png';
import orderImage from '../Assets/order-fulfillment.png';
import salesImage from '../Assets/profit-growth.png';
import inventoryImage from '../Assets/warehouse.png';
import wallpaperImage from '../Assets/wallpaperq.jpg'; // Add your wallpaper image here

const SalesManagement = () => {
  const navigate = useNavigate();

  return (
    <div>
      <ElseNavbar />

      <div
        className="background-container"
        style={{ backgroundImage: `url(${wallpaperImage})` }}
      >
              <img
            src={leftIcon}
            alt="Back"
            className="back-arrow"
            onClick={() => navigate('/SupplierHome')}

            style={{ marginTop: '-600px', width: '60px', height: '50px'}}
          />
        <div className="button-container">
          <button className="management-button" onClick={() => navigate('/salesmanagementaccepted')}>
            <img src={productionImage} alt="Production Management" className="button-icon" />
            Accepted
          </button>
          <button className="management-button" onClick={() => navigate('/salesmanagementcancelled')}>
            <img src={fishImage} alt="Products" className="button-icon" />
            Cancelled
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Ssidebar.css'; 
import add_icon from '../Assets/Addproduct.png';
import list_product from '../Assets/Productlist.png';
import sale_icon from '../Assets/saleicon.png';
import complete_icon from '../Assets/completed.png';
import approval_icon from '../Assets/approval.png';
import apartment_icon from '../Assets/apartment.png';
import dropdown from '../Assets/dropdown_icon.png';
import home_button from '../Assets/home-button.png';
import receival_icon from '../Assets/received.png';

const Ssidebar = () => {
    const [showSalesSubmenu, setShowSalesSubmenu] = useState(false);
    const location = useLocation();

    // Toggle submenu visibility when "Sales" is clicked
    const toggleSalesSubmenu = () => {
        setShowSalesSubmenu(!showSalesSubmenu); // Toggle the state
    };

    return (
        <div className="s-sidebar">
            <Link to='/seller' style={{ textDecoration: "none" }}>
                <div className="ssidebar-item">
                    <img src={home_button} alt="Add Product" />
                    <p>Home</p>
                </div>
            </Link>
            <Link to='/addproduct' style={{ textDecoration: "none" }}>
                <div className="ssidebar-item">
                    <img src={add_icon} alt="Add Product" />
                    <p>Add Product</p>
                </div>
            </Link>

            <Link to='/productlist' style={{ textDecoration: "none" }}>
                <div className="ssidebar-item">
                    <img src={list_product} alt="Product List" />
                    <p>All Products List</p>
                </div>
            </Link>

            <div className="ssidebar-item" onClick={toggleSalesSubmenu}>
                <img src={sale_icon} alt="Sales" />
                <p>Sales</p>
                <img src={dropdown} alt="Dropdown Icon" />
            </div>

            {showSalesSubmenu && (
                <div className="s-submenu">
                    <Link to='/userorder' style={{ textDecoration: "none" }}>
                        <div className="submenu-item">
                            <img src={approval_icon} alt="For Approval" />
                            <p>For Approval</p>
                        </div>
                    </Link>
                    <Link to='/torecievenasya' style={{ textDecoration: "none" }}>
                        <div className="submenu-item">
                            <img src={apartment_icon} alt="For Shipment" />
                            <p>For Shipment</p>
                        </div>
                    </Link>
                    <Link to='/providerreceival' style={{ textDecoration: "none" }}>
                        <div className="submenu-item">
                            <img src={receival_icon} alt="For Receival" />
                            <p>For Receival</p>
                        </div>
                    </Link>
                </div>
            )}

            <Link to='/completeorder' style={{ textDecoration: "none" }}>
                <div className="ssidebar-item">
                    <img src={complete_icon} alt="Inventory" />
                    <p>Inventory</p>
                </div>
            </Link>
        </div>
    );
};

export default Ssidebar;

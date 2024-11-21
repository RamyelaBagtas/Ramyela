import React from 'react';
import { Link } from 'react-router-dom';
import './BSsidebar.css'; 
import add_icon from '../Assets/Addproduct.png'
import list_product from '../Assets/Productlist.png'
import sale_icon from '../Assets/saleicon.png';
import complete_icon from '../Assets/completed.png'

const BSsidebar = () => {
    return (
        <div className="bs-sidebar">
        <Link to='/ssaddproduct' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
            <img src={add_icon} alt="" />
                <p>Add Product</p>
            </div>
        </Link>
        <Link to='/sssproductlist' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
            <img src={list_product} alt="" />
                <p>All Products List</p>
            </div>
        </Link>
        <Link to='/sssuserorder' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
            <img src={sale_icon} alt="" />
                <p>Sales</p>
            </div>
        </Link>
        <Link to='/bsscompleteorder' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
            <img src={complete_icon} alt="" />
                <p>Inventory</p>
            </div>
        </Link>
        </div>
    );
};

export default BSsidebar;

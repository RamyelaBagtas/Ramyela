import React from 'react';
import { Link } from 'react-router-dom';
import './EXsidebar.css'; 
import add_icon from '../Assets/Addproduct.png';
import list_product from '../Assets/Productlist.png';
import sale_icon from '../Assets/saleicon.png';
import complete_icon from '../Assets/completed.png'


const EXsidebar = () => {
    return (
        <div className="ex-sidebar">
        <Link to='/EXaddproduct' style={{textDecoration:"none"}}>
            <div className="exsidebar-item">
            <img src={add_icon} alt="" />
                <p>Add Product</p>
            </div>
        </Link>
        <Link to='/exproductlist' style={{textDecoration:"none"}}>
            <div className="exsidebar-item">
            <img src={list_product} alt="" />
                <p>All Products List</p>
            </div>
        </Link>
        <Link to='/userorder' style={{textDecoration:"none"}}>
            <div className="exsidebar-item">
            <img src={sale_icon} alt="" />
                <p>Sales</p>
            </div>
        </Link>
        <Link to='/exscompleteorder' style={{textDecoration:"none"}}>
            <div className="exsidebar-item">
            <img src={complete_icon} alt="" />
                <p>Inventory</p>
            </div>
        </Link>
        </div>
    );
};

export default EXsidebar
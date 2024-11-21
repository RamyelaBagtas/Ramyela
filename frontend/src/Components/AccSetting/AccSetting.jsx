import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './AccSetting.css'

const AccSetting = () => {
    const [NavbarVisible, setNavbarVisible] = useState(true);
    const [FooterVisible, setFooterVisible] = useState(true);



    return (
        <div className='acc-container'>
            {NavbarVisible && <Navbar />}
        <div>
        <div className="bs-sidebar">
        <Link to='/address' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
                <p>Create New Address</p>
            </div>
        </Link>
        <Link to='/myaddress' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
                <p>My Address</p>
            </div>
        </Link>
        </div>
        </div>
        </div>
    );
};

export default AccSetting
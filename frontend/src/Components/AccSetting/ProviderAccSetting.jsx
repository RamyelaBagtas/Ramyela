import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AccSetting.css'
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import RSSSnavbar from '../RSSSnavbar/RSSSnavbar';

const ProviderAccSetting = () => {
    const [FooterVisible, setFooterVisible] = useState(true);

    const toggleFooter = () => {
        setFooterVisible(!FooterVisible);
      };


    return (
        <div className='acc-container'>
            <RSSSnavbar/>
        <div>
        <div className="bs-sidebar">
        <Link to='/sellersaddress' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
                <p>Create New Address</p>
            </div>
        </Link>
        <Link to='/myaddseller' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
                <p>My Address</p>
            </div>
        </Link>
        </div>
        </div>
        </div>
    );
};

export default ProviderAccSetting;
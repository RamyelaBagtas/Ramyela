import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AccSetting.css'
import Exporternavbar from '../Exporternavbar/Exporternavbar';

const Exporteraccsetting = () => {



    return (
        <div className='acc-container'>
            <Exporternavbar/>
        <div>
        <div className="bs-sidebar">
        <Link to='/exporteradd' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
                <p>Create New Address</p>
            </div>
        </Link>
        <Link to='/exportermyadd' style={{textDecoration:"none"}}>
            <div className="bssidebar-item">
                <p>My Address</p>
            </div>
        </Link>
        </div>
        </div>
        </div>
    );
};

export default Exporteraccsetting
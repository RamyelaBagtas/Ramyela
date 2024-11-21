import React, { useState } from 'react';
import './AdminNavbar.css'
import profile_icon from '../Assets/profileicon.png';
import shop_logo from '../Assets/bg.png'; // Import your shop logo image

const AdminNavbar = ({ onLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const navigateTo = (path) => {
        window.location.href = path;
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <div className="navbar">
            <div className="nav-logo">
                <img src={shop_logo} alt="Shop Logo" />
            </div>
            <div className="nav-icons">
                <button className="logout" onClick={() => navigateTo("/")}>Logout</button>
                <div className="profile" onClick={toggleDropdown}>
                    <img src={profile_icon} alt="Profile" />
                    {showDropdown && (
                        <div className="dropdown">
                            <button onClick={() => navigateTo("provideraccsettings")}>Account Settings</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNavbar;
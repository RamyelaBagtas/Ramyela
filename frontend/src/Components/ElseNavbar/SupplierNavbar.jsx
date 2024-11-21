import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext'; // Import the useAuth hook
import './ElseNavbar.css';
import shop_logo from '../Assets/bg.png'; // Import your shop logo image
import axios from 'axios';
import axiosInstance from '../axiosInstance';

const SupplierNavbar = ({ onLogout }) => {
    const { userId, logout } = useAuth(); // Get userId and logout function from context
    const [userDetails, setUserDetails] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axiosInstance.get(`api/user/${userId}`, {
                    responseType: 'json'
                });
                const data = response.data;

                console.log("Fetched User Details:", data); // Log user details for debugging

                setUserDetails(data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

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
                {userDetails && (
                    <div className="profile" onClick={toggleDropdown}>
                        <img
                            src={userDetails.displayPictureURL || '../Assets/profileicon.png'}
                            alt="Profile"
                            className="profile-pic"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '../Assets/profileicon.png'; // Fallback if the URL fails to load
                            }}
                        />
                        <div className="user-info">
                            <span>{userDetails.firstName} {userDetails.lastName}</span>
                            <span>{userDetails.userType}</span>
                            <span>{userDetails.userId}</span>
                        </div>
                        {showDropdown && (
                            <div className="dropdown">
                                <button onClick={() => navigateTo("/provideraccsettings")}>Account Settings</button>
                                <button onClick={() => { logout(); navigateTo("/"); }}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierNavbar;

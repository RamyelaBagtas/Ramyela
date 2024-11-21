import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext'; 
import shop_logo from '../Assets/bg.png'; // Import your shop logo image
import cart_icon from '../Assets/cart.png'; // Import your cart icon image
import profile_icon from '../Assets/profileicon.png';
import axiosInstance from '../axiosInstance';

const Exporternavbar = ({ onLogout, onCart, onProfile }) => {
    const location = useLocation();
    const { userId } = useAuth(); // Get userId from AuthContext
    const [showDropdown, setShowDropdown] = useState(false);
    const [consumer, setConsumer] = useState(null);
    const [cartCount, setCartCount] = useState(0); // Add state for cart count

    // Fetch consumer details
    useEffect(() => {
        const fetchConsumerDetails = async () => {
            if (userId) {
                try {
                    const response = await axiosInstance.get(`api/consumer/${userId}`);
                    setConsumer(response.data);
                } catch (error) {
                    console.error('Error fetching consumer details:', error);
                }
            }
        };

        fetchConsumerDetails();
    }, [userId]);

    // Fetch cart count
    useEffect(() => {
        const fetchCartCount = async () => {
            if (userId) {
                try {
                    const response = await axiosInstance.get(`api/cart-count/${userId}`);
                    setCartCount(response.data.cartCount);
                } catch (error) {
                    console.error('Error fetching cart count:', error);
                }
            }
        };

        fetchCartCount();
    }, [userId]);

    useEffect(() => {
        const pathname = location.pathname;
        let title = "Shop"; // Default title

        // Update title based on the current route
        switch (pathname) {
            case "/shop":
                title = "Shop";
                break;
            case "/dried-fish":
                title = "Dried Fish";
                break;
            case "/gourmet":
                title = "Gourmet";
                break;
            case "/login":
                title = "Login";
                break;
            case "/cart":
                title = "Cart";
                break;
            default:
                title = "Shop";
        }

        document.title = title; // Set document title
    }, [location.pathname]);

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
            <div className="nav-shop-links">
                <button onClick={() => navigateTo("/exporter")}>Shop</button>
            </div>
            <div className="nav-icons">
                <button className="cart" onClick={() => navigateTo("/exportercart")}>
                    <img src={cart_icon} alt="Cart" />
                    {cartCount > 0 && (
                        <span className="cart-count">{cartCount}</span> // Display cart count beside cart icon
                    )}
                </button>
                <div className="profile" onClick={toggleDropdown}>
                    {consumer ? (
                        <>
                            <img
                                src={consumer.displayPictureURL || profile_icon}
                                alt="Profile"
                                className="profile-icon"
                            />
                            <span className="profile-name">
                                {consumer.firstName} {consumer.lastName}
                            </span>
                        </>
                    ) : (
                        <img src={profile_icon} alt="Profile" className="profile-icon" />
                    )}
                    {showDropdown && (
                        <div className="dropdown">
                            <button onClick={() => navigateTo("/exporteraccsetting")}>Account Settings</button>
                            <button onClick={() => navigateTo("/exporterorder")}>My Purchase</button>
                            <button onClick={() => navigateTo("/exportersellerorder")}>My Purchase for Supplier</button>
                            <button onClick={() => navigateTo("/")}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Exporternavbar;

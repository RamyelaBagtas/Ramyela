import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../AuthContext';
import { useSnackbar } from 'notistack';
import axiosInstance from '../axiosInstance';

const ToReceiveConsumer = () => {
    const { userId } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [activeButton, setActiveButton] = useState('/torecieveconsumer');
    const shippingFee = 50; // Shipping fee

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosInstance.get(`api/completeOrder/eta/${userId}`);
                setNotifications(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false);
                enqueueSnackbar('Failed to fetch notifications', { variant: 'error' });
            }
        };

        fetchNotifications();
    }, [userId, enqueueSnackbar]);

    const handleOrderReceived = async (orderId) => {
        try {
            await axiosInstance.put(`api/receive/${orderId}`);
            enqueueSnackbar('Order marked as received by you!', { variant: 'success' });
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification._id !== orderId)
            );
        } catch (error) {
            console.error('Error marking order as received:', error);
            enqueueSnackbar('Failed to mark order as received', { variant: 'error' });
        }
    };

    const handleButtonClick = (path) => {
        setActiveButton(path); // Update active button state
        navigate(path);
    };

    const calculateTotalAmount = (quantity, price) => {
        return (quantity * price + shippingFee).toFixed(2);
    };

    const isWithinDateRange = (startDate, endDate) => {
        const currentDate = new Date();
        return currentDate >= new Date(startDate) && currentDate <= new Date(endDate);
    };

    // Automatically mark order as received one day after endDate
    useEffect(() => {
        const markOrdersReceived = async () => {
            for (const notification of notifications) {
                const endDate = new Date(notification.toReceiveETA.endDate);
                const orderId = notification._id;
                const currentDate = new Date();

                if (currentDate > endDate) {
                    // Mark the order as received one day after endDate
                    const markAsReceivedDate = new Date(endDate);
                    markAsReceivedDate.setDate(markAsReceivedDate.getDate() + 7);
                    
                    if (currentDate >= markAsReceivedDate) {
                        await handleOrderReceived(orderId);
                    }
                }
            }
        };

        markOrdersReceived();
    }, [notifications]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="button-container">
                <button
                    className={`btn-shipped-orders ${activeButton === '/mypurchase' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('/mypurchase')}
                >
                    To Approve
                </button>
                <button
                    className={`btn-shipped-orders ${activeButton === '/nashipna' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('/nashipna')}
                >
                    To Ship
                </button>
                <button
                    className={`btn-shipped-orders ${activeButton === '/torecieveconsumer' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('/torecieveconsumer')}
                >
                    To Receive
                </button>
                <button
                    className={`btn-shipped-orders ${activeButton === '/cancel' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('/cancel')}
                >
                    Cancelled
                </button>
                <button
                    className={`btn-shipped-orders ${activeButton === '/recievedconsumer' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('/recievedconsumer')} style={{background: 'none'}}
                >
                    Delivered
                </button>
            </div>
            <div className="shipped-container">
                <h1>To Receive</h1>
                {notifications.length === 0 ? (
                    <p>No shipped orders found.</p>
                ) : (
                    notifications.map((notification) => (
                        <div key={notification._id} className="order-summary">
                            <div className="order-details">
                                <div className="product-details">
                                    <img src={notification.product.image} alt={notification.product.title} className="product-image" />
                                    <div className="product-info">
                                        <h3>{notification.product.title}</h3>
                                        <p><strong>Quantity:</strong> {notification.product.quantity}</p>
                                        <p><strong>Price:</strong> ₱{notification.product.price.toFixed(2)}</p>
                                        <p><strong>Total:</strong> ₱{calculateTotalAmount(notification.product.quantity, notification.product.price)}</p>
                                        <div className="eta-details">
                                            <p><strong>Expect Delivery from:</strong> {new Date(notification.toReceiveETA.startDate).toLocaleDateString()} - {new Date(notification.toReceiveETA.endDate).toLocaleDateString()}</p>
                                        </div>
                                        {notification.receivedByUser ? (
                                            <p style={{ color: 'green' }}>Order received by you</p>
                                        ) : (
                                            <button
                                            onClick={() => handleOrderReceived(notification._id)}
                                            disabled={!isWithinDateRange(notification.toReceiveETA.startDate, notification.toReceiveETA.endDate)}
                                            style={
                                                !isWithinDateRange(notification.toReceiveETA.startDate, notification.toReceiveETA.endDate)
                                                    ? { backgroundColor: 'grey', color: 'white', cursor: 'not-allowed' } // Style when disabled
                                                    : {} // Default style when not disabled
                                            }
                                        >
                                                Order Received
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ToReceiveConsumer;

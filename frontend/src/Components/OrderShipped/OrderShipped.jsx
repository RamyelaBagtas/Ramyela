import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../AuthContext'; // Import useAuth hook from AuthContext
import { useSnackbar } from 'notistack'; // Import useSnackbar for notifications
import './OrderShipped.css'; // Import CSS file
import axiosInstance from '../axiosInstance';

const OrderShipped = () => {
  const { userId } = useAuth(); // Access userId from useAuth hook
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState('/nashipna');
  const navigate = useNavigate(); // Define navigate from react-router-dom
  const { enqueueSnackbar } = useSnackbar(); // Snackbar notifications

  // Define a constant for shipping fee
  const shippingFee = 50;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`api/consumernotify/${userId}`); // Adjust API endpoint
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        enqueueSnackbar('Failed to fetch notifications', { variant: 'error' }); // Show error notification
      }
    };

    fetchNotifications();
  }, [userId, enqueueSnackbar]); // Include userId and enqueueSnackbar in the dependency array

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
    const handleButtonClick = (path) => {
    setActiveButton(path); // Update active button state
    navigate(path);
  };

  // Function to calculate total amount for each product including shipping fee
  const calculateTotalAmount = (quantity, price) => {
    return (quantity * price + shippingFee).toFixed(2);
  };

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
        <h1>Waiting for Sender</h1>
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

export default OrderShipped;

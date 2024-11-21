import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import './ReceivalP.css'
import axiosInstance from '../axiosInstance';

const ReceivalP = () => {
  const { userId } = useAuth();
  const [receivalOrders, setReceivalOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceivalOrders = async () => {
      try {
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        const receivalOrdersResponse = await axiosInstance.get(`api/tobereceive/${userId}`);
        console.log("Received Product Orders with Image:", receivalOrdersResponse.data);

        setReceivalOrders(receivalOrdersResponse.data);
      } catch (error) {
        console.error('Error fetching receival orders:', error);
        setError('Failed to fetch receival orders. Please try again.');
      }
    };

    fetchReceivalOrders();
  }, [userId]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div>
      <ElseNavbar />
      <Ssidebar />
      <div className="receival-container">
        <h1>📦 For Receival Orders</h1>
        {error && <p className="error-message">{error}</p>}
        <table className="receival-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Default Address</th>
              <th>ETA Start Date</th>
              <th>ETA End Dates</th>
            </tr>
          </thead>
          <tbody>
            {receivalOrders.map(order => (
              <tr key={order.orderId}>
                <td>
                  {order.imageUrl ? (
                    <img 
                      src={order.imageUrl} 
                      alt={order.title} 
                      className='order-image' 
                      style={{ width: '50px', height: '50px' }}
                    />
                  ) : (
                    <p>No Image Available</p>
                  )}
                </td>
                <td>{order.title}</td>
                <td>{order.quantity}</td>
                <td>{order.totalAmount}</td>
                <td>{formatDate(order.date)}</td>
                <td>
                  {order.defaultAddress.fullName}, {order.defaultAddress.contactNumber}, 
                  {order.defaultAddress.street}, {order.defaultAddress.houseNumber}, 
                  {order.defaultAddress.barangay}, {order.defaultAddress.city}, 
                  {order.defaultAddress.province}, {order.defaultAddress.region}, 
                  {order.defaultAddress.postalCode}, {order.defaultAddress.country}
                </td>
                <td>{formatDate(order.toReceiveETA.startDate)}</td>
                <td>{formatDate(order.toReceiveETA.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivalP;

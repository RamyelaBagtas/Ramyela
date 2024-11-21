import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../AuthContext'; // Import useAuth hook from AuthContext
import axiosInstance from '../axiosInstance';

const ConsumerOrder = () => {
  const { consumerId } = useAuth(); // Access consumerId from useAuth hook
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(`api/consumernotif/${consumerId}`);
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    if (consumerId) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Consumer ID not found');
    }
  }, [consumerId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="consumer-order-container">
        <h1>Consumer Orders</h1>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-summary">
              <h2>Order Date: {new Date(order.createdAt).toLocaleDateString()}</h2>
              <p>Message: {order.message}</p>
              <div className="order-details">
                <p>Total Amount: ₱{order.totalAmount.toFixed(2)}</p>
                <p>Shipped: {order.shipped ? 'Yes' : 'No'}</p>
                <p>Products:</p>
                <ul>
                  {order.products.map((product, index) => (
                    <li key={index}>
                      <p>Title: {product.title}</p>
                      <p>Quantity: {product.quantity}</p>
                      <p>Price: ₱{product.price.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsumerOrder;

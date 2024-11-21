import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderStatus.css'; // Import the CSS file
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const OrderStatus = () => {
  const [consumerId, setConsumerId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve consumerId from local storage
    const storedConsumerId = localStorage.getItem('consumerId');
    if (storedConsumerId) {
      setConsumerId(storedConsumerId);
    } else {
      setError('Consumer ID not found in local storage');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (consumerId) {
      const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(`api/notifications/${consumerId}`);
          if (response.data && response.data.messages) {
            setMessages(response.data.messages);
            setLoading(false);
          } else {
            setError('No messages found');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError('Failed to fetch messages');
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [consumerId]);

  const handleClick = () => {
    navigate(`/order`);
  };

  return (
    <div>
        <Navbar/>
    <div className="order-status-container">
      <h2 className="order-status-title">Order Status</h2>
      {loading ? (
        <p className="order-status-loading">Loading...</p>
      ) : error ? (
        <p className="order-status-error">Error: {error}</p>
      ) : (
        <ul className="order-status-list">
          {messages.map((message, index) => (
            <li key={index} className="order-status-item" onClick={() => handleClick(message.orderId)}>
              <p className="order-status-item-text">{message}</p>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
};

export default OrderStatus;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import leftIcon from '../Assets/arrow-left.png';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import { useSnackbar } from 'notistack'; // Importing useSnackbar
import './SupplierOrders.css';
import axiosInstance from '../axiosInstance';

const SupplierOrders = () => {
  const navigate = useNavigate();
  const { userId } = useAuth(); // Get userId from useAuth hook
  const { enqueueSnackbar } = useSnackbar(); // Hook to trigger snackbar notifications
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  const cancellationReasons = [
    'Supplier cannot comply to Date Needed',
    'Supplier cannot comply to Ordered Quantity',
    'Address Too Far',
    'Other'
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(`api/supplier/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        setError('Could not fetch orders.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const handleAccept = async (orderId) => {
    try {
      await axiosInstance.post(`api/orders/${orderId}/accept`);
      setOrders(orders.filter(order => order._id !== orderId)); // Remove accepted order from list
      enqueueSnackbar('Order Accepted successfully!', { variant: 'success' }); // Success notification
    } catch (error) {
      enqueueSnackbar('Could not accept order. Please try again later.', { variant: 'error' }); // Error notification
    }
  };

  const handleCancel = async (orderId) => {
    setCancelOrderId(orderId); // Track the order being canceled
    setShowReasonInput(true); // Show cancellation reason input
  };

  const submitCancellation = async () => {
    if (selectedReason) {
      try {
        await axiosInstance.post(`api/orders/${cancelOrderId}/cancel`, { reason: selectedReason });
        setOrders(orders.filter(order => order._id !== cancelOrderId)); // Remove canceled order from list
        setShowReasonInput(false); // Hide reason input
        setSelectedReason(''); // Clear selected reason
        enqueueSnackbar('Order canceled successfully!', { variant: 'success' }); // Success notification
      } catch (error) {
        enqueueSnackbar('Could not cancel order. Please try again later.', { variant: 'error' }); // Error notification
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <ElseNavbar />
      <div>
        <h1>
          <img
            src={leftIcon}
            alt="Back"
            className="back-arrow"
            onClick={() => navigate('/supplierhome')}
          />
          Orders
        </h1>
        {orders.length > 0 ? (
          <div className="order-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <h2>Order Date: {new Date(order.date).toLocaleDateString()}</h2>
                <div className="order-details">
                  <div className="product-image">
                    {order.supplierproducts.productImage ? (
                      <img
                        src={`data:image/jpeg;base64,${order.supplierproducts.productImage}`}
                        alt="Product"
                        style={{ width: '100px', height: '100px' }}
                      />
                    ) : (
                      'No Image'
                    )}
                  </div>
                  <div className="product-info">
                    <td>Product Title: {order.supplierproducts.productTitle}</td>
                    <td>Category: {order.supplierproducts.category}</td>
                    <td>Quantity: {order.quantity}</td>
                    <td>TotalAmount: {order.totalAmount}</td>
                    <td>
                      <div>Name: {order.defaultAddress.fullName}</div>
                      <div>Address: {order.defaultAddress.street}, {order.defaultAddress.barangay}</div>
                      <div>{order.defaultAddress.city}, {order.defaultAddress.province}</div>
                      <div>{order.defaultAddress.region}, {order.defaultAddress.country}</div>
                      <div>Postal Code: {order.defaultAddress.postalCode}</div>
                      <div>Contact: {order.defaultAddress.contactNumber}</div>
                    </td>
                    <td>Date Ordered: {new Date(order.date).toLocaleDateString()}</td>
                    <td>Date Needed: {new Date(order.startDate).toLocaleDateString()} to {new Date(order.endDate).toLocaleDateString()}</td>
                  </div>
                </div>
                <div className="order-buttons">
                  <button
                    onClick={() => handleAccept(order._id)}
                    className="accept-button"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="cancel-button"
                  >
                    Cancel Order
                  </button>
                </div>
                {showReasonInput && cancelOrderId === order._id && (
                  <div className="cancellation-reason">
                    <label>Select Cancellation Reason:</label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    >
                      <option value="">-- Select a Reason --</option>
                      {cancellationReasons.map((reason, index) => (
                        <option key={index} value={reason}>{reason}</option>
                      ))}
                    </select>
                    <button
                      onClick={submitCancellation}
                      className="submit-cancellation"
                    >
                      Submit Cancellation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No orders found for this user.</p>
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;

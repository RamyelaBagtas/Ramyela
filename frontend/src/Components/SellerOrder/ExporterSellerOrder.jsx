import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useAuth } from '../AuthContext';
import './SellerOrder.css'; // Import custom CSS for styling
import axiosInstance from '../axiosInstance';
import Exporternavbar from '../Exporternavbar/Exporternavbar';

const SellerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');  // New state to track selected filter
  const { userId } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!userId) {
      enqueueSnackbar('User ID is required', { variant: 'error' });
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(`api/seller/orders/${userId}`, {
          params: {
            status: statusFilter,  // Include status filter as query parameter
          },
        });
        setOrders(response.data.orders);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 431) {
          enqueueSnackbar('Request is too large, try again later.', { variant: 'error' });
        } else {
          console.error('Error fetching orders:', error);
          enqueueSnackbar('Failed to fetch orders', { variant: 'error' });
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, statusFilter, enqueueSnackbar]);  // Re-run the effect when statusFilter changes

  const getCorrectPrice = (quantity, wholesaleTiers) => {
    if (!wholesaleTiers) return 0;

    const matchedTier = wholesaleTiers.find(
      (tier) => quantity >= tier.minOrder && quantity <= tier.maxOrder
    );

    return matchedTier ? matchedTier.unitPrice : 0; // If no match, return 0 or a default value
  };

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);  // Update filter when the user selects a new status
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div>No orders found for this user.</div>;
  }

  return (
    <div>
      <Exporternavbar />
      <div className="filter-container">
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select id="statusFilter" value={statusFilter} onChange={handleStatusChange}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="orders-container">
        {orders
          .filter(order => {
            // If no filter is applied, display all orders
            if (!statusFilter) return true;
            // Only display orders matching the selected status
            return order.status === statusFilter;
          })
          .map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <h3>Order Date: {new Date(order.date).toLocaleDateString()}</h3>
                <p>Status: {order.status}</p>
              </div>
              <div className="order-content">
                <div className="product-image">
                  {order.supplierproducts && order.supplierproducts.productImage ? (
                    <img
                      src={order.supplierproducts.productImage}
                      alt={order.supplierproducts.productTitle || 'Product Image'}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>
                <div className="order-details">
                  <h4>{order.supplierproducts ? order.supplierproducts.productTitle : 'No title'}</h4>
                  <p>Quantity: {order.quantity}</p>
                  
                  {/* Get the correct price based on the quantity and wholesale tiers */}
                  {order.supplierproducts && order.supplierproducts.wholesaleTiers && order.quantity && (
                    <p>
                      Price: ₱{getCorrectPrice(order.quantity, order.supplierproducts.wholesaleTiers)}
                    </p>
                  )}

                  <p>Total: ₱{order.totalAmount}</p>
                  <p>Date Needed: {formatDate(order.startDate)} to {formatDate(order.endDate)}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SellerOrder;

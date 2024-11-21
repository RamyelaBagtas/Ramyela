import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserOrder.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import { useAuth } from '../AuthContext';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const UserOrder = () => {
  const { userId } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [inputUserId, setInputUserId] = useState('');
  const [showCancelIndex, setShowCancelIndex] = useState(null); // Changed state to track which order's cancel form to show
  const [cancellationReasons, setCancellationReasons] = useState({
    outOfStock: false,
    qualityIssue: false,
    misleadingDescription: false,
    sellerCanceled: false,
    locationTooFar: false,
    other: false,
    otherReason: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userId) {
          setError('User ID not found');
          return;
        }

        const response = await axiosInstance.get(`api/productIds/${userId}`);
        if (response && response.data && response.data.productOrders) {
          setOrderData(response.data.productOrders);
          setError('');
          setSubmitted(true);
          setDataLoaded(true);
          enqueueSnackbar('Orders fetched successfully', { variant: 'success' });
        } else {
          setError('No order data found for this user');
          setOrderData([]);
          setSubmitted(true);
          setDataLoaded(true);
          enqueueSnackbar('No order data found', { variant: 'info' });
        }
      } catch (error) {
        setError('Failed to fetch order data');
        console.error('Error fetching order data:', error);
        enqueueSnackbar('Failed to fetch order data', { variant: 'error' });
      }
    };

    fetchOrders();
  }, [userId, enqueueSnackbar]);

  const handleOrderSubmit = async (consumerId, title, product, totalAmount, index) => {
    try {
      const response = await axiosInstance.post('api/consumernotif', {
        consumerId,
        product,
        totalAmount,
        date: new Date(),
      });

      if (response.status === 200) {
        enqueueSnackbar('Notification sent successfully', { variant: 'success' });
        setOrderData(prevOrderData => {
          const updatedOrderData = [...prevOrderData];
          updatedOrderData[index].shipped = true;
          return updatedOrderData;
        });
      } else {
        enqueueSnackbar('Insufficient stock available', { variant: 'error' });
      }
    } catch (error) {
      console.error('Insufficient stock available:', error);
      enqueueSnackbar('Insufficient stock available', { variant: 'error' });
    }
  };

  const handleOrderCancel = (index) => {
    // Show the cancellation form for the selected order
    setShowCancelIndex(index);
    setCancellationReasons({
      outOfStock: false,
      qualityIssue: false,
      misleadingDescription: false,
      sellerCanceled: false,
      locationTooFar: false,
      other: false,
      otherReason: '',
    });
  };

  const handleCancelSubmit = async () => {
    const selectedReasons = Object.entries(cancellationReasons)
      .filter(([key, value]) => value && key !== 'otherReason')
      .map(([key]) => key)
      .join(', ');

    if (!selectedReasons && !cancellationReasons.otherReason.trim()) {
      enqueueSnackbar('Please provide a cancellation reason', { variant: 'warning' });
      return;
    }

    const cancellationReason = selectedReasons + (cancellationReasons.otherReason ? `, Other: ${cancellationReasons.otherReason}` : '');

    try {
      if (showCancelIndex === null) {
        return;
      }

      const order = orderData[showCancelIndex];
      const response = await axiosInstance.post('api/cancelnotif', {
        consumerId: order.consumerId,
        product: order.product,
        totalAmount: order.totalAmount,
        date: new Date(),
        cancellationReason
      });

      if (response.status === 200) {
        enqueueSnackbar('Order canceled successfully', { variant: 'success' });
        setOrderData(prevOrderData => {
          const updatedOrderData = [...prevOrderData];
          updatedOrderData[showCancelIndex] = { ...updatedOrderData[showCancelIndex], canceled: true, cancellationDate: new Date(), cancellationReason };
          return updatedOrderData;
        });
        setShowCancelIndex(null); // Close the form after submission
      } else {
        enqueueSnackbar('Failed to cancel order', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      enqueueSnackbar('Error canceling order', { variant: 'error' });
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCancellationReasons(prevState => ({ ...prevState, [name]: checked }));
  };

  const handleOtherReasonChange = (event) => {
    setCancellationReasons(prevState => ({ ...prevState, otherReason: event.target.value }));
  };

  const handleChange = (event) => {
    setInputUserId(event.target.value);
  };

  return (
    <div>
      <ElseNavbar />
      <Ssidebar />
      <div className='userorder'>
        <h2>For Approval</h2>
        {submitted && (
          <div>
            {error && <p>Error: {error}</p>}
            {orderData.length > 0 ? (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product ID</th>
                      <th>Products</th>
                      <th>Default Address</th>
                      <th>Total Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.map((order, index) => (
                      <React.Fragment key={`${order.productId}-${index}`}>
                        <tr>
                          <td>{order.date}</td>
                          <td>{order.productId}</td>
                          <td>
                            <div key={order.product.productId}>
                              <img src={order.product.image} alt="Product" style={{ width: '100px', height: '100px' }} />
                              <br />
                              {order.product.title}
                              <br />
                              Quantity: {order.product.quantity}
                            </div>
                          </td>
                          <td>{order.defaultAddress ? `${order.defaultAddress.fullName}, ${order.defaultAddress.contactNumber}, ${order.defaultAddress.region}, ${order.defaultAddress.province}, ${order.defaultAddress.city}, ${order.defaultAddress.barangay}, ${order.defaultAddress.postalCode}, ${order.defaultAddress.street}, ${order.defaultAddress.houseNumber}, ${order.defaultAddress.country}` : 'No default address'}</td>
                          <td>{order.totalAmount}</td>
                          <td>
                            {order.shipped ? (
                              "Order Approved"
                            ) : order.canceled ? (
                              "Order Canceled"
                            ) : (
                              <>
                                <button onClick={() => handleOrderSubmit(order.consumerId, order.product.title, order.product, order.totalAmount, index)}>
                                  Accept Order
                                </button>
                                <button className='cancel-btn-now' onClick={() => handleOrderCancel(index)}>
                                  Cancel Order
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                        {/* Conditional rendering of cancellation form */}
                        {showCancelIndex === index && (
                          <tr>
                            <td colSpan="6">
                              <div className='cancel-form'>
                                <h2>Cancel Order</h2>
                                <p>Please select a reason for cancellation:</p>
                                <label>
                                  <input
                                    type="checkbox"
                                    name="outOfStock"
                                    checked={cancellationReasons.outOfStock}
                                    onChange={handleCheckboxChange}
                                  />
                                  Product was out of stock
                                </label>
                                <br />
                                <label>
                                  <input
                                    type="checkbox"
                                    name="qualityIssue"
                                    checked={cancellationReasons.qualityIssue}
                                    onChange={handleCheckboxChange}
                                  />
                                  Quality issue with the product
                                </label>
                                <br />
                                <label>
                                  <input
                                    type="checkbox"
                                    name="misleadingDescription"
                                    checked={cancellationReasons.misleadingDescription}
                                    onChange={handleCheckboxChange}
                                  />
                                  Misleading product description
                                </label>
                                <br />
                                <label>
                                  <input
                                    type="checkbox"
                                    name="sellerCanceled"
                                    checked={cancellationReasons.sellerCanceled}
                                    onChange={handleCheckboxChange}
                                  />
                                  Seller canceled the order
                                </label>
                                <br />
                                <label>
                                  <input
                                    type="checkbox"
                                    name="locationTooFar"
                                    checked={cancellationReasons.locationTooFar}
                                    onChange={handleCheckboxChange}
                                  />
                                  Delivery location is too far
                                </label>
                                <br />
                                <label>
                                  <input
                                    type="checkbox"
                                    name="other"
                                    checked={cancellationReasons.other}
                                    onChange={handleCheckboxChange}
                                  />
                                  Other (please specify):
                                  <input
                                    type="text"
                                    value={cancellationReasons.otherReason}
                                    onChange={handleOtherReasonChange}
                                  />
                                </label>
                                <br />
                                <br />
                                <button onClick={handleCancelSubmit}>Submit Cancellation</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No orders found for this user.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrder;

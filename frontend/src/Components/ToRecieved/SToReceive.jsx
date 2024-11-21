import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import { useAuth } from '../AuthContext';
import { useSnackbar } from 'notistack';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '../axiosInstance';

const SToReceive = () => {
  const { userId } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [inputUserId, setInputUserId] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userId) {
          setError('User ID not found');
          return;
        }

        const response = await axiosInstance.get(`api/providernotify/${userId}`);
        if (response && response.data) {
          setOrderData(response.data);
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

  const handleChange = (event) => {
    setInputUserId(event.target.value);
  };

  const handleAccept = (index) => {
    setSelectedOrderIndex(index);
    setShowDatePicker(true);
  };

const handleSubmit = async (order) => {
  if (!startDate || !endDate) {
    enqueueSnackbar('Please select both start and end dates for the ETA', { variant: 'warning' });
    return;
  }

  try {
    const response = await axiosInstance.put(`api/completeOrder/${order.product.orderId}/eta`, {
      toReceiveETA: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    if (response.status === 200) {
      enqueueSnackbar('Order accepted and ETA set successfully', { variant: 'success' });
      setShowDatePicker(false);
      setStartDate(null);
      setEndDate(null);
      setSelectedOrderIndex(null);
    }
  } catch (error) {
    console.error('Error accepting the order:', error);
    enqueueSnackbar('Failed to accept the order', { variant: 'error' });
  }
};



  return (
    <div>
      <ElseNavbar />
      <Ssidebar/>
      <div className="userorder">
        {!dataLoaded && (
          <form>
            <label htmlFor="userId">User ID:</label>
            <input
              type="text"
              id="userId"
              value={inputUserId}
              onChange={handleChange}
              required
            />
            <button type="submit">Submit</button>
          </form>
        )}

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
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.map((order, index) => (
                      <tr key={`${order.productId}-${index}`}>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>{order.product.productId}</td>
                        <td>
                          <div>
                            <img
                              src={order.product.image}
                              alt="Product"
                              style={{ width: '100px', height: '100px' }}
                            />
                            <br />
                            {order.product.title}
                            <br />
                            Quantity: {order.product.quantity}
                          </div>
                        </td>
                        <td>
                          {order.defaultAddress
                            ? `${order.defaultAddress.fullName}, ${order.defaultAddress.contactNumber}, ${order.defaultAddress.region}, ${order.defaultAddress.province}, ${order.defaultAddress.city}, ${order.defaultAddress.barangay}, ${order.defaultAddress.postalCode}, ${order.defaultAddress.street}, ${order.defaultAddress.houseNumber}, ${order.defaultAddress.country}`
                            : 'No default address'}
                        </td>
                        <td>{order.totalAmount}</td>
                        <td>Order Accepted</td>
                        <td>
                          {selectedOrderIndex !== index && (
                            <button onClick={() => handleAccept(index)}>Accept</button>
                          )}
                          {showDatePicker && selectedOrderIndex === index && (
                            <div>
                              <label>Select Start Date:</label>
                              <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="yyyy/MM/dd"
                                placeholderText="Select start date"
                              />
                              <label>Select End Date:</label>
                              <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="yyyy/MM/dd"
                                placeholderText="Select end date"
                              />
                              <button onClick={() => handleSubmit(order)}>Submit Dates</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No order data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SToReceive;

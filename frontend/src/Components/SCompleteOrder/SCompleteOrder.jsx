import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SCompleteOrder.css';
import BSsidebar from '../BSsidebar/BSsidebar';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '../axiosInstance';

function SCompleteOrder() {
  const [userId, setUserId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingStock, setRemainingStock] = useState(0);
  const [totalsByProductId, setTotalsByProductId] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setUserId(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.get(`api/consumernotif/${userId}`);
      setNotifications(response.data);
      setSubmitted(true);
      const totals = calculateTotals(response.data);
      setTotalsByProductId(totals);
      filterNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const calculateTotals = (data) => {
    const totalsByProductId = data.reduce((acc, notification) => {
      const { product } = notification;
      const orderDate = new Date(notification.createdAt).toLocaleDateString();
      if (!acc[product.productId]) {
        acc[product.productId] = {
          productId: product.productId,
          title: product.title,
          image: product.image,
          quantityTotal: 0,
          amountTotal: 0,
          stockTotal: product.stock,
          orderDate: orderDate
        };
      }
      acc[product.productId].quantityTotal += product.quantity;
      acc[product.productId].amountTotal += notification.totalAmount;
      return acc;
    }, {});

    const totalQuantity = Object.values(totalsByProductId).reduce((acc, curr) => acc + curr.quantityTotal, 0);
    const totalAmount = Object.values(totalsByProductId).reduce((acc, curr) => acc + curr.amountTotal, 0);
    const totalStock = Object.values(totalsByProductId).reduce((acc, curr) => acc + curr.stockTotal, 0);
    const remainingStock = totalStock - totalQuantity;

    setTotalQuantity(totalQuantity);
    setTotalAmount(totalAmount);
    setRemainingStock(remainingStock);

    return totalsByProductId;
  };

  const filterNotifications = (data) => {
    let filtered = data;

    if (startDate && endDate) {
      filtered = filtered.filter(notification => {
        const orderDate = new Date(notification.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtered.length === 0) {
      setError('No results found.');
    } else {
      setError('');
    }

    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    if (submitted) {
      filterNotifications(notifications);
    }
  }, [startDate, endDate, searchTerm]);

  return (
    <div>
      <ElseNavbar />
      <BSsidebar />
      <div className='scompleted-orders-container'>
        <h1>Completed Orders</h1>
        {!submitted && (
          <form onSubmit={handleSubmit}>
            <label>
              User ID:
              <input type="text" value={userId} onChange={handleChange} />
            </label>
            <button type="submit">Submit</button>
          </form>
        )}
        {submitted && (
          <div>
            <div className="filter-container">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
              />
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                minDate={startDate}
              />
              <input
                type="text"
                placeholder="Search by title"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    filterNotifications(notifications);
                  }
                }}
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            <ul>
              {filteredNotifications.map(notification => (
                <li key={notification._id}>
                  <p>Product ID: {notification.product.productId}</p>
                  <p>Title: {notification.product.title}</p>
                  <img src={notification.product.image} alt="Product" className='images' />
                  <p>Quantity: {notification.product.quantity}</p>
                  <p>Stock: {notification.product.stock}</p>
                  <p>Price: {notification.product.price}</p>
                  <p>Total Amount: {notification.totalAmount}</p>
                  <p>Order Date: {new Date(notification.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
            <p className='totall'>Total Amount: {totalAmount}</p>
            <h1>Inventory</h1>
            {Object.values(totalsByProductId).map((total) => (
              <div key={total.productId}>
                <h3>Product ID: {total.productId}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Total Quantity</th>
                      <th>Total Amount</th>
                      <th>Remaining Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><img src={total.image} alt="Product" className='inventory-image' /></td>
                      <td>{total.title}</td>
                      <td>{total.quantityTotal}</td>
                      <td>{total.amountTotal}</td>
                      <td>{total.stockTotal - total.quantityTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SCompleteOrder;

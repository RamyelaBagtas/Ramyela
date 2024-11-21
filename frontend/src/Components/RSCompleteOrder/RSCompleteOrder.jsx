import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RSCompleteOrder.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import { useAuth } from '../AuthContext'; // Update with the correct path to your useAuth hook or context
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RSsidebar from '../Ssidebar/Ssidebar';
import axiosInstance from '../axiosInstance';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const RSCompleteOrder = () => {
  const { userId } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [canceledOrders, setCanceledOrders] = useState([]);
  const [error, setError] = useState('');
  const [elseNavbarVisible, setElseNavbarVisible] = useState(true);
  const [sSidebarVisible, setSSidebarVisible] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermCanceled, setSearchTermCanceled] = useState('');
  const [searchTermComplete, setSearchTermComplete] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        // Fetch products
        const productsResponse = await axiosInstance.get(`api/rsproducts/user/${userId}`);
        const productsWithImages = productsResponse.data.map(product => ({
          ...product,
          imageUrl: arrayBufferToBase64(product.image.data)
        }));
        setProducts(productsWithImages);

        // Fetch completed orders
        const notificationsResponse = await axiosInstance.get(`api/consumernotif/${userId}`);
        setOrders(notificationsResponse.data);

        // Fetch canceled orders
        const canceledOrdersResponse = await axiosInstance.get(`api/cancellednotif/${userId}`);
        setCanceledOrders(canceledOrdersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, [userId]);

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const getImageUrl = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? `data:image/jpeg;base64,${product.imageUrl}` : null;
  };

  // Prepare data for the bar chart
  const labels = products.map(product => product.title);
  const completedOrdersData = products.map(product => {
    const productOrders = orders.filter(order => order.product.productId === product._id);
    return productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
  });

  const canceledOrdersData = products.map(product => {
    const canceledProductOrders = canceledOrders.filter(order => order.product.productId === product._id);
    return canceledProductOrders.reduce((acc, order) => acc + order.product.quantity, 0);
  });

  const remainingStockData = products.map(product => {
    const productOrders = orders.filter(order => order.product.productId === product._id);
    const totalOrders = productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
    return product.stock - totalOrders;
  });

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Completed Orders',
        data: completedOrdersData,
        backgroundColor: '#36A2EB',
        stack: 'Stack 0',
      },
      {
        label: 'Canceled Orders',
        data: canceledOrdersData,
        backgroundColor: '#FF6384',
        stack: 'Stack 1',
      },
      {
        label: 'Remaining Stock',
        data: remainingStockData,
        backgroundColor: '#FFCE56',
        stack: 'Stack 2',
      }
    ]
  };

  const handleSearch = (orders, term) => {
    return orders.filter(order => order.product.title.toLowerCase().includes(term.toLowerCase()));
  };

  const handleFilterByDate = (orders, startDate, endDate) => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
    });
  };

  const filteredOrders = handleSearch(handleFilterByDate(orders, startDate, endDate), searchTermComplete);
  const filteredCanceledOrders = handleSearch(canceledOrders, searchTermCanceled);

  return (
    <div>
      {elseNavbarVisible && <ElseNavbar />}
      <RSsidebar/>
      <div className="inventory-container">
        <h1>Overall Inventory</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Inventory"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Total Amount</th>
              <th>Stock</th>
              <th>Remaining Stock</th>
              <th>Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(product => {
                const productOrders = orders.filter(order => order.product.productId === product._id);
                const totalAmount = productOrders.reduce((acc, order) => acc + order.totalAmount, 0);
                const totalOrders = productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
                const remainingStock = product.stock - totalOrders;

                return (
                  <tr key={product._id}>
                    <td>
                      {product.imageUrl && (
                        <img src={`data:image/jpeg;base64,${product.imageUrl}`} alt={product.title} className='inventory-image' />
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>₱{product.price}</td>
                    <td>₱{totalAmount.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{remainingStock}</td>
                    <td>{totalOrders}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <h2>Complete Orders</h2>

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
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search Complete Orders"
            value={searchTermComplete}
            onChange={e => setSearchTermComplete(e.target.value)}
          />
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.orderId}>
                <td>
                  {getImageUrl(order.product.productId) && (
                    <img src={getImageUrl(order.product.productId)} alt={order.product.title} className='inventory-image' />
                  )}
                </td>
                <td>{order.product.title}</td>
                <td>{order.product.quantity}</td>
                <td>₱{order.totalAmount.toFixed(2)}</td>
                <td>{formatDate(order.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Canceled Orders</h2>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Canceled Orders"
            value={searchTermCanceled}
            onChange={e => setSearchTermCanceled(e.target.value)}
          />
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Order Date</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredCanceledOrders.length > 0 ? filteredCanceledOrders.map(order => (
              <tr key={order.orderId}>
                <td>
                  {getImageUrl(order.product.productId) && (
                    <img src={getImageUrl(order.product.productId)} alt={order.product.title} className='inventory-image' />
                  )}
                </td>
                <td>{order.product.title}</td>
                <td>₱{order.product.price}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.cancellationReason}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5">No canceled orders</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2>Orders Distribution</h2>
        <div className="chart-container">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Orders Distribution by Product',
                },
              },
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RSCompleteOrder;

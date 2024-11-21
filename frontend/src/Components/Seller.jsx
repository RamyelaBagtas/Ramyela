import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from './ElseNavbar/ElseNavbar';
import Ssidebar from './Ssidebar/Ssidebar';
import axios from 'axios';
import { useAuth } from './AuthContext';
import axiosInstance from './axiosInstance';

const Seller = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [forreceivalCount, setforreceivalCount] = useState(0);
  const [unshippedCount, setUnshippedCount] = useState(0);
  const [shipmentCount, setShipmentCount] = useState(0); // State for unshipped count
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        const productsResponse = await axiosInstance.get(`api/inventory/${userId}`);
        const productsWithImages = productsResponse.data.map(product => ({
          ...product,
          imageUrl: arrayBufferToBase64(product.image.data),
          totalStock: product.stockWithOrder + product.additionalStocks.reduce((total, stock) => total + (stock.stillAddStock || 0), 0),
        }));
        setProducts(productsWithImages);

        const ordersResponse = await axiosInstance.get(`api/consumernotif/${userId}`);
        setOrders(ordersResponse.data);

        const unshippedResponse = await axiosInstance.get(`api/count/unshipped/${userId}`);
        setUnshippedCount(unshippedResponse.data.unshipped);

        const shipmentResponse = await axiosInstance.get(`api/count/forshipment/${userId}`);
        setShipmentCount(shipmentResponse.data.shipped); // Set the unshipped count

        const forreceivalResponse = await axiosInstance.get(`api/count/forreceival/${userId}`);
        setforreceivalCount(forreceivalResponse.data.receival);

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
    if (!date) return 'N/A';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateTotalOrders = (productId) => {
    const productOrders = orders.filter(order => order.product.productId === productId);
    return productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
  };

  const productsWithWarnings = products.filter(product => {
    const totalOrders = calculateTotalOrders(product._id);
    const remainingStock = product.totalStock - totalOrders;
    return remainingStock <= 10 || (new Date(product.expirationDate) - new Date() <= 7 * 24 * 60 * 60 * 1000);
  });

  return (
    <div>
      <ElseNavbar />
      <Ssidebar />
      <div className="seller-container">
        <h1>⚠️ Products with Warnings</h1>
        {error && <p className="error-message">{error}</p>}

        {productsWithWarnings.length === 0 ? (
          <p>No products with critical stock levels or near expiration.</p>
        ) : (
          <table className="warning-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Expiration Date</th>
                <th>Total Stock</th>
                <th>Total Orders</th>
                <th>Remaining Stock</th>
                <th>Warnings</th>
              </tr>
            </thead>
            <tbody>
              {productsWithWarnings.map(product => {
                const totalOrders = calculateTotalOrders(product._id);
                const remainingStock = product.totalStock - totalOrders;

                return (
                  <tr key={product._id}>
                    <td>
                      {product.imageUrl && (
                        <img 
                          src={`data:image/jpeg;base64,${product.imageUrl}`} 
                          alt={product.title} 
                          style={{ width: '50px', height: '50px' }}
                        />
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>{product.price}</td>
                    <td>{product.stockWithOrder}</td>
                    <td>{formatDate(product.expirationDate)}</td>
                    <td>{product.totalStock}</td>
                    <td>{totalOrders}</td>
                    <td>{remainingStock}</td>
                    <td>
                      {remainingStock <= 10 && <p className="warning" style={{ color: '#d9534f' }}>⚠️ Critical stock level!</p>}
                      {new Date(product.expirationDate) - new Date() <= 7 * 24 * 60 * 60 * 1000 && (
                        <p className="warning">⚠️ Near expiration!</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

<h1>💰Sales</h1>

        <div className="for-approval-section">
          <h3>📝 For Approval: {unshippedCount}           <button 
            onClick={() => navigate('/userorder')} 
            style={{
              background: 'none',
              color: '#799FCB', // pastel blue color
              textDecoration: 'underline',
              border: 'none',
              borderRadius: '0',
              padding: '0',
              cursor: 'pointer',
              fontSize: '16px', // Adjust size as needed
              marginLeft: '50px'
            }}
          >
            See For Approval Orders
          </button></h3>
        </div>

        {/* New For Shipment Section */}
        <div className="for-shipment-section">
          <h3>🚚 For Shipment: {shipmentCount} <button 
            onClick={() => navigate('/torecievenasya')} 
            style={{
              background: 'none',
              color: '#799FCB', // pastel blue color
              textDecoration: 'underline',
              border: 'none',
              borderRadius: '0',
              padding: '0',
              cursor: 'pointer',
              fontSize: '16px', // Adjust size as needed
              marginLeft: '50px',
            }}
          >
            See For Shipment
          </button></h3>
        </div>
        <div className="for-shipment-section">
          <h3>📬 For Receival: {forreceivalCount}           <button 
            onClick={() => navigate('/torecievenasya')} 
            style={{
              background: 'none',
              color: '#799FCB', // pastel blue color
              textDecoration: 'underline',
              border: 'none',
              borderRadius: '0',
              padding: '0',
              cursor: 'pointer',
              fontSize: '16px', // Adjust size as needed
              marginLeft: '60px'
            }}
          >
            See For Receival
          </button></h3>

        </div>
      </div>
    </div>
  );
};

export default Seller;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../AuthContext';
import { useSnackbar } from 'notistack';
import './Cancel.css';
import Exporternavbar from '../Exporternavbar/Exporternavbar';
import axiosInstance from '../axiosInstance';

const ExporterCancel = () => {
  const { userId } = useAuth();
  const [canceledOrders, setCanceledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('/exportercancel');
  const { enqueueSnackbar } = useSnackbar();

  const shippingFee = 50;

  useEffect(() => {
    const fetchCanceledOrders = async () => {
      try {
        const response = await axiosInstance.get(`api/cancel/${userId}`);
        setCanceledOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching canceled orders:', error);
        setLoading(false);
        enqueueSnackbar('Failed to fetch canceled orders', { variant: 'error' });
      }
    };

    fetchCanceledOrders();
  }, [userId, enqueueSnackbar]);

  const handleButtonClick = (path) => {
    setActiveButton(path);
    navigate(path);
  };

  const calculateTotalAmount = (quantity, price) => {
    return (quantity * price + shippingFee).toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Exporternavbar />
      <div className="button-container">
        <button
          className={`btn-shipped-orders ${activeButton === '/exporterorder' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/exporterorder')}
        >
          To Approve
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/exporternashipna' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/exporternashipna')}
        >
          To Ship
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/exportertorecieveconsumer' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/exportertorecieveconsumer')}
        >
          To Receive
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/exportercancel' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/exportercancel')}
        >
          Cancelled
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/exporterrecievedconsumer' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/exporterrecievedconsumer')} style={{background: 'none'}}
        >
          Delivered
        </button>
      </div>

      <div className="cancel-container">
        <h1>Cancelled Orders</h1>
        {canceledOrders.length === 0 ? (
          <p>No cancelled orders found.</p>
        ) : (
          canceledOrders.map((order) => (
            <div key={order._id} className="order-summary">
              <div className="order-details">
                <div className="product-details">
                  {/* Check if product is an array or a single object */}
                  {Array.isArray(order.product) ? (
                    order.product.map((product) => (
                      <div key={product.productId} className="product-info">
                        <img src={product.image} alt={product.title} className="product-image" />
                        <h3>{product.title}</h3>
                        <p><strong>Quantity:</strong> {product.quantity}</p>
                        <p><strong>Price:</strong> ₱{product.price.toFixed(2)}</p>
                        <p><strong>Total:</strong> ₱{calculateTotalAmount(product.quantity, product.price)}</p>
                        <p><strong>Cancellation Reason:</strong> {product.cancellationReason || order.cancellationReason || 'N/A'}</p>
                        <button className="proceed-buttonss" onClick={() => navigate(`/allproductdisplay/${product.productId}`)}>Buy Again</button>
                      </div>
                    ))
                  ) : (
                    // If product is a single object, render it directly
                    <div className="product-info">
                      <img src={order.product.image} alt={order.product.title} className="product-image" />
                      <h3>{order.product.title}</h3>
                      <p><strong>Quantity:</strong> {order.product.quantity}</p>
                      <p><strong>Price:</strong> ₱{order.product.price.toFixed(2)}</p>
                      <p><strong>Total:</strong> ₱{calculateTotalAmount(order.product.quantity, order.product.price)}</p>
                      <p><strong>Cancellation Reason:</strong> {order.product.cancellationReason || order.cancellationReason || 'N/A'}</p>
                      <button className="proceed-buttonss" onClick={() => navigate(`/allproductdisplay/${order.product.productId}`)}>Buy Again</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExporterCancel;

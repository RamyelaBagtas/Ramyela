import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../AuthContext'; // Import useAuth hook from AuthContext
import { useSnackbar } from 'notistack'; // Import useSnackbar from notistack
import './Order.css';
import axiosInstance from '../axiosInstance';

const MyPurchase = () => {
  const { userId } = useAuth(); // Access userId from useAuth hook
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState('/mypurchase');
  const [selectedProductForCancel, setSelectedProductForCancel] = useState(null); // Track which product is being canceled
  const [cancellationReasons, setCancellationReasons] = useState([]); // Track selected cancellation reasons
  const navigate = useNavigate(); // Define navigate from react-router-dom
  const { enqueueSnackbar } = useSnackbar(); // Use useSnackbar for notifications

  const reasonOptions = [
    "Found a better price",
    "No longer needed",
    "Wrong item ordered",
    "Changed my mind",
  ]; // Example reasons

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(`api/${userId}`); // Update API endpoint to include userId
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]); // Include userId in the dependency array

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleButtonClick = (path) => {
    setActiveButton(path); // Update active button state
    navigate(path);
  };

  // Function to calculate total amount for each product
  const calculateTotalAmount = (quantity, price) => {
    return quantity * price;
  };

  // Function to show the cancellation modal
  const showCancelModal = (orderId, productId) => {
    setSelectedProductForCancel({ orderId, productId });
  };

  // Function to handle order cancellation
  const handleCancelOrder = async () => {
    if (cancellationReasons.length === 0) {
      enqueueSnackbar('Please select at least one reason for cancellation', { variant: 'warning' });
      return;
    }

    const { orderId, productId } = selectedProductForCancel;

    try {
      await axiosInstance.post('api/consumercancelorder', {
        productId,
        orderId,
        reasons: cancellationReasons, // Send the selected reasons to the backend
      });
      enqueueSnackbar('Cancellation request submitted successfully', { variant: 'success' });
      // Optionally, refresh the orders to reflect the cancellation status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                product: order.product.map((product) =>
                  product.productId === productId
                    ? { ...product, cancelRequest: 'pending', cancellationReason: cancellationReasons.join(', ') }
                    : product
                ),
              }
            : order
        )
      );
      setSelectedProductForCancel(null); // Close the modal
      setCancellationReasons([]); // Reset cancellation reasons
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      enqueueSnackbar('Failed to submit cancellation request', { variant: 'error' });
    }
  };

  const handleReasonChange = (reason) => {
    setCancellationReasons((prevReasons) =>
      prevReasons.includes(reason)
        ? prevReasons.filter((r) => r !== reason)
        : [...prevReasons, reason]
    );
  };

  const cancelModal = (
    <div className="cancel-modal">
      <h3>Select cancellation reasons:</h3>
      {reasonOptions.map((reason) => (
        <div key={reason}>
          <input
            type="checkbox"
            value={reason}
            onChange={() => handleReasonChange(reason)}
            checked={cancellationReasons.includes(reason)}
          />
          <label>{reason}</label>
        </div>
      ))}
      <button onClick={handleCancelOrder}>Submit Cancellation</button>
      <button onClick={() => setSelectedProductForCancel(null)}>Cancel</button>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="button-container">
        <button
          className={`btn-shipped-orders ${activeButton === '/mypurchase' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/mypurchase')}
        >
          To Approve
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/nashipna' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/nashipna')}
        >
          To Ship
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/torecieveconsumer' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/torecieveconsumer')}
        >
          To Receive
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/cancel' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/cancel')}
        >
          Cancelled
        </button>
        <button
          className={`btn-shipped-orders ${activeButton === '/recievedconsumer' ? 'active' : ''}`}
          onClick={() => handleButtonClick('/recievedconsumer')} style={{background: 'none'}}
        >
          Delivered
        </button>
      </div>
      <div className="purchase-container">
        <h1>Waiting for Approval</h1>
        {orders.length === 0 ? (
          <p>No purchases found.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-summary">
              <h2>Order Date: {new Date(order.date).toLocaleDateString()}</h2>
              <div className="order-details">
                {order.product.map((product) => (
                  <div key={product.productId} className="product-details">
                    <img src={product.image} alt={product.title} className="product-image" />
                    <div className="product-info">
                      <h3>{product.title}</h3>
                      <p>Quantity: {product.quantity}</p>
                      <p>Price: ₱{product.price && product.price.toFixed(2)}</p>
                      <p>Total: ₱{calculateTotalAmount(product.quantity, product.price) + 50}</p>
                      {product.cancelRequest ? (
                        <p>Cancellation Reason: {product.cancellationReason} < br/> Cancellation: {product.cancelRequest}</p>
                      ) : (
                        <button onClick={() => showCancelModal(order._id, product.productId)}>
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedProductForCancel && cancelModal}
    </div>
  );
};

export default MyPurchase;

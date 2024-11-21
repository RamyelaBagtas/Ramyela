// ReceiptPage.jsx
import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import './RecieptPage.css'
import Footer from '../Footer/Footer';
import Navbar from '../Navbar/Navbar';

const ReceiptPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { itemsToCheckout, defaultAddress, subtotal, shippingFee, totalAmount } = state;
    
    const receiptRef = useRef();
  
    const handlePrint = useReactToPrint({
      content: () => receiptRef.current,
    });

    
  
    return (
      <div>
        <Navbar />
        <div className="receipt-container" ref={receiptRef}>
          <h1>Billing</h1>
          <h2>Order Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {itemsToCheckout.map((product) => (
                <tr key={product._id}>
                  <td>{product.title}</td>
                  <td><img src={product.imageUrl} alt={product.title} className="product-image" /></td>
                  <td>{product.quantity}</td>
                  <td>₱{product.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="address-summary">
            <h2>Shipping Address</h2>
            <p>{defaultAddress ? `${defaultAddress.fullName}, ${defaultAddress.contactNumber}, ${defaultAddress.region}, ${defaultAddress.province}, ${defaultAddress.city}, ${defaultAddress.barangay}, ${defaultAddress.postalCode}, ${defaultAddress.street}, ${defaultAddress.houseNumber}, ${defaultAddress.country}` : 'No default address set'}</p>
          </div>
          <div className="totals-summary">
            <h3>Subtotal: ₱{subtotal}</h3>
            <h3>Shipping Fee: ₱{shippingFee.toFixed(2)}</h3>
            <h3>Total: ₱{totalAmount}</h3>
          </div>
        </div>
        <div className="button-container">
          <button className="back-button" onClick={() => navigate('/cart')}>Back to Cart</button>
        </div>
        <Footer />
      </div>
    );
  };
  
  export default ReceiptPage;

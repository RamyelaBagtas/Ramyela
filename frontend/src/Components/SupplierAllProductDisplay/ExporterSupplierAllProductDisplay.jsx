import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Footer from '../Footer/Footer';
import { useAuth } from '../AuthContext';
import { useSnackbar } from 'notistack';
import './SupplierAllProductDisplay.css';
import Exporternavbar from '../Exporternavbar/Exporternavbar';
import axiosInstance from '../axiosInstance';

const ExporterSupplierAllProductDisplay = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [product, setProduct] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedWholesaleTier, setSelectedWholesaleTier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { userId, isLoggedIn } = useAuth();

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('api/supplierproducts/displaysuser');
        const allProducts = response.data;
        const fetchedProduct = allProducts.find(product => product._id === id);
        if (fetchedProduct && fetchedProduct.productImage && fetchedProduct.productImage.data) {
          const base64String = arrayBufferToBase64(fetchedProduct.productImage.data);
          fetchedProduct.imageUrl = `data:image/jpeg;base64,${base64String}`;
        }
        setProduct(fetchedProduct || null);
      } catch (error) {
        console.error('Error fetching products:', error);
        enqueueSnackbar('Failed to fetch product details', { variant: 'error' });
      }
    };

    fetchProducts();
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
        
        try {
          if (!isLoggedIn) {
            enqueueSnackbar('User not logged in', { variant: 'error' });
            return;
          }
      
          const response = await axiosInstance.get(`api/address/default/${userId}`);
          setDefaultAddress(response.data);
        } catch (error) {
          enqueueSnackbar('Error fetching default address', { variant: 'error' });
          console.error('Error fetching default address:', error);
        }
      };

    if (userId) {
      fetchDefaultAddress();
    }
  }, [userId, enqueueSnackbar]);

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const buyNow = () => {
    if (!userId) {
      enqueueSnackbar('Please log in to proceed with the purchase', { variant: 'warning' });
      return;
    }
    setShowOrderForm(true); // Show the order form
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();

    if (new Date(startDate) > new Date(endDate)) {
      enqueueSnackbar('End date must be later than start date', { variant: 'warning' });
      return;
    }

    const orderDetails = {
      userId: userId,
      supplierproducts: { productId: id },
      quantity: quantity,
      totalAmount: totalPrice,
      defaultAddress: defaultAddress,
      date: new Date().toISOString(),
      startDate: startDate, // Start Date from the form
      endDate: endDate,   // End Date from the form
    };

    try {
      await axiosInstance.post('api/place-order', orderDetails);
      enqueueSnackbar('Order placed successfully!', { variant: 'success' });
      setShowOrderForm(false);
    } catch (error) {
      enqueueSnackbar('Failed to place order', { variant: 'error' });
    }
  };

  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value);
    setQuantity(newQuantity);
    updateTotalPrice(newQuantity);
  };

  const handleTierSelect = (tier) => {
    setSelectedWholesaleTier(tier);
    updateTotalPrice(quantity);
  };

  const updateTotalPrice = (newQuantity) => {
    if (!product || !product.wholesaleTiers) return;

    const matchedTier = product.wholesaleTiers.find(tier => 
      newQuantity >= tier.minOrder && newQuantity <= tier.maxOrder
    );

    if (matchedTier) {
      setSelectedWholesaleTier(matchedTier);
    } else {
      setSelectedWholesaleTier(null);
    }
  };

  const totalPrice = selectedWholesaleTier
    ? selectedWholesaleTier.unitPrice * quantity
    : 0;

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div>
      <Exporternavbar />
      <div className="product-display-container">
        {product && product.imageUrl && (
          <img src={product.imageUrl} alt={product.productTitle} />
        )}
        <div className="product-info">
          {product ? (
            <>
              <h1>{product.productTitle}</h1>
              <p className="description"><strong>Description:</strong> {product.productDescription}</p>
              <p className="category"><strong>Category:</strong> {product.category}</p>
              <p><strong>Pre Order: </strong>{product.preOrder ? 'No' : 'Yes'}</p>
              <p className="manufacture-date"><strong>Manufacture Date:</strong> {formatDate(product.manufactureDate)}</p>
              <p className="expiration-date"><strong>Expiration Date:</strong> {formatDate(product.expirationDate)}</p>
              {product.wholesaleTiers && (
                <div className="wholesale-tiers">
                  <h3>Wholesale Price</h3>
                  <ul>
                    {product.wholesaleTiers.map((tier, index) => (
                      <li key={index} onClick={() => handleTierSelect(tier)}>
                        {tier.minOrder} - {tier.maxOrder}: ₱{tier.unitPrice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button onClick={buyNow}>Buy Now</button>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

      {showOrderForm && (
        <div className="overlay">
          <div className="order-form-container">
            <form onSubmit={handleOrderSubmit} className="order-form">
              <h2>Order Form</h2>
              <div>
                <p><strong>Product Title:</strong> {product.productTitle}</p>
                {product.wholesaleTiers && selectedWholesaleTier && (
                  <p>
                    <strong>Wholesale Price:</strong> {selectedWholesaleTier.minOrder} - {selectedWholesaleTier.maxOrder} : ₱{selectedWholesaleTier.unitPrice}
                  </p>
                )}
              </div>
              <label>
                Quantity:
                <input 
                  type="number" 
                  name="quantity" 
                  min="1" 
                  max={product?.stock} 
                  value={quantity}
                  onChange={handleQuantityChange}
                  required
                />
              </label>

              <br />
              <br />
              
              {/* Start and End Date Range Inputs */}
              <label>
                <p>Date Needed:</p>
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  min={today} // Disable past dates
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={endDate}
                  min={startDate || today} // Ensure end date is not before start date
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </label>

              <div className="order-summary">
                <h3>Order Summary</h3>
                <p><strong>Total Price:</strong> ₱{totalPrice.toFixed(2)}</p>
              </div>

              {defaultAddress && (
                <div className="default-address">
                  <h3>Shipping Address</h3>
                  <p>Name: {defaultAddress.fullName}</p>
                  <p>Address: {defaultAddress.street}, {defaultAddress.barangay}, {defaultAddress.city}, {defaultAddress.province}, {defaultAddress.region}, {defaultAddress.country} - {defaultAddress.postalCode}</p>
                  <p><strong>Contact:</strong> {defaultAddress.contactNumber}</p>
                </div>
              )}

              <button type="submit">Place Order</button>
              <button type="button" onClick={() => setShowOrderForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ExporterSupplierAllProductDisplay;

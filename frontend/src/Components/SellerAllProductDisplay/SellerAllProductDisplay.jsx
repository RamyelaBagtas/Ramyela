import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SellerAllProductDisplay.css';
import { useSnackbar } from 'notistack';
import ResellerNavbar from '../ResellerNavbar/ResellerNavbar';
import axiosInstance from '../axiosInstance';

const SellerAllProductDisplay = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [product, setProduct] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const today = new Date().toISOString().split('T')[0]; 


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get('api/allproducts/displaysuser');
        const allProducts = response.data;

        // Find the product by id
        const fetchedProduct = allProducts.find((prod) => prod._id === id);

        if (fetchedProduct && fetchedProduct.image && fetchedProduct.image.data) {
          const base64String = arrayBufferToBase64(fetchedProduct.image.data);
          fetchedProduct.imageUrl = `data:image/jpeg;base64,${base64String}`;
        }

        // Calculate total stock with additional stocks
        fetchedProduct.stock = calculateTotalStock(fetchedProduct.stock, fetchedProduct.additionalStocks);

        fetchedProduct.expirationDate = formatDate(fetchedProduct.expirationDate); // Format the expiration date

        setProduct(fetchedProduct || null);
      } catch (error) {
        console.error('Error fetching product:', error);
        enqueueSnackbar('Failed to fetch product details', { variant: 'error' });
      }
    };

    fetchProduct();
  }, [id, enqueueSnackbar]);
  

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const calculateTotalStock = (stock, additionalStocks) => {
    if (!additionalStocks || !Array.isArray(additionalStocks)) return stock;
    return additionalStocks.reduce((total, stockEntry) => total + stockEntry.addstock, stock);
  };


  return (
    <div>
        <ResellerNavbar/>
      <div className="product-display-container">
        {product && product.imageUrl && (
          <img src={product.imageUrl} alt={product.title} className="product-image" />
        )}
        <div className="product-info">
          {product ? (
            <>
              <h1>{product.title}</h1>
              <p className="category"><strong>Category:</strong> {product.category}</p>
              <p className="price"><strong>Price:</strong> ₱{product.price}</p>
              <p className="quantity"><strong>Expiration Date:</strong> {formatDate(product.expirationDate)}</p>
              <p className="stock"><strong>Stock:</strong> {product.stock}</p>
              <p className="description"><strong>Description:</strong> {product.description}</p>
              {product.firstName && product.lastName && (
                <div className="product-supplier-info">
                  <p><strong>Provider's Name:</strong> {product.firstName} {product.lastName}</p>
                </div>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAllProductDisplay;

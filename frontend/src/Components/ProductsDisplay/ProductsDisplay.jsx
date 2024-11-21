import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ProductsDisplay.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useAuth } from '../AuthContext'; // Assuming the correct path to your useAuth hook or context
import { useSnackbar } from 'notistack'; // Assuming you have installed and imported notistack
import axiosInstance from '../axiosInstance';

const ProductsDisplay = () => {
  const { id } = useParams();
  const location = useLocation();
  const { userId } = useAuth(); // Assuming useAuth provides userId
  const { enqueueSnackbar } = useSnackbar();
  const [product, setProduct] = useState(location.state?.product || null);
  const [NavbarVisible, setNavbarVisible] = useState(true);
  const [FooterVisible, setFooterVisible] = useState(true);

  useEffect(() => {
    if (!product) {
      const fetchProduct = async () => {
        try {
          const response = await axiosInstance.get(`api/products/${id}`);
          const fetchedProduct = response.data;

          if (fetchedProduct.image && fetchedProduct.image.data) {
            const base64String = arrayBufferToBase64(fetchedProduct.image.data);
            fetchedProduct.imageUrl = `data:image/jpeg;base64,${base64String}`;
          }

          fetchedProduct.expirationDate = formatDate(fetchedProduct.expirationDate); // Format the date

          setProduct(fetchedProduct);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };

      fetchProduct();
    }
  }, [id, product]);

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

  const addToCart = async () => {
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    try {
      const response = await axiosInstance.post('api/add-to-cart', {
        consumerId: userId, // Assuming userId is used for consumerId
        userId: userId,
        productId: id,
        quantity: 1,
      });

      console.log(response.data); // Assuming your backend sends a success message

      // Show notification using notistack
      enqueueSnackbar('Product added to cart successfully!', { variant: 'success' });

    } catch (error) {
      console.error('Error adding product to cart:', error);
      // Show error notification using notistack
      enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
    }
  };

  const toggleNavbar = () => {
    setNavbarVisible(!NavbarVisible);
  };

  const toggleFooter = () => {
    setFooterVisible(!FooterVisible);
  };

  return (
    <div>
      {NavbarVisible && <Navbar />}
      <div className="product-display-container">
        {product && product.imageUrl && (
          <img src={product.imageUrl} alt={product.title} />
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
              <button onClick={addToCart}>Add to Cart</button>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      {FooterVisible && <Footer />}
    </div>
  );
};

export default ProductsDisplay;

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './RSproductdisplay.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useAuth } from '../AuthContext'; 
import { useSnackbar } from 'notistack'; 
import axiosInstance from '../axiosInstance';

const RSproductsdisplay = () => {
  const { id } = useParams();
  const location = useLocation();
  const { userId } = useAuth(); 
  const { enqueueSnackbar } = useSnackbar(); 
  const [product, setProduct] = useState(location.state?.product || null);
  const [NavbarVisible, setNavbarVisible] = useState(true);
  const [FooterVisible, setFooterVisible] = useState(true);

  useEffect(() => {
    if (!product) {
      // Fetch product details if not passed through state
      const fetchProduct = async () => {
        try {
          const response = await axiosInstance.get(`api/rsproducts/${id}`);
          const fetchedProduct = response.data;

          // Convert image data to base64 if present
          if (fetchedProduct.image && fetchedProduct.image.data) {
            const base64String = arrayBufferToBase64(fetchedProduct.image.data);
            fetchedProduct.imageUrl = `data:image/jpeg;base64,${base64String}`;
          }

          setProduct(fetchedProduct);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };

      fetchProduct();
    }
  }, [id, product]);

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const addToCart = async () => {
    if (!userId) {
      enqueueSnackbar('User not logged in', { variant: 'error' });
      return;
    }

    try {
      const response = await axiosInstance.post('api/RSadd-to-cart', {
        consumerId: userId,
        productId: id,
        quantity: 1,
      });

      console.log(response.data); // Assuming your backend sends a success message

      // Alert when product is added to cart
      enqueueSnackbar('Product added to cart successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
    }
  };

  if (!product) {
    return <div>Loading product details...</div>;
  }

  const toggleNavbar = () => {
    setNavbarVisible(!NavbarVisible);
  };

  const toggleFooter = () => {
    setFooterVisible(!FooterVisible);
  };
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      {NavbarVisible && <Navbar />}
      <div className="product-display-container">
        <img src={product.imageUrl} alt={product.title} />
        <div className="product-info">
          <h1>{product.title}</h1>
          <p className="category"><strong>Category:</strong> {product.category}</p>
          <p className="price"><strong>Price:</strong> ₱{product.price}</p>
          <p className="quantity"><strong>Expiration Date:</strong> {formatDate(product.expirationDate)}</p>
          <p className="stock"><strong>Stock:</strong> {product.stock}</p>
          <p className="description"><strong>Description:</strong> {product.description}</p>
          {product.firstName && product.lastName && (
            <div className="product-supplier-info">
              <p><strong>Reseller Name:</strong> {product.firstName} {product.lastName}</p>
            </div>
          )}
          <button onClick={addToCart}>Add to Cart</button>
        </div>
      </div>
      {FooterVisible && <Footer />}
    </div>
  );
};

export default RSproductsdisplay;

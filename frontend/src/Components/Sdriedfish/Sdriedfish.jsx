import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Sdriedfish.css'
import axiosInstance from '../axiosInstance';

const Sdriedfish = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('api/sproducts/dried-fish');
      if (response && response.data) {
        const productsWithImages = await Promise.all(
          response.data.map(async product => {
            if (product.image && product.image.data) {
              const base64String = await arrayBufferToBase64(product.image.data);
              return { ...product, imageUrl: `data:image/jpeg;base64,${base64String}` };
            }
            return product;
          })
        );
        setProducts(productsWithImages);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    }
  };

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return (
    <div className="sdriedproducts-container">
      <h1>Dried Fish Products From Supplier</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="sdriedproducts-grid">
        {products.map(product => (
          <div className="sdriedproduct-card" key={product._id}>
            {product.imageUrl && (
              <Link
                to={{
                  pathname: `/allproductdisplay/${product._id}`,
                  state: { product }
                }}
              >
                <img src={product.imageUrl} alt={product.title} />
              </Link>
            )}
            <h3>{product.title}</h3>
            <p>₱{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sdriedfish;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './RSproducts.css'
import axiosInstance from '../axiosInstance';

const ForSeller = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('api/suplayerproducts/displaysuser');
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
    <div>
    <div className="rsproducts-container">
      <h1>Products From Supplier</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="rsproducts-grid">
        {products.map(product => (
          <div className="rsproduct-card" key={product._id}>
            {product.productImage && (
              <Link
                to={{
                  pathname: `/supplierallproductdisplay/${product._id}`,
                  state: { product }
                }}
              >
                <img src={product.productImage} alt={product.title} />
              </Link>
            )}
            <h3>{product.productTitle}</h3>
            <p>Wholesale</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ForSeller;

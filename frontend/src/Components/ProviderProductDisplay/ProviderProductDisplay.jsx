import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './ProviderProductDisplay.css';  // Make sure to create this CSS file
import axiosInstance from '../axiosInstance';

const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const ProviderProductDisplay = () => {
    const { userId } = useParams();
    const [products, setProducts] = useState([]);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState('');
    const [noProducts, setNoProducts] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get(`api/providerproducts/${userId}`);
                if (response && response.data) {
                    const providerData = response.data.provider;
                    const productsData = response.data.products;

                    // Check if productsData is empty
                    if (productsData.length === 0) {
                        setNoProducts(true);
                    } else {
                        setNoProducts(false);

                        const productsWithImages = await Promise.all(
                            productsData.map(async product => {
                                if (product.image && product.image.data) {
                                    const base64String = await arrayBufferToBase64(product.image.data);
                                    return { ...product, imageUrl: `data:image/jpeg;base64,${base64String}` };
                                }
                                return { ...product, imageUrl: '' };
                            })
                        );

                        setProvider(providerData);
                        setProducts(productsWithImages);
                    }
                } else {
                    setError('');
                }
            } catch (error) {
                setError('');
                console.error('', error);
            }
        };

        fetchProducts();
    }, [userId]);

    return (
        <div>
            <Navbar />
            <div className="provider-products-container">
                <div className="provider-header">
                    {provider && (
                        <div className="provider-info">
                            <img 
                                src={provider.displayPictureURL} 
                                alt={`${provider.firstName} ${provider.lastName}`} 
                                className="provider-image"
                            />
                            <h2>{provider.firstName} {provider.lastName}</h2>
                        </div>
                    )}
                    <h1>All Products</h1>
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="provider-products-grid">
                    {noProducts ? (
                        <p>No products available from this provider.</p>
                    ) : (
                        products.length > 0 ? (
                            products.map(product => (
                                <Link 
                                    to={`/allproductdisplay/${product._id}`} 
                                    key={product._id} 
                                    className="provider-product-link"
                                >
                                    <div className="provider-product-card">
                                        {product.imageUrl && (
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.title} 
                                                className="provider-product-image"
                                            />
                                        )}
                                        <h3>{product.title}</h3>
                                        <p>₱{product.price}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No products available from this provider.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderProductDisplay;

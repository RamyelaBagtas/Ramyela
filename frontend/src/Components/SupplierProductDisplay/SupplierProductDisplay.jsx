import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import RSSSnavbar from '../RSSSnavbar/RSSSnavbar';
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

const SupplierProductDisplay = () => {
    const { userId } = useParams();
    const [supplierproducts, setSupplierProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState('');
    const [noProducts, setNoProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get(`api/supplier/products/${userId}`);
                if (response && response.data) {
                    const providerData = response.data.provider;
                    const supplierproductsData = response.data.supplierproducts;

                    if (supplierproductsData.length === 0) {
                        setNoProducts(true);
                    } else {
                        setNoProducts(false);

                        const supplierproductsWithImages = supplierproductsData.map(supplierproduct => {
                            if (supplierproduct.productImage && supplierproduct.productImage.data) {
                                const base64String = arrayBufferToBase64(supplierproduct.productImage.data);
                                return { ...supplierproduct, imageUrl: `data:image/jpeg;base64,${base64String}` };
                            }
                            return { ...supplierproduct, imageUrl: '' };
                        });

                        setProvider(providerData);
                        setSupplierProducts(supplierproductsWithImages);
                        setFilteredProducts(supplierproductsWithImages); // Initialize filtered products
                    }
                } else {
                    setError('Failed to load products.');
                }
            } catch (error) {
                setError('Error loading products.');
                console.error('Error:', error);
            }
        };

        fetchProducts();
    }, [userId]);

    useEffect(() => {
        // Filter products based on the search term
        if (searchTerm) {
            const filtered = supplierproducts.filter(product =>
                product.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(supplierproducts);
        }
    }, [searchTerm, supplierproducts]);

    return (
        <div>
            <RSSSnavbar />
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
                            <p>{provider.contactNumber}</p>
                        </div>
                    )}
                    <h1>All Products</h1>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="provider-products-grid">
                    {noProducts ? (
                        <p>No products available from this provider.</p>
                    ) : (
                        filteredProducts.length > 0 ? (
                            filteredProducts.map(supplierproduct => (
                                <Link 
                                    to={`/supplierallproductdisplay/${supplierproduct._id}`} 
                                    key={supplierproduct._id} 
                                    className="provider-product-link"
                                >
                                    <div className="provider-product-card">
                                        {supplierproduct.productImage && (
                                            <img 
                                                src={supplierproduct.imageUrl} 
                                                alt={supplierproduct.productTitle} 
                                                className="provider-product-image"
                                            />
                                        )}
                                        <h3>{supplierproduct.productTitle}</h3>
                                        <div className="wholesale-tiers">
                                            {supplierproduct.wholesaleTiers.map((tier, index) => (
                                                <p key={index}>Qty: {tier.minOrder} - {tier.maxOrder} @ ₱{tier.unitPrice}</p>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No products match your search.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierProductDisplay;

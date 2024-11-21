import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './AllProductDisplay.css';
import Footer from '../Footer/Footer';
import { useAuth } from '../AuthContext'; // Assuming the correct path to your useAuth hook or context
import { useSnackbar } from 'notistack'; // Assuming you have installed and imported notistack
import Exporternavbar from '../Exporternavbar/Exporternavbar';
import axiosInstance from '../axiosInstance';

const ExportersAllProductsDisplay = () => {
  const { id } = useParams();
  const { userId } = useAuth(); // Assuming useAuth provides userId
  const { enqueueSnackbar } = useSnackbar();
  const [product, setProduct] = useState(null);
  const [NavbarVisible, setNavbarVisible] = useState(true);
  const [FooterVisible, setFooterVisible] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('api/allproducts/displaysuser');
        const allProducts = response.data;

        // Find the product by ida
        const fetchedProduct = allProducts.find(product => product._id === id);

        if (fetchedProduct && fetchedProduct.image && fetchedProduct.image.data) {
          const base64String = arrayBufferToBase64(fetchedProduct.image.data);
          fetchedProduct.imageUrl = `data:image/jpeg;base64,${base64String}`;
        }

        // Add the additional stock to the product stock
        fetchedProduct.stock = calculateTotalStock(fetchedProduct.stock, fetchedProduct.additionalStocks);

        fetchedProduct.expirationDate = formatDate(fetchedProduct.expirationDate); // Format the date

        setProduct(fetchedProduct || null);
      } catch (error) {
        console.error('Error fetching products:', error);
        enqueueSnackbar('Failed to fetch product details', { variant: 'error' });
      }
    };

    fetchProducts();
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

  // Function to calculate total stock including additional stocks
  const calculateTotalStock = (stock, additionalStocks) => {
    if (!additionalStocks || !Array.isArray(additionalStocks)) return stock;
    return additionalStocks.reduce((total, stockEntry) => total + stockEntry.addstock, stock);
  };

  const addToCart = async () => {
    if (!userId) {
      console.error('User not logged in');
      enqueueSnackbar('Please log in to add items to the cart', { variant: 'warning' });
      return;
    }

    try {
      const response = await axiosInstance.post('api/all-add-to-cart', {
        consumerId: userId,
        userId: userId,
        productId: id,
        quantity: 1,
      });

      console.log(response.data);
      enqueueSnackbar('Product added to cart successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
    }
  };


  const toggleFooter = () => {
    setFooterVisible(!FooterVisible);
  };

  return (
    <div>
      <Exporternavbar/>
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

export default ExportersAllProductsDisplay;

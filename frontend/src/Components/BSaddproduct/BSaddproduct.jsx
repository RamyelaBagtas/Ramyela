import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack'; 
import './BSaddproduct.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import { useAuth } from '../AuthContext'; 
import axiosInstance from '../axiosInstance';

const BSaddproduct = () => {
  const { userId, firstName, lastName, displayPictureURL } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [elseNavbarVisible, setElseNavbarVisible] = useState(true);
  const [sSidebarVisible, setSsidebarVisible] = useState(true);

  const { enqueueSnackbar } = useSnackbar(); 

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const calculateMinExpirationDate = (category) => {
    const currentDate = new Date();
    if (category === 'driedfish') {
      currentDate.setMonth(currentDate.getMonth() + 6);
    } else if (category === 'gourmet') {
      currentDate.setMonth(currentDate.getMonth() + 12);
    }
    return currentDate.toISOString().split('T')[0]; 
  };

  const formatPrice = (value) => {
    // Ensure value is a number and format it
    const numValue = parseFloat(value.replace(/,/g, '')); // Remove existing commas
    return isNaN(numValue) ? '' : numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, ''); // Remove commas
    if (!isNaN(rawValue)) {
      setPrice(formatPrice(rawValue));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const minExpirationDate = calculateMinExpirationDate(category);

    if (expirationDate < minExpirationDate) {
      setError(`Expiration date must be at least ${category === 'driedfish' ? '6' : '12'} months from today.`);
      enqueueSnackbar(`Expiration date must be at least ${category === 'driedfish' ? '6' : '12'} months from today.`, { variant: 'warning' });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('expirationDate', expirationDate);
    formData.append('stock', stock);
    formData.append('price', price.replace(/,/g, '')); // Store raw price without commas
    formData.append('userId', userId); 
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('displayPictureURL', displayPictureURL);
    formData.append('image', image);

    try {
      const response = await axiosInstance.post('api/bsproducts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsLoading(false);
      enqueueSnackbar('Product added successfully', { variant: 'success' });
      console.log('Product added:', response.data);

      setTitle('');
      setDescription('');
      setImage(null);
      setImageUrl('');
      setCategory('');
      setExpirationDate('');
      setStock('');
      setPrice('');
    } catch (error) {
      setIsLoading(false);
      setError('Failed to add product. Please try again.');
      enqueueSnackbar('Failed to add product. Please try again.', { variant: 'error' });
      console.error('Error adding product:', error);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setExpirationDate('');
  };

  return (
    <div>
      {elseNavbarVisible && <ElseNavbar />}
      {sSidebarVisible && <Ssidebar />}
      <div className="add-product-container">
        <h2>Add Product</h2>
        <div className="form-group" hidden>
          <label>User Id:</label>
          <input
            type="text"
            value={userId}
            readOnly 
          />
        </div>
        <form onSubmit={handleAddProduct}>
          <div className="form-group">
            <label>Product Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Product Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Product Image:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} required />
            {imageUrl && <img src={imageUrl} alt="Product Preview" />}
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select value={category} onChange={handleCategoryChange} required>
              <option value="">Select Category</option>
              <option value="gourmet">Gourmet</option>
              <option value="driedfish">Dried Fish</option>
            </select>
          </div>
          <div className="form-group">
            <label>Expiration Date:</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={calculateMinExpirationDate(category)}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock:</label>
            <input
              type="text"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="text" // Change input type to text for formatted price
              value={price}
              onChange={handlePriceChange}
              required
              placeholder="0.00" // Placeholder to show expected format
            />
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <button className='btn-submit' type="submit">Add Product</button>
              {error && <p>{error}</p>}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default BSaddproduct;

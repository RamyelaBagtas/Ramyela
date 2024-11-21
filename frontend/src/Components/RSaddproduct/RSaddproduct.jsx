import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import './RSaddproduct.css';
import RSsidebar from '../RSsidebar/RSsidebar';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import { useAuth } from '../AuthContext'; // Import useAuth
import axiosInstance from '../axiosInstance';

const RSaddproduct = () => {
  const [elseNavbarVisible, setElseNavbarVisible] = useState(true);
  const [rsSidebarVisible, setRsSidebarVisible] = useState(true); // Retrieve userId from AuthContext
  const { userId, firstName, lastName, displayPictureURL } = useAuth(); // Fetch additional user data
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
    formData.append('price', price);
    formData.append('userId', userId); 
    formData.append('firstName', firstName); // Include firstName
    formData.append('lastName', lastName); // Include lastName
    formData.append('displayPictureURL', displayPictureURL); // Include displayPictureURL
    formData.append('image', image);

    try {
      const response = await axiosInstance.post('api/rsproducts', formData, {
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


  const toggleElseNavbar = () => {
    setElseNavbarVisible(!elseNavbarVisible);
  };

  const toggleRsSidebar = () => {
    setRsSidebarVisible(!rsSidebarVisible);
  };

  return (
    <div>
      {elseNavbarVisible && <ElseNavbar />}
      {rsSidebarVisible && <RSsidebar />}
      <div className="reselleradd-product-container">
        <h2>Add Product</h2>
        <div className="rsform-group">
            <label>User Id:</label>
            <input
              type="text"
              value={userId}
              readOnly // Make it read-only
            />
          </div>
        <form onSubmit={handleAddProduct}>
          <div className="rsform-group">
            <label>Product Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="rsform-group">
            <label>Product Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="rsform-group">
            <label>Product Image:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} required />
            {imageUrl && <img src={imageUrl} alt="Product Preview" />}
          </div>
          <div className="rsform-group">
            <label>Category:</label>
            <select value={category} onChange={handleCategoryChange} required>
              <option value="">Select Category</option>
              <option value="gourmet">Gourmet</option>
              <option value="driedfish">Dried Fish</option>
            </select>
          </div>
          <div className="rsform-group">
            <label>Expiration Date:</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={calculateMinExpirationDate(category)}
              required
            />
          </div>
          <div className="rsform-group">
            <label>Stock:</label>
            <input
              type="text"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="rsform-group">
            <label>Price:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
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

export default RSaddproduct;

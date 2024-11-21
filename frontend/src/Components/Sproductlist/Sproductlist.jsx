import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Sproductlist.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import { useSnackbar } from 'notistack';
import axiosInstance from '../axiosInstance';

const Sproductlist = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [elseNavbarVisible, setElseNavbarVisible] = useState(true);
  const [sSidebarVisible, setSSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [sortOrder, setSortOrder] = useState('asc'); 


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }
        const response = await axiosInstance.get(`api/sproducts/user/${userId}`);
        console.log('Products:', response.data);
        const productsWithImages = response.data.map(product => ({
          ...product,
          imageUrl: arrayBufferToBase64(product.image.data)
        }));
        
        // Sort products by expiration date
        const sortedProducts = productsWithImages.sort((a, b) => {
          const dateA = new Date(a.expirationDate);
          const dateB = new Date(b.expirationDate);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
  
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      }
    };
  
    fetchProducts();
  }, [sortOrder]); // Dependency on sortOrder to refetch products when sorting changes
  

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleArchiveProduct = async (id) => {
    try {
      await axiosInstance.post(`api/sproducts/archive/${id}`);
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      setError('Failed to archive product');
      console.error('Error archiving product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = async () => {
    try {
      const expirationDate = new Date(editingProduct.expirationDate);
      const currentDate = new Date();
      let isValid = true;

      if (editingProduct.category === 'driedfish') {
        const minDriedFishDate = new Date();
        minDriedFishDate.setMonth(currentDate.getMonth() + 6);
        if (expirationDate < minDriedFishDate) {
          enqueueSnackbar('Expiration date for dried fish must be 6 months or longer from today.', { variant: 'error' });
          isValid = false;
        }
      } else if (editingProduct.category === 'gourmet') {
        const minGourmetDate = new Date();
        minGourmetDate.setMonth(currentDate.getMonth() + 12);
        if (expirationDate < minGourmetDate) {
          enqueueSnackbar('Expiration date for gourmet products must be 12 months or longer from today.', { variant: 'error' });
          isValid = false;
        }
      }

      if (!isValid) return;

      const response = await axiosInstance.put(`api/sproducts/${editingProduct._id}`, editingProduct);
      setProducts(products.map(product => (product._id === editingProduct._id ? response.data : product)));
      setEditingProduct(null);
      enqueueSnackbar('Product updated successfully!', { variant: 'success' }); // Success notification
    } catch (error) {
      setError('Failed to update product');
      enqueueSnackbar('Failed to update product. Please try again.', { variant: 'error' }); // Error notification
      console.error('Error updating product:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: value
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleElseNavbar = () => {
    setElseNavbarVisible(!elseNavbarVisible);
  };

  const toggleSSidebar = () => {
    setSSidebarVisible(!sSidebarVisible);
  };

  const navigateToArchive = () => {
    navigate('/archive');
  };

  // Function to check if the product is about to expire and return a warning message
  const getExpirationWarning = (expirationDate) => {
    const date = new Date(expirationDate);
    const today = new Date();
    const warningDate = new Date(today);
    warningDate.setDate(today.getDate() + 7);

    if (date <= warningDate) {
      const daysLeft = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      return `Warning: Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
    }

    return '';
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };
  
  return (
    <div>
      {elseNavbarVisible && <ElseNavbar />}
      {sSidebarVisible && <Ssidebar />}
      <div className="sview-products-container">
        <button className="btn-see-archive" onClick={navigateToArchive}>See Archive</button>
        <button className="btn-sort" onClick={toggleSortOrder}>
          Sort by Expiration Date: {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        {error && <p className="error-message">{error}</p>}
        <div className="sproducts-grid">
          {products.length > 0 ? (
            <table className="sproduct-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className={getExpirationWarning(product.expirationDate) ? 'expiring-soon' : ''}>
                    <td>
                      {product.imageUrl && (
                        <img src={`data:image/jpeg;base64,${product.imageUrl}`} alt={product.title} />
                      )}
                    </td>
                    <td>
                      {editingProduct && editingProduct._id === product._id ? (
                        <input
                          type="text"
                          name="title"
                          value={editingProduct.title}
                          onChange={handleChange}
                        />
                      ) : (
                        product.title
                      )}
                    </td>
                    <td>
                      {editingProduct && editingProduct._id === product._id ? (
                        <textarea
                          name="description"
                          value={editingProduct.description}
                          onChange={handleChange}
                        />
                      ) : (
                        product.description
                      )}
                    </td>
                    <td>
                      {editingProduct && editingProduct._id === product._id ? (
                        <input
                          type="number"
                          name="price"
                          value={editingProduct.price}
                          onChange={handleChange}
                        />
                      ) : (
                        `₱${product.price}`
                      )}
                    </td>
                    <td>
                      {editingProduct && editingProduct._id === product._id ? (
                        <input
                          type="number"
                          name="stock"
                          value={editingProduct.stock}
                          onChange={handleChange}
                        />
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      {editingProduct && editingProduct._id === product._id ? (
                        <input
                          type="date"
                          name="expirationDate"
                          value={formatDate(editingProduct.expirationDate)} // Format date
                          onChange={handleChange}
                        />
                      ) : (
                        <>
                          {formatDate(product.expirationDate)} <br />
                          <span className="expiration-warning">{getExpirationWarning(product.expirationDate)}</span>
                        </>
                      )}
                    </td>
                    <td>
                      {editingProduct && editingProduct._id === product._id ? (
                        <>
                          <button className="btn-save" onClick={handleSaveEdit}>Save</button>
                          <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-archive" onClick={() => handleArchiveProduct(product._id)}>Archive</button>
                          <button className="btn-edit" onClick={() => handleEditProduct(product)}>Edit</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>
    </div>
  );
}; 

export default Sproductlist;

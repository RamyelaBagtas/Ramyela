import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack'; 
import './BSproductlist.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import Ssidebar from '../Ssidebar/Ssidebar';
import { useAuth } from '../AuthContext';
import axiosInstance from '../axiosInstance';

const BSproductlist = () => {
  const { userId } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [elseNavbarVisible, setElseNavbarVisible] = useState(true);
  const [bsSidebarVisible, setBsSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); 
  const [sortOrder, setSortOrder] = useState('asc');
  const [additionalStockData, setAdditionalStockData] = useState({}); // Change to object

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!userId) {
          console.error('User ID not found');
          return;
        }
        const response = await axiosInstance.get(`api/products/user/${userId}`);
        const productsWithImages = response.data.map(product => ({
          ...product,
          imageUrl: arrayBufferToBase64(product.image.data)
        }));

        const additionalStockPromises = productsWithImages.map(async (product) => {
          const additionalResponse = await axiosInstance.get(`api/products/${product._id}/add-stock`);
          return {
            ...product,
            additionalStocks: additionalResponse.data || []
          };
        });

        const productsWithAdditionalStock = await Promise.all(additionalStockPromises);
        const sortedProducts = productsWithAdditionalStock.sort((a, b) => {
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
  }, [sortOrder, userId]); // Include userId in dependencies

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBSArchiveProduct = async (id) => {
    try {
      await axiosInstance.post(`api/products/archive/${id}`);
      setProducts(products.filter(product => product._id !== id));
      enqueueSnackbar('Product archived successfully', { variant: 'success' });
    } catch (error) {
      setError('Failed to archive product');
      enqueueSnackbar('Failed to archive product', { variant: 'error' });
    }
  };

  const handleBSEditProduct = (product) => {
    setEditingProduct({
      ...product,
      expirationDate: formatDate(product.expirationDate)
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axiosInstance.put(`api/products/${editingProduct._id}`, {
        ...editingProduct,
        expirationDate: new Date(editingProduct.expirationDate).toISOString()
      });
      setProducts(products.map(product => (product._id === editingProduct._id ? response.data : product)));
      setEditingProduct(null);
      enqueueSnackbar('Product updated successfully', { variant: 'success' });
    } catch (error) {
      setError('Failed to update product');
      enqueueSnackbar('Failed to update product', { variant: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleAddStock = async (productId) => {
    const { addstock } = additionalStockData[productId] || {};
  
    // Get the product to determine its category
    const product = products.find(product => product._id === productId);
    
    // Determine the expiration date based on the category
    let expirationDate;
    const category = product?.category; // Assuming category is part of the product data
    const today = new Date();
    
    if (category === 'dried fish') {
      expirationDate = new Date(today.setMonth(today.getMonth() + 6)).toISOString(); // 6 months from now
    } else if (category === 'gourmet') {
      expirationDate = new Date(today.setMonth(today.getMonth() + 12)).toISOString(); // 12 months from now
    } else {
      expirationDate = additionalStockData[productId]?.expirationDate; // Use the provided expiration date for other categories
    }
  
    console.log('Adding stock for productId:', productId, 'addstock:', addstock, 'expirationDate:', expirationDate);
  
    if (!addstock || !expirationDate) {
      enqueueSnackbar('Both stock quantity and expiration date must be provided.');
      return;
    }
  
    try {
      await axiosInstance.post(`api/products/${productId}/add-stock`, { addstock, expirationDate });
      // Refresh product data or handle UI update as needed
      enqueueSnackbar('Stock added successfully');
    } catch (error) {
      console.error('Failed to add stock:', error);
      enqueueSnackbar('Error adding stock');
    }
  
    // Reset the input fields after adding stock
    setAdditionalStockData((prev) => ({
      ...prev,
      [productId]: { addstock: '', expirationDate: '' },
    }));
  };
  

  const handleAdditionalChange = (productId, e) => {
    const { name, value } = e.target;
    setAdditionalStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [name]: value,
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: value
    });
  };

  const navigateToArchive = () => {
    navigate('/bsarchive');
  };

  const toggleElseNavbar = () => {
    setElseNavbarVisible(!elseNavbarVisible);
  };

  const toggleBsSidebar = () => {
    setBsSidebarVisible(!bsSidebarVisible);
  };

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


  const getStockWarning = (stock, expirationDate) => {
    const criticalStockThreshold = 10; // Define what critical stock means
    const date = new Date(expirationDate);
    const today = new Date();
    const warningDate = new Date(today);
    warningDate.setDate(today.getDate() + 7); // Warning if expiring in 7 days

    if (stock < criticalStockThreshold) {
        return '⚠️Warning: Low stock!';
    }

    if (date <= warningDate) {
        const daysLeft = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        return `⚠️Warning: Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
    }

    return '';
};


  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div>
      {elseNavbarVisible && <ElseNavbar />}
      <Ssidebar />
      <div className="bsdriedview-products-container">
        <button className="btn-see-archive" onClick={navigateToArchive}>See Archive</button>
        <button className="btn-sort" onClick={toggleSortOrder}>
          Sort by Expiration Date: {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        {error && <p className="error-message">{error}</p>}
        <div className="bsproducts-grid">
          {products.length > 0 ? (
            <table className="sproduct-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Total Stock</th>
                  <th>Product Date In</th>
                  <th>Expiration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const totalStock = product.stock + (product.additionalStocks?.reduce((total, stock) => total + stock.addstock, 0) || 0);
                  const expirationWarning = getExpirationWarning(product.expirationDate);
                  const stockWarning = getStockWarning(totalStock);

                  return (
                    <React.Fragment key={product._id}>
                      <tr className={expirationWarning ? 'expiring-soon' : ''}>
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
                            `₱${product.price.toFixed(2)}`
                          )}
                        </td>
                        <td>
                          {product.stock}
                          {product.additionalStocks && product.additionalStocks.length > 0 ? (
                            product.additionalStocks.map((stock, index) => (
                              <div key={index}>
                                <span>{stock.addstock}</span>
                              </div>
                            ))
                          ) : (
                            <p></p>
                          )}
                        </td>
                        <td>{totalStock}</td>
                        <td>
                          {editingProduct && editingProduct._id === product._id ? (
                            <input
                              type="date"
                              name="expirationDate"
                              value={editingProduct.expirationDate}
                              onChange={handleChange}
                            />
                          ) : (
                            formatDate(product.createdAt)
                          )}
                        </td>
                        <td>{editingProduct && editingProduct._id === product._id ? (
                          <input
                            type="date"
                            name="expirationDate"
                            value={editingProduct.expirationDate}
                            onChange={handleChange}
                          />
                        ) : (
                          formatDate(product.expirationDate)
                        )}
                          {product.additionalStocks && product.additionalStocks.length > 0 ? (
                          product.additionalStocks.map((stock, index) => (
                            <div key={index}>
                              <span>{formatDate(stock.expirationDate)}</span>
                              {expirationWarning && <span className="expiration-warning">{expirationWarning}</span>}
                            </div>
                          ))
                        ) : (
                          <p></p>
                        )}
                      </td>
                        <td>
                          {editingProduct && editingProduct._id === product._id ? (
                            <>
                              <button onClick={handleSaveEdit}>Save</button>
                              <button onClick={handleCancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleBSEditProduct(product)}>Edit</button>
                              <button onClick={() => handleBSArchiveProduct(product._id)}>Archive</button>
                            </>
                          )}
                        </td>
                      </tr>
                      { (stockWarning || expirationWarning) && (
                        <tr>
                          <td colSpan="9" className="warning-message">
                            {stockWarning && <div>{stockWarning}</div>}
                            {expirationWarning && <div>{expirationWarning}</div>}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="9">
                          <h4>Additional Stocks</h4>
                          <input
                            type="number"
                            name="addstock"
                            value={additionalStockData[product._id]?.addstock || ''}
                            onChange={e => handleAdditionalChange(product._id, e)}
                            placeholder="Add Stock"
                          />
                          <input
                            type="date"
                            name="expirationDate"
                            value={additionalStockData[product._id]?.expirationDate || ''}
                            onChange={e => handleAdditionalChange(product._id, e)}
                            placeholder="Expiration Date"
                          />
                          <button onClick={() => handleAddStock(product._id)}>Add Stock</button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
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

export default BSproductlist;
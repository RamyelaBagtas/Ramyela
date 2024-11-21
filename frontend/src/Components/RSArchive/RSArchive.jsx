import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext'; // Assuming AuthContext is defined in AuthContext.jsx
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import RSsidebar from '../RSsidebar/RSsidebar';
import { useNavigate } from 'react-router-dom';
import './RSArchive.css'; // Import your CSS file
import { useSnackbar } from 'notistack';
import axiosInstance from '../axiosInstance';

const RSArchive = () => {
  const { userId } = useAuth(); // Access userId from AuthContext
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchArchivedProducts = async () => {
      try {
        const response = await axiosInstance.get(`api/rsproducts/archive/${userId}`); // Use userId in the endpoint
        const productsWithImages = response.data.map(product => ({
          ...product,
          imageUrl: arrayBufferToBase64(product.image.data),
          expirationDate: formatDate(product.expirationDate) // Format expirationDate
        }));
        setArchivedProducts(productsWithImages);
        setLoading(false);
      } catch (error) {
        console.error('No Archive Products', error);
        setLoading(false);
      }
    };

    fetchArchivedProducts();
  }, [userId]); // Fetch products whenever userId changes

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0]; // Convert to YYYY-MM-DD
  };

  const handleNavigateToProductList = () => {
    navigate('/rsproductlist'); // Navigate to the Sproductlist route
  };

  const handleUnarchiveProduct = async (productId) => {
    try {
      await axiosInstance.post(`api/rsproducts/unarchive/${productId}`);
      setArchivedProducts(archivedProducts.filter(product => product._id !== productId));
    } catch (error) {
      console.error('Error unarchiving product:', error);
      // Handle error or display notification
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSortChange = () => {
    setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredProducts = archivedProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery)
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const dateA = new Date(a.expirationDate);
    const dateB = new Date(b.expirationDate);
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });


  if (loading) {
    return <p>Loading archived products...</p>;
  }

  return (
    <div>
      <ElseNavbar />
      <RSsidebar />
      <div className='seller-container'>
        <h2>Archived Products</h2>
        <button className="btn-see-archive" onClick={handleNavigateToProductList}>Product List</button>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <button className="btn-sort" onClick={handleSortChange}>
          Sort by Expiration Date ({sortDirection === 'asc' ? '↑' : '↓'})
        </button>
        {sortedProducts.length === 0 ? (
          <p>No archived products found.</p>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      {product.imageUrl && (
                        <img src={`data:image/jpeg;base64,${product.imageUrl}`} alt={product.title} />
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>${product.price}</td>
                    <td>{product.stock}</td>
                    <td>{product.expirationDate}</td>
                    <td>
                      <button className="btn-unarchive" onClick={() => handleUnarchiveProduct(product._id)}>Unarchive</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RSArchive;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useSnackbar } from 'notistack';
import './ProductManagement.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import leftIcon from '../Assets/arrow-left.png';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const ProductManagement = () => {
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editIndex, setEditIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // For managing search input

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get(`api/supplierproducts/${userId}`);
                setProducts(response.data);
                enqueueSnackbar('Products loaded successfully!', { variant: 'success' });
            } catch (err) {
                enqueueSnackbar('Error retrieving products: ' + (err.response?.data?.message || err.message), { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [userId, enqueueSnackbar]);

    const formatDate = (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate)
            ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsedDate)
            : 'N/A';
    };

    const formatCurrency = (amount) => {
        return `₱${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    };

    const handleEdit = (index) => {
        setEditIndex(index); // Set the index of the product being edited
    };

    const handleCancel = () => {
        setEditIndex(null); // Exit edit mode without saving
    };

    const handleUpdate = async (productId, updatedData) => {
        try {
            await axiosInstance.put(`api/supplierproducts/${productId}`, updatedData);
            enqueueSnackbar('Product updated successfully!', { variant: 'success' });
            const response = await axiosInstance.get(`api/supplierproducts/${userId}`);
            setProducts(response.data);
            setEditIndex(null); // Exit edit mode after updating
        } catch (error) {
            enqueueSnackbar('Error updating product: ' + (error.response?.data?.message || error.message), { variant: 'error' });
        }
    };

    const handleInputChange = (event, productIndex, section, fieldIndex, field) => {
        const updatedProducts = [...products];
        if (section) {
            updatedProducts[productIndex][section][fieldIndex][field] = event.target.value;
        } else {
            updatedProducts[productIndex][field] = event.target.value;
        }
        setProducts(updatedProducts);
    };

    // Filter products based on search term
    const filteredProducts = products.filter((product) =>
        product.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <ElseNavbar />
            <div className="body2">
                <div className="product-management-container">
                    <img
                        src={leftIcon}
                        alt="Back"
                        className="back-arrow"
                        onClick={() => navigate('/supplierhome')}
                    />
                    <h1>Products</h1>

                    {/* Search input field */}
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search products by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm state
                        />
                    </div>

                    {filteredProducts.length === 0 ? (
                        <p>No products found for this search.</p>
                    ) : (
                        filteredProducts.map((product, productIndex) => (
                            <div key={product._id} className="product-card">
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Category</th>
                                            <th>Manufacture Date</th>
                                            <th>Expiration Date</th>
                                            <th>Pre Order</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {product.productImage ? (
                                                    <img
                                                        src={`data:image/png;base64,${product.productImage}`}
                                                        alt={product.productTitle}
                                                        className="product-image"
                                                    />
                                                ) : (
                                                    <p>No image available</p>
                                                )}
                                            </td>
                                            <td>
                                                {editIndex === productIndex ? (
                                                    <input
                                                        type="text"
                                                        value={product.productTitle}
                                                        onChange={(e) => handleInputChange(e, productIndex, null, null, 'productTitle')}
                                                    />
                                                ) : (
                                                    product.productTitle
                                                )}
                                            </td>
                                            <td>
                                                {editIndex === productIndex ? (
                                                    <input
                                                        type="text"
                                                        value={product.productDescription}
                                                        onChange={(e) => handleInputChange(e, productIndex, null, null, 'productDescription')}
                                                    />
                                                ) : (
                                                    product.productDescription
                                                )}
                                            </td>
                                            <td>
                                                {editIndex === productIndex ? (
                                                    <input
                                                        type="text"
                                                        value={product.category}
                                                        onChange={(e) => handleInputChange(e, productIndex, null, null, 'category')}
                                                    />
                                                ) : (
                                                    product.category
                                                )}
                                            </td>
                                            <td>
                                                {editIndex === productIndex ? (
                                                    <input
                                                        type="date"
                                                        value={product.manufactureDate}
                                                        onChange={(e) => handleInputChange(e, productIndex, null, null, 'manufactureDate')}
                                                    />
                                                ) : (
                                                    formatDate(product.manufactureDate)
                                                )}
                                            </td>
                                            <td>
                                                {editIndex === productIndex ? (
                                                    <input
                                                        type="date"
                                                        value={product.expirationDate}
                                                        onChange={(e) => handleInputChange(e, productIndex, null, null, 'expirationDate')}
                                                    />
                                                ) : (
                                                    formatDate(product.expirationDate)
                                                )}
                                            </td>
                                            <td>{product.preOrder ? 'Yes' : 'Yes'}</td>
                                            <td>
                                                {product.wholesaleTiers && product.wholesaleTiers.length > 0 ? (
                                                    product.wholesaleTiers.map((tier, index) => (
                                                        <div key={index}>
                                                            Min Order: 
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={tier.minOrder}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'wholesaleTiers', index, 'minOrder')}
                                                                />
                                                            ) : (
                                                                tier.minOrder
                                                            )}
                                                            - Max Order: 
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={tier.maxOrder}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'wholesaleTiers', index, 'maxOrder')}
                                                                />
                                                            ) : (
                                                                tier.maxOrder
                                                            )}
                                                            : 
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={tier.unitPrice}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'wholesaleTiers', index, 'unitPrice')}
                                                                />
                                                            ) : (
                                                                `₱${tier.unitPrice}`
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No wholesale tiers available</p>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Materials Table */}
                                {product.materials && product.materials.length > 0 && (
                                    <div className="materials-section">
                                        <h3>Materials</h3>
                                        <table className="material-table">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th>Total Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {product.materials.map((material, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="text"
                                                                    value={material.description}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'materials', index, 'description')}
                                                                />
                                                            ) : (
                                                                material.description
                                                            )}
                                                        </td>
                                                        <td>
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={material.quantity}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'materials', index, 'quantity')}
                                                                />
                                                            ) : (
                                                                `${material.quantity} `
                                                            )}
                                                        </td>
                                                        <td>
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={material.price}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'materials', index, 'price')}
                                                                />
                                                            ) : (
                                                                formatCurrency(material.price)
                                                            )}
                                                        </td>
                                                        <td>{formatCurrency(material.quantity * material.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Editable Ingredients Table */}
                                {product.ingredients && product.ingredients.length > 0 && (
                                    <div className="ingredients-section">
                                        <h3>Ingredients</h3>
                                        <table className="ingredient-table">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th>Total Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {product.ingredients.map((ingredient, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="text"
                                                                    value={ingredient.description}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'ingredients', index, 'description')}
                                                                />
                                                            ) : (
                                                                ingredient.description
                                                            )}
                                                        </td>
                                                        <td>
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={ingredient.quantity}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'ingredients', index, 'quantity')}
                                                                />
                                                            ) : (
                                                                `${ingredient.quantity} ${ingredient.unit}`
                                                            )}
                                                        </td>
                                                        <td>
                                                            {editIndex === productIndex ? (
                                                                <input
                                                                    type="number"
                                                                    value={ingredient.price}
                                                                    onChange={(e) => handleInputChange(e, productIndex, 'ingredients', index, 'price')}
                                                                />
                                                            ) : (
                                                                formatCurrency(ingredient.price)
                                                            )}
                                                        </td>
                                                        <td>{formatCurrency(ingredient.quantity * ingredient.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Procedure Table */}
                                {product.procedures && product.procedures.length > 0 && (
  <div className="procedure-section">
    <h3>Procedure</h3>
    <table className="procedure-table">
      <thead>
        <tr>
          <th>Assigned Employee</th>
          <th>Procedure</th>
        </tr>
      </thead>
      <tbody>
        {product.procedures.map((procedure, index) => (
          <tr key={index}>
            <td>
              {editIndex === productIndex ? (
                <input
                  type="text"
                  value={procedure.employee}
                  onChange={(e) => handleInputChange(e, productIndex, 'procedures', index, 'employee')}
                />
              ) : (
                procedure.employee
              )}
            </td>
            <td>
              {editIndex === productIndex ? (
                <input
                  type="text"
                  value={procedure.procedure}
                  onChange={(e) => handleInputChange(e, productIndex, 'procedures', index, 'procedure')}
                />
              ) : (
                procedure.procedure
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

                                {editIndex === productIndex ? (
                                    <>
                                        <button onClick={() => handleUpdate(product._id, product)}>Update</button>
                                        <button onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={() => handleEdit(productIndex)}>Edit</button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import axios from 'axios';
import './ProductionManagement.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import { useAuth } from '../AuthContext';
import leftIcon from '../Assets/arrow-left.png';
import { useSnackbar } from 'notistack';
import axiosInstance from '../axiosInstance';

const ProductionManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { userId, userType, displayPictureURL, firstName, lastName } = useAuth();
  const [productTitle, setProductTitle] = useState(''); // State for product title
  const [productDescription, setProductDescription] = useState(''); // State for product description
  const [productImage, setProductImage] = useState(null); // State for product image
  const [category, setCategory] = useState(''); // State for product category
  const [preOrder, setPreOrder] = useState(false); // State for pre-order option
  const [preOrderChecklist, setPreOrderChecklist] = useState(['']); // State for pre-order checklist
  const [wholesaleTiers, setWholesaleTiers] = useState([{ minOrder: 0, maxOrder: 0, unitPrice: 0 }]);
  const [materials, setMaterials] = useState([{ description: '', quantity: 0, price: 0 }]);
  const [ingredients, setIngredients] = useState([{ description: '', quantity: 0, price: 0 }]);
  const [procedures, setProcedures] = useState([{ employee: '', procedure: '' }]);
  const [manufactureDate, setManufactureDate] = useState(''); // State for manufacture date
  const [expirationDate, setExpirationDate] = useState(''); // State for expiration date

  const handleAddWholesaleTier = () => {
    setWholesaleTiers([...wholesaleTiers, { minOrder: 0, maxOrder: 0, unitPrice: 0 }]);
  };

  const handleRemoveWholesaleTier = (index) => {
    const newWholesaleTiers = wholesaleTiers.filter((_, i) => i !== index);
    setWholesaleTiers(newWholesaleTiers);
  };

  const handleWholesaleChange = (index, field, value) => {
    const newWholesaleTiers = [...wholesaleTiers];
    newWholesaleTiers[index][field] = value;
    setWholesaleTiers(newWholesaleTiers);
  };
  const handleAddMaterial = () => {
    setMaterials([...materials, { description: '', quantity: 0, price: 0 }]);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { description: '', quantity: 0, price: 0 }]);
  };

  const handleAddProcedureRow = () => {
    setProcedures([...procedures, { employee: '', procedure: '' }]);
  };

  const handleRemoveMaterial = (index) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(newMaterials);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleRemoveProcedureRow = (index) => {
    const newProcedures = procedures.filter((_, i) => i !== index);
    setProcedures(newProcedures);
  };

  const handleChangeMaterial = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };

  const handleChangeIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleProcedureChange = (index, field, value) => {
    const newProcedures = [...procedures];
    newProcedures[index][field] = value;
    setProcedures(newProcedures);
  };


  const handleSave = async () => {
    // Validate manufactureDate and expirationDate
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0); // Normalize to start of the day
  
    const sixMonthsFromToday = new Date();
    sixMonthsFromToday.setMonth(today.getMonth() + 6);
    sixMonthsFromToday.setHours(0, 0, 0, 0); // Normalize to start of the day
  
  
    const manufactureDateObj = new Date(manufactureDate);
    const expirationDateObj = new Date(expirationDate);
  
    // Validate manufactureDate: must be between today and one month ago
    if (manufactureDateObj > today || manufactureDateObj < oneMonthAgo) {
      enqueueSnackbar('Manufacture date must be between today and one month ago.', {
        variant: 'error',
      });
      return;
    }
  
    if (expirationDateObj < sixMonthsFromToday) {
      enqueueSnackbar(
        'Expiration date must be at least six months from today.',
        { variant: 'error' }
      );
      return;
    }
  
    const formData = new FormData();
    formData.append('productTitle', productTitle);
    formData.append('productDescription', productDescription);
    formData.append('productImage', productImage);
    formData.append('category', category);
    formData.append('preOrder', preOrder);
    formData.append('preOrderChecklist', JSON.stringify(preOrderChecklist));
    formData.append('wholesaleTiers', JSON.stringify(wholesaleTiers));
    formData.append('materials', JSON.stringify(materials));
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('procedures', JSON.stringify(procedures));
    formData.append('manufactureDate', manufactureDate);
    formData.append('expirationDate', expirationDate);
    formData.append('userId', userId);
    formData.append('userType', userType);
    formData.append('displayPictureURL', displayPictureURL);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
  
    try {
      const response = await axiosInstance.post('api/supplierproducts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Product saved successfully:', response.data);
      enqueueSnackbar('Product saved successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error saving product:', error);
      enqueueSnackbar('Error saving product', { variant: 'error' });
    }
  };
  
  

const formatCurrency = (amount) => {
  // Format the amount to include commas and two decimal places
  return `₱${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

  return (
    <div>
        <ElseNavbar/>
    <div className='body1'>
    <div className="container">
    <img
          src={leftIcon}
          alt="Back"
          className="back-arrow"
          onClick={() => navigate('/supplierhome')}
        />
      <h2>Production Management</h2>
      <div className="section">
        <h3>Product Title</h3>
        <input
          type="text"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder="Enter product title"
        />
      </div>
      <div className="section">
        <h3>Product Description</h3>
        <input
          type='text'
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Enter product description"
        />
      </div>
      <div className="section">
        <h3>Product Image</h3>
        <input
          type="file"
          onChange={(e) => setProductImage(e.target.files[0])}
        />
      </div>
      <div className="section">
        <h3>Category</h3>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter product category"
        />
      </div>
      <div className="section">
        <h3>Materials</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={material.description}
                    onChange={(e) => handleChangeMaterial(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => handleChangeMaterial(index, 'quantity', parseInt(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={material.price}
                    onChange={(e) => handleChangeMaterial(index, 'price', parseFloat(e.target.value))}
                  />
                </td>
                <td>{formatCurrency(material.quantity * material.price)}</td>
                <td>
                  <button onClick={() => handleRemoveMaterial(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-button" onClick={handleAddMaterial}>Add Material</button>
      </div>
      <div className="section">
      <h3>Ingredients</h3>
<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Quantity</th>
      <th>Unit</th>
      <th>Price</th>
      <th>Total Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {ingredients.map((ingredient, index) => (
      <tr key={index}>
        <td>
          <input
            type="text"
            value={ingredient.description}
            onChange={(e) => handleChangeIngredient(index, 'description', e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            value={ingredient.quantity}
            onChange={(e) => handleChangeIngredient(index, 'quantity', parseInt(e.target.value))}
          />
        </td>
        <td>
          <input
            type="text"
            value={ingredient.unit}
            onChange={(e) => handleChangeIngredient(index, 'unit', e.target.value)}
            placeholder="e.g., kg, g, L"
          />
        </td>
        <td>
          <input
            type="number"
            value={ingredient.price}
            onChange={(e) => handleChangeIngredient(index, 'price', parseFloat(e.target.value))}
          />
        </td>
        <td>{formatCurrency(ingredient.quantity * ingredient.price)}</td>
        <td>
          <button onClick={() => handleRemoveIngredient(index)}>Remove</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

        <button className="add-button" onClick={handleAddIngredient}>Add Ingredient</button>
      </div>
      <div className="section">
        <h3>Procedures</h3>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Procedure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {procedures.map((procedure, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={procedure.employee}
                    onChange={(e) => handleProcedureChange(index, 'employee', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={procedure.procedure}
                    onChange={(e) => handleProcedureChange(index, 'procedure', e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => handleRemoveProcedureRow(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-button" onClick={handleAddProcedureRow}>Add Procedure</button>
      </div>
      <div className="section">
  <h3>Pre-Order</h3>
  <label>
    <input
      type="checkbox"
      checked={true} // Always checked
      disabled // Prevents user interaction
    />
    Pre-Order Enabled
  </label>
</div>

      <div className="section">
<h3>Wholesale Details</h3>
{wholesaleTiers.map((tier, index) => (
  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <input
      type="number"
      value={tier.minOrder}
      onChange={(e) => handleWholesaleChange(index, 'minOrder', parseInt(e.target.value))}
      placeholder="Min Order"
      style={{ marginRight: '10px' }}
    />
    <span>-</span>
    <input
      type="number"
      value={tier.maxOrder}
      onChange={(e) => handleWholesaleChange(index, 'maxOrder', parseInt(e.target.value))}
      placeholder="Max Order"
      style={{ margin: '0 10px' }}
    />
    <span>:</span>
    <input
      type="number"
      value={tier.unitPrice}
      onChange={(e) => handleWholesaleChange(index, 'unitPrice', parseFloat(e.target.value))}
      placeholder="₱0"
      style={{ marginLeft: '10px' }}
    />
    <button onClick={() => handleRemoveWholesaleTier(index)} style={{ marginLeft: '10px' }}>Remove</button>
  </div>
))}
<button className="add-button" onClick={handleAddWholesaleTier}>Add Wholesale Tier</button>
</div>
      <div className="section">
        <h3>Manufacture Date</h3>
        <input
          type="date"
          value={manufactureDate}
          onChange={(e) => setManufactureDate(e.target.value)}
        />
      </div>
      <div className="section">
        <h3>Expiration Date</h3>
        <input
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
      </div>
      <button className='save-product-button' onClick={handleSave}>Save Product</button>
    </div>
    </div>
    </div>
  );
};

export default ProductionManagement;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { useAuth } from '../AuthContext'; // Adjust the import path accordingly
import { useSnackbar } from 'notistack';
import Exporternavbar from '../Exporternavbar/Exporternavbar';
import axiosInstance from '../axiosInstance';

const ExporterCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [shippingFee, setShippingFee] = useState(50); // Example shipping fee
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuth(); // Use useAuth to access the authentication context
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!isLoggedIn) {
          enqueueSnackbar('User not logged in', { variant: 'error' });
          return;
        }
  
        const response = await axiosInstance.get(`api/cart/${userId}`, {
          params: { consumerId: userId } // Ensure consumerId is set to userId
        });
  
        console.log('Response from server:', response.data);
  
        // Convert image data to base64 for each cart item
        const cartItemsWithImages = response.data.map(item => {
          if (item.image && item.image.data) {
            const base64String = arrayBufferToBase64(item.image.data);
            return { ...item, imageUrl: `data:image/jpeg;base64,${base64String}` };
          }
          return item;
        });
  
        setCartItems(cartItemsWithImages);
        // Initialize checkedItems state
        const initialCheckedItems = {};
        cartItemsWithImages.forEach(item => {
          initialCheckedItems[item._id] = false;
        });
        setCheckedItems(initialCheckedItems);
      } catch (error) {
        enqueueSnackbar('Error fetching cart items', { variant: 'error' });
        console.error('Error fetching cart items:', error);
      }
    };
  
    const fetchDefaultAddress = async () => {
      try {
        if (!isLoggedIn) {
          enqueueSnackbar('User not logged in', { variant: 'error' });
          return;
        }
    
        const response = await axiosInstance.get(`api/address/default/${userId}`);
        setDefaultAddress(response.data);
      } catch (error) {
        enqueueSnackbar('Error fetching default address', { variant: 'error' });
        console.error('Error fetching default address:', error);
      }
    };
    
  
    if (isLoggedIn) {
      fetchCartItems();
      fetchDefaultAddress();
    }
  }, [isLoggedIn, userId, enqueueSnackbar]);
  
  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value, 10);
    setCartItems(cartItems.map(product => {
      if (product._id === id) {
        if (isNaN(newQuantity) || newQuantity < 1) {
          enqueueSnackbar('Invalid quantity', { variant: 'warning' });
          return { ...product, quantity: 1 }; // Set minimum quantity to 1
        }
        if (newQuantity > product.stock) {
          enqueueSnackbar('Quantity cannot exceed available stock', { variant: 'warning' });
          return { ...product, quantity: product.stock }; // Set quantity to max available stock
        }
        return { ...product, quantity: newQuantity };
      }
      return product;
    }));
  };

  const handleRemove = async (id) => {
    try {
      // Send a DELETE request to the server to remove the item from the cart
      const response = await axiosInstance.delete(`api/cart/remove/${id}`);

      // Check if the request was successful
      if (response.status === 200) {
        // Filter out the removed item from the cart items state
        setCartItems(cartItems.filter(item => item._id !== id));
        // Remove the item from the checkedItems state
        const updatedCheckedItems = { ...checkedItems };
        delete updatedCheckedItems[id];
        setCheckedItems(updatedCheckedItems);
        // Alert when product is removed successfully
        enqueueSnackbar('Product removed successfully', { variant: 'success' });
      } else {
        enqueueSnackbar('Error removing item from cart', { variant: 'error' });
        console.error('Error removing item from cart:', response.data);
      }
    } catch (error) {
      enqueueSnackbar('Error removing item from cart', { variant: 'error' });
      console.error('Error removing item from cart:', error.message);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!defaultAddress) {
      enqueueSnackbar('Please set a default address before proceeding to checkout.', { variant: 'warning' });
      return;
    }
  
    const itemsToCheckout = cartItems.filter(item => checkedItems[item._id]);
  
    if (itemsToCheckout.length === 0) {
      enqueueSnackbar('Please select at least one item to proceed to checkout.', { variant: 'warning' });
      return;
    }
  
    // Check if any selected item has a quantity of 0
    const hasZeroQuantity = itemsToCheckout.some(item => item.quantity === 0);
    if (hasZeroQuantity) {
      enqueueSnackbar('Cannot proceed with items that have a quantity of 0. Please update your cart.', { variant: 'warning' });
      return;
    }
  
    try {
      const subtotal = calculateSubtotal();
      const totalAmount = calculateTotal();
      const productWithProductId = itemsToCheckout.map(product => ({
        orderId: product.orderId,
        productId: product.productId,
        userId: product.userId,
        title: product.title,
        image: product.imageUrl,
        quantity: product.quantity,
        stock: product.stock,
        price: product.price,
      }));
      
      const defaultAddress = JSON.parse(localStorage.getItem('defaultAddress'));
      const currentDate = new Date();
  
      const response = await axiosInstance.post('api/cartorder', {
        consumerId: userId,
        product: productWithProductId,
        totalAmount,
        defaultAddress,
        date: currentDate
      });
  
      if (response.status === 201) {
        enqueueSnackbar('Proceeding to checkout with selected items', { variant: 'success' });
        
        const remainingItems = cartItems.filter(item => !checkedItems[item._id]);
        setCartItems(remainingItems);
  
        const initialCheckedItems = {};
        remainingItems.forEach(item => {
          initialCheckedItems[item._id] = false;
        });
        setCheckedItems(initialCheckedItems);
  
        navigate('/exporterreceipt', {
          state: {
            itemsToCheckout,
            defaultAddress,
            subtotal,
            shippingFee,
            totalAmount
          }
        });
      } else {
        enqueueSnackbar('Error creating order', { variant: 'error' });
        console.error('Error creating order:', response.data);
      }
    } catch (error) {
      enqueueSnackbar('Error creating order', { variant: 'error' });
      console.error('Error creating order:', error);
    }
  };
  

  const calculateSubtotal = () => {
    return cartItems.reduce((total, product) => {
      if (checkedItems[product._id]) {
        return total + (product.price * product.quantity);
      }
      return total;
    }, 0).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal + shippingFee).toFixed(2);
  };

  const handleCheckboxChange = (id) => {
    setCheckedItems({
      ...checkedItems,
      [id]: !checkedItems[id],
    });
  };

  const hasCheckedItems = Object.values(checkedItems).some(isChecked => isChecked);
  
  return (
    <div>
      <Exporternavbar />
      <div className="cart-container">
        <table>
          <thead>
            <tr>
              <th>Check</th>
              <th>Image</th>
              <th>Product Title</th>
              <th>Price</th>
              <th>Quantity</th>
              <th hidden>Stock</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(product => (
              <tr key={product._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={checkedItems[product._id] || false}
                    onChange={() => handleCheckboxChange(product._id)}
                  />
                </td>
                <td>{product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} />
                )}</td>
                <td>{product.title}</td>
                <td>₱{product.price.toFixed(2)}</td>
                <td className="quantity-input">
                  <input
                    type="number"
                    value={product.quantity}
                    min="1"
                    max={product.stock}
                    onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                  />
                </td>
                <td hidden>{product.stock}</td>
                <td className="remove-button" onClick={() => handleRemove(product._id)}>
                  &times;
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cart-total-container">
          <h2>Order Summary</h2>
          <h3>Subtotal: ₱{calculateSubtotal()}</h3>
          <h3>Shipping Fee: ₱{shippingFee.toFixed(2)}</h3>
          <h3>Total: ₱{calculateTotal()}</h3>
          <p>Shipping to: {defaultAddress ? `${defaultAddress.fullName}, ${defaultAddress.contactNumber}, ${defaultAddress.region}, ${defaultAddress.province}, ${defaultAddress.city}, ${defaultAddress.barangay},${defaultAddress.postalCode}, ${defaultAddress.street}, ${defaultAddress.houseNumber}, ${defaultAddress.country}` : 'No default address set'}</p>
          {hasCheckedItems && (
            <button className="proceed-button" onClick={handleProceedToCheckout}>Proceed to Checkout</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExporterCartPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useAuth } from '../AuthContext';
import check from '../Assets/check.png';
import ProviderAccSetting from '../AccSetting/ProviderAccSetting';
import axiosInstance from '../axiosInstance';

const MyAddSellers = () => {
  const [userId, setUserId] = useState('');  // Renamed variable
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [AccSettingVisible, setAccSettingVisible] = useState(true);
  const [currentAddress, setCurrentAddress] = useState(null);

  const { userId: authUserId, isLoggedIn } = useAuth();  // Destructure userId from AuthContext
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isLoggedIn) {
      setUserId(authUserId);  // Set userId from AuthContext
    }
  }, [authUserId, isLoggedIn]);

  useEffect(() => {
    if (userId) {
      const fetchAddresses = async () => {
        try {
          const response = await axiosInstance.get(`api/sellersaddresses/${userId}`);  // Use userId
          if (response.status === 200) {
            setAddresses(response.data.addresses);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          enqueueSnackbar('Error fetching addresses', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };

      fetchAddresses();
    }
  }, [userId]);  // Depend on userId

  const handleRemoveAddress = async (addressId) => {
    try {
      const response = await axiosInstance.delete(`api/sellersaddress/remove/${addressId}`);
      if (response.status === 200) {
        setAddresses(addresses.filter(address => address._id !== addressId));
        enqueueSnackbar('Address removed successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error removing address:', error);
      enqueueSnackbar('Failed to remove address', { variant: 'error' });
    }
  };

  const handleUseAddress = async (addressId) => {
    try {
      const response = await axiosInstance.put(`api/sellersaddress/default/${userId}/${addressId}`);  // Use userId
      if (response.status === 200) {
        const updatedAddresses = addresses.map(address =>
          address._id === addressId ? { ...address, isDefault: true } : { ...address, isDefault: false }
        );
        setAddresses(updatedAddresses);
        setCurrentAddress(updatedAddresses.find(address => address._id === addressId));
        enqueueSnackbar('Default address set successfully', { variant: 'success' });

        // Save the default address to local storage
        const defaultAddress = updatedAddresses.find(address => address._id === addressId);
        localStorage.setItem('defaultAddress', JSON.stringify(defaultAddress));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      enqueueSnackbar('Failed to set default address', { variant: 'error' });
    }
  };


  return (
    <div>
      <ProviderAccSetting/>
      <div className="my-address-container">
        <h1>My Addresses</h1> 
        {loading ? (
          <p>Loading...</p>
        ) : (
          addresses.length > 0 ? (
            <div className="addresses-list">
              {addresses.map((address) => (
                <div key={address._id} className={`address-details ${address.isDefault ? 'default' : ''}`}>
                  <div className="address-header">
                  {address.isDefault && (
                      <img src={check} alt="Default Address" className="default-icon" />
                    )} 
                    <p><strong>Full Name:</strong> {address.fullName}</p>
                  </div>
                  <p><strong>Contact Number:</strong> {address.contactNumber}</p>
                  <p><strong>Region:</strong> {address.region}</p>
                  <p><strong>Province:</strong> {address.province}</p>
                  <p><strong>Municipality:</strong> {address.municipality}</p>
                  <p><strong>Barangay:</strong> {address.barangay}</p>
                  <p><strong>Postal Code:</strong> {address.postalCode}</p>
                  <p><strong>Street:</strong> {address.street}</p>
                  <p><strong>House Number:</strong> {address.houseNumber}</p>
                  <p><strong>Country:</strong> {address.country}</p>
                  <button className="remove-button" onClick={() => handleRemoveAddress(address._id)}>Remove Address</button>
                  <button className="use-button" onClick={() => handleUseAddress(address._id)}>Use as Default</button>
                </div>
              ))}
            </div>
          ) : (
            <p>No addresses found for this user.</p>
          )
        )}
      </div>
    </div>
  );
};

export default MyAddSellers;

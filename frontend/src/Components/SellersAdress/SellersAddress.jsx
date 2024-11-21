import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SellersAddress.css'
import { useAuth } from '../AuthContext'; // Adjust the import path accordingly
import { useSnackbar } from 'notistack'; // Import useSnackbar from notistack
import ProviderAccSetting from '../AccSetting/ProviderAccSetting';
import axiosInstance from '../axiosInstance';

const SellersAddress = ({ onSave }) => {
  const [address, setAddress] = useState({
    fullName: '',
    contactNumber: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    postalCode: '',
    street: '',
    houseNumber: '',
    country: '',
    latitude: null, // For storing the latitude
    longitude: null // For storing the longitude
  });

  const { userId, isLoggedIn } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // No need to get coordinates from device; fetch from address details instead
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const fetchCoordinates = async () => {
    try {
      const response = await axiosInstance.post('api/get-coordinates', {
        country: address.country,
        region: address.region,
        province: address.province,
        city: address.city,
        barangay: address.barangay
      });
      if (response.status === 200) {
        setAddress((prevAddress) => ({
          ...prevAddress,
          latitude: response.data.latitude,
          longitude: response.data.longitude
        }));
      } else {
        enqueueSnackbar('Failed to fetch coordinates', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      enqueueSnackbar('Failed to fetch coordinates', { variant: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (!isLoggedIn) {
        enqueueSnackbar('User not logged in. Please log in.', { variant: 'error' });
        return;
      }

      await fetchCoordinates(); // Fetch coordinates before saving address

      try {
        const response = await axiosInstance.post('api/SellersAddress', {
          userId: userId,
          ...address
        });
        if (response.status === 201) {
          enqueueSnackbar('Address saved successfully', { variant: 'success' });
          onSave && onSave();
        } else {
          enqueueSnackbar('Failed to save address', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error saving address:', error);
        enqueueSnackbar('Failed to save address', { variant: 'error' });
      }
    }
  };

  const validateForm = () => {
    const { fullName, contactNumber, region, province, city, barangay, postalCode, street, houseNumber, country } = address;
    if (!fullName || !contactNumber || !region || !province || !city || !barangay || !postalCode || !street || !houseNumber || !country) {
      enqueueSnackbar('All fields are required.', { variant: 'warning' });
      return false;
    }
    return true;
  };

  return (
    <div>
        <ProviderAccSetting/>
      <div className="sellers-address-container">
        <h1>Enter Your Address</h1>
        <form onSubmit={handleSubmit}>
          <div className="sellers-form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={address.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="contactNumber">Contact Number:</label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={address.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="region">Region:</label>
            <input
              type="text"
              id="region"
              name="region"
              value={address.region}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="province">Province:</label>
            <input
              type="text"
              id="province"
              name="province"
              value={address.province}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="city">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={address.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="barangay">Barangay:</label>
            <input
              type="text"
              id="barangay"
              name="barangay"
              value={address.barangay}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="postalCode">Postal Code:</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="street">Street:</label>
            <input
              type="text"
              id="street"
              name="street"
              value={address.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="houseNumber">House Number:</label>
            <input
              type="text"
              id="houseNumber"
              name="houseNumber"
              value={address.houseNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sellers-form-group">
            <label htmlFor="country">Country:</label>
            <input
              type="text"
              id="country"
              name="country"
              value={address.country}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Save Address</button>
        </form>
      </div>
    </div>
  );
};

export default SellersAddress;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pendingUser = require('../models/PendingUser');
const Consumer = require('../models/Consumer');
const bcrypt = require('bcrypt');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

const getCoordinates = async (country, region, province, city, barangay) => {
  try {
    // Your access token from Mapbox
    const accessToken = 'pk.eyJ1IjoicmFuYmFndGFzIiwiYSI6ImNtMzAzY3Z4ZTBpaHAyanB6aDc3bGdjOWsifQ.QZKytMbUh3FLz2iibwV4kQ';

    // Concatenate the location details into a single string
    const locationString = `${barangay}, ${city}, ${province}, ${region}, ${country}`;

    // Make the request to the Mapbox API with the formatted URL
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationString)}.json`, {
      params: {
        access_token: accessToken,  // Pass the access token
        limit: 1                    // Limit results to the top one
      }
    });

    // Check if any location data is returned
    if (response.data.features.length === 0) {
      throw new Error('Location not found');
    }

    // Extract longitude and latitude from the response
    const [longitude, latitude] = response.data.features[0].center;
    return [longitude, latitude];
  } catch (error) {
    console.error('Error fetching coordinates from Mapbox:', error.message);
    throw new Error('Error fetching coordinates');
  }
};



const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
};

const isValidPassword = (password) => {
    return /^(?=.*[A-Z])(?=.*[0-9!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
};


const isValidContactNumber = (contactNumber) => {
  return /^\d{11}$/.test(contactNumber);
};

const signupUser = async (userData) => {
  const { 
    firstName, 
    lastName, 
    email, 
    password, 
    confirmPassword, 
    birthdate, 
    contactNumber, 
    userType, 
    country, 
    region, 
    province, 
    city, 
    barangay, 
    displayPictureURL, 
    dtiImageURL, 
    businessPermitImageURL, 
    sanitaryPermitImageURL 
  } = userData;

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (!isValidEmail(email)) {
    throw new Error('Email must end with @gmail.com');
  }

  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 8 characters long, contain a number, and a capital letter');
  }

  if (!isValidContactNumber(contactNumber)) {
    throw new Error('Contact number must be 11 digits long');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (userType === 'consumer') {
      // Save consumer user to User and Consumer models
      const newConsumer = new Consumer({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        birthdate,
        contactNumber,
        displayPictureURL,
        userType,
      });

      const userEntry = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        birthdate,
        contactNumber,
        userType,
        displayPictureURL,
        address: null, // Consumer does not require address fields
        dtiImageURL: null,
        businessPermitImageURL: null,
        sanitaryPermitImageURL: null,
      });

      await newConsumer.save();
      await userEntry.save();
    } else {
      // Save supplier, seller, reseller, or exporter to pendingUser model
      const coordinates = await getCoordinates(country, region, province, city, barangay);

      const newPendingUser = new pendingUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        birthdate,
        contactNumber,
        userType,
        address: {
          country,
          region,
          province,
          city,
          barangay,
          coordinates,
        },
        displayPictureURL,
        dtiImageURL,
        businessPermitImageURL,
        sanitaryPermitImageURL,
      });

      await newPendingUser.save();
    }

    return 'User created successfully';
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw new Error('Error creating user');
  }
};


module.exports = { signupUser };

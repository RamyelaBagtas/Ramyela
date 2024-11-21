const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const ProvAddress = require('../models/ProvAddress');
const axios = require('axios');
const SellersAddress = require('../models/SellersAddress');


// DELETE route to remove an address by ID
router.delete('/sellersaddress/remove/:id', async (req, res) => {
  try {
    const addressId = req.params.id;

    // Find the address by ID
    const address = await SellersAddress.findById(addressId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Delete the address
    await SellersAddress.findByIdAndDelete(addressId);

    res.status(200).json({ message: 'Address removed successfully' });
  } catch (error) {
    console.error('Error removing address:', error);
    res.status(500).json({ message: 'Failed to remove address' });
  }
});



router.put('/sellersaddress/default/:userId/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // Set all addresses for the user to not default
    await SellersAddress.updateMany({ userId }, { $set: { isDefault: false } });

    // Set the selected address as default
    await SellersAddress.findByIdAndUpdate(addressId, { $set: { isDefault: true } });

    // Optionally, delete the previous default address if needed
    // await Address.deleteOne({ consumerId, _id: { $ne: addressId }, isDefault: true });

    res.status(200).json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
});


router.get('/sellersaddress/default/:consumerId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the default address for the user
    const defaultAddress = await SellersAddress.findOne({ userId, isDefault: true });

    if (defaultAddress) {
      res.status(200).json(defaultAddress);
    } else {
      res.status(404).json({ message: 'Default address not found' });
    }
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({ message: 'Failed to fetch default address' });
  }
});


router.get('/sellersaddresses/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all addresses by consumerId
    const addresses = await SellersAddress.find({ userId });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: 'Addresses not found' });
    }

    res.status(200).json({ addresses });
  } catch (error) {
    console.error('Error getting addresses:', error);
    res.status(500).json({ message: 'Failed to get addresses' });
  }
});

router.post('/SellersAddress', async (req, res) => {
  try {
    const { 
      userId, 
      fullName, 
      contactNumber, 
      region, 
      province, 
      city, 
      barangay, 
      postalCode, 
      street, 
      houseNumber, 
      country 
    } = req.body;

    // Validate required fields
    if (!userId || !fullName || !contactNumber || !region || !province || !city || !barangay || !postalCode || !street || !houseNumber || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Initialize coordinates
    let latitude = null;
    let longitude = null;

    // Fetch coordinates based on the address
    try {
      const response = await axios.post('http://localhost:3000/api/get-coordinates', {
        country,
        region,
        province,
        city,
        barangay
      });

      if (response.status === 200) {
        latitude = response.data.latitude;
        longitude = response.data.longitude;
      } else {
        console.warn('Failed to fetch coordinates');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return res.status(500).json({ message: 'Failed to fetch coordinates' });
    }

    // Ensure coordinates were fetched
    if (latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Could not determine coordinates for the address' });
    }

    // Create and save the new address
    const newAddress = new SellersAddress({
      userId,
      fullName,
      contactNumber,
      region,
      province,
      city,
      barangay,
      postalCode,
      street,
      houseNumber,
      country,
      coordinates: [longitude, latitude], // GeoJSON format [longitude, latitude]
      isDefault: false
    });

    await newAddress.save();
    res.status(201).json({ message: 'Address saved successfully', address: newAddress });
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ message: 'Failed to save address' });
  }
});

// Endpoint to save address
const MAPBOX_GEOCODING_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Endpoint to fetch coordinates using Mapbox API
router.post('/get-coordinates', async (req, res) => {
  const { country, region, province, city, barangay } = req.body;

  // Construct the address string
  const address = `${barangay}, ${city}, ${province}, ${region}, ${country}`;

  try {
    const response = await axios.get(`${MAPBOX_GEOCODING_API_URL}/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: 'pk.eyJ1IjoicmFuYmFndGFzIiwiYSI6ImNtMzAzY3Z4ZTBpaHAyanB6aDc3bGdjOWsifQ.QZKytMbUh3FLz2iibwV4kQ',
        limit: 1
      }
    });

    if (response.data.features && response.data.features.length > 0) {
      const [longitude, latitude] = response.data.features[0].geometry.coordinates;
      res.status(200).json({ latitude, longitude });
    } else {
      res.status(404).json({ message: 'Coordinates not found' });
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to save address
router.post('/Address', async (req, res) => {
  try {
    const { 
      consumerId, 
      fullName, 
      contactNumber, 
      region, 
      province, 
      city, 
      barangay, 
      postalCode, 
      street, 
      houseNumber, 
      country 
    } = req.body;

    // Validate required fields
    if (!consumerId || !fullName || !contactNumber || !region || !province || !city || !barangay || !postalCode || !street || !houseNumber || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Initialize coordinates
    let latitude = null;
    let longitude = null;

    // Fetch coordinates based on the address
    try {
      const response = await axios.post('http://localhost:3000/api/get-coordinates', {
        country,
        region,
        province,
        city,
        barangay
      });

      if (response.status === 200) {
        latitude = response.data.latitude;
        longitude = response.data.longitude;
      } else {
        console.warn('Failed to fetch coordinates');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return res.status(500).json({ message: 'Failed to fetch coordinates' });
    }

    // Ensure coordinates were fetched
    if (latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Could not determine coordinates for the address' });
    }

    // Create and save the new address
    const newAddress = new Address({
      consumerId,
      fullName,
      contactNumber,
      region,
      province,
      city,
      barangay,
      postalCode,
      street,
      houseNumber,
      country,
      coordinates: [longitude, latitude], // GeoJSON format [longitude, latitude]
      isDefault: false
    });

    await newAddress.save();
    res.status(201).json({ message: 'Address saved successfully', address: newAddress });
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ message: 'Failed to save address' });
  }
});



// Endpoint to get address by consumerId
router.get('/addresses/:consumerId', async (req, res) => {
  try {
    const consumerId = req.params.consumerId;

    // Find all addresses by consumerId
    const addresses = await Address.find({ consumerId });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: 'Addresses not found' });
    }

    res.status(200).json({ addresses });
  } catch (error) {
    console.error('Error getting addresses:', error);
    res.status(500).json({ message: 'Failed to get addresses' });
  }
});

router.delete('/address/remove/:id', async (req, res) => {
  try {
   const addressId = req.params.id;
   const address = await Address.findById(addressId);

   if (!address) {
       return res.status(404).send('Address not found');
   }
 
   await Address.findByIdAndDelete(addressId);
   res.status(200).send('Address removed successfully');
  }
   catch (error) {
       console.error('Error removing address:', error);
       res.status(500).send('Failed to remove address');
   }
});


router.put('/address/default/:consumerId/:addressId', async (req, res) => {
  try {
    const { consumerId, addressId } = req.params;

    // Set all addresses for the user to not default
    await Address.updateMany({ consumerId }, { $set: { isDefault: false } });

    // Set the selected address as default
    await Address.findByIdAndUpdate(addressId, { $set: { isDefault: true } });

    // Optionally, delete the previous default address if needed
    // await Address.deleteOne({ consumerId, _id: { $ne: addressId }, isDefault: true });

    res.status(200).json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
});


router.get('/address/default/:consumerId', async (req, res) => {
  try {
    const consumerId = req.params.consumerId;

    // Find the default address for the user
    const defaultAddress = await Address.findOne({ consumerId, isDefault: true });

    if (defaultAddress) {
      res.status(200).json(defaultAddress);
    } else {
      res.status(404).json({ message: 'Default address not found' });
    }
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({ message: 'Failed to fetch default address' });
  }
});





module.exports = router;



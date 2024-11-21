const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PendingUser = require('../models/PendingUser'); // Adjust path as necessary
const Seller = require('../models/Seller'); // Adjust path as necessary
const Reseller = require('../models/Reseller'); // Adjust path as necessary
const Exporter = require('../models/Exporter'); // Adjust path as necessary
const Supplier = require('../models/Supplier');
const RejectedUser = require('../models/rejectedUser');
const Provider = require('../models/Provider');
const emailService = require('../services/emailService'); // Ensure you have an email service
const Product = require('../models/Product');
const CartItem = require('../models/CartItem');



// Helper function to check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const Address = require('../models/Address'); // Adjust the path as needed
const Consumer = require('../models/Consumer'); // Import the Consumer model
const SellersAddress = require('../models/SellersAddress');
const SupplierProducts = require('../models/SupplierProducts');
const User = require('../models/User');

const findProductInCollections = async (productId) => {
  let product = await Product.findById(productId);
  if (product) return { product, collection: 'Product' };

  return null;
};

router.get('/suppliers/forselling', async (req, res) => {
  try {
    // Fetch all providers where the userType is 'Supplier'
    const suppliers = await Provider.find({ userType: 'supplier' });

    if (suppliers.length === 0) {
      return res.status(404).json({ message: 'No suppliers found' });
    }

    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
});

// POST: Add product from any collection to cart
router.post('/all-add-to-cart', async (req, res) => {
  try {
    const { consumerId, productId, quantity } = req.body;

    // Fetch user from the database
    const consumer = await Consumer.findById(consumerId);

    if (!consumer) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find product in different collections
    const productInfo = await findProductInCollections(productId);

    if (!productInfo) {
      return res.status(404).json({ error: 'Product not found in any collection' });
    }

    const { product, collection } = productInfo;

    // Generate a new orderId
    const orderId = new mongoose.Types.ObjectId();

    // Calculate total stock including additional stocks
    const totalStock = product.stock + (Array.isArray(product.additionalStocks) 
      ? product.additionalStocks.reduce((acc, stock) => acc + stock.addstock, 0) 
      : 0); // Default to 0 if additionalStocks is not an array

    // Create a new cart item
    const cartItem = new CartItem({
      orderId: orderId, // Assign generated orderId
      consumerId: consumerId,
      productId: product._id,
      userId: product.userId, // Assuming products in all collections have userId
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity,
      stock: totalStock, // Use the calculated total stock
      collection: collection // Save the collection name to track product origin
    });

    // Save the cart item to the database
    await cartItem.save();

    res.status(201).json({ message: 'Product added to cart successfully', orderId: orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/pendingusercount', async (req, res) => {
  try {
    const count = await PendingUser.countDocuments(); // Count all documents
    res.json({ count });
  } catch (error) {
    console.error('Error fetching pending user count:', error);
    res.status(500).json({ error: 'Error fetching pending user count' });
  }
});


router.get('/allproducts/displaysuser', async (req, res) => {
    try {
        // Fetch products only from the Product collection
        const products = await Product.find({ archived: false })
            .select('title category expirationDate price image stock userId description firstName lastName additionalStocks stockWithOrder');

        // Check if products were found
        if (products.length === 0) {
            return res.status(404).send('No products found');
        }

        // Send the retrieved products as the response
        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Failed to retrieve products');
    }
});

router.get('/supplierproducts/displaysuser', async (req, res) => {
  try {
      // Fetch products with necessary fields
      const products = await SupplierProducts.find().select('productTitle category price stock manufactureDate expirationDate productImage wholesaleTiers productDescription firstName lastName unitOfMeasure');

      if (products.length === 0) {
          return res.status(404).send('No products found');
      }

      // Send the retrieved products as the response
      res.status(200).send(products);
  } catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).send('Failed to retrieve products');
  }
});


router.get('/supplier-products', async (req, res) => {
  try {
      const products = await SupplierProducts.find()
          .populate('userId', 'firstName lastName displayPictureURL') // Populate user details if needed
          .exec();

      if (!products.length) {
          return res.status(404).json({ message: 'No products found' });
      }

      res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching supplier products:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/supplier/products/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;

      if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
      }

      // Fetch the provider's details from the database
      const provider = await Provider.findOne({ userId }).exec();

      if (!provider) {
          return res.status(404).json({ error: 'Provider not found' });
      }

      // Fetch products associated with the provider from the Product collection
      const supplierproducts = await SupplierProducts.find({ userId })
          .select('productTitle productImage wholesaleTiers price')
          .exec();

      if (!supplierproducts || supplierproducts.length === 0) {
          return res.status(404).json({ error: 'No products found for this provider' });
      }

      // Return provider details along with their products
      res.json({
          provider: {
              displayPictureURL: provider.displayPictureURL,
              firstName: provider.firstName,
              lastName: provider.lastName,
              contactNumber: provider.contactNumber
          },
          supplierproducts
      });
  } catch (error) {
      console.error('Error fetching provider products:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});




// Add this route to your existing router
router.get('/providerproducts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch the provider's details from the database
        const provider = await Provider.findOne({ userId }).exec();

        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        // Fetch products associated with the provider from the Product collection
        const products = await Product.find({ userId }).exec();

        if (!products || products.length === 0) {
            return res.status(404).json({ error: 'No products found for this provider' });
        }

        // Return provider details along with their products
        res.json({
            provider: {
                displayPictureURL: provider.displayPictureURL,
                firstName: provider.firstName,
                lastName: provider.lastName
            },
            products
        });
    } catch (error) {
        console.error('Error fetching provider products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






// Fetch user details based on userId for consumers
router.get('/consumer/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const consumer = await Consumer.findById(userId).select('userId firstName lastName displayPictureURL');

    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    res.json(consumer);
  } catch (error) {
    console.error('Error fetching consumer details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


const getUserDetailsByType = async (userId, userType) => {
  let Provider;

  switch (userType) {
    case 'supplier':
      Provider = Supplier;
      break;
    case 'seller':
      Provider = Seller;
      break;
    case 'reseller':
      Provider = Reseller;
      break;
    case 'exporter':
      Provider = Exporter;
      break;
    default:
      throw new Error('Invalid user type');
  }

  return await Provider.findById(userId).select('userId firstName lastName userType displayPictureURL');
};

router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    let user = await Provider.findById(userId).select('userId firstName lastName userType displayPictureURL');

    if (!user) {
      // Check in the approved users collections
      const userTypes = ['supplier', 'seller', 'reseller', 'exporter'];
      for (const userType of userTypes) {
        user = await getUserDetailsByType(userId, userType);
        if (user) break;
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Define the POST route
// Your existing backend routes
router.post('/nearestprovider/:consumerId', async (req, res) => {
  try {
      const consumerId = req.params.consumerId;
      const { maxDistance } = req.body;

      if (!consumerId) {
          return res.status(400).json({ error: 'Consumer ID is required' });
      }

      const consumerAddress = await Address.findOne({ consumerId, isDefault: true }).exec();
      if (!consumerAddress) {
          return res.status(404).json({ error: 'Consumer address not found' });
      }

      const { coordinates, fullName, region, province, city, barangay, postalCode, street, houseNumber, country } = consumerAddress;
      if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ error: 'Invalid coordinates' });
      }

      const [longitude, latitude] = coordinates;

      const consumer = await Consumer.findById(consumerId).select('displayPictureURL').exec();
      if (!consumer) {
          return res.status(404).json({ error: 'Consumer not found' });
      }

      const providers = await Provider.aggregate([
          {
              $geoNear: {
                  near: {
                      type: "Point",
                      coordinates: [longitude, latitude],
                  },
                  distanceField: "distance",
                  maxDistance: maxDistance || 10000,
                  spherical: true,
              },
          },
          {
              $match: {
                  userType: { $in: ["supplier", "seller", "reseller", "exporter"] },
                  "address.coordinates": { $exists: true, $ne: [] }
              }
          },
          {
              $project: {
                  userId: 1,
                  firstName: 1,
                  lastName: 1,
                  userType: 1,
                  displayPictureURL: 1,
                  country: "$address.country",
                  region: "$address.region",
                  province: "$address.province",
                  city: "$address.city",
                  barangay: "$address.barangay",
                  coordinates: "$address.coordinates",
                  distance: 1,
              },
          },
      ]);

      res.json({
          consumer: {
              fullName,
              displayPictureURL: consumer.displayPictureURL,
              coordinates: consumerAddress.coordinates,
              region,
              province,
              city,
              barangay,
              postalCode,
              street,
              houseNumber,
              country
          },
          providers
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Define the GET route
router.get('/nearestprovider/:consumerId', async (req, res) => {
  try {
    const consumerId = req.params.consumerId;
    const maxDistance = parseInt(req.query.maxDistance) || 10000;

    if (!consumerId) {
      return res.status(400).json({ error: 'Consumer ID is required' });
    }

    // Fetch consumer's address
    const consumerAddress = await Address.findOne({ consumerId, isDefault: true }).exec();
    if (!consumerAddress) {
      return res.status(404).json({ error: 'Consumer address not found' });
    }

    const { coordinates, fullName, region, province, city, barangay, postalCode, street, houseNumber, country } = consumerAddress;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const [longitude, latitude] = coordinates;

    // Fetch consumer details
    const consumer = await Consumer.findById(consumerId).select('displayPictureURL').exec();
    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    // Find providers within 10km
    const nearbyProviders = await Provider.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
        },
      },
      {
        $match: {
          userType: { $in: ["supplier", "seller", "reseller", "exporter"] },
          "address.coordinates": { $exists: true, $ne: [] },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          firstName: 1,
          lastName: 1,
          userType: 1,
          displayPictureURL: 1,
          country: "$address.country",
          region: "$address.region",
          province: "$address.province",
          city: "$address.city",
          barangay: "$address.barangay",
          coordinates: "$address.coordinates",
          distance: 1,
        },
      },
    ]);

    // Find providers beyond 10km
    const distantProviders = await Provider.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          minDistance: maxDistance,
          spherical: true,
        },
      },
      {
        $match: {
          userType: { $in: ["supplier", "seller", "reseller", "exporter"] },
          "address.coordinates": { $exists: true, $ne: [] },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          firstName: 1,
          lastName: 1,
          userType: 1,
          displayPictureURL: 1,
          country: "$address.country",
          region: "$address.region",
          province: "$address.province",
          city: "$address.city",
          barangay: "$address.barangay",
          coordinates: "$address.coordinates",
          distance: 1,
        },
      },
    ]);

    // Combine nearby and distant providers
    const providers = [...nearbyProviders, ...distantProviders];

    res.json({
      consumer: {
        fullName,
        displayPictureURL: consumer.displayPictureURL,
        coordinates: consumerAddress.coordinates,
        region,
        province,
        city,
        barangay,
        postalCode,
        street,
        houseNumber,
        country,
      },
      providers,
    });
  } catch (error) {
    console.error('Error finding nearby providers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




router.get('/nearby/:consumerId', async (req, res) => {
  try {
    const consumerId = req.params.consumerId;
    if (!consumerId) {
      return res.status(400).json({ error: 'Consumer ID is required' });
    }

    // Get consumer's address coordinates
    const consumerAddress = await Address.findOne({ consumerId, isDefault: true }).exec();

    if (!consumerAddress) {
      return res.status(404).json({ error: 'Consumer address not found' });
    }

    // Log the consumer address for debugging
    console.log('Consumer Address:', consumerAddress);

    // Access coordinates directly from the consumerAddress document
    const coordinates = consumerAddress.coordinates;

    // Validate coordinates
    if (!coordinates || coordinates.length !== 2) {
      console.error('Invalid or missing coordinates:', coordinates);
      return res.status(400).json({ error: 'Coordinates are missing or invalid' });
    }

    // Query for nearby providers
    const providers = await Provider.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [120.5811862, 14.6433475],
          },
          distanceField: "distance",
          maxDistance: 10000, // Testing with a larger distance
          spherical: true,
        },
      }
    ]);
    

    // Format the response
    const formattedProviders = providers.map(provider => ({
      userId: provider.userId,
      firstName: provider.firstName,
      lastName: provider.lastName,
      country: provider.address.country,
      region: provider.address.region,
      province: provider.address.province,
      city: provider.address.city,
      barangay: provider.address.barangay,
      coordinates: provider.address.coordinates
    }));

    res.json(formattedProviders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});





// Endpoint to approve a pending user
const getCoordinates = async (country, region, province, city, barangay) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${barangay}, ${city}, ${province}, ${region}, ${country}`,
        format: 'json'
      }
    });
    const location = response.data[0];
    if (location) {
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon)
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw new Error('Error fetching coordinates');
  }
};

router.post('/approve/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const pendingUser = await PendingUser.findById(userId);

    if (!pendingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword, 
      birthdate, 
      contactNumber, 
      userType, 
      dtiImageURL, 
      displayPictureURL,
      businessPermitImageURL, 
      sanitaryPermitImageURL, 
      address 
    } = pendingUser;

    const { 
      country, 
      region, 
      province, 
      city, 
      barangay, 
      coordinates 
    } = address || {};

    if (!country || !region || !province || !city || !barangay || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Address fields are missing or coordinates are incorrect' });
    }

    const [longitude, latitude] = coordinates.map(coord => parseFloat(coord));
    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    let approvedUser;

    switch (userType) {
      case 'supplier':
        approvedUser = new Supplier({
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
            coordinates: [longitude, latitude]
          },
          displayPictureURL,
          dtiImageURL, 
          businessPermitImageURL, 
          sanitaryPermitImageURL,
          archived: false
        });
        break;
      case 'seller':
        approvedUser = new Seller({
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
            coordinates: [longitude, latitude]
          },
          displayPictureURL,
          dtiImageURL, 
          businessPermitImageURL, 
          sanitaryPermitImageURL,
          archived: false
        });
        break;
      case 'reseller':
        approvedUser = new Reseller({
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
            coordinates: [longitude, latitude]
          },
          displayPictureURL,
          dtiImageURL, 
          businessPermitImageURL, 
          sanitaryPermitImageURL,
          archived: false
        });
        break;
      case 'exporter':
        approvedUser = new Exporter({
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
            coordinates: [longitude, latitude]
          },
          displayPictureURL,
          dtiImageURL, 
          businessPermitImageURL, 
          sanitaryPermitImageURL,
          archived: false
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid userType' });
    }

    await approvedUser.save();

    // Save to providers collection
    const provider = new Provider({
      userId: approvedUser._id,
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
        coordinates: [longitude, latitude]
      },
      displayPictureURL,
      dtiImageURL, 
      businessPermitImageURL, 
      sanitaryPermitImageURL
    });
    await provider.save();

    const newusers = new User({
      userId: approvedUser._id,
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
        coordinates: [longitude, latitude]
      },
      displayPictureURL,
      dtiImageURL, 
      businessPermitImageURL, 
      sanitaryPermitImageURL
    });
    await newusers.save();

    // Save to consumers collection only for reseller and exporter
    if (userType === 'reseller' || userType === 'exporter') {
      const consumerEmail = email + '.consumer';  // Modify the email to avoid duplication

      const consumer = new Consumer({
        userId: approvedUser._id,
        firstName,
        lastName,
        email: consumerEmail,  // Save with modified email
        password: hashedPassword,
        birthdate,
        contactNumber,
        displayPictureURL,
        userType,
      });
      await consumer.save();
    }

    // Delete pending user
    await PendingUser.findByIdAndDelete(userId);

    // Send approval email
    await emailService.sendApprovalEmail(email, firstName, lastName, userType, userId); // Implement this method in your email service

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/reject/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { reasons, comment } = req.body;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const pendingUser = await PendingUser.findById(userId);
    if (!pendingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { email, firstName, lastName, userType, dtiImageURL, businessPermitImageURL, sanitaryPermitImageURL } = pendingUser;
    await PendingUser.findByIdAndDelete(userId);
    let rejectedUser = await RejectedUser.findOne({ email });
    if (rejectedUser) {
      rejectedUser.set({ firstName, lastName, userType, dtiImageURL, businessPermitImageURL, sanitaryPermitImageURL, comment });
    } else {
      rejectedUser = new RejectedUser({ email, firstName, lastName, userType, dtiImageURL, businessPermitImageURL, sanitaryPermitImageURL, comment });
    }
    await rejectedUser.save();
    await emailService.sendRejectionEmail(email, firstName, lastName, userType, reasons, comment);
    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;
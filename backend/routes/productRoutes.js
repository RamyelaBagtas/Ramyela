const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const DriedFishProduct = require('../models/DriedFishProduct');
const GourmetProduct = require('../models/GourmetProduct');
const mongoose = require('mongoose');
const CartOrderGet = require('../models/CartOderget');
const CompleteOrder = require('../models/completeOrder');
const SupplierProducts = require('../models/SupplierProducts');
const Provider = require('../models/Provider');
const SellersAddress = require('../models/SellersAddress');
const Seller = require('../models/Seller');
const Reseller = require('../models/Reseller');


router.post('/nearest/seller/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { maxDistance } = req.body;
  
        if (!userId) {
            return res.status(400).json({ error: 'user ID is required' });
        }
  
        const userAddress = await SellersAddress.findOne({ userId, isDefault: true }).exec();
        if (!userAddress) {
            return res.status(404).json({ error: 'Consumer address not found' });
        }
  
        const { coordinates, fullName, region, province, city, barangay, postalCode, street, houseNumber, country } = userAddress;
        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
  
        const [longitude, latitude] = coordinates;
  
        const user = await Reseller.findById(userId).select('displayPictureURL').exec();
        if (!user) {
            return res.status(404).json({ error: 'user not found' });
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
                    userType: { $in: ["seller"] },
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
            user: {
                fullName,
                displayPictureURL: user.displayPictureURL,
                coordinates: userAddress.coordinates,
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
  router.get('/nearest/seller/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const maxDistance = parseInt(req.query.maxDistance) || 10000;
  
      if (!userId) {
        return res.status(400).json({ error: 'user ID is required' });
      }
  
      // Fetch consumer's address
      const userAddress = await SellersAddress.findOne({ userId, isDefault: true }).exec();
      if (!userAddress) {
        return res.status(404).json({ error: 'Consumer address not found' });
      }
  
      const { coordinates, fullName, region, province, city, barangay, postalCode, street, houseNumber, country } = userAddress;
      if (!coordinates || coordinates.length !== 2) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }
  
      const [longitude, latitude] = coordinates;
  
      // Fetch consumer details
      const user = await Reseller.findById(userId).select('displayPictureURL').exec();
      if (!user) {
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
            userType: { $in: ["seller"] },
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
            userType: { $in: ["seller"] },
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
        user: {
          fullName,
          displayPictureURL: user.displayPictureURL,
          coordinates: userAddress.coordinates,
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



router.get('/default-address/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Find the default address for the given userId
      const defaultAddress = await SellersAddress.findOne({ userId, isDefault: true });
  
      if (!defaultAddress) {
        return res.status(404).json({ message: 'Default address not found' });
      }
  
      return res.status(200).json(defaultAddress);
    } catch (error) {
      console.error('Error fetching default address:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

router.post('/nearest/supplierr/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { maxDistance } = req.body;
  
        if (!userId) {
            return res.status(400).json({ error: 'user ID is required' });
        }
  
        const userAddress = await SellersAddress.findOne({ userId, isDefault: true }).exec();
        if (!userAddress) {
            return res.status(404).json({ error: 'Consumer address not found' });
        }
  
        const { coordinates, fullName, region, province, city, barangay, postalCode, street, houseNumber, country } = userAddress;
        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
  
        const [longitude, latitude] = coordinates;
  
        const user = await Seller.findById(userId).select('displayPictureURL').exec();
        if (!user) {
            return res.status(404).json({ error: 'user not found' });
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
                    userType: { $in: ["supplier"] },
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
            user: {
                fullName,
                displayPictureURL: user.displayPictureURL,
                coordinates: userAddress.coordinates,
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
  router.get('/nearest/supplier/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const maxDistance = parseInt(req.query.maxDistance) || 10000;
  
      if (!userId) {
        return res.status(400).json({ error: 'user ID is required' });
      }
  
      // Fetch consumer's address
      const userAddress = await SellersAddress.findOne({ userId, isDefault: true }).exec();
      if (!userAddress) {
        return res.status(404).json({ error: 'Consumer address not found' });
      }
  
      const { coordinates, fullName, region, province, city, barangay, postalCode, street, houseNumber, country } = userAddress;
      if (!coordinates || coordinates.length !== 2) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }
  
      const [longitude, latitude] = coordinates;
  
      // Fetch consumer details
      const user = await Seller.findById(userId).select('displayPictureURL').exec();
      if (!user) {
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
            userType: { $in: ["supplier"] },
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
            userType: { $in: ["supplier"] },
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
        user: {
          fullName,
          displayPictureURL: user.displayPictureURL,
          coordinates: userAddress.coordinates,
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

router.post('/products/unarchive/:productId', async (req, res) => {
    const { productId } = req.params;
  
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { archived: false },
        { new: true } // Return the updated document
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error unarchiving product:', error);
      res.status(500).json({ error: 'Failed to unarchive product' });
    }
  });

  router.get('/products/:productId/add-stock', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Check if the product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        // Fetch the existing product including additional stocks
        const existingProduct = await Product.findById(productId).select('additionalStocks');
        if (!existingProduct) {
            return res.status(404).send('Product not found');
        }

        // Return the additional stocks data
        res.status(200).json(existingProduct.additionalStocks);
    } catch (error) {
        console.error('Error fetching additional stocks:', error);
        res.status(500).send('Failed to fetch additional stocks');
    }
});


router.post('/products/:productId/add-stock', async (req, res) => {
    try {
        const productId = req.params.productId;
        const { addstock, expirationDate } = req.body;

        // Check if the product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        // Fetch the existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).send('Product not found');
        }

        // Validate expiration date
        const currentDate = new Date();
        if (new Date(expirationDate) < currentDate) {
            return res.status(400).send('Expiration date must be in the future.');
        }

        // Add new stock to additionalStocks array with stillAddStock and createdAt date
        const newStockEntry = {
            addstock, // The amount of stock being added
            expirationDate,
            stillAddStock: addstock, // Same value as addstock
            createdAt: new Date() // Automatically save the creation date
        };

        existingProduct.additionalStocks.push(newStockEntry);
        await existingProduct.save();

        res.status(200).json(existingProduct);
    } catch (error) {
        console.error('Error adding stock:', error);
        res.status(500).send('Failed to add stock');
    }
});





router.put('/products/:productId', async (req, res) => {
    try {
        const productId = req.params.productId; // Retrieve product ID from request parameters
        const updateData = req.body; // Data to update

        // Check if the product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        // Fetch the existing product to get the category
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).send('Product not found');
        }

        const { expirationDate, category } = updateData;

        // Calculate the minimum expiration date based on the category
        const currentDate = new Date();
        let minExpirationDate;

        if (category === 'driedfish') {
            currentDate.setMonth(currentDate.getMonth() + 6);
            minExpirationDate = currentDate.toISOString().split('T')[0];
        } else if (category === 'gourmet') {
            currentDate.setMonth(currentDate.getMonth() + 12);
            minExpirationDate = currentDate.toISOString().split('T')[0];
        }

        // Validate expiration date if it is provided in the update data
        if (expirationDate && expirationDate < minExpirationDate) {
            const requiredMonths = category === 'driedfish' ? 6 : 12;
            return res.status(400).send(`Expiration date must be at least ${requiredMonths} months from today.`);
        }

        // Update the product and return the updated document
        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true }).select('title category description expirationDate stock price image');

        res.status(200).send(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Failed to update product');
    }
});

router.get('/products/archive/:id', async (req, res) => {
    try {
        const userId = req.params.id; // Retrieve user ID from request parameters

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        const products = await Product.find({ userId: userId, archived: true }).select('title category expirationDate stock price image additionalStocks');
        
        if (!products || products.length === 0) {
            return res.status(404).send('No products found for this user');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.post('/products/archive/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        const archivedProduct = await Product.findByIdAndUpdate(productId, { archived: true }, { new: true });

        if (!archivedProduct) {
            return res.status(404).send('Product not found');
        }

        res.status(200).send(archivedProduct);
    } catch (error) {
        console.error('Error archiving product:', error);
        res.status(500).send('Failed to archive product');
    }
});

router.get('/count/unshipped/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
    
        // Count the number of items in the cart for the given consumerId
        const unshipped = await CartOrderGet.countDocuments({ 'product.userId': userId, shipped: 'false' });
    
        res.status(200).json({ unshipped });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    router.get('/count/forshipment/:userId', async (req, res) => {
        try {
            const { userId } = req.params;
        
            // Count the number of items in the cart for the given consumerId
            const shipped = await CompleteOrder.countDocuments({ 'product.userId': userId, shipped: true, Receive: false, toReceiveETA: { $exists: false } });
        
            res.status(200).json({ shipped });
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });

        router.get('/count/forreceival/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
            
                // Count the number of items in the cart for the given consumerId
                const receival = await CompleteOrder.countDocuments({ 'product.userId': userId, shipped: true, Receive: false, toReceiveETA: { $exists: true } });
            
                res.status(200).json({ receival });
              } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
              }
            });

            router.get('/inventory/:id', async (req, res) => {
                try {
                    const userId = req.params.id;
            
                    if (!mongoose.Types.ObjectId.isValid(userId)) {
                        return res.status(400).send('Invalid user ID');
                    }
            
                    const products = await Product.find({ userId: userId })
                        .select('title category expirationDate price image stock userId description firstName lastName additionalStocks stockWithOrder createdAt');
            
                    if (!products || products.length === 0) {
                        return res.status(404).send('No products found for this user');
                    }
            
                    // Calculate total stock by adding product stock and additionalStocks.addstock
                    const productsWithTotalStock = products.map(product => {
                        const totalAdditionalStock = product.additionalStocks.reduce((total, stock) => total + (stock.addstock || 0), 0);
                        return {
                            ...product._doc,
                            totalStock: product.stock + totalAdditionalStock
                        };
                    });
            
                    res.status(200).send(productsWithTotalStock);
                } catch (error) {
                    console.error('Error fetching products:', error);
                    res.status(500).send('Failed to fetch products');
                }
            });

router.get('/inventory/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        const products = await Product.find({ userId: userId })
            .select('title category expirationDate price image stock userId description firstName lastName additionalStocks stockWithOrder createdAt');

        if (!products || products.length === 0) {
            return res.status(404).send('No products found for this user');
        }

        // Calculate total stock by adding product stock and additionalStocks.addstock
        const productsWithTotalStock = products.map(product => {
            const totalAdditionalStock = product.additionalStocks.reduce((total, stock) => total + (stock.addstock || 0), 0);
            return {
                ...product._doc,
                totalStock: product.stock + totalAdditionalStock
            };
        });

        res.status(200).send(productsWithTotalStock);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/products/user/:id', async (req, res) => {
    try {
        const userId = req.params.id; // Retrieve user ID from request parameters

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        const products = await Product.find({ userId: userId, archived: false }).select('title category description expirationDate stock price image createdAt');
        
        if (!products || products.length === 0) {
            return res.status(404).send('No products found for this user');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});


router.get('/products/dried-fish', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'driedfish', archived: false, userType: "seller" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/sproducts/dried-fish', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'driedfish', archived: false, userType: "supplier" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/rsproducts/dried-fish', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'driedfish', archived: false, userType: "reseller" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/exproducts/dried-fish', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'driedfish', archived: false, userType: "exporter" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/products/gourmet', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'gourmet', archived: false, userType: "seller" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/sproducts/gourmet', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'gourmet', archived: false, userType: "supplier" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/rsproducts/gourmet', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'gourmet', archived: false, userType: "reseller" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

router.get('/exproducts/gourmet', async (req, res) => {
    try {
        // Fetch products with the category of 'dried fish'
        const products = await Product.find({ category: 'gourmet', archived: false, userType: "exporter" }).select('title category price image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});

// Route for adding a product
// Assuming you have a function where this logic is implemented
const getUserTypeById = async (userId) => {
    let userType;

    // First, check in the Provider model
    const Provider = require('../models/Provider');
    const provider = await Provider.findById(userId).select('userType');
    
    if (provider) {
        userType = provider.userType; // Set userType from Provider
    } else {
        // If not found, check other user models
        const userTypes = ['supplier', 'seller', 'reseller', 'exporter'];

        for (const type of userTypes) {
            const UserModel = require(`../models/${type.charAt(0).toUpperCase() + type.slice(1)}`); // Dynamically require the model
            const user = await UserModel.findById(userId).select('userType'); // Fetch userType

            if (user) {
                userType = user.userType; // Set userType based on fetched data
                break; // Exit loop once userType is found
            }
        }
    }

    // If userType is not found, return an error
    if (!userType) {
        throw new Error('User not found or userType not defined');
    }

    return userType;
};


// GET endpoint to fetch all products associated with a specific userId
router.get('/supplierproducts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        // Find products associated with the provided userId
        const products = await SupplierProducts.find({ userId });

        // Check if products were found
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found for this user.' });
        }

        // Convert productImage to base64 if it exists
        const productsWithImages = products.map(product => {
            return {
                ...product.toObject(), // Convert Mongoose document to plain object
                productImage: product.productImage ? product.productImage.toString('base64') : null,
            };
        });

        // Respond with the retrieved products
        res.status(200).json(productsWithImages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products', error });
    }
});


// PUT endpoint to update a supplier product
router.put('/supplierproducts/:id', async (req, res) => {
    try {
        const {
            productTitle,
            productDescription,
            category,
            preOrder,
            preOrderChecklist,
            wholesaleTiers,
            materials,
            ingredients,
            procedures,
            manufactureDate,
            expirationDate,
            userId,
            userType,
            displayPictureURL,
            firstName,
            lastName
        } = req.body;

        let productImageURL = displayPictureURL; // If no new image is uploaded, keep the existing URL

        // Handle file upload to a local directory
        if (req.files && req.files.productImage) {
            const uploadedFile = req.files.productImage;
            const uploadPath = path.join(__dirname, 'uploads', uploadedFile.name); // Define upload directory path

            // Save the image to the 'uploads' directory
            uploadedFile.mv(uploadPath, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'File upload failed', error: err });
                }

                // Store the image URL or relative path
                productImageURL = `/uploads/${uploadedFile.name}`;
            });
        }

        // Safely parse JSON fields, check if the field is a string before parsing
        const parseJSON = (data) => {
            try {
                return typeof data === 'string' ? JSON.parse(data) : data;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return [];
            }
        };

        // Find and update the product by ID
        const updatedProduct = await SupplierProducts.findByIdAndUpdate(
            req.params.id,
            {
                productTitle,
                productDescription,
                productImageURL, // Store the image URL or relative path
                category,
                preOrder: preOrder === 'true',
                preOrderChecklist: parseJSON(preOrderChecklist),
                wholesaleTiers: parseJSON(wholesaleTiers),
                materials: parseJSON(materials),
                ingredients: parseJSON(ingredients),
                procedures: parseJSON(procedures),
                manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
                expirationDate: expirationDate ? new Date(expirationDate) : null,
                userId,
                userType,
                firstName,
                lastName,
            },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product data', error });
    }
});


router.post('/supplierproducts', async (req, res) => {
    try {
        const {
            productTitle,
            productDescription,
            category,
            preOrder,
            preOrderChecklist,
            wholesaleTiers,
            materials,
            ingredients,
            procedures,
            manufactureDate,
            expirationDate,
        } = req.body;

        const userId = req.body.userId; // Get userId from request body
        const userType = req.body.userType; // Get userType from request body
        const displayPictureURL = req.body.displayPictureURL; // Get displayPictureURL from request body
        const firstName = req.body.firstName; // Get firstName from request body
        const lastName = req.body.lastName; // Get lastName from request body

        const productImage = req.files && req.files.productImage ? req.files.productImage.data : null;

        const newProduction = new SupplierProducts({
            productTitle,
            productDescription,
            productImage,
            category,
            preOrder: preOrder === 'true',
            preOrderChecklist: JSON.parse(preOrderChecklist || '[]'),
            wholesaleTiers: JSON.parse(wholesaleTiers || '[]'),
            materials: JSON.parse(materials || '[]'),
            ingredients: JSON.parse(ingredients || '[]'),
            procedures: JSON.parse(procedures || '[]'),
            manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
            userId, // Save userId
            userType, // Save userType
            displayPictureURL, // Save displayPictureURL
            firstName, // Save firstName
            lastName, // Save lastName
        });

        const savedProduction = await newProduction.save();
        res.status(201).json(savedProduction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving production data', error });
    }
});


// Usage within your endpoint
router.post('/bsproducts', async (req, res) => {
    try {
        const { title, description, category, expirationDate, stock, price, userId, firstName, lastName, displayPictureURL } = req.body;
        const image = req.files.image;

        // Get userType
        const userType = await getUserTypeById(userId);

        // Calculate the minimum expiration date based on the category
        const currentDate = new Date();
        let minExpirationDate;

        if (category === 'driedfish') {
            currentDate.setMonth(currentDate.getMonth() + 6);
            minExpirationDate = currentDate.toISOString().split('T')[0];
        } else if (category === 'gourmet') {
            currentDate.setMonth(currentDate.getMonth() + 12);
            minExpirationDate = currentDate.toISOString().split('T')[0];
        } else {
            return res.status(400).send('Invalid category');
        }

        // Validate expiration date
        if (expirationDate < minExpirationDate) {
            const requiredMonths = category === 'driedfish' ? 6 : 12;
            return res.status(400).send(`Expiration date must be at least ${requiredMonths} months from today.`);
        }

        // Create a new product instance with the userType set automatically
        const product = new Product({
            title,
            description,
            category,
            expirationDate,
            stock,
            stockWithOrder: stock, // Initialize stockWithOrder to the same value as stock
            price,
            userId,
            firstName,
            lastName,
            displayPictureURL,
            userType // Automatically included from provider or fallback
        });
        product.image = image.data; // Store image data as Buffer

        // Save the product to the database
        await product.save();

        // Handle specific categories
        if (category === 'gourmet') {
            const gourmetProduct = new GourmetProduct({
                title,
                description,
                image: product.image,
                expirationDate,
                stock,
                price,
                userId,
                firstName,
                lastName,
                displayPictureURL,
                userType // Automatically included from provider or fallback
            });
            await gourmetProduct.save();
            res.status(201).send(gourmetProduct);
        } else if (category === 'driedfish') {
            const driedFishProduct = new DriedFishProduct({
                title,
                description,
                image: product.image,
                expirationDate,
                stock,
                price,
                userId,
                firstName,
                lastName,
                displayPictureURL,
                userType // Automatically included from provider or fallback
            });
            await driedFishProduct.save();
            res.status(201).send(driedFishProduct);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Failed to add product');
    }
});





// Route for fetching all products associated with a specific user
router.get('/productlist/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch cart items from the database
        const product = await Product.find({ userId });

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/products/user/:id', async (req, res) => {
    try {
        const userId = req.params.id; // Retrieve user ID from request parameters
        const products = await Product.find({ userId }).select('title category expirationDate stock price image');
        
        // Check if any products were found
        if (!products.length) {
            return res.status(404).send('No products found for this user.');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Failed to fetch products');
    }
});



router.get('/suplayerproducts/displaysuser', async (req, res) => {
    try {
        const products = await SupplierProducts.find();

        if (!products || products.length === 0) {
            return res.status(404).send('No products found');
        }

        // Send products with image data as base64 string
        const productsWithImages = products.map(product => {
            if (product.productImage) {
                return {
                    ...product.toObject(),
                    productImage: `data:image/jpeg;base64,${product.productImage.toString('base64')}`
                };
            }
            return product;
        });

        res.status(200).json(productsWithImages);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Failed to retrieve products');
    }
});



// Get product details
router.get('/products/displaysuser', async (req, res) => {
    try {
        const products = await Product.find({ archived: false, userType: "seller" }).select('title category expirationDate price image stock userId description');

        if (!products) {
            return res.status(404).send('No products found');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Failed to retrieve products');
    }
});

router.get('/sproducts/displaysuser', async (req, res) => {
    try {
        const products = await Product.find({ archived: false, userType: "supplier" }).select('title category expirationDate price image stock userId description');

        if (!products) {
            return res.status(404).send('No products found');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Failed to retrieve products');
    }
});

router.get('/rsproducts/displaysuser', async (req, res) => {
    try {
        const products = await Product.find({ archived: false, userType: "reseller" }).select('title category expirationDate price image stock userId description');

        if (!products) {
            return res.status(404).send('No products found');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Failed to retrieve products');
    }
});

router.get('/exproducts/displaysuser', async (req, res) => {
    try {
        const products = await Product.find({ archived: false, userType: "exporter" }).select('title category expirationDate price image stock userId description');

        if (!products) {
            return res.status(404).send('No products found');
        }

        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Failed to retrieve products');
    }
});

router.get('/products/displaysuser/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId).select('title category expirationDate price image stock userId description');

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.status(200).send(product);
    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).send('Failed to retrieve product');
    }
});


// Get a product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Remove product
router.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Determine the category and remove from the respective collection
        if (product.category === 'gourmet') {
            await GourmetProduct.findOneAndDelete({ title: product.title });
        } else if (product.category === 'driedfish') {
            await DriedFishProduct.findOneAndDelete({ title: product.title });
        } else {
            return res.status(400).send('Invalid category');
        }

        // Remove from the main products collection
        await Product.findByIdAndDelete(productId);

        res.status(200).send('Product removed successfully');
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).send('Failed to remove product');
    }
});

module.exports = router;

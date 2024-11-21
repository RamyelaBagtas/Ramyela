const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/Consumer');
const Product = require('../models/Product');
const CartItem = require('../models/CartItem');
const CompleteOrder = require('../models/completeOrder');
const cartOrderget = require('../models/CartOderget');
const CancelOrder = require('../models/cancelOrder');



const Provider = require('../models/Provider');
const SellersAddress = require('../models/SellersAddress');
const Seller = require('../models/Seller');
const SupplierOrder = require('../models/SupplierOrder');
const SupplierProducts = require('../models/SupplierProducts');
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

router.get('/cart-count/:consumerId', async (req, res) => {
  try {
    const { consumerId } = req.params;

    // Count the number of items in the cart for the given consumerId
    const cartCount = await CartItem.countDocuments({ consumerId });

    res.status(200).json({ cartCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/completeOrder/received/:consumerId', async (req, res) => {
    const { consumerId } = req.params;

    if (!consumerId) {
        return res.status(400).json({ error: 'ConsumerId is required' });
    }

    try {
        // Fetch orders where the consumerId matches and toReceiveETA is present
        const orders = await CompleteOrder.find({
            consumerId: consumerId,
            Receive: true,
        });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found with ETA for this consumerId' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


router.get('/completeOrder/eta/:consumerId', async (req, res) => {
    const { consumerId } = req.params;

    if (!consumerId) {
        return res.status(400).json({ error: 'ConsumerId is required' });
    }

    try {
        // Fetch orders where the consumerId matches and toReceiveETA is present
        const orders = await CompleteOrder.find({
            consumerId: consumerId,
            toReceiveETA: { $exists: true },
            Receive: false,
        });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found with ETA for this consumerId' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders with ETA:', error);
        res.status(500).json({ error: 'Failed to fetch orders with ETA' });
    }
});


router.get('/consumernotif/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch notifications for the given userId where userId is associated with the product array
        const notifications = await CompleteOrder.find({ 'product.userId': userId, Receive: true });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.get('/cancellednotif/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch notifications for the given userId where userId is associated with the product array
        const notifications = await CancelOrder.find({ 'product.userId': userId });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.get('/cancel/:consumerId', async (req, res) => {
  const { consumerId } = req.params;

  try {
      // Fetch approved cancel requests from the CartOrderGet collection
      const approvedCancelRequests = await cartOrderget.find({
          consumerId,
          'product.cancelRequest': 'success'
      }).select('product totalAmount date defaultAddress cancellationReason'); // Select necessary fields

      // Fetch notifications from the CancelOrder collection where canceled is true
      const notifications = await CancelOrder.find({
          consumerId,
          canceled: true
      }).select('product totalAmount createdAt cancellationReason');

      if (!notifications.length && !approvedCancelRequests.length) {
          return res.status(404).json({ message: 'No cancelled orders found for this consumer' });
      }

      // Combine results from both collections
      const canceledOrders = [
          ...approvedCancelRequests,
          ...notifications
      ];

      res.status(200).json(canceledOrders);
  } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      res.status(500).json({ error: 'Failed to fetch cancelled orders' });
  }
});

  
router.get('/providernotify/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    try {
        // Fetch orders where the product array contains the specified userId and exclude those with toReceiveETA
        const orders = await CompleteOrder.find({
            'product.userId': userId,
            'toReceiveETA': { $exists: false }
        });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found for this userId' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

  
// Function to automatically mark orders as received
const markOrdersAsReceivedAutomatically = async () => {
    try {
      const currentDate = new Date();
      const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  
      console.log('Running automatic update for orders that should be marked as received.');
      console.log('Comparing against endDate less than:', oneDayAgo);
  
      const orders = await CompleteOrder.find({
        Receive: false,
        'toReceiveETA.endDate': { $lt: oneDayAgo } // Only orders past endDate
      });
  
      if (orders.length === 0) {
        console.log('No orders found that need to be marked as received.');
        return;
      }
  
      console.log('Found orders to mark as received:', orders);
  
      for (const order of orders) {
        order.Receive = true; // Mark order as received
        order.dateReceived = currentDate; // Set the dateReceived field to current date
        await order.save(); // Save changes
      }
  
      console.log('Automatically marked orders as received:', orders.length);
    } catch (error) {
      console.error('Failed to auto-mark orders as received:', error);
    }
  };
  
  // Schedule to run this function every 24 hours
  setInterval(markOrdersAsReceivedAutomatically, 24 * 60 * 60 * 1000); // 24 hours
  

// Endpoint to mark order as received
router.put('/receive/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
  
      // Find and update the order by ID
      const order = await CompleteOrder.findOneAndUpdate(
        { _id: orderId },  // filter by order ID
        { $set: { 
            Receive: true,
            dateReceived: new Date() // Set dateReceived to current date
        }},  
        { new: true }  // return the updated document
      );
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order marked as received', order });
    } catch (error) {
      console.error('Failed to mark order as received:', error);
      res.status(500).json({ message: 'Failed to mark order as received', error });
    }
  });

  // Add ETA to the CompleteOrder
router.put('/completeOrder/:orderId/eta', async (req, res) => {
    const { orderId } = req.params;
    const { toReceiveETA } = req.body;

    try {
        // Validate that the ETA dates are provided
        if (!toReceiveETA || !toReceiveETA.startDate || !toReceiveETA.endDate) {
            return res.status(400).json({ error: 'Both start date and end date for ETA are required' });
        }

        // Find the complete order by orderId and update the ETA dates
        const completeOrder = await CompleteOrder.findOneAndUpdate(
          { 'product.orderId': orderId }, 
          { toReceiveETA },
          { new: true }
      );

        if (!completeOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'ETA updated successfully', completeOrder });
    } catch (error) {
        console.error('Error updating ETA:', error);
        res.status(500).json({ error: 'Failed to update ETA' });
    }
});

  

router.get('/consumernotify/:consumerId', async (req, res) => {
    const { consumerId } = req.params;

    try {
      // Fetch notifications for the given consumerId
      const notifications = await CompleteOrder.find({ consumerId, 'toReceiveETA': { $exists: false } });
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });


router.post('/consumernotif', async (req, res) => {
    const { consumerId, product, totalAmount, date } = req.body;

    try {
        // Fetch the product directly from the Product collection
        const orderedProduct = await Product.findById(product.productId);

        // Check if the product was found
        if (!orderedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Calculate total stock including additional stocks
        const totalStock = orderedProduct.stock + (Array.isArray(orderedProduct.additionalStocks) 
            ? orderedProduct.additionalStocks.reduce((acc, stock) => acc + stock.addstock, 0) 
            : 0); // Default to 0 if additionalStocks is not an array

        // Check if sufficient stock is available
        if (totalStock < product.quantity) {
            return res.status(400).json({ error: 'Insufficient stock available' });
        }

        // Use the existing orderId from the product object
        const { orderId } = product;

        // Determine how much to reduce from stock and additionalStocks
        let remainingQuantity = product.quantity;

        // Reduce from product stock first
        if (orderedProduct.stock >= remainingQuantity) {
            orderedProduct.stock -= remainingQuantity; // Reduce stock
            remainingQuantity = 0; // All quantity fulfilled
        } else {
            remainingQuantity -= orderedProduct.stock; // Reduce remaining quantity
            orderedProduct.stock = 0; // Set stock to 0 since it is fully utilized
        }

        // Now reduce from additional stocks if necessary
        if (remainingQuantity > 0 && Array.isArray(orderedProduct.additionalStocks)) {
            for (const stock of orderedProduct.additionalStocks) {
                if (remainingQuantity <= 0) break; // Break if all quantity is fulfilled

                if (stock.addstock >= remainingQuantity) {
                    stock.addstock -= remainingQuantity; // Reduce from additional stock
                    remainingQuantity = 0; // All quantity fulfilled
                } else {
                    remainingQuantity -= stock.addstock; // Reduce remaining quantity
                    stock.addstock = 0; // Set additional stock to 0 since it is fully utilized
                }
            }
        }

        // Save the updated product with the new stock levels
        await orderedProduct.save();

        // Retrieve the default address from the cartOrderget collection
        const cartOrder = await cartOrderget.findOne({ consumerId, 'product.orderId': orderId });
        if (!cartOrder) {
            return res.status(404).json({ error: 'Cart order not found' });
        }

        const defaultAddress = cartOrder.defaultAddress;

        // Save the notification to the CompleteOrder collection with the existing orderId and defaultAddress
        const completeOrder = new CompleteOrder({
            consumerId,
            product,
            totalAmount,
            orderId, // Use the existing orderId
            shipped: true, // Update the order status to shipped
            createdAt: date || new Date(), // Save the provided date or default to the current date
            defaultAddress // Include defaultAddress
        });
        await completeOrder.save();

        // Delete the specific cart order from the cartOrderget collection based on orderId
        await cartOrderget.deleteOne({
            consumerId,
            'product.orderId': orderId // Use the existing orderId
        });

        res.status(200).json({ message: 'Notification sent and saved successfully, stock updated, and product removed from cart' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});


router.get('/cancelrequest/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch notifications for the given consumerId
    const notifications = await cartOrderget.find({ userId, cancelRequest: "pending" }).select('product totalAmount createdAt cancellationReason'); // Include the reason here

    if (!notifications.length) {
      return res.status(404).json({ message: 'No notifications found for this consumer' });
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/pendingcancellations/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    console.log('Searching for pending cancellations for providerId:', userId);

    // Adjusted query to match userId in the product array
    const orders = await cartOrderget.find({
      'product.cancelRequest': 'pending',
      'product.userId': userId // Ensure this matches your schema
    });

    console.log('Orders found:', orders); // Log the found orders

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No pending cancellation requests found for this provider.' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching pending cancellations:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});



router.post('/consumercancelorder', async (req, res) => {
  const { productId, orderId, reasons } = req.body;

  try {
    // Find the order by orderId and update the product cancellation details
    const order = await cartOrderget.findOneAndUpdate(
      { _id: orderId, 'product.productId': productId },
      {
        $set: {
          'product.$.cancelRequest': 'success',  // Set cancelRequest to 'success'
          'product.$.cancellationReason': reasons.join(', ') // Save reasons as a string
        }
      },
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ message: 'Order or product not found' });
    }

    // Create a new CancelOrder document
    const cancelOrder = new CancelOrder({
      consumerId: order.consumerId, // Assuming order has a consumerId field
      product: order.product.find(prod => prod.productId === productId), // Find the relevant product details
      totalAmount: order.product.find(prod => prod.productId === productId).price * order.product.find(prod => prod.productId === productId).quantity, // Calculate total amount
      cancellationReason: reasons.join(', ')
    });

    await cancelOrder.save(); // Save the cancel order to the database

    res.status(200).json({ message: 'Cancellation request submitted', order });
  } catch (error) {
    console.error('Error handling cancellation request:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});




router.put('/approveCancellation/:orderId/:productId', async (req, res) => {
  try {
      const { orderId, productId } = req.params;
      
      const updatedOrder = await cartOrderget.updateOne(
          { "product.orderId": orderId, "product.productId": productId },
          { 
              $set: { 
                  "product.$.cancelRequest": "approved",
                  "product.$.cancelledBy": "consumer"
              }
          }
      );
      
      if (updatedOrder.nModified === 0) {
          return res.status(404).json({ error: 'Order or product not found' });
      }

      res.status(200).json({ message: 'Cancellation approved successfully' });
  } catch (error) {
      console.error('Error approving cancellation:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

  router.post('/cancelnotif', async (req, res) => {
    const { consumerId, product, totalAmount, cancellationReason, date } = req.body;
  
    try {
      // Step 1: Save the cancellation notification in CancelOrder collection
      const cancelOrder = new CancelOrder({
        consumerId,
        product,
        totalAmount,
        canceled: true, // Mark the order as canceled
        cancellationReason, // Include the cancellation reason
        createdAt: date || new Date() // Use provided date or default to current date
      });
  
      await cancelOrder.save();
  
      // Step 2: Delete the associated order from CartOrder collection
      await cartOrderget.deleteOne({ 
        consumerId, 
        "product.productId": product.productId // Replace with the actual field to match
      });
  
      // Respond with success
      res.status(200).json({ message: 'Notification sent, saved, and order removed successfully' });
    } catch (error) {
      console.error('Error processing cancellation:', error);
      res.status(500).json({ error: 'Failed to process cancellation and remove order' });
    }
  });
  
  
  

// GET endpoint to fetch all notifications
router.get('/consumernotif/:consumerId', async (req, res) => {
    const { consumerId } = req.params;

    try {
        // Fetch notifications for the given consumerId
        const notifications = await CompleteOrder.find({ consumerId, shipped: true}).select(' product totalAmount shipped createdAt'); // Select the fields you need

        if (!notifications) {
            return res.status(404).json({ message: 'No notifications found for this consumer' });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.get('/notifications/:consumerId', async (req, res) => {
    const { consumerId } = req.params;

    try {
        // Query the database to retrieve messages based on the consumerId
        const messages = await CompleteOrder.find({ consumerId: consumerId }).distinct('message');
        res.status(200).json({ messages: messages });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
  

router.get('/tobereceive/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate the user ID format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        // Query the `CompleteOrder` collection
        const productOrders = await CompleteOrder.aggregate([
            { $unwind: "$product" },
            {
                $match: {
                    "product.userId": userId,
                    "shipped": true,
                    "toReceiveETA.startDate": { $exists: true, $ne: null },
                    "toReceiveETA.endDate": { $exists: true, $ne: null },
                    "Receive": false
                }
            },
            {
                $project: {
                    orderId: "$_id",
                    productId: "$product.productId",
                    consumerId: 1,
                    title: "$product.title",
                    quantity: "$product.quantity",
                    totalAmount: 1,
                    date: 1,
                    defaultAddress: 1,
                    toReceiveETA: 1,
                    imageUrl: "$product.image" // Assumes image data is in `product.image`
                }
            }
        ]);

        // Handle case where no orders were found
        if (!productOrders || productOrders.length === 0) {
            return res.status(404).send('No products found with the given criteria');
        }

        // Format each product order, ensuring Base64 encoding for image data if necessary
        const productOrdersWithImages = productOrders.map(order => {
            let imageUrl = order.imageUrl;

            // Convert binary image data to Base64, if applicable
            if (imageUrl && imageUrl.buffer) {
                const buffer = imageUrl.buffer;
                imageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            }

            return {
                ...order,
                imageUrl
            };
        });

        res.status(200).send(productOrdersWithImages);
    } catch (error) {
        console.error('Error fetching receival orders:', error);
        res.status(500).send('Failed to fetch receival orders');
    }
});



router.get('/productIds/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;

      const productOrders = await cartOrderget.aggregate([
          { $unwind: "$product" }, // Unwind the product array
          { 
              $match: { 
                  "product.userId": userId,
                  "product.cancelRequest": null // Exclude products with cancelRequest: "pending"
              } 
          }, 
          { 
              $project: {
                  _id: 0, // Exclude the default _id field
                  orderId: 1,
                  productId: "$product.productId", // Include productId
                  consumerId: "$consumerId", // Include consumerId
                  product: "$product", // Include product array
                  totalAmount: "$totalAmount", // Include totalAmount
                  date: "$date", // Include date
                  defaultAddress: "$defaultAddress" // Include defaultAddress
              }
          }
      ]);

      res.status(200).json({ productOrders });
  } catch (error) {
      console.error('Error fetching productIds:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});




router.get('/cartOrder/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // Find the product to get the associated userId
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const userId = product.userId;

        // Query the database to find cart orders associated with the userId
        const cartOrders = await cartOrderget.find({ 'product.userId': userId });

        // Check if any cart orders were found
        if (cartOrders.length === 0) {
            return res.status(404).json({ message: 'No cart orders found for the user associated with this product' });
        }

        res.status(200).json({ cartOrders });
    } catch (error) {
        console.error('Error fetching cart orders:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

// Define the endpoint to fetch the receipt data
router.get('/:consumerId', async (req, res) => {
  const { consumerId } = req.params;

  try {
    // Fetch orders where the consumerId matches and exclude those with cancelRequest: 'success'
    const orders = await cartOrderget.find({
      consumerId,
      'product.cancelRequest': { $ne: 'success' } // Exclude successful cancellations
    });

    if (!orders.length) {
      return res.status(404).json({ message: 'Orders not found' });
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




// POST endpoint for creating a cart order
router.post('/cartorder', async (req, res) => {
  try {
    const { consumerId, product, totalAmount, defaultAddress, date } = req.body;

    // Find an existing CartItem with the consumerId
    const cartItem = await CartItem.findOne({ consumerId });

    if (!cartItem) {
      return res.status(404).json({ error: 'No cart items found for this consumer' });
    }

    // Check if product array is properly formed
    if (!product || !Array.isArray(product) || product.length === 0) {
      return res.status(400).json({ error: 'Product list is missing or empty' });
    }

    // Validate that each product item has an orderId
    for (const item of product) {
      if (!item.orderId) {
        return res.status(400).json({ error: 'Missing orderId in product item' });
      }
    }

    // Create a new cart order with the provided details
    const newCartOrder = new cartOrderget({
      consumerId,
      product, // The list of products in the order
      totalAmount,
      defaultAddress,
      date
    });

    // Save the new cart order to the database
    await newCartOrder.save();

    // Extract the product IDs from the product array
    const productIds = product.map(item => item.productId);

    // Delete only the cart items with matching productIds
    await CartItem.deleteMany({
      consumerId,
      productId: { $in: productIds }
    });

    // Return a success response
    return res.status(201).json({ message: 'Cart order created successfully' });
  } catch (error) {
    console.error('Error creating cart order:', error);
    // Return an error response
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/reseller-place-order', async (req, res) => {
  const { userId, productId, totalAmount, defaultAddress, date, quantity, startDate, endDate } = req.body;

  try {
    // Find the product from the SupplierProducts collection
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Exclude materials, ingredients, and procedures from the product

    // Prepare the order details to be saved into SupplierOrder
    const orderDetails = {
      userId,
      products: orderableProduct,  // Save the filtered product data
      totalAmount,
      quantity,
      defaultAddress,
      date,
      startDate: startDate,            // Ensure this is being passed correctly
      endDate: endDate,   
    };

    // Create a new supplier order
    const newOrder = new Product(orderDetails);

    // Save the order to the database
    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});


router.post('/exporter-place-order', async (req, res) => {
  const { userId, supplierproducts, totalAmount, address, date, quantity, startDate, endDate } = req.body;

  try {
    // Find the product from the SupplierProducts collection
    const product = await SupplierProducts.findById(supplierproducts.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Exclude materials, ingredients, and procedures from the product
    const { materials, ingredients, procedures, ...orderableProduct } = product.toObject();

    // Prepare the order details to be saved into SupplierOrder
    const orderDetails = {
      userId,
      supplierproducts: orderableProduct,  // Save the filtered product data
      totalAmount,
      quantity,
      address,
      date,
      startDate: startDate,            // Ensure this is being passed correctly
      endDate: endDate,   
    };

    // Create a new supplier order
    const newOrder = new SupplierOrder(orderDetails);

    // Save the order to the database
    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});


router.post('/place-order', async (req, res) => {
  const { userId, supplierproducts, totalAmount, defaultAddress, date, quantity, startDate, endDate } = req.body;

  try {
    // Find the product from the SupplierProducts collection
    const product = await SupplierProducts.findById(supplierproducts.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Exclude materials, ingredients, and procedures from the product
    const { materials, ingredients, procedures, ...orderableProduct } = product.toObject();

    // Prepare the order details to be saved into SupplierOrder
    const orderDetails = {
      userId,
      supplierproducts: orderableProduct,  // Save the filtered product data
      totalAmount,
      quantity,
      defaultAddress,
      date,
      startDate: startDate,            // Ensure this is being passed correctly
      endDate: endDate,   
    };

    // Create a new supplier order
    const newOrder = new SupplierOrder(orderDetails);

    // Save the order to the database
    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

router.post('/orders/:orderId/accept', async (req, res) => {
  try {
    const order = await SupplierOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'accepted';
    order.dateAccepted = new Date(); // Save the date when the order is accepted
    await order.save();

    res.status(200).json({ message: 'Order accepted successfully', order });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order and save cancellation reason and date
router.post('/orders/:orderId/cancel', async (req, res) => {
  const { reason } = req.body; // Cancellation reason sent by the frontend
  if (!reason) {
    return res.status(400).json({ message: 'Cancellation reason is required' });
  }

  try {
    const order = await SupplierOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.dateCancelled = new Date(); // Save the date when the order is canceled
    await order.save();

    res.status(200).json({ message: 'Order canceled successfully', order });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/supplier/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Adjust query to include status: 'pending' and ObjectId conversion
    const orders = await SupplierOrder.find({ 
      'supplierproducts.userId': new mongoose.Types.ObjectId(userId),
      status: "pending"  // Filter for orders with 'pending' status
    });

    if (!orders || orders.length === 0) {
      console.log('No pending orders found');
      return res.status(404).json({ message: 'No pending orders found for this user.' });
    }

    console.log('Pending orders found:', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ message: 'Server error. Could not fetch orders.' });
  }
});


router.get('/supplier/orders/accepted/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Adjust query to include status: 'pending' and ObjectId conversion
    const orders = await SupplierOrder.find({ 
      'supplierproducts.userId': new mongoose.Types.ObjectId(userId),
      status: "accepted"  // Filter for orders with 'pending' status
    });

    if (!orders || orders.length === 0) {
      console.log('No pending orders found');
      return res.status(404).json({ message: 'No pending orders found for this user.' });
    }

    console.log('Pending orders found:', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ message: 'Server error. Could not fetch orders.' });
  }
});


router.get('/supplier/orders/cancelled/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Adjust query to include status: 'pending' and ObjectId conversion
    const orders = await SupplierOrder.find({ 
      'supplierproducts.userId': new mongoose.Types.ObjectId(userId),
      status: "cancelled"  // Filter for orders with 'pending' status
    });

    if (!orders || orders.length === 0) {
      console.log('No pending orders found');
      return res.status(404).json({ message: 'No pending orders found for this user.' });
    }

    console.log('Pending orders found:', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ message: 'Server error. Could not fetch orders.' });
  }
});


router.get('/seller/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await SupplierOrder.find({ userId }).populate('supplierproducts');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // Convert product image buffers to base64 strings
    const ordersWithImages = orders.map(order => {
      if (order.supplierproducts && order.supplierproducts.productImage) {
        order.supplierproducts.productImage = `data:image/jpeg;base64,${order.supplierproducts.productImage.toString('base64')}`;
      }
      return order;
    });

    res.status(200).json({ orders: ordersWithImages });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});


  
  
  // GET endpoint to fetch orders for a specific user
  router.get('/cartorder', async (req, res) => {
    try {
      const { consumerId } = req.query;
  
      if (!consumerId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const orders = await cartOrderget.find({ consumerId }).populate('items.productId');
  
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });
  


// Endpoint for adding a product to the cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const { consumerId, productId, quantity } = req.body;

    // Fetch user from the database
    const user = await User.findById(consumerId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Fetch product from the database
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Generate a new orderId
    const orderId = new mongoose.Types.ObjectId();

    // Create a new cart item
    const cartItem = new CartItem({
        orderId: orderId, // Assign generated orderId
        consumerId: consumerId,
        productId: product._id,
        userId: product.userId,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity,
        stock: product.stock
    });

    // Save the cart item to the database
    await cartItem.save();

    res.status(201).json({ message: 'Product added to cart successfully', orderId: orderId });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

// Endpoint for fetching cart items for a user
router.get('/cart/:consumerId', async (req, res) => {
    try {
        const { consumerId } = req.query;

        if (!consumerId) {
            return res.status(400).json({ error: 'Consumer ID is required' });
        }

        // Fetch cart items from the database
        const cartItems = await CartItem.find({ consumerId });

        res.status(200).json(cartItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/cart/remove/:id', async (req, res) => {
   try {
    const productId = req.params.id;
    const product = await CartItem.findById(productId);

    if (!product) {
        return res.status(404).send('Product not found');
    }
  
    await CartItem.findByIdAndDelete(productId);
    res.status(200).send('Product removed successfully');
   }
    catch (error) {
        console.error('Error removing product:', error);
        res.status(500).send('Failed to remove product');
    }
});

module.exports = router;

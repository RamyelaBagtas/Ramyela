// routes/adminAuth.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Reseller = require('../models/Reseller');
const Seller = require('../models/Seller');
const Supplier = require('../models/Supplier');
const Exporter = require('../models/Exporter');
const Product = require('../models/Product');
const Consumer = require('../models/Consumer');
const Provider = require('../models/Provider');


router.get('/consumerss', async (req, res) => {
  try {
    const consumer = await Consumer.find().select('userId firstName lastName email birthdate contactNumber ');

    res.status(200).json(consumer);
  } catch (error) {
    console.error('Error fetching consumers:', error);
    res.status(500).send('Failed to fetch consumers');
  }
});

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';




// Register admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create a new admin instance
    const admin = new Admin({ name, email, password });
    await admin.save(); // Save the admin to the database

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Login admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// routes/admin.js (or your equivalent route file)

router.patch('/resellers/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the reseller to unarchive it
    const updatedReseller = await Reseller.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedReseller) {
      return res.status(404).json({ message: 'Reseller not found' });
    }

    res.status(200).json({ message: 'Reseller unarchived successfully', updatedReseller });
  } catch (error) {
    console.error('Error unarchiving reseller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/resellers/archived', async (req, res) => {
  try {
    // Fetch resellers who are archived
    const archivedResellers = await Reseller.find({ archived: true })
      .select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    if (!archivedResellers.length) {
      return res.status(404).json({ message: 'No archived resellers found' });
    }

    // Fetch associated products for each archived reseller
    const archivedResellerIds = archivedResellers.map(reseller => reseller._id);
    const archivedProducts = await Product.find({ userId: { $in: archivedResellerIds }, archived: true });

    res.status(200).json({ archivedResellers, archivedProducts });
  } catch (error) {
    console.error('Error fetching archived resellers and products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to remove a reseller by ID
router.patch('/resellers/:id', async (req, res) => {
  try {
    const resellerId = req.params.id;
    const reseller = await Reseller.findByIdAndUpdate(
      resellerId,
      { archived: true },
      { new: true }
    );

    if (!reseller) {
      return res.status(404).json({ message: 'Reseller not found' });
    }

    await Product.updateMany(
      { userId: resellerId },
      { archived: true }
    );

    res.status(200).json({ message: 'Reseller and associated products archived successfully' });
  } catch (error) {
    console.error('Error archiving reseller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/resellers', async (req, res) => {
  try {
    // Fetch resellers with userType 'reseller' and archived set to false
    const resellers = await Reseller.find({ 
      userType: 'reseller',
      archived: false 
    }).select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    res.status(200).json(resellers);
  } catch (error) {
    console.error('Error fetching resellers:', error);
    res.status(500).send('Failed to fetch resellers');
  }
});

////////////////////////////////


router.patch('/sellers/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the reseller to unarchive it
    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: 'seller not found' });
    }

    res.status(200).json({ message: 'seller unarchived successfully', updatedSeller });
  } catch (error) {
    console.error('Error unarchiving seller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/sellers/archived', async (req, res) => {
  try {
    // Fetch resellers who are archived
    const archivedSellers = await Seller.find({ archived: true })
      .select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    if (!archivedSellers.length) {
      return res.status(404).json({ message: 'No archived resellers found' });
    }

    // Fetch associated products for each archived reseller
    const archivedSellerIds = archivedSellers.map(seller => seller._id);
    const archivedProducts = await Product.find({ userId: { $in: archivedSellerIds }, archived: true });

    res.status(200).json({ archivedSellers, archivedProducts });
  } catch (error) {
    console.error('Error fetching archived sellers and products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to remove a reseller by ID
router.patch('/sellers/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { archived: true },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ message: 'seller not found' });
    }

    await Product.updateMany(
      { userId: sellerId },
      { archived: true }
    );

    res.status(200).json({ message: 'seller and associated products archived successfully' });
  } catch (error) {
    console.error('Error archiving seller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/sellers', async (req, res) => {
  try {
    // Fetch resellers with userType 'reseller' and archived set to false
    const sellers = await Seller.find({ 
      archived: false 
    }).select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    res.status(200).json(sellers);
  } catch (error) {
    console.error('Error fetching resellers:', error);
    res.status(500).send('Failed to fetch resellers');
  }
});

//////////////

router.patch('/supplier/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the reseller to unarchive it
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier unarchived successfully', updatedSupplier });
  } catch (error) {
    console.error('Error unarchiving Supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/supplier/archived', async (req, res) => {
  try {
    // Fetch resellers who are archived
    const archivedSupplier = await Supplier.find({ archived: true })
      .select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    if (!archivedSupplier.length) {
      return res.status(404).json({ message: 'No archived Supplier found' });
    }

    // Fetch associated products for each archived reseller
    const archivedSupplierIds = archivedSupplier.map(Supplier => Supplier._id);
    const archivedProducts = await Product.find({ userId: { $in: archivedSupplierIds }, archived: true });

    res.status(200).json({ archivedSupplier, archivedProducts });
  } catch (error) {
    console.error('Error fetching archived Supplier and products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to remove a reseller by ID
router.patch('/supplier/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { archived: true },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await Product.updateMany(
      { userId: supplierId },
      { archived: true }
    );

    res.status(200).json({ message: 'Supplier and associated products archived successfully' });
  } catch (error) {
    console.error('Error archiving Supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/supplier', async (req, res) => {
  try {
    // Fetch resellers with userType 'reseller' and archived set to false
    const supplier = await Supplier.find({ 
      userType: 'supplier',
      archived: false 
    }).select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).send('Failed to fetch supplier');
  }
});


/////////////////////////


router.patch('/exporter/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the reseller to unarchive it
    const updatedExporter = await Exporter.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedExporter) {
      return res.status(404).json({ message: 'Exporter not found' });
    }

    res.status(200).json({ message: 'Exporter unarchived successfully', updatedExporter });
  } catch (error) {
    console.error('Error unarchiving Exporter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/Exporter/archived', async (req, res) => {
  try {
    // Fetch resellers who are archived
    const archivedExporter = await Exporter.find({ archived: true })
      .select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    if (!archivedExporter.length) {
      return res.status(404).json({ message: 'No archived Exporter found' });
    }

    // Fetch associated products for each archived reseller
    const archivedExporterIds = archivedExporter.map(Exporter => Exporter._id);
    const archivedProducts = await Product.find({ userId: { $in: archivedExporterIds }, archived: true });

    res.status(200).json({ archivedExporter, archivedProducts });
  } catch (error) {
    console.error('Error fetching archived Exporter and products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to remove a reseller by ID
router.patch('/exporter/:id', async (req, res) => {
  try {
    const exporterId = req.params.id;
    const updatedExporter = await Exporter.findByIdAndUpdate(
      exporterId,
      { archived: true },
      { new: true }
    );

    if (!updatedExporter) {
      return res.status(404).json({ message: 'Exporter not found' });
    }

    await Product.updateMany(
      { userId: exporterId },
      { archived: true }
    );

    res.status(200).json({ message: 'Exporter and associated products archived successfully' });
  } catch (error) {
    console.error('Error archiving exporter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/exporter', async (req, res) => {
  try {
    // Fetch resellers with userType 'reseller' and archived set to false
    const exporter = await Exporter.find({ 
      userType: 'exporter',
      archived: false 
    }).select('userId firstName lastName email birthdate contactNumber userType dtiImageURL businessPermitImageURL sanitaryPermitImageURL');

    res.status(200).json(exporter);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).send('Failed to fetch supplier');
  }
});



router.delete('/exporters/:id', async (req, res) => {
  try {
    const exporterId = req.params.id;
    const exporter = await Exporter.findByIdAndDelete(exporterId);

    if (!exporter) {
      return res.status(404).json({ message: 'exporter not found' });
    }

    await Product.deleteMany({ userId: exporterId });

    res.status(200).json({ message: 'exporter removed successfully' });
  } catch (error) {
    console.error('Error removing exporter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;

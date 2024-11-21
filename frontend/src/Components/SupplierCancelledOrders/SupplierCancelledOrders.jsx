import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, CircularProgress, Snackbar, Typography, Button, Select, MenuItem } from '@mui/material';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import leftIcon from '../Assets/arrow-left.png';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const SupplierCancelledOrder = () => {
    const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { userId } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredOrders, setFilteredOrders] = useState([]);

  const fetchCancelledOrders = async () => {
    try {
      const response = await axiosInstance.get(`api/supplier/orders/cancelled/${userId}`);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching cancelled orders.');
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, [userId]);

  // Filter orders based on the selected month and year
  useEffect(() => {
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.dateCancelled);
      return (
        orderDate.getMonth() === selectedMonth &&
        orderDate.getFullYear() === selectedYear
      );
    });
    setFilteredOrders(filtered);
  }, [orders, selectedMonth, selectedYear]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchCancelledOrders();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    doc.text(`Cancelled Orders for ${months[selectedMonth]} ${selectedYear}`, 14, 10);
    doc.setFontSize(12);

    Object.entries(groupedOrders).forEach(([productTitle, productOrders], index) => {
      const rows = productOrders.map(order => [
        order.supplierproducts.productTitle,
        order.supplierproducts.category,
        order.quantity,
        order.totalAmount.toLocaleString(),
        order.defaultAddress.fullName,
        `${order.defaultAddress.street}, ${order.defaultAddress.barangay}, ${order.defaultAddress.city}, ${order.defaultAddress.province}, ${order.defaultAddress.region}, ${order.defaultAddress.country}`,
        order.defaultAddress.contactNumber,
        new Date(order.date).toLocaleDateString(),
        `${new Date(order.startDate).toLocaleDateString()} to ${new Date(order.endDate).toLocaleDateString()}`,
        new Date(order.dateCancelled).toLocaleDateString(),
      ]);

      doc.autoTable({
        head: [[
          'Product Title', 'Category', 'Quantity', 'Total Amount', 'Customer Name', 
          'Address', 'Contact', 'Order Date', 'Date Needed', 'Date Cancelled'
        ]],
        body: rows,
        startY: 20 + index * 60,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' },
      });

      const totalQuantity = productOrders.reduce((acc, order) => acc + order.quantity, 0);
      const grandTotalAmount = productOrders.reduce((acc, order) => acc + order.totalAmount, 0);
      doc.text(`Total Quantity: ${totalQuantity}`, 14, doc.lastAutoTable.finalY + 10);
      doc.text(`Grand Total Amount: ${grandTotalAmount.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 15);
    });

    doc.save(`Cancelled_Orders_${months[selectedMonth]}_${selectedYear}.pdf`);
  };

  // Group orders by product title
  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const productTitle = order.supplierproducts.productTitle;
    if (!acc[productTitle]) {
      acc[productTitle] = [];
    }
    acc[productTitle].push(order);
    return acc;
  }, {});

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <ElseNavbar />
      <div style={{ padding: '20px' }}>
        <Typography variant="h4" align="center" gutterBottom>
        <img
            src={leftIcon}
            alt="Back"
            className="back-arrow"
            onClick={() => navigate('/salesmanagement')}
          />
          Cancelled Orders for {months[selectedMonth]} {selectedYear}
        </Typography>

        <div>
        <div style={{ justifyContent: 'center', marginBottom: '20px' }}>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {[...Array(12).keys()].map(month => (
              <MenuItem key={month} value={month}>{new Date(0, month).toLocaleString('default', { month: 'long' })}</MenuItem>
            ))}
          </Select>
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ marginLeft: '10px' }}>
            {[2023, 2024, 2025].map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
          <Button variant="contained" color="primary" style={{ marginLeft: '10px' }}>Filter Orders</Button>
        </div>

        {loading && <CircularProgress />}
        {error && (
          <div>
            <Typography color="error">{error}</Typography>
            <button onClick={handleRetry}>Retry</button>
          </div>
        )}

        {/* Show message if no orders are found for the selected month and year */}
        {!loading && filteredOrders.length === 0 && (
          <Typography align="center" variant="h6" color="textSecondary">
            No cancelled orders found for the selected month and year.
          </Typography>
        )}

        {/* Render each product group if orders are available */}
        {Object.entries(groupedOrders).map(([productTitle, productOrders]) => {
          const totalQuantity = productOrders.reduce((acc, order) => acc + order.quantity, 0);
          const grandTotalAmount = productOrders.reduce((acc, order) => acc + order.totalAmount, 0);

          return (
            <div key={productTitle} style={{ marginTop: '20px' }}>
              <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: '10px'}}>
                Order for {productTitle}
              </Typography>

              <TableContainer component={Paper} style={{ marginTop: '10px', padding: '10px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Image</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell>Date Needed</TableCell>
                      <TableCell>Date Cancelled</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          {order.supplierproducts.productImage ? (
                            <img
                              src={`data:image/jpeg;base64,${order.supplierproducts.productImage}`}
                              alt="Product"
                              style={{ width: '100px', height: '100px' }}
                            />
                          ) : (
                            'No Image'
                          )}
                        </TableCell>
                        <TableCell>{order.supplierproducts.category}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{order.defaultAddress.fullName}</TableCell>
                        <TableCell>
                          {`${order.defaultAddress.street}, ${order.defaultAddress.barangay}, ${order.defaultAddress.city}, ${order.defaultAddress.province}, ${order.defaultAddress.region}, ${order.defaultAddress.country}`}
                        </TableCell>
                        <TableCell>{order.defaultAddress.contactNumber}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {new Date(order.startDate).toLocaleDateString()} to {new Date(order.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{new Date(order.dateCancelled).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                  Total Quantity for this product: {totalQuantity}
                </Typography>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  Grand Total Amount for this product: {grandTotalAmount.toLocaleString()}
                </Typography>
              </TableContainer>
            </div>
          );
        })}
        <button onClick={generatePDF}>Download PDF</button>
        </div>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={error}
        />
      </div>
    </div>
  );
};

export default SupplierCancelledOrder;

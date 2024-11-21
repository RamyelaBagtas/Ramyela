import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import leftIcon from '../Assets/arrow-left.png';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CircularProgress, Typography, Button, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Snackbar } from '@mui/material';
import axiosInstance from '../axiosInstance';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const groupOrdersByProductTitle = (orders) => {
    return orders.reduce((groups, order) => {
        const title = order.supplierproducts.productTitle;
        if (!groups[title]) groups[title] = [];
        groups[title].push(order);
        return groups;
    }, {});
};

const InventoryManagement = () => {
    const [productData, setProductData] = useState([]);
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [acceptedOrders, setAcceptedOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [filteredAcceptedOrders, setFilteredAcceptedOrders] = useState([]);
    const [filteredCancelledOrders, setFilteredCancelledOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const fetchOrders = async () => {
        try {
            const [acceptedResponse, cancelledResponse] = await Promise.all([
                axiosInstance.get(`api/supplier/orders/accepted/${userId}`),
                axiosInstance.get(`api/supplier/orders/cancelled/${userId}`)
            ]);

            setAcceptedOrders(acceptedResponse.data);
            setCancelledOrders(cancelledResponse.data);
            setLoading(false);
            calculateProductData(acceptedResponse.data, cancelledResponse.data);
        } catch (err) {
            setError('Error fetching orders.');
            setLoading(false);
            setOpenSnackbar(true);
        }
    };

    const filterOrders = (orders, month, year, isCancelled = false) => {
        return orders.filter(order => {
            const orderDate = isCancelled ? new Date(order.dateCancelled) : new Date(order.dateAccepted);
            return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        });
    };

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    useEffect(() => {
        setFilteredAcceptedOrders(filterOrders(acceptedOrders, selectedMonth, selectedYear));
        setFilteredCancelledOrders(filterOrders(cancelledOrders, selectedMonth, selectedYear, true));
    }, [acceptedOrders, cancelledOrders, selectedMonth, selectedYear]);

    const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value));
    const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));
    const handleCloseSnackbar = () => setOpenSnackbar(false);

    const calculateProductData = (accepted, cancelled) => {
        const productMap = {};

        accepted.forEach(order => {
            const product = order.supplierproducts;
            if (!productMap[product._id]) {
                productMap[product._id] = {
                    title: product.productTitle,
                    stock: product.stock || 0,
                    completed: 0,
                    cancelled: 0,
                };
            }
            productMap[product._id].completed += order.quantity;
        });

        cancelled.forEach(order => {
            const product = order.supplierproducts;
            if (!productMap[product._id]) {
                productMap[product._id] = {
                    title: product.productTitle,
                    stock: product.stock || 0,
                    completed: 0,
                    cancelled: 0,
                };
            }
            productMap[product._id].cancelled += order.quantity;
        });

        setProductData(Object.values(productMap).map(item => ({
            ...item,
            remaining: item.stock - item.completed,
        })));
    };

    const renderOrdersTable = (groupedOrders, isCancelled = false) => {
        return Object.entries(groupedOrders).map(([productTitle, orders]) => {
            const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
            const grandTotalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
            return (
                <TableContainer component={Paper} key={productTitle} style={{ marginBottom: '20px' }}>
                    <Typography variant="h6" align="center" style={{ padding: '10px' }}>
                        {productTitle}
                    </Typography>
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
                                <TableCell>{isCancelled ? 'Date Cancelled' : 'Date Accepted'}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order._id}>
                                    <TableCell>
                                        {order.supplierproducts.productImage ? (
                                            <img
                                                src={`data:image/jpeg;base64,${order.supplierproducts.productImage}`}
                                                alt="Product"
                                                style={{ width: '100px', height: '100px' }}
                                            />
                                        ) : 'No Image'}
                                    </TableCell>
                                    <TableCell>{order.supplierproducts.category}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>{order.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell>{order.defaultAddress.fullName}</TableCell>
                                    <TableCell>
                                        {order.defaultAddress.street}, {order.defaultAddress.barangay}, {order.defaultAddress.city}, {order.defaultAddress.province}, {order.defaultAddress.region}, {order.defaultAddress.country}
                                    </TableCell>
                                    <TableCell>{order.defaultAddress.contactNumber}</TableCell>
                                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {new Date(order.startDate).toLocaleDateString()} to {new Date(order.endDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(isCancelled ? order.dateCancelled : order.dateAccepted).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={3} align="right">
                                    <strong>Total Quantity:</strong>
                                </TableCell>
                                <TableCell colSpan={2} align="left">
                                    {totalQuantity}
                                </TableCell>
                                <TableCell colSpan={3} align="right">
                                    <strong>Grand Total Amount:</strong>
                                </TableCell>
                                <TableCell colSpan={3} align="left">
                                    {grandTotalAmount.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        });
    };
    

    const generateBarChartData = () => {
        const labels = productData.map(product => product.title);
        return {
            labels,
            datasets: [
                {
                    label: 'Completed Order',
                    data: productData.map(product => product.completed),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
                {
                    label: 'Cancelled Order',
                    data: productData.map(product => product.cancelled),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
            ]
        };
    };

    const generatePDF = (orders, title) => {
        const doc = new jsPDF('landscape');
        doc.text(`${title} for ${months[selectedMonth]} ${selectedYear}`, 14, 10);
        doc.setFontSize(12);
    
        // Group orders by product title
        const groupedOrders = orders.reduce((acc, order) => {
            const productTitle = order.supplierproducts.productTitle;
            if (!acc[productTitle]) {
                acc[productTitle] = [];
            }
            acc[productTitle].push(order);
            return acc;
        }, {});
    
        let totalQuantity = 0;
        let grandTotalAmount = 0;
    
        Object.keys(groupedOrders).forEach((productTitle, index) => {
            const productOrders = groupedOrders[productTitle];
            const headers = [
                'Category', 'Quantity', 'Total Amount', 'Customer Name', 'Address', 'Contact',
                'Order Date', 'Date Needed', title === 'Cancelled Orders' ? 'Date Cancelled' : 'Date Accepted'
            ];
    
            const rows = productOrders.map(order => {
                totalQuantity += order.quantity; // Accumulate total quantity
                grandTotalAmount += order.totalAmount; // Accumulate total amount
                return [
                    order.supplierproducts.category,
                    order.quantity,
                    order.totalAmount.toLocaleString(),
                    order.defaultAddress.fullName,
                    `${order.defaultAddress.street}, ${order.defaultAddress.barangay}, ${order.defaultAddress.city}, ${order.defaultAddress.province}, ${order.defaultAddress.region}, ${order.defaultAddress.country}`,
                    order.defaultAddress.contactNumber,
                    new Date(order.date).toLocaleDateString(),
                    `${new Date(order.startDate).toLocaleDateString()} to ${new Date(order.endDate).toLocaleDateString()}`,
                    new Date(title === 'Cancelled Orders' ? order.dateCancelled : order.dateAccepted).toLocaleDateString()
                ];
            });
    
            doc.text(`Product: ${productTitle}`, 14, doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 20);
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 20 : 30,
                theme: 'grid',
                headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' }
            });
        });
    
        // Add total quantity and grand total amount
        const summaryStartY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 20;
        doc.text(`Total Quantity: ${totalQuantity}`, 14, summaryStartY + 10);
        doc.text(`Grand Total Amount: ${grandTotalAmount.toLocaleString()}`, 14, summaryStartY + 20);
    
        doc.save(`${title}_${months[selectedMonth]}_${selectedYear}.pdf`);
    };
    


    const groupedAcceptedOrders = groupOrdersByProductTitle(filteredAcceptedOrders);
    const groupedCancelledOrders = groupOrdersByProductTitle(filteredCancelledOrders);

    return (
        <div>
            <ElseNavbar />
            <div style={{ padding: '20px' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    <img
                        src={leftIcon}
                        alt="Back"
                        className="back-arrow"
                        onClick={() => navigate('/SupplierHome')}
                    />
                    Inventory Management for {months[selectedMonth]} {selectedYear}
                </Typography>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Select value={selectedMonth} onChange={handleMonthChange}>
                        {months.map((month, index) => (
                            <MenuItem key={index} value={index}>
                                {month}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select value={selectedYear} onChange={handleYearChange} style={{ marginLeft: '10px' }}>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </div>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <Typography variant="h5" gutterBottom>
                                Accepted Orders
                            </Typography>
                            {renderOrdersTable(groupedAcceptedOrders)}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <Typography variant="h5" gutterBottom>
                                Cancelled Orders
                            </Typography>
                            {renderOrdersTable(groupedCancelledOrders, true)}
                        </div>

                        <Typography variant="h5" gutterBottom>
                            Product Chart
                        </Typography>
                        <Bar data={generateBarChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button variant="contained" color="primary" onClick={() => generatePDF(filteredAcceptedOrders, 'Accepted Orders')}>
                                Export Accepted Orders to PDF
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => generatePDF(filteredCancelledOrders, 'Cancelled Orders')} style={{ marginLeft: '10px' }}>
                                Export Cancelled Orders to PDF
                            </Button>
                        </div>
                    </>
                )}

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

export default InventoryManagement;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import leftIcon from '../Assets/arrow-left.png';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axiosInstance from '../axiosInstance';

const SupplierAccepted = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(`api/supplier/orders/accepted/${userId}`);
      setOrders(response.data);
      filterOrders(response.data, selectedMonth, selectedYear);
    } catch (error) {
      setError('Could not fetch orders.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (orders, month, year) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.dateAccepted);
      return orderDate >= startDate && orderDate <= endDate;
    });

    setFilteredOrders(filtered);
  };

  const groupOrdersByTitle = (orders) => {
    return orders.reduce((acc, order) => {
      const title = order.supplierproducts.productTitle;
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(order);
      return acc;
    }, {});
  };

  const calculateTotals = (order) => {
    return {
      totalQuantity: order.quantity,
      grandTotalAmount: order.totalAmount
    };
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchOrders();
    }
  }, [userId, selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    filterOrders(orders, month, selectedYear);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    filterOrders(orders, selectedMonth, year);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generatePDF = () => {
    const doc = new jsPDF('landscape'); // Set the orientation to landscape
    doc.setFontSize(18);
    doc.text(`Accepted Orders for ${months[selectedMonth]} ${selectedYear}`, 10, 10);
    doc.setFontSize(12);

    // Group orders by product title
    const groupedOrders = groupOrdersByTitle(filteredOrders);

    Object.keys(groupedOrders).forEach((productTitle) => {
      const ordersForTitle = groupedOrders[productTitle];
      const { totalQuantity, grandTotalAmount } = ordersForTitle.reduce(
        (totals, order) => {
          totals.totalQuantity += order.quantity;
          totals.grandTotalAmount += order.totalAmount;
          return totals;
        },
        { totalQuantity: 0, grandTotalAmount: 0 }
      );

      const headers = [
        'Product Title', 'Category', 'Quantity', 'Total Amount',
        'Customer Name', 'Address', 'Contact', 'Order Date', 'Date Needed', 'Date Accepted'
      ];

      const tableData = ordersForTitle.map((order) => [
        order.supplierproducts.productTitle.slice(0, 30) + (order.supplierproducts.productTitle.length > 30 ? '...' : ''),
        order.supplierproducts.category,
        order.quantity,
        order.totalAmount.toLocaleString(),
        order.defaultAddress.fullName,
        `${order.defaultAddress.street}, ${order.defaultAddress.barangay}, ${order.defaultAddress.city}, ${order.defaultAddress.province}, ${order.defaultAddress.region}, ${order.defaultAddress.country}`,
        order.defaultAddress.contactNumber,
        new Date(order.date).toLocaleDateString(),
        `${new Date(order.startDate).toLocaleDateString()} to ${new Date(order.endDate).toLocaleDateString()}`,
        new Date(order.dateAccepted).toLocaleDateString()
      ]);

      // Calculate startY dynamically based on the previous table position
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 20; // Ensure a gap of 20 units after the last table

      // Add the table for the current product
      doc.autoTable({
        startY: startY, // Start the table at the correct Y position
        head: [headers],
        body: tableData,
        margin: { top: 10, left: 10, right: 10 },
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 10, cellPadding: 4, valign: 'middle' },
        styles: {
          cellWidth: 'auto',
          halign: 'center',
          overflow: 'linebreak',
          fontSize: 10,
          lineHeight: 1.2
        },
        columnStyles: {
          3: { halign: 'right' },
          7: { halign: 'center' },
          8: { halign: 'center' },
          9: { halign: 'center' },
          5: { cellWidth: 'auto', overflow: 'linebreak' },
          0: { cellWidth: 'auto' }
        },
        pageBreak: 'auto',
      });

      // Calculate positions for the grand total and total quantity
      let grandTotalY = doc.lastAutoTable.finalY + 10;
      let totalQuantityY = grandTotalY + 8;

      // Check if there is enough space, otherwise add a new page
      if (totalQuantityY + 20 > doc.internal.pageSize.height) {
        doc.addPage();
        grandTotalY = 20; // Reset position on new page
        totalQuantityY = grandTotalY + 10;
      }

      // Add Grand Total Amount and Total Quantity for this product after the table
      doc.setFontSize(12);
      doc.text(`Grand Total Amount: ${grandTotalAmount.toLocaleString()}`, 10, grandTotalY);
      doc.text(`Total Quantity: ${totalQuantity}`, 10, totalQuantityY);
    });

    // Save the generated PDF file
    doc.save(`Accepted_Orders_${months[selectedMonth]}_${selectedYear}.pdf`);
  };

  return (
    <div>
      <ElseNavbar />
      <div>
        <h1>
          <img
            src={leftIcon}
            alt="Back"
            className="back-arrow"
            onClick={() => navigate('/salesmanagement')}
          />
          Accepted Orders for {months[selectedMonth]} {selectedYear}
        </h1>

        <div>
          <select value={selectedMonth} onChange={handleMonthChange}>
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select value={selectedYear} onChange={handleYearChange}>
            {Array.from({ length: 10 }, (_, index) => selectedYear - index).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button onClick={() => filterOrders(orders, selectedMonth, selectedYear)}>Filter Orders</button>
        </div>

        {filteredOrders.length === 0 ? (
          <p>No accepted orders found for the selected dates.</p>
        ) : (
          Object.keys(groupOrdersByTitle(filteredOrders)).map((productTitle) => {
            const ordersForTitle = groupOrdersByTitle(filteredOrders)[productTitle];
            const { totalQuantity, grandTotalAmount } = ordersForTitle.reduce(
              (totals, order) => {
                totals.totalQuantity += order.quantity;
                totals.grandTotalAmount += order.totalAmount;
                return totals;
              },
              { totalQuantity: 0, grandTotalAmount: 0 }
            );

            return (
              <div key={productTitle}>
                <h2>{productTitle}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Product Image</th>
                      <th>Product Title</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Customer Name</th>
                      <th>Address</th>
                      <th>Contact</th>
                      <th>Order Date</th>
                      <th>Date Needed</th>
                      <th>Date Accepted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersForTitle.map((order, index) => (
                      <tr key={index}>
                                              <td>
                        {order.supplierproducts.productImage ? (
                          <img
                            src={`data:image/jpeg;base64,${order.supplierproducts.productImage}`}
                            alt="Product"
                            style={{ width: '100px', height: '100px' }}
                          />
                        ) : (
                          'No Image'
                        )}
                      </td>
                        <td>{order.supplierproducts.productTitle}</td>
                        <td>{order.supplierproducts.category}</td>
                        <td>{order.quantity}</td>
                        <td>{order.totalAmount}</td>
                        <td>{order.defaultAddress.fullName}</td>
                        <td>{`${order.defaultAddress.street}, ${order.defaultAddress.city}`}</td>
                        <td>{order.defaultAddress.contactNumber}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>{`${new Date(order.startDate).toLocaleDateString()} to ${new Date(order.endDate).toLocaleDateString()}`}</td>
                        <td>{new Date(order.dateAccepted).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>Total Quantity: {totalQuantity}</p>
                <p>Grand Total Amount: {grandTotalAmount.toLocaleString()}</p>
              </div>
            );
          })
        )}
        <button onClick={generatePDF}>Generate PDF</button>
      </div>
    </div>
  );
};

export default SupplierAccepted;

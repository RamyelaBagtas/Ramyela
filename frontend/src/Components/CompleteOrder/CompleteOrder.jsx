import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompleteOrder.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import { useAuth } from '../AuthContext'; 
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Ssidebar from '../Ssidebar/Ssidebar';
import * as XLSX from 'xlsx'; // Add this import for Excel export functionality
import axiosInstance from '../axiosInstance';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const CompleteOrder = () => {
  const { userId } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [canceledOrders, setCanceledOrders] = useState([]);
  const [error, setError] = useState('');
  const [elseNavbarVisible, setElseNavbarVisible] = useState(true);
  const [totalStocks, setTotalStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermCanceled, setSearchTermCanceled] = useState('');
  const [searchTermComplete, setSearchTermComplete] = useState('');
  const [month, setMonth] = useState(new Date()); // State for the selected month

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        const productsResponse = await axiosInstance.get(`api/inventory/${userId}`);
        const productsWithImages = productsResponse.data.map(product => ({
          ...product,
          imageUrl: arrayBufferToBase64(product.image.data),
          totalStock: product.stockWithOrder + product.additionalStocks.reduce((total, stock) => total + (stock.stillAddStock || 0), 0)
        }));
        
        setProducts(productsWithImages);
        setTotalStocks(productsWithImages.map(product => product.totalStock));
        
        const notificationsResponse = await axios.get(`api/consumernotif/${userId}`);
        setOrders(notificationsResponse.data);

        const canceledOrdersResponse = await axiosInstance.get(`api/cancellednotif/${userId}`);
        console.log(canceledOrdersResponse.data);
        setCanceledOrders(canceledOrdersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, [userId]);

  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getImageUrl = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? `data:image/jpeg;base64,${product.imageUrl}` : null;
  };

  // Prepare data for the bar chart
  const labels = products.map(product => product.title);
  const completedOrdersData = products.map(product => {
    const productOrders = orders.filter(order => order.product.productId === product._id);
    return productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
  });

  const canceledOrdersData = products.map(product => {
    const canceledProductOrders = canceledOrders.filter(order => order.product.productId === product._id);
    return canceledProductOrders.reduce((acc, order) => acc + order.product.quantity, 0);
  });

  const remainingStockData = products.map(product => {
    const productOrders = orders.filter(order => order.product.productId === product._id);
    const totalOrders = productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
    return product.totalStock - totalOrders;
  });

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Completed Orders',
        data: completedOrdersData,
        backgroundColor: '#36A2EB',
        stack: 'Stack 0',
      },
      {
        label: 'Canceled Orders',
        data: canceledOrdersData,
        backgroundColor: '#FF6384',
        stack: 'Stack 1',
      },
      {
        label: 'Total Stocks',
        data: totalStocks,
        backgroundColor: '#FFCE56',
        stack: 'Stack 2',
      },
      {
        label: 'Remaining Stocks',
        data: remainingStockData,
        backgroundColor: '#C6B5ED',
        stack: 'Stack 3',
      }
    ]
  };

  const handleSearch = (orders, term) => {
    return orders.filter(order => order.product.title.toLowerCase().includes(term.toLowerCase()));
  };

  // New filter by month function
  const handleFilterByMonth = (orders, month) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const isExpirationNear = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const timeDiff = expDate.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 7; // Show warning if expiration is within 7 days
  };

  const isStockCritical = (remainingStock) => {
    return remainingStock <= 10; // Critical stock level threshold
  };


  const filteredOrders = handleSearch(handleFilterByMonth(orders, month), searchTermComplete);
  const filteredCanceledOrders = handleSearch(canceledOrders, searchTermCanceled);

  const exportToExcel = () => {
    // Group completed orders by product
    const productTotals = {};
  
    filteredOrders.forEach(order => {
      const title = order.product.title;
      const amount = order.totalAmount;
  
      if (!productTotals[title]) {
        productTotals[title] = {
          Quantity: 0,
          TotalAmount: 0,
          Orders: [],
        };
      }
  
      productTotals[title].Quantity += order.product.quantity;
      productTotals[title].TotalAmount += amount;
      productTotals[title].Orders.push({
        Title: order.product.title,
        Quantity: order.product.quantity,
        'Total Amount': amount.toFixed(2),
        'Order Date': formatDate(order.date),
        'Date Received': formatDate(order.dateReceived),
      });
    });
  
    // Prepare data for completed orders
    const completedOrdersData = [];
    let grandTotal = 0;
  
    Object.keys(productTotals).forEach(title => {
      const productData = productTotals[title];
      completedOrdersData.push(...productData.Orders);
      grandTotal += productData.TotalAmount;
  
      // Append a total row for the product
      completedOrdersData.push({
        Title: '',
        Quantity: '',
        'Total Amount': `Total for ${title}: ₱${productData.TotalAmount.toFixed(2)}`,
        'Order Date': '',
        'Date Received': '',
      });
    });
  
    // Prepare data for canceled orders
    const canceledOrdersData = filteredCanceledOrders.map(order => ({
      Title: order.product.title,
      Quantity: order.product.quantity,
      Price: order.product.price.toFixed(2), // Assuming you have price in product data
      'Cancellation Date': formatDate(order.createdAt),
      'Cancellation Reason': order.cancellationReason,
    }));
  
    // Create worksheets
    const completedOrdersSheet = XLSX.utils.json_to_sheet(completedOrdersData);
    const canceledOrdersSheet = XLSX.utils.json_to_sheet(canceledOrdersData);
  
    // Append grand total row to completed orders
    const grandTotalRow = [{ Title: '', Quantity: '', 'Total Amount': `Grand Total of All Products: ₱${grandTotal.toFixed(2)}`, 'Order Date': '', 'Date Received': '' }];
    XLSX.utils.sheet_add_json(completedOrdersSheet, grandTotalRow, { skipHeader: true, origin: -1 });
  
    // Function to apply styles
    const applyStyles = (ws) => {
      // Set header style
      const headerRow = ws['A1']['s'] = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center" },
      };
  
      // Set column widths
      const colWidths = [
        { wch: 30 }, // Title
        { wch: 15 }, // Quantity
        { wch: 15 }, // Total Amount / Price
        { wch: 20 }, // Order Date / Cancellation Date
        { wch: 25 }, // Date Received / Reason
      ];
      ws['!cols'] = colWidths;
  
      // Apply border style to all cells
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellRef]) continue; // Skip if cell doesn't exist
          ws[cellRef].s = {
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      }
    };
  
    // Apply styles to sheets
    applyStyles(completedOrdersSheet);
    applyStyles(canceledOrdersSheet);
  
    // Create a new workbook
    const wb = XLSX.utils.book_new();
  
    // Append the sheets to the workbook
    XLSX.utils.book_append_sheet(wb, completedOrdersSheet, 'Completed Orders');
    XLSX.utils.book_append_sheet(wb, canceledOrdersSheet, 'Canceled Orders');
  
    // Write the file
    XLSX.writeFile(wb, 'orders_report.xlsx');
  };
  

  const productTotals = products.map(product => {
    const productOrders = filteredOrders.filter(order => order.product.productId === product._id);
    const totalAmount = productOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalQuantity = Math.floor(productOrders.reduce((acc, order) => acc + order.product.quantity, 0));
  
    return {
      title: product.title,
      totalAmount,
      totalQuantity,
      productOrders,
    };
  });

  
  

  const grandTotal = productTotals.reduce((acc, product) => acc + product.totalAmount, 0);
  

  return (
    <div>
      {elseNavbarVisible && <ElseNavbar />}
      <Ssidebar />
      <div className="inventory-container">
        <h1>Overall Inventory</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Inventory"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="month-picker">
          <DatePicker 
            selected={month} 
            onChange={date => setMonth(date)} 
            dateFormat="MMMM yyyy"
            showMonthYearPicker 
          />
          <button onClick={exportToExcel}>Export to Excel</button> {/* Export button */}
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Total Amount</th>
              <th>Stock</th>
              <th>Added Stock</th>
              <th>Added Stock Date In</th>
              <th>Date In of Product</th>
              <th>Expiration Date</th>
              <th>Total Stock</th>
              <th>Remaining Stock</th>
              <th>Total Orders</th>
            </tr>
          </thead>
          <tbody>
      {products
        .filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(product => {
          const productOrders = orders.filter(order => order.product.productId === product._id);
          const totalAmount = productOrders.reduce((acc, order) => acc + order.totalAmount, 0);
          const totalOrders = productOrders.reduce((acc, order) => acc + order.product.quantity, 0);
          const remainingStock = product.totalStock - totalOrders;

          return (
            <tr key={product._id}>
              <td>
                {product.imageUrl && (
                  <img src={`data:image/jpeg;base64,${product.imageUrl}`} alt={product.title} className='inventory-image' />
                )}
              </td>
              <td>{product.title}</td>
              <td>₱{product.price}</td>
              <td>₱{totalAmount.toFixed(2)}</td>
              <td>{product.stockWithOrder}</td>
              <td>{product.additionalStocks && product.additionalStocks.length > 0 ? (
                    product.additionalStocks.map((stock, index) => (
                      <div key={index}>
                        <span>{stock.stillAddStock}</span>
                      </div>
                    ))
                  ) : (
                    <p></p>
                  )}</td>
                  <td>  {product.additionalStocks && product.additionalStocks.length > 0 ? (
product.additionalStocks.map((stock, index) => (
<div key={index}>
  <span>{formatDate(stock.createdAt)}</span>
</div>
))
) : (
<p></p>
)}</td>
<td>
{product.createdAt && <div><span>{formatDate(product.createdAt)}</span></div>}
</td>
    <td>
      {formatDate(product.expirationDate)}
      {product.additionalStocks && product.additionalStocks.length > 0 ? (
        product.additionalStocks.map((stock, index) => (
          <div key={index}>
            <span>{formatDate(stock.expirationDate)}</span> {/* Displaying createdAt */}
          </div>
        ))
      ) : (
        <p></p>
      )}
    </td>
              <td>{product.totalStock}</td>
              <td>{remainingStock}</td>
              <td>{totalOrders}</td>
              
                {isExpirationNear(product.expirationDate) && (
                  <p className="warning">⚠️ Expiration date is near!</p>
                )}
                {isStockCritical(remainingStock) && (
                  <p className="warning">⚠️ Remaining stock is at a critical level!</p>
                )}
              
            </tr>
          );
        })}
    </tbody>
  </table>
  <br />

        <h1>Completed Orders</h1>
        {productTotals.map(({ title, totalAmount, productOrders, totalQuantity }) => (
          <div key={title}>
            <br />
            <h3>{title}</h3>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Date Received</th>
                </tr>
              </thead>
              <tbody>
                {productOrders.length > 0 ? (
                  productOrders.map(order => (
                    <tr key={order.orderId}>
                      <td>
                        {getImageUrl(order.product.productId) && (
                          <img src={getImageUrl(order.product.productId)} alt={order.product.title} className='inventory-image' />
                        )}
                      </td>
                      <td>{order.product.title}</td>
                      <td>{order.product.quantity}</td>
                      <td>₱{order.totalAmount.toFixed(2)}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>{new Date(order.dateReceived).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No completed orders for this product.</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="6"><strong>Total Amount for {title}: ₱{totalAmount.toFixed(2)} <br /> Total Quantity for {title}: {totalQuantity}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
               <h2>Grand Total of All Products: ₱{grandTotal.toFixed(2)}</h2>

<br />

<h1>Canceled Orders by Product</h1>

{products.map((product) => {
  const productCanceledOrders = filteredCanceledOrders.filter(order => order.product.productId === product._id);
  return (
    <div key={product._id}>
      <h3>{product.title}</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Cancellation Date</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {productCanceledOrders.length > 0 ? (
            productCanceledOrders.map(order => (
              <tr key={order.orderId}> {/* Make sure orderId is unique */}
                <td>
                  {getImageUrl(order.product.productId) && (
                    <img src={getImageUrl(order.product.productId)} alt={order.product.title} className='inventory-image' />
                  )}
                </td>
                <td>{order.product.title}</td>
                <td>{order.product.quantity}</td>
                <td>₱{order.totalAmount.toFixed(2)}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.cancellationReason}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No canceled orders for this product.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
})}

        <h1>Orders Overview</h1>
        <Bar data={barChartData} options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Orders Overview',
            },
          },
        }} />
      </div>
    </div>
  );
};

export default CompleteOrder;

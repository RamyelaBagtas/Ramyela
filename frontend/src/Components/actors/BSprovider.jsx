
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import './BSprovider.css'; 
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import axiosInstance from '../axiosInstance';

const BSprovider = () => {
  const [archivedSellers, setArchivedSellers] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchArchivedData = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/sellers/archived');
        setArchivedSellers(response.data.archivedSellers);
        setArchivedProducts(response.data.archivedProducts);
        enqueueSnackbar('Archived data fetched successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error fetching archived data:', error);
        enqueueSnackbar('Failed to fetch archived data', { variant: 'error' });
      }
    };

    fetchArchivedData();
  }, [enqueueSnackbar]);

  const handleSeeResellers = () => {
    navigate('/bs'); // Navigate to the Rs component
  };

  const handleUnarchive = async (id) => {
    try {
      await axiosInstance.patch(`/auth/admin/sellers/${id}/unarchive`);
      setArchivedSellers(archivedSellers.filter(seller => seller._id !== id));
      enqueueSnackbar('Reseller unarchived successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error unarchiving reseller:', error);
      enqueueSnackbar('Failed to unarchive reseller', { variant: 'error' });
    }
  };

  return (
    <div>
      <ElseNavbar />
      <AdminSidebar/>
      <div className='bsprovider-archive-container'>
        <button onClick={handleSeeResellers}>See Sellers</button>
        <h1>Archived Sellers</h1>
        {archivedSellers.length === 0 ? (
          <p className="bsno-data">No archived resellers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>DTI</th>
                <th>Business Permit</th>
                <th>Sanitary Permit</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {archivedSellers.map((seller) => (
                <tr key={seller._id}>
                  <td><img src={seller.dtiImageURL} alt="DTI" /></td>
                  <td><img src={seller.businessPermitImageURL} alt="Business Permit" /></td>
                  <td><img src={seller.sanitaryPermitImageURL} alt="Sanitary Permit" /></td>
                  <td>{seller.firstName}</td>
                  <td>{seller.lastName}</td>
                  <td>{seller.email}</td>
                  <td>{seller.contactNumber}</td>
                  <td>
                    <button onClick={() => handleUnarchive(seller._id)}>Unarchive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <SnackbarProvider maxSnack={3}>
    <BSprovider />
  </SnackbarProvider>
);

export default App;

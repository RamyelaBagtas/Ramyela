// ProviderArchive.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import './ProviderArchive.css'; // Import the CSS file
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import axiosInstance from '../axiosInstance';

const ProviderArchive = () => {
  const [archivedResellers, setArchivedResellers] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchArchivedData = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/resellers/archived');
        setArchivedResellers(response.data.archivedResellers);
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
    navigate('/rsellers'); // Navigate to the Rs component
  };

  const handleUnarchive = async (id) => {
    try {
      await axiosInstance.patch(`auth/admin/resellers/${id}/unarchive`);
      setArchivedResellers(archivedResellers.filter(reseller => reseller._id !== id));
      enqueueSnackbar('Reseller unarchived successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error unarchiving reseller:', error);
      enqueueSnackbar('Failed to unarchive reseller', { variant: 'error' });
    }
  };

  return (
    <div>
      <ElseNavbar />
      <AdminSidebar />
      <div className='provider-archive-container'>
        <button onClick={handleSeeResellers}>See Resellers</button>
        <h1>Archived Resellers</h1>
        {archivedResellers.length === 0 ? (
          <p className="no-data">No archived resellers found.</p>
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
              {archivedResellers.map((reseller) => (
                <tr key={reseller._id}>
                  <td><img src={reseller.dtiImageURL} alt="DTI" /></td>
                  <td><img src={reseller.businessPermitImageURL} alt="Business Permit" /></td>
                  <td><img src={reseller.sanitaryPermitImageURL} alt="Sanitary Permit" /></td>
                  <td>{reseller.firstName}</td>
                  <td>{reseller.lastName}</td>
                  <td>{reseller.email}</td>
                  <td>{reseller.contactNumber}</td>
                  <td>
                    <button onClick={() => handleUnarchive(reseller._id)}>Unarchive</button>
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
    <ProviderArchive />
  </SnackbarProvider>
);

export default App;

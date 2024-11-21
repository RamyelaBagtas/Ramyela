// ProviderArchive.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import './SSprovider.css'; // Import the CSS file
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import axiosInstance from '../axiosInstance';

const SSprovider = () => {
  const [archivedSupplier, setArchivedSupplier] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchArchivedData = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/supplier/archived');
        setArchivedSupplier(response.data.archivedSupplier);
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
    navigate('/ss'); // Navigate to the Rs component
  };

  const handleUnarchive = async (id) => {
    try {
      await axiosInstance.patch(`auth/admin/supplier/${id}/unarchive`);
      setArchivedSupplier(archivedSupplier.filter(supplier => supplier._id !== id));
      enqueueSnackbar('Supplier unarchived successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error unarchiving supplier:', error);
      enqueueSnackbar('Failed to unarchive supplier', { variant: 'error' });
    }
  };

  return (
    <div>
      <ElseNavbar />
      <AdminSidebar />
      <div className='ssprovider-archive-container'>
        <button onClick={handleSeeResellers}>See Supplier</button>
        <h1>Archived Suppliers</h1>
        {archivedSupplier.length === 0 ? (
          <p className="ssno-data">No archived Supplier found.</p>
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
              {archivedSupplier.map((supplier) => (
                <tr key={supplier._id}>
                  <td><img src={supplier.dtiImageURL} alt="DTI" /></td>
                  <td><img src={supplier.businessPermitImageURL} alt="Business Permit" /></td>
                  <td><img src={supplier.sanitaryPermitImageURL} alt="Sanitary Permit" /></td>
                  <td>{supplier.firstName}</td>
                  <td>{supplier.lastName}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.contactNumber}</td>
                  <td>
                    <button onClick={() => handleUnarchive(supplier._id)}>Unarchive</button>
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
    <SSprovider />
  </SnackbarProvider>
);

export default App;

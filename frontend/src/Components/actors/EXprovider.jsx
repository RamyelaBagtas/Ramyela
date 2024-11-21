// ProviderArchive.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import './EXprovider.css'; // Import the CSS file
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import axiosInstance from '../axiosInstance';

const EXprovider = () => {
  const [archivedExporter, setArchivedExporter] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchArchivedData = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/exporter/archived');
        setArchivedExporter(response.data.archivedExporter);
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
    navigate('/ex'); // Navigate to the Rs component
  };

  const handleUnarchive = async (id) => {
    try {
      await axiosInstance.patch(`auth/admin/exporter/${id}/unarchive`);
      setArchivedExporter(archivedExporter.filter(exporter => exporter._id !== id));
      enqueueSnackbar('exporter unarchived successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error unarchiving exporter:', error);
      enqueueSnackbar('Failed to unarchive exporter', { variant: 'error' });
    }
  };

  return (
    <div>
      <ElseNavbar />
      <AdminSidebar />
      <div className='exprovider-archive-container'>
        <button onClick={handleSeeResellers}>See Exporters</button>
        <h1>Archived Exporters</h1>
        {archivedExporter.length === 0 ? (
          <p className="exno-data">No archived Exporters found.</p>
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
              {archivedExporter.map((exporter) => (
                <tr key={exporter._id}>
                  <td><img src={exporter.dtiImageURL} alt="DTI" /></td>
                  <td><img src={exporter.businessPermitImageURL} alt="Business Permit" /></td>
                  <td><img src={exporter.sanitaryPermitImageURL} alt="Sanitary Permit" /></td>
                  <td>{exporter.firstName}</td>
                  <td>{exporter.lastName}</td>
                  <td>{exporter.email}</td>
                  <td>{exporter.contactNumber}</td>
                  <td>
                    <button onClick={() => handleUnarchive(exporter._id)}>Unarchive</button>
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
    <EXprovider />
  </SnackbarProvider>
);

export default App;

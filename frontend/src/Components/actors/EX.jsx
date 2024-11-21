import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EX.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import axiosInstance from '../axiosInstance';

const EX = () => {
  const [exporters, setExporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar(); // Destructure enqueueSnackbar from useSnackbar
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExporters = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/exporter');
        setExporters(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exporters:', error);
        setError('Failed to fetch exporters');
        setLoading(false);
      }
    };

    fetchExporters();
  }, []);

    const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };


  const handleArchive = async (id) => {
    try {
      await axiosInstance.patch(`auth/admin/exporter/${id}`);
      setExporters(exporters.filter(exporter => exporter._id !== id)); // Remove the archived reseller from the state
      enqueueSnackbar('Exporter archived successfully!', { variant: 'success' }); // Show success notification
    } catch (error) {
      console.error('Error archiving Exporter:', error);
      enqueueSnackbar('Failed to archive Exporter', { variant: 'error' }); // Show error notification
    }
  };

  const navigateToArchived = () => {
    navigate('/exprovider'); // Navigate to ProviderArchive component
  };

  return (
    <div>
      <AdminNavbar />
      <AdminSidebar />
      <div className='excontainer'>
        <h1>Exporters</h1>
        <button onClick={navigateToArchived} className="btn-archive">Go to Archived Exporters</button>
        <table>
          <thead>
            <tr>
              <th>DTI</th>
              <th>Business Permit</th>
              <th>Sanitary Permit</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Birthdate</th>
              <th>Contact Number</th>
              <th>User Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {exporters.map((exporter) => (
              <tr key={exporter._id}>
                <td><img src={exporter.dtiImageURL} alt="DTI" className="image" /></td>
                <td><img src={exporter.businessPermitImageURL} alt="Business Permit" className="image" /></td>
                <td><img src={exporter.sanitaryPermitImageURL} alt="Sanitary Permit" className="image" /></td>
                <td>{exporter.firstName}</td>
                <td>{exporter.lastName}</td>
                <td>{exporter.email}</td>
                <td>{formatDate(exporter.birthdate)}</td>
                <td>{exporter.contactNumber}</td>
                <td>{exporter.userType}</td>
                <td>
                <button className='btn-rsarchive' onClick={() => handleArchive(exporter._id)}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EX;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RS.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import axiosInstance from '../axiosInstance';

const Rs = () => {
  const [resellers, setResellers] = useState([]);
  const { enqueueSnackbar } = useSnackbar(); // Destructure enqueueSnackbar from useSnackbar
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch resellers from the API
    const fetchResellers = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/resellers');
        setResellers(response.data);
      } catch (error) {
        console.error('Error fetching resellers:', error);
      }
    };

    fetchResellers();
  }, []);

      const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };


  const handleArchive = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/auth/admin/resellers/${id}`);
      setResellers(resellers.filter(reseller => reseller._id !== id)); // Remove the archived reseller from the state
      enqueueSnackbar('Reseller archived successfully!', { variant: 'success' }); // Show success notification
    } catch (error) {
      console.error('Error archiving reseller:', error);
      enqueueSnackbar('Failed to archive reseller', { variant: 'error' }); // Show error notification
    }
  };

  const navigateToArchived = () => {
    navigate('/providerarchived'); // Navigate to ProviderArchive component
  };

  return (
    <div>
      <AdminNavbar />
      <AdminSidebar />
      <div className='rscontainer'>
        <h1>Resellers</h1>
        <button onClick={navigateToArchived} className="btn-archive">Go to Archived Resellers</button> {/* Add navigation button */}
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
            {resellers.map((reseller) => (
              <tr key={reseller._id}>
                <td><img src={reseller.dtiImageURL} alt="DTI" className="image" /></td>
                <td><img src={reseller.businessPermitImageURL} alt="Business Permit" className="image" /></td>
                <td><img src={reseller.sanitaryPermitImageURL} alt="Sanitary Permit" className="image" /></td>
                <td>{reseller.firstName}</td>
                <td>{reseller.lastName}</td>
                <td>{reseller.email}</td>
                <td>{formatDate(reseller.birthdate)}</td>
                <td>{reseller.contactNumber}</td>
                <td>{reseller.userType}</td>
                <td>
                  <button className='btn-rsarchive' onClick={() => handleArchive(reseller._id)}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rs;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BS.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import axiosInstance from '../axiosInstance';

const Bs = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch resellers from the API
    const fetchSellers = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/sellers');
        setSellers(response.data);
      } catch (error) {
        console.error('Error fetching sellers:', error);
      }
    };

    fetchSellers();
  }, []);

      const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };


  const handleArchive = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/auth/admin/sellers/${id}`);
      setSellers(sellers.filter(seller => seller._id !== id)); // Remove the archived reseller from the state
      enqueueSnackbar('seller archived successfully!', { variant: 'success' }); // Show success notification
    } catch (error) {
      console.error('Error archiving seller:', error);
      enqueueSnackbar('Failed to archive seller', { variant: 'error' }); // Show error notification
    }
  };

  const navigateToArchived = () => {
    navigate('/bsprovider'); // Navigate to ProviderArchive component
  };

  return (
    <div>
      <AdminNavbar />
      <AdminSidebar />
      <div className='bscontainer'>
        <h1>Sellers</h1>
        <button onClick={navigateToArchived} className="btn-archive">Go to Archived Sellers</button>
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
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td><img src={seller.dtiImageURL} alt="DTI" className="image" /></td>
                <td><img src={seller.businessPermitImageURL} alt="Business Permit" className="image" /></td>
                <td><img src={seller.sanitaryPermitImageURL} alt="Sanitary Permit" className="image" /></td>
                <td>{seller.firstName}</td>
                <td>{seller.lastName}</td>
                <td>{seller.email}</td>
                <td>{formatDate(seller.birthdate)}</td>
                <td>{seller.contactNumber}</td>
                <td>{seller.userType}</td>
                <td>
                  <button className='btn-delete' onClick={() => handleArchive(seller._id)}>Archived</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bs;

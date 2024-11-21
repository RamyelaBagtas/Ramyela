import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SS.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import axiosInstance from '../axiosInstance';

const Ss = () => {
  const [suppliers, setSuppliers] = useState([]);
  const { enqueueSnackbar } = useSnackbar(); // Destructure enqueueSnackbar from useSnackbar
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch suppliers from the API
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/supplier');
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleArchive = async (id) => {
    try {
      await axiosInstance.patch(`auth/admin/supplier/${id}`);
      setSuppliers(suppliers.filter(supplier => supplier._id !== id)); // Remove the archived reseller from the state
      enqueueSnackbar('supplier archived successfully!', { variant: 'success' }); // Show success notification
    } catch (error) {
      console.error('Error archiving supplier:', error);
      enqueueSnackbar('Failed to archive supplier', { variant: 'error' }); // Show error notification
    }
  };

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };


  const navigateToArchived = () => {
    navigate('/ssprovider'); // Navigate to ProviderArchive component
  };

  return (
    <div>
      <AdminNavbar/>
      <AdminSidebar />
      <div className='sscontainer'>
        <h1>Suppliers</h1>
        <button onClick={navigateToArchived} className="btn-archive">Go to Archived Suppliers</button>
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
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td><img src={supplier.dtiImageURL} alt="DTI" className="image" /></td>
                <td><img src={supplier.businessPermitImageURL} alt="Business Permit" className="image" /></td>
                <td><img src={supplier.sanitaryPermitImageURL} alt="Sanitary Permit" className="image" /></td>
                <td>{supplier.firstName}</td>
                <td>{supplier.lastName}</td>
                <td>{supplier.email}</td>
                <td>{formatDate(supplier.birthdate)}</td>
                <td>{supplier.contactNumber}</td>
                <td>{supplier.userType}</td>
                <td>
                <button className='btn-rsarchive' onClick={() => handleArchive(supplier._id)}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ss;

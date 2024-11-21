import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BS.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import axiosInstance from '../axiosInstance';

const Consumer = () => {
  const [Consumer, setConsumer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch resellers from the API
    const fetchConsumer = async () => {
      try {
        const response = await axiosInstance.get('auth/admin/consumerss');
        setConsumer(response.data);
      } catch (error) {
        console.error('Error fetching Consumer:', error);
      }
    };

    fetchConsumer();
  }, []);

    const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };


  return (
    <div>
      <AdminNavbar />
      <AdminSidebar />
      <div className='bscontainer'>
        <h1>Consumers</h1>
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Birthdate</th>
              <th>Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {Consumer.map((Consumer) => (
              <tr key={Consumer._id}>
                <td>{Consumer.firstName}</td>
                <td>{Consumer.lastName}</td>
                <td>{Consumer.email}</td>
                <td>{formatDate(Consumer.birthdate)}</td>
                <td>{Consumer.contactNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Consumer;

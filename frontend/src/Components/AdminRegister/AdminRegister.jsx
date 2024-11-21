import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import './AdminRegister.css';
import ElseNavbar from '../ElseNavbar/ElseNavbar';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import axiosInstance from '../axiosInstance';

const AdminAccountPage = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [elseNavbarVisible, setElseNavbarVisible] = useState(true); 
    const [adminSidebarVisible, setAdminSidebarVisible] = useState(true); 

    const handleRegisterAdmin = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to the register endpoint with admin data
            await axiosInstance.post('auth/admin/register', { name, email, password });
            // Show a success notification
            enqueueSnackbar('Admin registered successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error registering admin:', error);
            // Show an error notification
            enqueueSnackbar('Error registering admin', { variant: 'error' });
        }
    };

    const toggleAdminNavbar = () => {
        setElseNavbarVisible(!elseNavbarVisible);
    };

    const toggleAdminSidebar = () => {
        setAdminSidebarVisible(!adminSidebarVisible);
    };

    return (
        <div>
        <div>
            {elseNavbarVisible && <ElseNavbar />}
            {adminSidebarVisible && <AdminSidebar />}
            <div className="admin-account-page">
                <h2>Register New Admin</h2>
                <form onSubmit={handleRegisterAdmin}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button className="register" type="submit">Register New Admin</button>
                </form>
            </div>
        </div>
        </div>
    );
};

export default AdminAccountPage;

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from './axiosInstance';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId'));
    const [userType, setUserType] = useState('');
    const [archived, setArchived] = useState(false);
    const [displayPictureURL, setDisplayPictureURL] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [createdAt, setCreatedAt] = useState('');

    const login = async (userId) => {
        setUserId(userId);
        setIsLoggedIn(true);
        localStorage.setItem('userId', userId);
        await fetchUserDetails(userId);
    };

    const logout = () => {
        setUserId(null);
        setIsLoggedIn(false);
        localStorage.removeItem('userId');
    };

    const isAuthenticated = () => isLoggedIn;

    const fetchUserDetails = async (userId) => {
        try {
            const response = await axiosInstance.get(`api/user/${userId}`);
            const { userType, archived, displayPictureURL, firstName, lastName, createdAt } = response.data;
            setUserType(userType);
            setArchived(archived);
            setDisplayPictureURL(displayPictureURL);
            setFirstName(firstName);
            setLastName(lastName);
            setCreatedAt(createdAt);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserDetails(userId);
        }
    }, [userId]);

    return (
        <AuthContext.Provider value={{ userId, isLoggedIn, userType, archived, displayPictureURL, firstName, lastName, createdAt, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };

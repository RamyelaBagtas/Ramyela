import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import './LoginSignup.css';
import { useAuth } from '../AuthContext';
import axiosInstance from '../axiosInstance';

const LoginSignup = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { login } = useAuth();
    const [showLogin, setShowLogin] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [dtiImage, setDtiImage] = useState(null);
    const [businessPermitImage, setBusinessPermitImage] = useState(null);
    const [sanitaryPermitImage, setSanitaryPermitImage] = useState(null);
    const [passwordError, setPasswordError] = useState('');
        const [emailError, setEmailError] = useState('');
    const [contactError, setContactError] = useState('');

    // New state fields for address and display picture
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [displayPicture, setDisplayPicture] = useState(null); // New state for display picture

    const navigate = useNavigate();

    const handleCreateAccountClick = () => {
        setShowSignUp(true);
        setShowLogin(false);
    };

    const handleLoginClick = () => {
        setShowSignUp(false);
        setShowLogin(true);
    };

    const handleUserTypeChange = (event) => {
        setUserType(event.target.value);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (!validatePassword(newPassword)) {
            setPasswordError('Password must be at least 8 characters long, contain a number, a symbol, and an uppercase letter.');
        } else {
            setPasswordError('');
        }
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        if (!newEmail.endsWith('@gmail.com')) {
            setEmailError('Email must end with @gmail.com');
        } else {
            setEmailError('');
        }
    };

    const handleContactChange = (e) => {
        const newContactNumber = e.target.value;
        if (newContactNumber.length <= 11) {
            setContactNumber(newContactNumber);
            setContactError('');
        } else {
            setContactError('Contact number must not exceed 11 digits.');
        }
    };

    const handleDtiImageUpload = (event) => {
        setDtiImage(event.target.files[0]);
    };

    const handleBusinessPermitImageUpload = (event) => {
        setBusinessPermitImage(event.target.files[0]);
    };

    const handleSanitaryPermitImageUpload = (event) => {
        setSanitaryPermitImage(event.target.files[0]);
    };

    const handleDisplayPictureUpload = (event) => {
        setDisplayPicture(event.target.files[0]); // Update state for display picture
    };

    const capitalizeWords = (value) => {
        return value.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };
    
    // Update the handleChange methods for firstName and lastName
    const handleFirstNameChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setFirstName(formattedValue);
    };
    
    const handleLastNameChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setLastName(formattedValue);
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('login/login', { email, password });
            const { userType, consumerId } = response.data;
    
            enqueueSnackbar('Login successful', { variant: 'success' });
            console.log('Login successful:', userType, email, consumerId);
    
            // Store the correct ID and userType in localStorage
            localStorage.setItem('userType', userType);
            localStorage.setItem('userId', consumerId);
    
            // Trigger the login function from AuthContext
            login(consumerId);
    
            // Navigate based on userType
            switch (userType) {
                case 'consumer':
                    navigate('/ppppp');
                    break;
                case 'supplier':
                    navigate('/SupplierHome');
                    break;
                case 'seller':
                    navigate('/seller');
                    break;
                case 'reseller':
                    navigate('/seller');
                    break;
                case 'exporter':
                    navigate('/exporter'); // Ensure the path exists
                    break;
                case 'admin':
                    navigate('/admin');
                    break;
                default:
                    enqueueSnackbar('Invalid userType', { variant: 'error' });
                    console.error('Unhandled userType:', userType);
            }
        } catch (error) {
            if (error.response) {
                console.error('Error logging in:', error.response.data);
                if (error.response.status === 401) {
                    enqueueSnackbar('Email or password is incorrect', { variant: 'error' });
                } else {
                    enqueueSnackbar('Error logging in: ' + (error.response.data.message || 'An unexpected error occurred'), { variant: 'error' });
                }
            } else if (error.request) {
                console.error('Error request:', error.request);
                enqueueSnackbar('Error logging in: No response received from server', { variant: 'error' });
            } else {
                console.error('Error message:', error.message);
                enqueueSnackbar('Error logging in: ' + error.message, { variant: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", 'qd4fubon');
        formData.append("folder", "sample services");

        try {
            const cloudinaryResponse = await axios.post(
                "https://api.cloudinary.com/v1_1/dwpdaavhd/image/upload",
                formData
            );
            return cloudinaryResponse.data.secure_url;
        } catch (error) {
            console.error("Error uploading image:", error);
            enqueueSnackbar("Error uploading image", { variant: "error" });
            return null;
        }
    };

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSignUp = async () => {
        setLoading(true);

        if (!firstName || !lastName || !email || !password || !confirmPassword || !birthdate || !contactNumber || !userType) {
            enqueueSnackbar('All fields are required', { variant: 'warning' });
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            setLoading(false);
            return;
        } else {
            setPasswordError('');
        }

        const age = calculateAge(birthdate);
        if (age < 14) {
            enqueueSnackbar('You must be at least 14 years old to sign up', { variant: 'error' });
            setLoading(false);
            return;
        }

        let dtiImageURL = null;
        let businessPermitImageURL = null;
        let sanitaryPermitImageURL = null;
        let displayPictureURL = null; // New variable for display picture URL

        if (userType !== 'consumer') {
            if (dtiImage) {
                dtiImageURL = await handleFileUpload(dtiImage);
                if (!dtiImageURL) {
                    enqueueSnackbar('DTI image upload failed', { variant: 'error' });
                    setLoading(false);
                    return;
                }
            }
            if (businessPermitImage) {
                businessPermitImageURL = await handleFileUpload(businessPermitImage);
                if (!businessPermitImageURL) {
                    enqueueSnackbar('Business Permit image upload failed', { variant: 'error' });
                    setLoading(false);
                    return;
                }
            }
            if (sanitaryPermitImage) {
                sanitaryPermitImageURL = await handleFileUpload(sanitaryPermitImage);
                if (!sanitaryPermitImageURL) {
                    enqueueSnackbar('Sanitary Permit image upload failed', { variant: 'error' });
                    setLoading(false);
                    return;
                }
            }
        }

        if (displayPicture) {
            displayPictureURL = await handleFileUpload(displayPicture);
            if (!displayPictureURL) {
                enqueueSnackbar('Display picture upload failed', { variant: 'error' });
                setLoading(false);
                return;
            }
        }

        const userData = {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            birthdate,
            contactNumber,
            userType,
            dtiImageURL,
            businessPermitImageURL,
            sanitaryPermitImageURL,
            displayPictureURL, // Add display picture URL to the userData
            ...(userType !== 'consumer' && { // Include address fields only if not consumer
                country,
                region,
                province,
                city,
                barangay
            })
        };

        try {
            const response = await axiosInstance.post('auth/signup', userData);
            enqueueSnackbar(response.data.message, { variant: 'success' });

            if (userType === 'consumer') {
                setShowSignUp(false);
                setShowLogin(true);
                navigate('/');
            }
        } catch (error) {
            console.error('Error signing up:', error);
            enqueueSnackbar('Error signing up: ' + (error.response?.data.message || 'An unexpected error occurred'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCountryChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setCountry(formattedValue);
    };
    
    const handleRegionChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setRegion(formattedValue);
    };
    
    const handleProvinceChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setProvince(formattedValue);
    };
    
    const handleCityChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setCity(formattedValue);
    };
    
    const handleBarangayChange = (e) => {
        const formattedValue = capitalizeWords(e.target.value);
        setBarangay(formattedValue);
    };

    return (
        <div className="login-page">
            {showLogin && (
                <div className="login-container">
                    <h2>Login</h2>
                    <div className="input-fields">
                        <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-fields">
                        <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button className="input-field-buttonlgn" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p>Don't have an account? <span className="p" onClick={handleCreateAccountClick}>Sign Up</span></p>
                </div>
            )}

            {showSignUp && (
                <div className="signup-container">
                    <h2>Sign Up</h2>
                    <div className="input-fields">
        <input type="text" placeholder='First Name' value={firstName} onChange={handleFirstNameChange} />
    </div>
    <div className="input-fields">
        <input type="text" placeholder='Last Name' value={lastName} onChange={handleLastNameChange} />
    </div>
                    <div className="input-fields">
                        <input type="email" placeholder='Email' value={email} onChange={handleEmailChange} />
                        {emailError && <p className="error-text">{emailError}</p>}
                    </div>
                    <div className="input-fields">
                        <input type="password" placeholder='Password' value={password} onChange={handlePasswordChange} />
                        {passwordError && <p className="error-text">{passwordError}</p>}
                    </div>
                    <div className="input-fields">
                        <input type="password" placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                                        {passwordError && <p className="error-text">{passwordError}</p>}
                    <div className="input-fields">
                        <label>Birthdate:</label>
                        <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                    </div>
                    <div className="input-fields">
                        <input type="text" placeholder='Contact Number' value={contactNumber} onChange={handleContactChange} />
                        {contactError && <p className="error-text">{contactError}</p>}
                    </div>
                    <div className="input-fields">
                        <label>Display Picture:</label>
                        <input type="file" accept="image/*" onChange={handleDisplayPictureUpload} />
                    </div>
                    <div className="input-fields">
                        <label>User Type:</label>
                        <select value={userType} onChange={handleUserTypeChange}>
                            <option value="">Select User Type</option>
                            <option value="consumer">Consumer</option>
                            <option value="supplier">Supplier</option>
                            <option value="seller">Seller</option>
                            <option value="reseller">Reseller</option>
                            <option value="exporter">Exporter</option>
                        </select>
                    </div>
                    {userType !== 'consumer' && (
                        <>
        <div className="input-fields">
            <input type="text" placeholder='Country' value={country} onChange={handleCountryChange} />
        </div>
        <div className="input-fields">
            <input type="text" placeholder='Region' value={region} onChange={handleRegionChange} />
        </div>
        <div className="input-fields">
            <input type="text" placeholder='Province' value={province} onChange={handleProvinceChange} />
        </div>
        <div className="input-fields">
            <input type="text" placeholder='Municipality' value={city} onChange={handleCityChange} />
        </div>
        <div className="input-fields">
            <input type="text" placeholder='Barangay' value={barangay} onChange={handleBarangayChange} />
        </div>
                            <div className="input-fields">
                                <label>DTI Image:</label>
                                <input type="file" accept="image/*" onChange={handleDtiImageUpload} />
                            </div>
                            <div className="input-fields">
                                <label>Business Permit Image:</label>
                                <input type="file" accept="image/*" onChange={handleBusinessPermitImageUpload} />
                            </div>
                            <div className="input-fields">
                                <label>Sanitary Permit Image:</label>
                                <input type="file" accept="image/*" onChange={handleSanitaryPermitImageUpload} />
                            </div>
                        </>
                    )}
                    <button className="input-fields-button" onClick={handleSignUp} disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                    <p>
                        Already have an account? <span className="p" onClick={handleLoginClick}>Login</span>
                        </p>
                </div>
            )}
        </div>
    );
};

export default LoginSignup;

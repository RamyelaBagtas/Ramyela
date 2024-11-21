import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PendingUser.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Modal from 'react-modal';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import axiosInstance from '../axiosInstance';

Modal.setAppElement('#root');

const PendingUserPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingUserCount, setPendingUserCount] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReasons, setRejectReasons] = useState({
    dti: false,
    businessPermit: false,
    sanitaryPermit: false,
  });
  const [comment, setComment] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axiosInstance.get('api/pendingusers');
        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      }
    };

    const fetchPendingUserCount = async () => {
      try {
        const response = await axiosInstance.get('api/pendingusercount');
        setPendingUserCount(response.data.count);
      } catch (error) {
        console.error('Error fetching pending user count:', error);
      }
    };

    fetchPendingUsers();
    fetchPendingUserCount();
  }, []);

      const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };


  const handleApprove = async (userId) => {
    try {
      await axiosInstance.post(`api/approve/${userId}`);
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      setPendingUserCount(prevCount => prevCount - 1); // Update the count
      enqueueSnackbar('User approved successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error approving user:', error);
      enqueueSnackbar('Failed to approve user', { variant: 'error' });
    }
  };

  const handleReject = (user) => {
    setSelectedUserId(user._id);
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  const handleRejectSubmit = async () => {
    try {
      await axiosInstance.post(`api/reject/${selectedUserId}`, {
        reasons: rejectReasons,
        comment,
      });
      setPendingUsers(pendingUsers.filter(user => user._id !== selectedUserId));
      setPendingUserCount(prevCount => prevCount - 1); // Update the count
      enqueueSnackbar('User rejected successfully', { variant: 'success' });
      setModalIsOpen(false);
      setComment('');
    } catch (error) {
      console.error('Error rejecting user:', error);
      enqueueSnackbar('Failed to reject user', { variant: 'error' });
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setRejectReasons(prevState => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  return (
    <div>
      <AdminNavbar />
      <AdminSidebar pendingUserCount={pendingUserCount} />
      <div className="pending-user-container">
        <div className="pending-user">
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Birthdate</th>
                <th>Contact Number</th>
                <th>Email</th>
                <th>User Type</th>
                <th>DTI</th>
                <th>Business Permit</th>
                <th>Sanitary Permit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{formatDate(user.birthdate)}</td>
                  <td>{user.contactNumber}</td>
                  <td>{user.email}</td>
                  <td>{user.userType}</td>
                  <td><img src={user.dtiImageURL} alt="DTI" className="image" /></td>
                  <td><img src={user.businessPermitImageURL} alt="Business Permit" className="image" /></td>
                  <td><img src={user.sanitaryPermitImageURL} alt="Sanitary Permit" className="image" /></td>
                  <td className="btn-container">
                    <button onClick={() => handleApprove(user._id)}>Approve</button>
                    <button onClick={() => handleReject(user)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Reject Reasons"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Reject Reasons</h2>
        <form>
          <div>
            <input
              type="checkbox"
              id="dti"
              name="dti"
              checked={rejectReasons.dti}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="dti">Reject DTI</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="businessPermit"
              name="businessPermit"
              checked={rejectReasons.businessPermit}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="businessPermit">Reject Business Permit</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="sanitaryPermit"
              name="sanitaryPermit"
              checked={rejectReasons.sanitaryPermit}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="sanitaryPermit">Reject Sanitary Permit</label>
          </div>
          <div>
            <label htmlFor="comment">Comment/Note:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              rows="4"
              cols="50"
            />
          </div>
          <button type="button" onClick={handleRejectSubmit}>Submit</button>
        </form>
      </Modal>
    </div>
  );
};

const PendingUserPageWithSnackbar = () => (
  <SnackbarProvider maxSnack={3}>
    <PendingUserPage />
  </SnackbarProvider>
);

export default PendingUserPageWithSnackbar;

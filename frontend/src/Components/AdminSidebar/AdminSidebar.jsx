import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css'; 
import request_icon from '../Assets/requesticon.png';
import register_admin from '../Assets/register_admin.png';
import rs_icon from '../Assets/reseller.png';
import bs_icon from '../Assets/seller.png';
import ex_icon from '../Assets/export.png';
import s_icon from '../Assets/supplier.png';
import consumer_icon from '../Assets/consumer.png';

const AdminSidebar = ({ pendingUserCount }) => {
  return (
    <div className="admin-sidebar">
      <Link to='/pendinguser' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={request_icon} alt="" />
          <p>Requests {pendingUserCount > 0 && `(${pendingUserCount})`}</p>
        </div>
      </Link>
      <Link to='/ss' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={s_icon} alt="" />
          <p>Suppliers</p>
        </div>
      </Link>
      <Link to='/bs' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={bs_icon} alt="" />
          <p>Sellers</p>
        </div>
      </Link>
      <Link to='/rsellers' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={rs_icon} alt="" />
          <p>Resellers</p>
        </div>
      </Link>
      <Link to='/ex' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={ex_icon} alt="" />
          <p>Exporters</p>
        </div>
      </Link>
      <Link to='/allconsumer' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={consumer_icon} alt="" />
          <p>Consumers</p>
        </div>
      </Link>
      <Link to='/register' style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={register_admin} alt="" />
          <p>Register Admin</p>
        </div>
      </Link>
    </div>
  );
};

export default AdminSidebar;

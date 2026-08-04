import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import toast from 'react-hot-toast';
import { MdBarChart, MdPeople } from 'react-icons/md';
import ImpersonationBanner from "../components/shared/ImpersonationBanner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: ''
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Admin Dashboard" />
         <ImpersonationBanner />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Manage and resolve civic complaints</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
  <button
    className="btn btn-secondary"
    onClick={() => navigate('/admin/users')}
  >
    <MdPeople /> Manage Users
  </button>
<button
    className="btn btn-secondary"
    onClick={() => navigate('/admin/categories')}
  >
    Manage Categories
  </button>
  <button
    className="btn btn-secondary"
    onClick={() => navigate('/admin/analytics')}
  >
    <MdBarChart /> Analytics
  </button>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

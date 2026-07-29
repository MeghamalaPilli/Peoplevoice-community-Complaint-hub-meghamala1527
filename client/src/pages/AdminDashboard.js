import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { MdSearch, MdEdit, MdRefresh, MdBarChart, MdPeople } from 'react-icons/md';
import ImpersonationBanner from "../components/shared/ImpersonationBanner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  

  const fetchAll = async () => {
    setLoading(true);
    try {
     const [sRes, uRes]= await Promise.all([
API.get('/admin/stats'),
API.get('/admin/users'),
]);
      setStats(sRes.data.stats || {});
    } catch (err) {
  console.error(err);
  console.log(err.response?.data);
}
finally {
  setLoading(false);
}
  };
  useEffect(() => {
    fetchAll();
}, []);

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

  const statCards = [
    { label: 'Total', value: stats.total, color: 'var(--accent-primary)', bg: 'rgba(108,99,255,0.12)' },
    { label: 'Pending', value: stats.pending, color: 'var(--accent-yellow)', bg: 'rgba(255,209,102,0.12)' },
    { label: 'In Progress', value: stats.inProgress, color: 'var(--accent-orange)', bg: 'rgba(255,140,66,0.12)' },
    { label: 'Resolved', value: stats.resolved, color: 'var(--accent-green)', bg: 'rgba(0,217,166,0.12)' },
    { label: 'Critical', value: stats.critical, color: '#e74c3c', bg: 'rgba(231,76,60,0.12)' },
    { label: 'Today', value: stats.todayCount, color: 'var(--accent-primary)', bg: 'rgba(108,99,255,0.12)' },
    { label: 'Resolution Rate', value: `${stats.resolutionRate || 0}%`, color: 'var(--accent-green)', bg: 'rgba(0,217,166,0.12)' },
    { label: 'Avg Resolution', value: `${stats.avgResolutionHours || 0}h`, color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' },
  ];
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

          <div className="grid-4" style={{ marginBottom: 28 }}>
            {statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 18 }}>📊</div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value ?? '—'}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Manage Modal */}
      
    </div>
  );
};

export default AdminDashboard;

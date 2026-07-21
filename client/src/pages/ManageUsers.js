import React, { useEffect, useState } from 'react';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
const [editUser, setEditUser] = useState(null);

const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  role: 'citizen'
});
const [search, setSearch] = useState('');
const [roleFilter, setRoleFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get('/admin/users');

      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUser = async (id) => {
    try {
      if (!window.confirm('Change user status?')) return;

await API.put(`/admin/users/${id}/toggle`);

      toast.success('User status updated');

      fetchUsers();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await API.delete(`/admin/users/${id}`);

      toast.success('User deleted');

      fetchUsers();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const saveUser = async () => {
  try {

    if (editUser) {

      await API.put(
        `/admin/users/${editUser._id}`,
        {
          name: form.name,
          email: form.email,
          role: form.role
        }
      );

      toast.success('User updated');

    } else {

      await API.post(
        '/admin/users',
        form
      );

      toast.success('User created');
    }

    setShowModal(false);

    fetchUsers();

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      'Operation failed'
    );
  }
};


const filteredUsers = users.filter((user) => {

  const matchesSearch =
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase());

  const matchesRole =
    roleFilter === 'all' ||
    user.role === roleFilter;

  const matchesStatus =
    statusFilter === 'all' ||
    (statusFilter === 'active' && user.isActive) ||
    (statusFilter === 'inactive' && !user.isActive);

  return matchesSearch && matchesRole && matchesStatus;
});
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Topbar title="Manage Users" />

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Manage Users</h1>
              <p className="page-subtitle">
                Create, Edit, Delete and Control Users
              </p>
            </div>

<div className="grid-4" style={{ marginBottom: 20 }}>
  <div className="stat-card">
    <div className="stat-value">
      {users.length}
    </div>
    <div className="stat-label">
      Total Users
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-value">
      {users.filter(u => u.role === 'citizen').length}
    </div>
    <div className="stat-label">
      Citizens
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-value">
      {users.filter(u => u.role === 'president').length}
    </div>
    <div className="stat-label">
      Presidents
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-value">
      {users.filter(u => u.role === 'admin').length}
    </div>
    <div className="stat-label">
      Admins
    </div>
  </div>
</div>
            <button
  className="btn btn-primary"
  onClick={() => {
    setEditUser(null);

    setForm({
      name: '',
      email: '',
      password: '',
      role: 'citizen'
    });

    setShowModal(true);
  }}
>
  + Add User
</button>
          </div>
<div
  style={{
    display: 'flex',
    gap: '15px',
    marginBottom: 20,
    flexWrap: 'wrap',
    alignItems: 'center'
  }}
>

  <input
    type="text"
    placeholder="Search Name or Email..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      flex: 1,
      minWidth: '250px',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc'
    }}
  />

  <select
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
    style={{
      padding: '10px',
      borderRadius: '8px'
    }}
  >
    <option value="all">All Roles</option>
    <option value="admin">Admin</option>
    <option value="president">President</option>
    <option value="citizen">Citizen</option>
  </select>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    style={{
      padding: '10px',
      borderRadius: '8px'
    }}
  >
    <option value="all">All Status</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>

  <button
    className="btn btn-secondary"
    onClick={() => {
      setSearch('');
      setRoleFilter('all');
      setStatusFilter('all');
    }}
  >
    Reset
  </button>

</div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>  
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>

                      <td>
                        {u.isActive ? (
                          <span className="badge badge-resolved">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-rejected">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px'
                          }}
                        >
                          <button
  className="btn btn-secondary btn-sm"
  onClick={() => {
    setEditUser(u);

    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      password: ''
    });

    setShowModal(true);
  }}
>
  Edit
</button>

                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleUser(u._id)}
                          >
                            {u.isActive ? 'Block' : 'Activate'}
                          </button>

                          {u.role !== 'admin' && (
  <button
    className="btn btn-danger btn-sm"
    onClick={() => deleteUser(u._id)}
  >
    Delete
  </button>
)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowModal(false)}
  >
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="modal-header">
        <h2>
          {editUser ? 'Edit User' : 'Add User'}
        </h2>
      </div>

      <div className="form-group">
        <label>Name</label>

        <input
          className="form-input"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          className="form-input"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
        />
      </div>

      {!editUser && (
        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            className="form-input"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />
        </div>
      )}

      <div className="form-group">
        <label>Role</label>

       <select
  className="form-select"
  value={form.role}
  disabled={editUser?.role === 'admin'}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value
            })
          }
        >
          <option value="citizen">
            Citizen
          </option>

          <option value="president">
            President
          </option>

          <option value="admin">
            Admin
          </option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px'
        }}
      >
        <button
          className="btn btn-primary"
          onClick={saveUser}
        >
          Save
        </button>

        <button
          className="btn btn-secondary"
          onClick={() =>
            setShowModal(false)
          }
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default ManageUsers;
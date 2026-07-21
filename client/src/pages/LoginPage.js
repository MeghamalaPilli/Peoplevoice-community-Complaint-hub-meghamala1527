import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
 const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'citizen',
  wardNumber: '',
  villageName: 'Kotikalapudi',
  mandal: 'Ibrahimpatnam',
  address: '',
  pincode: '',
  aadharNumber: '',
  confirmPassword: ''
});
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
  let { name, value } = e.target;
  // PIN Code: allow only digits and max 6
if (name === "pincode") {
  value = value.replace(/\D/g, "");
  if (value.length > 6) return;
}

  // Aadhaar: allow only digits and max 12
  if (name === "aadharNumber") {
    value = value.replace(/\D/g, "");
    if (value.length > 12) return;
  }

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'president' ? '/president' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (e) => {
  e.preventDefault();

  if (!form.name || !form.email || !form.password) {
    return toast.error('All fields required');
  }

  if (form.password !== form.confirmPassword) {
    return toast.error('Passwords do not match');
  }
  if (
    form.role === "president" &&
    !/^\d{12}$/.test(form.aadharNumber)
) {
    return toast.error("Aadhaar number must contain exactly 12 digits");
}

  setLoading(true);

  try {
  const result = await register(form);

if (result.message) {
  toast.success(result.message);
  setTab("login");
  return;
}

toast.success("Account created successfully!");

if (result.role === "admin") {
  navigate("/admin");
} else {
  navigate("/citizen");
}
  } catch (err) {
    toast.error(err.response?.data?.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🏛️ People Voice</h1>
          <p>Community Complaint Management System</p>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</div>
          <div className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</div>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            
<p
  onClick={() => navigate('/forgot-password')}
  style={{
    cursor: 'pointer',
    color: '#6c63ff',
    textAlign: 'right',
    marginTop: '10px',
    marginBottom: '15px'
  }}
>
  Forgot Password?
</p>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              Or continue as{' '}
              <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => navigate('/public')}>
                Public Viewer (no login)
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
            </div>
            {form.role === 'citizen' && (
  <div className="form-group">
  <label className="form-label">Ward Number</label>
  <input
    className="form-input"
    type="text"
    name="wardNumber"
    value={form.wardNumber}
    onChange={handleChange}
    placeholder="Enter Ward Number"
    required
  />
</div>
)}
<div className="form-group">
  <label className="form-label">Village Name</label>

  <select
    className="form-select"
    name="villageName"
    value={form.villageName}
    onChange={handleChange}
    required
  >
    <option value="">Select Village</option>
    <option value="Kotikalapudi">Kotikalapudi</option>
  </select>
</div>
<div className="form-group">
  <label className="form-label">Mandal</label>

  <select
    className="form-select"
    name="mandal"
    value={form.mandal}
    onChange={handleChange}
    required
  >
    <option value="">Select Mandal</option>

    <option value="Ibrahimpatnam">Ibrahimpatnam</option>

  </select>
</div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                <option value="citizen">Citizen</option>
                <option value="president">President</option>
      
              </select>
            </div>
           {form.role === "president" && (
  <div className="form-group">
    <label className="form-label">Aadhaar Number</label>

    <input
      className="form-input"
      type="text"
      name="aadharNumber"
      value={form.aadharNumber}
      onChange={handleChange}
      placeholder="Enter 12-digit Aadhaar Number"
      maxLength={12}
      required
    />
  </div>
)}
            <div className="form-group">
  <label className="form-label">Address</label>

  <textarea
    className="form-input"
    name="address"
    value={form.address}
    onChange={handleChange}
    placeholder="Enter your address"
    rows="3"
    required
  />
</div>
<div className="form-group">
  <label className="form-label">PIN Code</label>

  <input
    className="form-input"
    type="text"
    name="pincode"
    value={form.pincode}
    onChange={handleChange}
    placeholder="Enter 6-digit PIN Code"
    maxLength={6}
    required
  />
</div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
  <label className="form-label">Confirm Password</label>
  <input
    className="form-input"
    type="password"
    name="confirmPassword"
    value={form.confirmPassword}
    onChange={handleChange}
    placeholder="Confirm Password"
    required
  />
</div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, padding: '14px', background: 'rgba(108,99,255,0.08)', borderRadius: 8, border: '1px solid rgba(108,99,255,0.2)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>DEMO ACCOUNTS</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;

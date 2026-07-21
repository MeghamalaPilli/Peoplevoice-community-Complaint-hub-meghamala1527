import React, { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6c63ff', '#ff6584', '#00d9a6', '#ffd166', '#ff8c42', '#4ecdc4', '#a29bfe', '#fd79a8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1a1a35', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        {label && <div style={{ marginBottom: 4, fontWeight: 600 }}>{label}</div>}
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [monthly, setMonthly] = useState([]);
  const [category, setCategory] = useState([]);
  const [resolution, setResolution] = useState([]);
  const [priority, setPriority] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      API.get('/analytics/monthly'),
      API.get('/analytics/category'),
      API.get('/analytics/resolution-time'),
      API.get('/analytics/priority'),
    ]).then(([m, c, r, p]) => {
      const monthlyData = Array.isArray(m?.data?.data) ? m.data.data : [];
      const categoryData = Array.isArray(c?.data?.data) ? c.data.data : [];
      const resolutionData = Array.isArray(r?.data?.data) ? r.data.data : [];
      const priorityData = Array.isArray(p?.data?.data) ? p.data.data : [];

      setMonthly(monthlyData);
      setCategory(categoryData.map(d => ({ name: d._id || 'Unknown', total: d.total || 0, resolved: d.resolved || 0 })));
      setResolution(resolutionData.map(d => ({ name: d._id || d.category || 'Unknown', days: Number(d.avgDays || d.avgHours / 24 || 0).toFixed(1), count: d.count || 0 })));
      setPriority(priorityData.map(d => ({ name: d._id || 'Unknown', value: d.count || 0 })));
    }).catch((err) => {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to load analytics right now.');
      setMonthly([]);
      setCategory([]);
      setResolution([]);
      setPriority([]);
    }).finally(() => setLoading(false));
  }, []);

  const totalComplaints = monthly.reduce((sum, item) => sum + (item.total || 0), 0);
  const resolvedComplaints = monthly.reduce((sum, item) => sum + (item.resolved || 0), 0);
  const pendingComplaints = Math.max(totalComplaints - resolvedComplaints, 0);
  const criticalComplaints = monthly.reduce((sum, item) => sum + (item.critical || 0), 0);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Analytics" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)' }}>
          Loading analytics...
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Analytics Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Analytics</h1>
              <p className="page-subtitle">{isAdmin ? 'Full system overview for the administrator' : 'Limited view tailored for the president'}</p>
            </div>
          </div>

          {error ? (
            <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(255,101,132,0.35)', color: 'var(--text-primary)' }}>
              <strong>Unable to load analytics.</strong>
              <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>{error}</div>
            </div>
          ) : null}

          {isAdmin ? (
            <>
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 20, fontSize: 18 }}>📈 Monthly Complaints (Last 12 Months)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                    <XAxis dataKey="month" stroke="#5a5a8a" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#5a5a8a" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#6c63ff" strokeWidth={2} dot={{ fill: '#6c63ff', r: 4 }} name="Total" />
                    <Line type="monotone" dataKey="resolved" stroke="#00d9a6" strokeWidth={2} dot={{ fill: '#00d9a6', r: 4 }} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                  <h3 style={{ marginBottom: 20, fontSize: 18 }}>📂 By Category</h3>
                  {category.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={category} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                        <XAxis dataKey="name" stroke="#5a5a8a" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                        <YAxis stroke="#5a5a8a" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" fill="#6c63ff" radius={[4,4,0,0]} name="Total" />
                        <Bar dataKey="resolved" fill="#00d9a6" radius={[4,4,0,0]} name="Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 20, fontSize: 18 }}>🎯 Priority Distribution</h3>
                  {priority.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={priority} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                          {priority.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: 20, fontSize: 18 }}>⏱️ Avg Resolution Time by Category (days)</h3>
                {resolution.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No resolved complaints yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={resolution} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                      <XAxis type="number" stroke="#5a5a8a" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" stroke="#5a5a8a" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="days" fill="#ffd166" radius={[0,4,4,0]} name="Avg Days" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                  <h3 style={{ marginBottom: 10, fontSize: 18 }}>📌 Overall Summary</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>A concise view for the president to monitor local complaint activity.</p>
                  <div className="grid-2">
                    <div className="card" style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)' }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{totalComplaints}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total complaints</div>
                    </div>
                    <div className="card" style={{ background: 'rgba(0,217,166,0.12)', border: '1px solid rgba(0,217,166,0.2)' }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{resolvedComplaints}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Resolved</div>
                    </div>
                    <div className="card" style={{ background: 'rgba(255,209,102,0.12)', border: '1px solid rgba(255,209,102,0.2)' }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{pendingComplaints}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pending</div>
                    </div>
                    <div className="card" style={{ background: 'rgba(255,101,132,0.12)', border: '1px solid rgba(255,101,132,0.2)' }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{criticalComplaints}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Critical</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 20, fontSize: 18 }}>📂 Complaint Categories</h3>
                  {category.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={category} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                        <XAxis dataKey="name" stroke="#5a5a8a" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                        <YAxis stroke="#5a5a8a" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" fill="#6c63ff" radius={[4,4,0,0]} name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: 20, fontSize: 18 }}>🎯 Priority Snapshot</h3>
                {priority.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={priority} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {priority.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

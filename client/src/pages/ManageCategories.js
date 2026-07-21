import React, { useState } from 'react';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';

const INITIAL_CATEGORIES = [
  { value: 'road', label: '🛣️ Road & Pavement', description: 'Issues with roads, potholes, signals, pavements, and crossings.', status: 'Active' },
  { value: 'water', label: '💧 Water Supply', description: 'Issues with water leaking, contaminated supply, or tap failures.', status: 'Active' },
  { value: 'electricity', label: '⚡ Electricity', description: 'Power cuts, streetlights broken, or high voltage problems.', status: 'Active' },
  { value: 'sanitation', label: '🗑️ Sanitation & Waste', description: 'Garbage accumulation, litter, cleaning requirements.', status: 'Active' },
  { value: 'sewage', label: '🚰 Sewage & Drainage', description: 'Overflowing drains, blocked sewer lines, and stenches.', status: 'Active' },
  { value: 'public_transport', label: '🚌 Public Transport', description: 'Bus delays, metro issues, auto/taxi fare disputes.', status: 'Active' },
  { value: 'parks', label: '🌳 Parks & Gardens', description: 'Broken park benches, damaged swings, or grass maintenance.', status: 'Active' },
  { value: 'noise', label: '🔊 Noise Pollution', description: 'Disturbance from loud music, night construction, or horns.', status: 'Active' },
  { value: 'animals', label: '🐕 Stray Animals', description: 'Nuisance or hazard caused by stray cattle or street dogs.', status: 'Active' },
  { value: 'other', label: '📋 Other', description: 'Any other civic issue that does not fit current categories.', status: 'Active' },
];

const ManageCategories = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
const [editingCategory, setEditingCategory] = useState(null);
  const toggleStatus = (value) => {
  setCategories((prev) =>
    prev.map((cat) =>
      cat.value === value
        ? {
            ...cat,
            status: cat.status === "Active" ? "Inactive" : "Active",
          }
        : cat
    )
  );
};
const handleEdit = (category) => {
  setEditingCategory({ ...category });
  setShowEditModal(true);
};
const saveCategory = () => {
  setCategories((prev) =>
    prev.map((cat) =>
      cat.value === editingCategory.value
        ? editingCategory
        : cat
    )
  );

  setShowEditModal(false);
};

  const filteredCategories = categories.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Manage Categories" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Manage Categories</h1>
              <p className="page-subtitle">Configure system categories for AI and routing</p>
            </div>
          </div>

          <div className="grid-4" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Total Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{categories.filter(c => c.status === 'Active').length}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Inactive</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">AI Supported</div>
              <div className="stat-label">Classification</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Search categories by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Key / Value</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.label}</td>
                    <td><code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{c.value}</code></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word' }}>{c.description}</td>
                    <td>
  <span
    className={
      c.status === "Active"
        ? "badge badge-resolved"
        : "badge badge-pending"
    }
  >
    {c.status}
  </span>

  <button
    className="btn btn-secondary btn-sm"
    style={{ marginLeft: 10 }}
    onClick={() => toggleStatus(c.value)}
  >
    {c.status === "Active" ? "Deactivate" : "Activate"}
  </button>

  <button
    className="btn btn-primary btn-sm"
    style={{ marginLeft: 10 }}
    onClick={() => handleEdit(c)}
  >
    Edit
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showEditModal && (
  <div className="modal-overlay">
    <div className="modal-content">

      <h2>Edit Category</h2>

      <div className="form-group">
        <label>Name</label>
        <input
          className="form-input"
          value={editingCategory.label}
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              label: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          className="form-input"
          rows="4"
          value={editingCategory.description}
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              description: e.target.value,
            })
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => setShowEditModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={saveCategory}
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;

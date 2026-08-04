import React, { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import API from '../utils/api';

const DEFAULT_CATEGORIES = [
  { value: 'road', label: '🛣️ Road & Pavement' },
  { value: 'water', label: '💧 Water Supply' },
  { value: 'electricity', label: '⚡ Electricity' },
  { value: 'sanitation', label: '🗑️ Sanitation & Waste' },
  { value: 'sewage', label: '🚰 Sewage & Drainage' },
  { value: 'public_transport', label: '🚌 Public Transport' },
  { value: 'parks', label: '🌳 Parks & Gardens' },
  { value: 'noise', label: '🔊 Noise Pollution' },
  { value: 'animals', label: '🐕 Stray Animals' },
  { value: 'other', label: '📋 Other' }
];

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [categoryForm, setCategoryForm] = useState({ value: '', label: '', description: '', status: 'Active' });
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const mergeCategories = (serverCategories) => {
    const serverMap = new Map(serverCategories.map((c) => [c.value, c]));

    const merged = DEFAULT_CATEGORIES.map((def) => {
      const backend = serverMap.get(def.value);
      return {
        _id: backend?._id || null,
        value: def.value,
        label: def.label,
        description: backend?.description || '',
        status: backend?.status || 'Inactive',
        existsOnServer: Boolean(backend)
      };
    });

    serverCategories.forEach((cat) => {
      if (!DEFAULT_CATEGORIES.some((def) => def.value === cat.value)) {
        merged.push({ ...cat, existsOnServer: true });
      }
    });

    return merged;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/categories?all=true');
      if (response.data?.categories) {
        setCategories(mergeCategories(response.data.categories));
      } else {
        setCategories(mergeCategories([]));
      }
    } catch (err) {
      console.error('Could not load categories', err);
      setCategories(mergeCategories([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCategoryForm({ value: '', label: '', description: '', status: 'Active' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setCategoryForm({
      _id: category._id,
      value: category.value,
      label: category.label,
      description: category.description || '',
      status: category.status || 'Active'
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError('');
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.value.trim() || !categoryForm.label.trim()) {
      setFormError('Category key and label are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        value: categoryForm.value.trim().toLowerCase().replace(/\s+/g, '_'),
        label: categoryForm.label.trim(),
        description: categoryForm.description.trim(),
        status: categoryForm.status || 'Active'
      };

      if (modalMode === 'add' || !categoryForm._id) {
        const response = await API.post('/categories', payload);
        if (response.data?.category) {
          setCategories((prev) => mergeCategories([
            ...prev.filter((cat) => cat.value !== response.data.category.value),
            response.data.category
          ]));
          closeModal();
        }
      } else {
        const response = await API.put(`/categories/${categoryForm._id}`, payload);
        if (response.data?.category) {
          setCategories((prev) => mergeCategories(
            prev.map((cat) => (cat._id === response.data.category._id ? response.data.category : cat))
          ));
          closeModal();
        }
      }
    } catch (err) {
      console.error('Category save failed', err);
      setFormError(err.response?.data?.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategoryStatus = async (category) => {
    const updatedStatus = category.status === 'Active' ? 'Inactive' : 'Active';

    try {
      if (!category._id) {
        const response = await API.post('/categories', {
          value: category.value,
          label: category.label,
          description: category.description,
          status: updatedStatus
        });
        if (response.data?.category) {
          setCategories((prev) => mergeCategories([
            ...prev.filter((cat) => cat.value !== response.data.category.value),
            response.data.category
          ]));
        }
        return;
      }

      const response = await API.put(`/categories/${category._id}`, { status: updatedStatus });
      if (response.data?.category) {
        setCategories((prev) => mergeCategories(
          prev.map((cat) => (cat._id === response.data.category._id ? response.data.category : cat))
        ));
      }
    } catch (err) {
      console.error('Unable to update status', err);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!category._id) return;

    try {
      await API.delete(`/categories/${category._id}`);
      setCategories((prev) => mergeCategories(prev.filter((cat) => cat._id !== category._id)));
    } catch (err) {
      console.error('Unable to delete category', err);
    }
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
              <p className="page-subtitle">Configure system categories for the project</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              Add Category
            </button>
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
              className="form-input"
              type="text"
              placeholder="Search categories by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  <tr key={c._id || i}>
                    <td style={{ fontWeight: 600 }}>{c.label}</td>
                    <td><code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{c.value}</code></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word' }}>{c.description}</td>
                    <td>
                      <span className={c.status === 'Active' ? 'badge badge-resolved' : 'badge badge-pending'}>
                        {c.status}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: 10 }}
                        onClick={() => toggleCategoryStatus(c)}
                      >
                        {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginLeft: 10 }}
                        onClick={() => openEditModal(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: 10 }}
                        onClick={() => handleDeleteCategory(c)}
                        disabled={!c._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showModal && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2 className="modal-title">
                      {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
                    </h2>
                    <button className="modal-close" onClick={closeModal}>
                      ×
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category Key</label>
                    <input
                      className="form-input"
                      value={categoryForm.value}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g. road"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category Label</label>
                    <input
                      className="form-input"
                      value={categoryForm.label}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g. 🛣️ Road & Pavement"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Short description of the category"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={categoryForm.status}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {formError && (
                    <div style={{ color: 'var(--danger)', marginBottom: 14 }}>{formError}</div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveCategory} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Category'}
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

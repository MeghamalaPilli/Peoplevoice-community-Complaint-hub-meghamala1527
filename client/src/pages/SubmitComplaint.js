import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MdCloudUpload, MdMyLocation, MdClose, MdAutoFixHigh } from 'react-icons/md';

const CATEGORIES = [
  { value: 'road', label: '🛣️ Road & Pavement' },
  { value: 'water', label: '💧 Water Supply' },
  { value: 'electricity', label: '⚡ Electricity' },
  { value: 'sanitation', label: '🗑️ Sanitation & Waste' },
  { value: 'sewage', label: '🚰 Sewage & Drainage' },
  { value: 'public_transport', label: '🚌 Public Transport' },
  { value: 'parks', label: '🌳 Parks & Gardens' },
  { value: 'noise', label: '🔊 Noise Pollution' },
  { value: 'animals', label: '🐕 Stray Animals' },
  { value: 'other', label: '📋 Other' },
];

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
  if (!user) return;

  setForm(prev => ({
    ...prev,
    villageName: user.villageName || "",
    mandal: user.mandal || "",
    locationAddress: user.address || "",
    pincode: user.pincode || ""
  }));
}, [user]);
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [dupWarning, setDupWarning] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  const [form, setForm] = useState({
  title: '',
  description: '',
  category: '',
  villageName: '',
  mandal: '',
  district: '',
  state: '',
  locationAddress: '',
  pincode: '',
});

useEffect(() => {
  if (!user) return;

  setForm(prev => ({
    ...prev,
    villageName: user.villageName || "",
    mandal: user.mandal || "",
    district: user.district || "",
    state: user.state || "",  
    locationAddress: user.address || "",
    pincode: user.pincode || ""
  }));
}, [user]);

useEffect(() => {
  if (!form.pincode || form.pincode.length !== 6) return;

  const fetchLocation = async () => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${form.pincode}`
      );

      const data = await res.json();

      if (
        data[0].Status === "Success" &&
        data[0].PostOffice.length
      ) {
        const office = data[0].PostOffice[0];

        setForm(prev => ({
          ...prev,
          district: office.District || "",
          state: office.State || ""
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  fetchLocation();
}, [form.pincode]);


  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const detectCategory = async () => {
    if (!form.title && !form.description) return;
    setAiLoading(true);
    try {
      const res = await API.post('/complaints/detect-category', { title: form.title, description: form.description });
      setAiResult(res.data);
      if (res.data.confidence > 40) {
        setForm(p => ({ ...p, category: res.data.category }));
        toast.success(`AI detected: ${res.data.category} (${res.data.confidence}% confidence)`);
      }
    } catch {} finally { setAiLoading(false); }
  };

  const handleGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        toast.success('Location captured!');
        setGpsLoading(false);
      },
      err => { toast.error('Could not get location'); setGpsLoading(false); }
    );
  };

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 5 - images.length);
    const withPreviews = arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(p => [...p, ...withPreviews]);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      return toast.error('Title, description, and category are required');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      images.forEach(img => fd.append('images', img.file));

      const res = await API.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.duplicateWarning) setDupWarning(res.data.duplicateWarning);
      toast.success('Complaint submitted successfully!');
      navigate(`/complaint/${res.data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };
const wordCount = form.description
  .trim()
  .split(/\s+/)
  .filter(word => word.length > 0).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Submit Complaint" />
        <div className="page-content" style={{ maxWidth: 800 }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">New Complaint</h1>
              <p className="page-subtitle">Describe your civic issue and we'll route it to the right president</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>📋 Complaint Details</h3>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" placeholder="Brief summary of the issue" value={form.title} onChange={handleChange}
                  onBlur={detectCategory} required />
              </div>

              <textarea
  className="form-textarea"
  name="description"
  placeholder="Describe the issue in detail..."
  value={form.description}
  onChange={handleChange}
  onFocus={() => setDescriptionTouched(true)}
  onBlur={detectCategory}
  required
  style={{ minHeight: 140 }}
/>
{descriptionTouched && wordCount < 20 && (
  <p
    style={{
      color: "red",
      fontSize: "13px",
      marginTop: "6px",
      fontWeight: "500"
    }}
  >
    Please enter at least 30-40 words. ({wordCount})
  </p>
)}              {aiResult && (
                <div className="ai-chip" style={{ marginBottom: 12 }}>
                  <MdAutoFixHigh />
                  AI Detected: <strong>{aiResult.category}</strong> ({aiResult.confidence}% confidence)
                  {aiLoading && ' — detecting...'}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>📍 Location</h3>
                <div className="grid-2">
    <div className="form-group">
  <label className="form-label">Village Name</label>

  <input
    className="form-input"
    value={form.villageName}
    readOnly
  />
</div>

    <div className="form-group">
      <label className="form-label">Mandal *</label>
      <input
        className="form-input"
        name="mandal"
        value={form.mandal}
        onChange={handleChange}
        placeholder="Enter Mandal"
        required
      />
    </div>
  </div>

  <div className="grid-2">
    <div className="form-group">
      <label className="form-label">District *</label>
      <input
        className="form-input"
        name="district"
        value={form.district}
        onChange={handleChange}
        placeholder="Enter District"
        required
      />
    </div>

    <div className="form-group">
      <label className="form-label">State *</label>
      <input
        className="form-input"
        name="state"
        value={form.state}
        onChange={handleChange}
        placeholder="Enter State"
        required
      />
    </div>
  </div>

 <div className="form-group">
  <label className="form-label">Address</label>

  <textarea
    className="form-textarea"
    value={form.locationAddress}
    rows={3}
    readOnly
  />
</div>
<div className="form-group">
  <label className="form-label">PIN Code</label>

  <input
    className="form-input"
    value={form.pincode}
    readOnly
  />
</div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleGPS} disabled={gpsLoading}>
                <MdMyLocation /> {gpsLoading ? 'Getting location...' : 'Use My GPS Location'}
              </button>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>📸 Upload Images (up to 5)</h3>
              <div
                className={`image-upload-area ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              >
                <div className="upload-icon"><MdCloudUpload /></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Drag & drop or click to upload images</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>JPEG, PNG, WebP — max 10MB each</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} />
              </div>

              {images.length > 0 && (
                <div className="image-grid" style={{ marginTop: 16 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img.preview} alt="" className="image-thumb" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                      >
                        <MdClose size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {dupWarning && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                ⚠️ {dupWarning} — Your complaint has still been submitted.
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : '🚀 Submit Complaint'}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/citizen')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;

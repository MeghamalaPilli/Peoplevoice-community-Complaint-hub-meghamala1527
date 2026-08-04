import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import { toast } from "react-hot-toast";

const AddPresidentModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    villageId: ""
  });

  useEffect(() => {
    if (open) {
      fetchVillages();
    }
  }, [open]);

  const fetchVillages = async () => {
    try {
      const res = await API.get("/superadmin/villages");

      setVillages(res.data.villages || []);
    } catch (err) {
      toast.error("Unable to load villages");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.villageId
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post(
        "/superadmin/presidents",
        formData
      );

      toast.success("President created successfully");

      setFormData({
        name: "",
        email: "",
        phone: "",
        villageId: ""
      });

      onSuccess();

      onClose();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
          "Unable to create president"
      );

    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add President</h2>

        <div className="form-group">
          <label>President Name</label>
          <input
            className="form-input"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-input"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            className="form-input"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Village</label>
          <select
            className="form-input"
            name="villageId"
            value={formData.villageId}
            onChange={handleChange}
          >
            <option value="">Select Village</option>
            {villages.map((village) => (
              <option key={village._id} value={village._id}>
                {village.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create President"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPresidentModal;
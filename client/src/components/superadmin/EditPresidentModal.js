import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import { toast } from "react-hot-toast";

const EditPresidentModal = ({
  open,
  onClose,
  president,
  onSuccess
}) => {

  const [loading, setLoading] = useState(false);

  const [villages, setVillages] = useState([]);
  useEffect(() => {
    if (open) {
      loadVillages();
    }
  }, [open]);

const loadVillages = async () => {
    try {
        const res = await API.get("/superadmin/villages");
        setVillages(res.data.villages || []);
    } catch (err) {
        console.error(err);
    }
};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    villageId: "",
    isActive: true
  });


  useEffect(() => {

  if (president) {

    setFormData({
      name: president.name || "",
      email: president.email || "",
      phone: president.phone || "",

      villageId:
        president.villageId?._id ||
        president.villageId ||
        "",

      isActive: president.isActive
    });

  }

}, [president]);


  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "isActive") {
      value = value === "false" ? false : value === "true" ? true : value;
    }

    setFormData({
      ...formData,
      [e.target.name]: value
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

      await API.put(
        `/superadmin/presidents/${president._id}`,
        formData
      );

      toast.success("President updated successfully");

      onSuccess();

      onClose();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Unable to update president"
      );

    } finally {

      setLoading(false);

    }

  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit President</h2>

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

        <div className="form-group">
          <label>Status</label>
          <select
            className="form-input"
            name="isActive"
            value={formData.isActive ? "true" : "false"}
            onChange={handleChange}
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update President"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPresidentModal;
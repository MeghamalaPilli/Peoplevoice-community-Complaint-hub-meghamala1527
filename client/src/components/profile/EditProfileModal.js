import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
const EditProfileModal = ({ onClose, user, onUpdated }) => {
    const { updateUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    villageName: "",
    mandal: "",
    wardNumber: "",
    pincode: "",
    address: ""
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        villageName: user.villageName || "",
        mandal: user.mandal || "",
        wardNumber: user.wardNumber || "",
        pincode: user.pincode || "",
        address: user.address || ""
      });
    }
  }, [user]);
const saveProfile = async () => {
  try {
    const res = await API.put("/auth/profile", form);

    updateUser(res.data.user);

    toast.success(res.data.message);

    if (onUpdated) {
      onUpdated(res.data.user);
    }

    onClose();

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Unable to update profile"
    );

  }
};
  return (
    <div className="modal-overlay">

      <div className="modal-content">

  <h2 style={{ marginBottom: 25 }}>
    Edit Profile
  </h2>

  <div className="form-group">
    <label>Full Name</label>
    <input
      className="form-control"
      value={form.name}
      onChange={(e) =>
        setForm({ ...form, name: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Phone</label>
    <input
      className="form-control"
      value={form.phone}
      onChange={(e) =>
        setForm({ ...form, phone: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Village</label>
    <input
      className="form-control"
      value={form.villageName}
      onChange={(e) =>
        setForm({
          ...form,
          villageName: e.target.value,
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Mandal</label>
    <input
      className="form-control"
      value={form.mandal}
      onChange={(e) =>
        setForm({
          ...form,
          mandal: e.target.value,
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Ward Number</label>
    <input
      className="form-control"
      value={form.wardNumber}
      onChange={(e) =>
        setForm({
          ...form,
          wardNumber: e.target.value,
        })
      }
    />
  </div>

  <div className="form-group">
    <label>PIN Code</label>
    <input
      className="form-control"
      value={form.pincode}
      onChange={(e) =>
        setForm({
          ...form,
          pincode: e.target.value,
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Address</label>
    <textarea
      className="form-control"
      rows={3}
      value={form.address}
      onChange={(e) =>
        setForm({
          ...form,
          address: e.target.value,
        })
      }
    />

  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 25
    }}
  >

    <button
      className="btn btn-secondary"
      onClick={onClose}
    >
      Cancel
    </button>

   <button
  className="btn btn-primary"
  onClick={saveProfile}
>
  Save Changes
</button>

  </div>

</div>

    </div>
  );
};

export default EditProfileModal;
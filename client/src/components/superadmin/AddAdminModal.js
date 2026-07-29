import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

const AddAdminModal = ({ onClose, onSuccess }) => {

    const [villages, setVillages] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        villageId: "",
        villageName: "",
        mandal: "",
        pincode: "",
        wardNumber: ""
    });

    useEffect(() => {

        loadVillages();

    }, []);

    const loadVillages = async () => {

        try {

            const res = await API.get("/superadmin/villages");

            setVillages(res.data.villages);

        } catch {

            toast.error("Unable to load villages");

        }

    };

    const createAdmin = async () => {

    try {

        await API.post("/superadmin/admins", {

            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            villageId: form.villageId

        });

        toast.success("Village Admin created successfully");

        onSuccess();

        onClose();

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to create admin"
        );

    }

};

   return (
  <div className="modal-overlay">
    <div className="modal-content">

      <h2>Add Village Admin</h2>
   
   <div className="form-group">
    <label>Name</label>

    <input
        className="form-input"
        value={form.name}
        onChange={(e)=>
            setForm({
                ...form,
                name:e.target.value
            })
        }
    />
</div>
<div className="form-group">
    <label>Email</label>

    <input
        type="email"
        className="form-input"
        value={form.email}
        onChange={(e)=>
            setForm({
                ...form,
                email:e.target.value
            })
        }
    />
</div>
<div className="form-group">
    <label>Phone</label>

    <input
        className="form-input"
        value={form.phone}
        onChange={(e)=>
            setForm({
                ...form,
                phone:e.target.value
            })
        }
    />
</div>

      {/* Village */}
      <div className="form-group">
        <label className="form-label">
          Village
        </label>

        <select
          className="form-input"
          value={form.villageId}
          onChange={(e) => {

            const village = villages.find(
              v => v._id === e.target.value
            );

            if (!village) return;

            setForm({
              ...form,
              villageId: village._id,
              villageName: village.name,
              mandal: village.mandal,
              pincode: village.pincode
            });

          }}
        >
            <div className="form-group">
  <label className="form-label">
    Full Name
  </label>

  <input
    className="form-input"
    value={form.name}
    onChange={(e)=>
      setForm({
        ...form,
        name:e.target.value
      })
    }
  />
</div>
<div className="form-group">
  <label className="form-label">
    Email
  </label>

  <input
    type="email"
    className="form-input"
    value={form.email}
    onChange={(e)=>
      setForm({
        ...form,
        email:e.target.value
      })
    }
  />
</div>
<div
  style={{
    display:"flex",
    justifyContent:"flex-end",
    gap:10,
    marginTop:25
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
    onClick={createAdmin}
>
    Create Admin
</button>

</div>
          <option value="">Select Village</option>

          {villages.map(v => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}

        </select>
      </div>

      {/* Mandal */}
      <div className="form-group">
        <label className="form-label">
          Mandal
        </label>

        <input
          className="form-input"
          value={form.mandal}
          disabled
        />
      </div>

      {/* Pincode */}
      <div className="form-group">
        <label className="form-label">
          Pincode
        </label>

        <input
          className="form-input"
          value={form.pincode}
          disabled
        />
      </div>
      <div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20
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
        onClick={createAdmin}
    >
        Save
    </button>

</div>

    </div>
  </div>
);
};
export default AddAdminModal;
import { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

const AddVillageModal = ({
    village,
    onClose,
    onSuccess
}) => {

    const [form, setForm] = useState({
        name: "",
        mandal: "",
        district: "",
        pincode: ""
    });
    useEffect(() => {

    if (village) {

        setForm({
            name: village.name,
            mandal: village.mandal,
            district: village.district,
            pincode: village.pincode
        });

    }

}, [village]);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const saveVillage = async () => {

        try {

           if (village) {

    await API.put(
        `/superadmin/villages/${village._id}`,
        form
    );

    toast.success("Village updated");

} else {

    await API.post(
        "/superadmin/villages",
        form
    );

    toast.success("Village added");

}

onSuccess();

onClose();

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to add village"
            );

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal-content">

                <h2>
    {village ? "Edit Village" : "Add Village"}
</h2>

                <div className="form-group">
  <label className="form-label">Village Name</label>
  <input
    className="form-input"
    name="name"
    value={form.name}
    onChange={handleChange}
    placeholder="Enter village name"
    required
  />
</div>

<div className="form-group">
  <label className="form-label">Mandal</label>
  <input
    className="form-input"
    name="mandal"
    value={form.mandal}
    onChange={handleChange}
    placeholder="Enter mandal"
    required
  />
</div>

<div className="form-group">
  <label className="form-label">District</label>
  <input
    className="form-input"
    name="district"
    value={form.district}
    onChange={handleChange}
    placeholder="Enter district"
    required
  />
</div>

<div className="form-group">
  <label className="form-label">Pincode</label>
  <input
    className="form-input"
    name="pincode"
    value={form.pincode}
    onChange={handleChange}
    placeholder="Enter pincode"
    required
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
                        onClick={saveVillage}
                    >
                        {village ? "Update Village" : "Add Village"}
                    </button>

                </div>

            </div>

        </div>

    );

};

export default AddVillageModal;
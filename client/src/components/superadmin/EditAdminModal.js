import { useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

const EditAdminModal = ({ admin, onClose, onSuccess }) => {

    const [form, setForm] = useState({

        name: admin.name,
        phone: admin.phone

    });

    const updateAdmin = async () => {

        try {

            await API.put(
                `/superadmin/admins/${admin._id}`,
                form
            );

            toast.success("Admin updated");

            onSuccess();

            onClose();

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to update admin"
            );

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal-content">

                <h2>Edit Village Admin</h2>

                <div className="form-group">

                    <label className="form-label">
                        Name
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
                        Phone
                    </label>

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

                <div
                    style={{
                        display:"flex",
                        justifyContent:"flex-end",
                        gap:10
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
                        onClick={updateAdmin}
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );

};

export default EditAdminModal;
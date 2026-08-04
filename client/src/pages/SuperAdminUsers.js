import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import API from "../utils/api";
import toast from "react-hot-toast";
import EditAdminModal from "../components/superadmin/EditAdminModal";

import AddAdminModal from "../components/superadmin/AddAdminModal";

const SuperAdminUsers = () => {

    const [admins,setAdmins]=useState([]);
    const [editAdmin, setEditAdmin] = useState(null);
    const [showModal,setShowModal]=useState(false);
    const [resendingId, setResendingId] = useState(null);

    const fetchAdmins=async()=>{

        try{

            const res=await API.get("/superadmin/admins");

            setAdmins(res.data.admins);

        }
        catch(err){

            toast.error("Unable to load admins");

        }

    };

    useEffect(()=>{

        fetchAdmins();

    },[]);

    const toggleStatus = async(id)=>{

    try{

        await API.patch(
            `/superadmin/admins/${id}/status`
        );

        toast.success("Status Updated");

        fetchAdmins();

    }
    catch(err){

        toast.error(
            err.response?.data?.message ||
            "Unable to update status"
        );

    }

};

const resendEmail = async (admin) => {
    try {
        setResendingId(admin._id);
        await API.post(`/superadmin/admins/${admin._id}/resend-email`);
        toast.success("Email resent successfully");
    } catch (err) {
        toast.error(
            err.response?.data?.message ||
            "Unable to resend email"
        );
    } finally {
        setResendingId(null);
    }
};
const deleteAdmin = async (id) => {

    const ok = window.confirm(
        "Are you sure you want to delete this Village Admin?"
    );

    if (!ok) return;

    try {

        await API.delete(`/superadmin/admins/${id}`);

        toast.success("Village Admin deleted");

        fetchAdmins();

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to delete admin"
        );

    }

};
const impersonateAdmin = async (admin) => {

    try {

        const res = await API.post(
            `/superadmin/admins/${admin._id}/impersonate`
        );

        // Save Super Admin token only once
        if (!localStorage.getItem("originalToken")) {

            localStorage.setItem(
                "originalToken",
                localStorage.getItem("token")
            );

        }

        localStorage.setItem(
            "impersonating",
            "true"
        );

        // Switch AuthContext to Admin
        await impersonateLogin(res.data.token);

        toast.success(`Logged in as ${admin.name}`);

        window.location.replace("/admin");

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to login as admin"
        );

    }

};
const returnToSuperAdmin = () => {

    const original = localStorage.getItem("originalToken");

    localStorage.setItem("token", original);

    localStorage.removeItem("originalToken");

    window.location = "/superadmin";

};
const { impersonateLogin } = useAuth();
    return(

        <div className="app-layout">

            <Sidebar/>

            <div className="main-content">

                <Topbar title="Village Admins"/>

                <div className="page-content">

                    <div
                        style={{
                            display:"flex",
                            justifyContent:"space-between",
                            marginBottom:20
                        }}
                    >

                        <h2>Village Admins</h2>

                        <button
                            className="btn btn-primary"
                            onClick={()=>setShowModal(true)}
                        >

                            + Add Admin

                        </button>

                    </div>

                    <table className="table">

                        <thead>

                            <tr>

                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Village</th>
                                <th>Mandal</th>
                                <th>Status</th>
                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                admins.map(admin=>(

<tr key={admin._id}>

    <td>{admin.name}</td>

    <td>{admin.email}</td>
    <td>{admin.phone}</td>

    <td>{admin.villageName}</td>

    <td>{admin.mandal}</td>

    <td>
        <span
            className={
                admin.isActive
                    ? "status-badge status-active"
                    : "status-badge status-closed"
            }
        >
            {admin.isActive ? "Active" : "Disabled"}
        </span>
    </td>

   <td>
    <div
        style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center"
        }}
    >
        <button
            className="btn btn-secondary"
            onClick={() => setEditAdmin(admin)}
        >
            Edit
        </button>

        <button
            className="btn btn-warning"
            onClick={() => toggleStatus(admin._id)}
        >
            {admin.isActive ? "Disable" : "Enable"}
        </button>

        <button
            className="btn btn-danger"
            onClick={() => deleteAdmin(admin._id)}
        >
            Delete
        </button>

        <button
            className="btn btn-primary"
            onClick={() => impersonateAdmin(admin)}
        >
            Login
        </button>
        <button
            className="btn btn-info"
            onClick={() => resendEmail(admin)}
            disabled={resendingId === admin._id}
        >
            {resendingId === admin._id ? "Sending..." : "Resend Email"}
        </button>
    </div>
</td>

</tr>

                                ))

                            }

                        </tbody>

                    </table>

                </div>

            </div>

                       {
                showModal && (
                    <AddAdminModal
                        onClose={() => setShowModal(false)}
                        onSuccess={fetchAdmins}
                    />
                )
            }

            {
                editAdmin && (
                    <EditAdminModal
                        admin={editAdmin}
                        onClose={() => setEditAdmin(null)}
                        onSuccess={fetchAdmins}
                    />
                )
            }

        </div>

    );

};

export default SuperAdminUsers;
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import API from "../utils/api";
import toast from "react-hot-toast";
import EditPresidentModal from "../components/superadmin/EditPresidentModal";
import AddPresidentModal from "../components/superadmin/AddPresidentModal";

const SuperAdminPresidents = () => {

    const [presidents, setPresidents] = useState([]);
    const [editPresident, setEditPresident] = useState(null);
    const [showModal,setShowModal]=useState(false);

    const fetchPresidents=async()=>{

        try{

            const res=await API.get("/superadmin/presidents");

            setPresidents(res.data.presidents);

        }
        catch(err){

            toast.error("Unable to load presidents");

        }

    };

    useEffect(()=>{

        fetchPresidents();

    },[]);

    const toggleStatus = async(id)=>{

    try{

        await API.patch(
            `/superadmin/presidents/${id}/status`
        );

        toast.success("Status Updated");

        fetchPresidents();

    }
    catch(err){

        toast.error(
            err.response?.data?.message ||
            "Unable to update status"
        );

    }

};
const deletePresident = async (id) => {

    const ok = window.confirm(
       "Are you sure you want to delete this President?"
    );

    if (!ok) return;

    try {

        await API.delete(`/superadmin/presidents/${id}`);

        toast.success("President deleted");

        fetchPresidents();

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to delete president"
        );

    }

};
const impersonatePresident = async (president) => {

    try {

        const res = await API.post(
            `/superadmin/presidents/${president._id}/impersonate`
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

        toast.success(`Logged in as ${president.name}`);

        window.location.replace("/president");

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to login as president"
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

                <Topbar title="President Management" />

                <div className="page-content">

                    <div
                        style={{
                            display:"flex",
                            justifyContent:"space-between",
                            marginBottom:20
                        }}
                    >

                        <h2>President Management</h2>

                        <button
                            className="btn btn-primary"
                            onClick={()=>setShowModal(true)}
                        >

                            + Add President

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

                                presidents.map(president=>(

<tr key={president._id}>

    <td>{president.name}</td>

    <td>{president.email}</td>
    <td>{president.phone}</td>

    <td>{president.villageName}</td>

    <td>{president.mandal}</td>

    <td>
        <span
            className={
                president.isActive
                    ? "status-badge status-active"
                    : "status-badge status-closed"
            }
        >
            {president.isActive ? "Active" : "Disabled"}
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
            onClick={() =>setEditPresident(president)}
        >
            Edit
        </button>

        <button
            className="btn btn-warning"
            onClick={() => toggleStatus(president._id)}
        >
            {president.isActive ? "Disable" : "Enable"}
        </button>

        <button
            className="btn btn-danger"
            onClick={() => deletePresident(president._id)}
        >
            Delete
        </button>

        <button
            className="btn btn-primary"
            onClick={() => impersonatePresident(president)}
        >
            Login
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
                    <AddPresidentModal
                        open={showModal}
                        onClose={() => setShowModal(false)}
                        onSuccess={fetchPresidents}
                    />
                )
            }

            {
                editPresident && (
                    <EditPresidentModal
                        open={Boolean(editPresident)}
                        president={editPresident}
                        onClose={() => setEditPresident(null)}
                        onSuccess={fetchPresidents}
                    />
                )
            }

        </div>

    );

};

export default SuperAdminPresidents;
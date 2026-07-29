import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";

const SuperAdminDashboard = () => {

    return (

        <div className="app-layout">

            <Sidebar />

            <div className="main-content">

                <Topbar title="Super Admin Dashboard" />

                <div className="page-content">
<div className="grid-4">

    <div
        className="card"
        onClick={() => window.location="/superadmin/villages"}
    >
        <h3>🏘 Manage Villages</h3>
    </div>

    <div
    className="card"
    onClick={() => window.location = "/superadmin/users"}
    style={{ cursor: "pointer" }}
>
    <h3>👨 Village Admins</h3>
</div>

    <div className="card">
        <h3>👑 Presidents</h3>
    </div>

    <div className="card">
        <h3>📊 Analytics</h3>
    </div>

</div>
                </div>

            </div>

        </div>

    );

};

export default SuperAdminDashboard;
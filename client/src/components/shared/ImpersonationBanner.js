import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";
import toast from "react-hot-toast";

const ImpersonationBanner = () => {

    const navigate = useNavigate();
    const { impersonateLogin } = useAuth();

    const returnToSuperAdmin = async () => {

        try {

            // remove impersonation session
            await API.post("/superadmin/stop-impersonation");

            const originalToken =
                localStorage.getItem("originalToken");

            if (!originalToken) {

                toast.error("Original session not found");

                return;

            }

            await impersonateLogin(originalToken);

            localStorage.removeItem("originalToken");
            localStorage.removeItem("impersonating");

            toast.success("Returned to Super Admin");

            navigate("/superadmin");

        } catch (err) {

            toast.error("Unable to return");

        }

    };

    if (localStorage.getItem("impersonating") !== "true")
        return null;

    return (

        <div
            style={{
                background: "#fff3cd",
                borderBottom: "1px solid #ffe69c",
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 600
            }}
        >

            <div>

                🟨 You are currently impersonating a Village Admin

            </div>

            <button
                className="btn btn-primary"
                onClick={returnToSuperAdmin}
            >

                Return to Super Admin

            </button>

        </div>

    );

};

export default ImpersonationBanner;
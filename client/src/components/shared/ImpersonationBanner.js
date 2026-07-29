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
      marginBottom: "24px",
      padding: "18px 22px",
      borderRadius: "16px",
      background: "rgba(255, 193, 7, 0.12)",
      border: "1px solid rgba(255,193,7,.35)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backdropFilter: "blur(12px)"
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}
    >
      <span style={{ fontSize: 24 }}>🛡️</span>

      <div>

        <div
          style={{
            fontWeight: 700,
            color: "#FFD166",
            fontSize: "16px"
          }}
        >
          Super Admin Impersonation Mode
        </div>

        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px"
          }}
        >
          You are currently working as a Village Admin.
        </div>

      </div>

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
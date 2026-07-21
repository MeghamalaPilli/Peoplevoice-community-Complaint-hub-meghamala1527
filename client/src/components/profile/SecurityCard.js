import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  FaDesktop,
  FaSignOutAlt,
  FaLaptop,
  FaMobileAlt
} from "react-icons/fa";

const SecurityCard = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const [sessions, setSessions] = useState([]);
const [loadingSessions, setLoadingSessions] = useState(false);

const updatePassword = async () => {

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (!otp) {
    toast.error("Enter OTP");
    return;
  }

  try {
    setLoading(true);

    const res = await API.put(
      "/auth/change-password/verify",
      {
        currentPassword,
        newPassword,
        otp,
      }
    );

    toast.success(res.data.message);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);

  } catch (err) {
    toast.error(
      err.response?.data?.message || "Password update failed"
    );
  } finally {
    setLoading(false);
  }
};
  const sendOTP = async () => {
    if (!currentPassword) {
      return toast.error("Enter current password");
    }

    setLoading(true);

    try {
      await API.post("/auth/request-change-password-otp", {
        currentPassword,
      });

      toast.success("OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }

    setLoading(false);
  };

  const loadSessions = async () => {
  try {

    setLoadingSessions(true);

    const res = await API.get("/auth/sessions");

    setSessions(res.data.sessions);

  } catch (err) {

    toast.error("Unable to load active devices");

  } finally {

    setLoadingSessions(false);

  }
};

const logoutOtherDevices = async () => {

  if (!window.confirm("Logout from all other devices?")) {
    return;
  }

  try {

    await API.delete("/auth/sessions/logout-others");

    toast.success("Other devices logged out");

    loadSessions();

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Unable to logout devices"
    );

  }

};

useEffect(() => {
  loadSessions();
}, []);
const logoutSingleDevice = async (id) => {

  if (!window.confirm("Logout this device?")) {
    return;
  }

  try {

    await API.delete(`/auth/sessions/${id}`);

    toast.success("Device logged out");

    loadSessions();

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Unable to logout device"
    );

  }

};

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 25 }}>
        Security Information
      </h3>

      <div className="form-group">
        <label>Current Password</label>
        <input
            type={showCurrent ? "text" : "password"}
          className="form-control"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Password</label>
        <input
            type={showCurrent ? "text" : "password"}
          className="form-control"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
        <input
            type={showCurrent ? "text" : "password"}
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {!otpSent ? (
        <button
          className="btn btn-primary"
          onClick={sendOTP}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <>
          <div
            className="form-group"
            style={{ marginTop: 20 }}
          >
            <label>Email OTP</label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            className="btn btn-success"
            onClick={updatePassword}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </>
      )}
      <hr style={{ margin: "35px 0" }} />

<h3 style={{ marginBottom: 20 }}>
  Active Devices
</h3>

<button
  className="btn btn-danger"
  style={{ marginBottom: 20 }}
  onClick={logoutOtherDevices}
>
  <FaSignOutAlt />
  &nbsp; Logout Other Devices
</button>

{loadingSessions ? (

  <p>Loading devices...</p>

) : (

  sessions.map((session) => (

    <div
      key={session._id}
      className="card"
      style={{
        marginBottom: 15,
        padding: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >

      <div>

        <h4 style={{ marginBottom: 5 }}>

          {session.device === "Desktop"
            ? <FaDesktop />
            : <FaMobileAlt />
          }

          {" "}

          {session.browser}

        </h4>

        <p
          style={{
            color: "#888",
            marginBottom: 5
          }}
        >
          {session.os}
        </p>

        <small>

          IP : {session.ip}

          <br />

          Last Active :
          {" "}
          {new Date(session.lastActive).toLocaleString()}

        </small>

      </div>

 <div style={{ textAlign: "right" }}>

  {session.isCurrent ? (

    <span
      style={{
        background: "#10b981",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 13
      }}
    >
      Current Device
    </span>

  ) : (

    <button
      className="btn btn-danger"
      onClick={() => logoutSingleDevice(session._id)}
    >
      Logout
    </button>

  )}

</div>

    </div>

  ))

)}

    </div>
  );
};

export default SecurityCard;
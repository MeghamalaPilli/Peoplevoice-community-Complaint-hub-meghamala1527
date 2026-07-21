import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOTP = async () => {
    try {
      const res = await axios.post("/api/auth/request-reset-otp", {
        email,
      });

      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send OTP"
      );
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post("/api/auth/verify-reset-otp", {
        email,
        otp,
      });

      toast.success(res.data.message);
      setStep(3);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP"
      );
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.put("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to reset password"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>

              <input
                className="form-input"
                type="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={sendOTP}
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">
                Enter OTP
              </label>

              <input
                className="form-input"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={verifyOTP}
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="form-group">
              <label className="form-label">
                New Password
              </label>

              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password
              </label>

              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={resetPassword}
            >
              Reset Password
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
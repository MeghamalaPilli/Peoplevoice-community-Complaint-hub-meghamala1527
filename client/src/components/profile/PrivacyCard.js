import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

const PrivacyCard = () => {

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    emailNotifications: true,
    grievanceNotifications: true,
    announcementNotifications: true,
    dataConsent: true,
  });

  const [loading, setLoading] = useState(false);

  const loadPrivacy = async () => {
    try {

      const res = await API.get("/auth/privacy");

      setPrivacy(res.data.privacy);

    } catch (err) {

      toast.error("Unable to load privacy settings");

    }
  };

  useEffect(() => {
    loadPrivacy();
  }, []);

  const handleChange = (e) => {

    const { name, checked, value, type } = e.target;

    setPrivacy((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

  };

  const savePrivacy = async () => {

    try {

      setLoading(true);

      const res = await API.put(
        "/auth/privacy",
        privacy
      );

      toast.success(res.data.message);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Unable to save settings"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="card" style={{ marginBottom: 20 }}>

      <h3 style={{ marginBottom: 25 }}>
        Privacy Information
      </h3>

      <div className="form-check">
        <input
          type="checkbox"
          name="showEmail"
          checked={privacy.showEmail}
          onChange={handleChange}
        />
        {" "}
        Show Email Address
      </div>

      <div className="form-check">
        <input
          type="checkbox"
          name="showPhone"
          checked={privacy.showPhone}
          onChange={handleChange}
        />
        {" "}
        Show Phone Number
      </div>

      <div className="form-check">
        <input
          type="checkbox"
          name="emailNotifications"
          checked={privacy.emailNotifications}
          onChange={handleChange}
        />
        {" "}
        Email Notifications
      </div>

      <div className="form-check">
        <input
          type="checkbox"
          name="grievanceNotifications"
          checked={privacy.grievanceNotifications}
          onChange={handleChange}
        />
        {" "}
        Grievance Notifications
      </div>

      <div className="form-check">
        <input
          type="checkbox"
          name="announcementNotifications"
          checked={privacy.announcementNotifications}
          onChange={handleChange}
        />
        {" "}
        Announcement Notifications
      </div>

      <div className="form-check">
        <input
          type="checkbox"
          name="dataConsent"
          checked={privacy.dataConsent}
          onChange={handleChange}
        />
        {" "}
        Allow CivicSense to store my data
      </div>

      <div style={{ marginTop: 20 }}>

        <label>Profile Visibility</label>

        <select
          className="form-control"
          name="profileVisibility"
          value={privacy.profileVisibility}
          onChange={handleChange}
        >
          <option value="private">
            Private
          </option>

          <option value="officials">
            Government Officials Only
          </option>

        </select>

      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 25 }}
        onClick={savePrivacy}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Privacy Settings"}
      </button>

    </div>

  );

};

export default PrivacyCard;
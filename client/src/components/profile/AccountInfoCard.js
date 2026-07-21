import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  MdEmail,
  MdBadge,
  MdCalendarToday,
  MdAccessTime
} from "react-icons/md";

const AccountInfoCard = () => {
  const { user } = useAuth();

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <h3 style={{ marginBottom: "20px" }}>
        Account Information
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "20px"
        }}
      >
        <InfoItem
          icon={<MdEmail />}
          label="Email Address"
          value={user?.email}
        />

        <InfoItem
          icon={<MdBadge />}
          label="Role"
          value={user?.role}
        />

        <InfoItem
          icon={<MdCalendarToday />}
          label="Joined On"
          value={
            user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "-"
          }
        />

        <InfoItem
          icon={<MdAccessTime />}
          label="Last Login"
          value={
            user?.lastLogin
              ? new Date(user.lastLogin).toLocaleString()
              : "First Login"
          }
        />
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      gap: "15px",
      alignItems: "flex-start"
    }}
  >
    <div
      style={{
        fontSize: "22px",
        color: "#6C63FF",
        marginTop: "3px"
      }}
    >
      {icon}
    </div>

    <div>
      <div
        style={{
          fontSize: "13px",
          color: "#888"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          marginTop: "4px",
          textTransform:
            label === "Role" ? "capitalize" : "none"
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export default AccountInfoCard;
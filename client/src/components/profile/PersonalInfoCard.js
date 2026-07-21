import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  MdPerson,
  MdPhone,
  MdLocationCity,
  MdHome,
  MdPinDrop,
  MdEdit
} from "react-icons/md";

const PersonalInfoCard = ({ onEdit }) => {
  const { user } = useAuth();

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h3>Personal Information</h3>

        <button
          className="btn btn-primary"
          onClick={onEdit}
        >
          <MdEdit /> Edit Profile
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "20px"
        }}
      >
        <InfoItem
          icon={<MdPerson />}
          label="Full Name"
          value={user?.name}
        />

        <InfoItem
          icon={<MdPhone />}
          label="Phone"
          value={user?.phone || "Not Added"}
        />

        <InfoItem
          icon={<MdLocationCity />}
          label="Village"
          value={user?.villageName || "Not Added"}
        />

        <InfoItem
          icon={<MdLocationCity />}
          label="Mandal"
          value={user?.mandal || "Not Added"}
        />

        <InfoItem
          icon={<MdLocationCity />}
          label="Ward"
          value={user?.wardNumber || "Not Added"}
        />

        <InfoItem
          icon={<MdPinDrop />}
          label="PIN Code"
          value={user?.pincode || "Not Added"}
        />

        <div style={{ gridColumn: "1 / span 2" }}>
          <InfoItem
            icon={<MdHome />}
            label="Address"
            value={user?.address || "Not Added"}
          />
        </div>
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
          marginTop: "4px"
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export default PersonalInfoCard;
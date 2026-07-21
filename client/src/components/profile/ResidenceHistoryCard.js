import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  MdLocationCity,
  MdMap,
  MdPinDrop,
  MdHome,
  MdHistory,
  MdCalendarToday
} from "react-icons/md";

const ResidenceHistoryCard = () => {
  const { user } = useAuth();

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <h3 style={{ marginBottom: "20px" }}>
        Residence History
      </h3>

      {/* Current Residence */}

      <div
        style={{
          marginBottom: "30px"
        }}
      >
        <h4
          style={{
            marginBottom: "18px",
            color: "#6C63FF",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <MdHome />
          Current Residence
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px"
          }}
        >
          <InfoItem
            icon={<MdLocationCity />}
            label="Village"
            value={user?.villageName}
          />

          <InfoItem
            icon={<MdMap />}
            label="Mandal"
            value={user?.mandal}
          />

          <InfoItem
            icon={<MdPinDrop />}
            label="Ward Number"
            value={user?.wardNumber}
          />

          <InfoItem
            icon={<MdPinDrop />}
            label="PIN Code"
            value={user?.pincode}
          />

          <div style={{ gridColumn: "1 / span 2" }}>
            <InfoItem
              icon={<MdHome />}
              label="Address"
              value={user?.address}
            />
          </div>
        </div>
      </div>

      {/* Previous Residence */}

      <h4
        style={{
          marginBottom: "18px",
          color: "#6C63FF",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <MdHistory />
        Previous Residences
      </h4>

      {user?.residenceHistory?.length > 0 ? (
        user.residenceHistory.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e8e8e8",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "18px",
              background: "#fafafa"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px"
              }}
            >
              <strong
                style={{
                  color: "#6C63FF"
                }}
              >
                Residence #{index + 1}
              </strong>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#888",
                  fontSize: "13px"
                }}
              >
                <MdCalendarToday />
                {new Date(item.changedAt).toLocaleDateString()}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "20px"
              }}
            >
              <InfoItem
                icon={<MdLocationCity />}
                label="Village"
                value={item.villageName}
              />

              <InfoItem
                icon={<MdMap />}
                label="Mandal"
                value={item.mandal}
              />

              <InfoItem
                icon={<MdPinDrop />}
                label="Ward Number"
                value={item.wardNumber}
              />

              <div style={{ gridColumn: "1 / span 2" }}>
                <InfoItem
                  icon={<MdHome />}
                  label="Address"
                  value={item.address}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "35px",
            color: "#888",
            border: "1px dashed #ddd",
            borderRadius: "12px"
          }}
        >
          <MdHistory
            size={45}
            color="#6C63FF"
            style={{ marginBottom: "10px" }}
          />

          <div
            style={{
              fontWeight: "600",
              marginBottom: "6px"
            }}
          >
            No Previous Residences
          </div>

          <div
            style={{
              fontSize: "14px"
            }}
          >
            Your previous addresses will appear here whenever you
            change your residence.
          </div>
        </div>
      )}
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
        {value || "-"}
      </div>
    </div>
  </div>
);

export default ResidenceHistoryCard;
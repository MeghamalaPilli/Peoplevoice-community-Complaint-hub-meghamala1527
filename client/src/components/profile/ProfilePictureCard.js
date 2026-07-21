import React, { useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import API, { getImageUrl } from "../../utils/api";
import toast from "react-hot-toast";

const ProfilePictureCard = () => {
  const { user } = useAuth();
  const fileRef = useRef();

  const uploadPicture = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      await API.post("/auth/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile picture updated");

      window.location.reload();
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const removePicture = async () => {
    try {
      await API.delete("/auth/profile-picture");

      toast.success("Profile picture removed");

      window.location.reload();
    } catch (err) {
      toast.error("Unable to remove");
    }
  };
console.log("Profile Picture:", user?.profilePicture);
console.log("Image URL:", getImageUrl(user?.profilePicture));

  return (
    <div className="card" style={{ marginBottom: 20 }}>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >

        {user?.profilePicture ? (
          <img
            src={`http://localhost:5000${user.profilePicture}`}
            alt=""
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #6C63FF",
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "#6C63FF",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 60,
              fontWeight: "700",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}

        <h2 style={{ marginTop: 20 }}>
          {user?.name}
        </h2>

        <p
          style={{
            color: "#777",
            marginBottom: 20,
          }}
        >
          {user?.email}
        </p>

        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*"
          onChange={uploadPicture}
        />

        <div
          style={{
            display: "flex",
            gap: "15px",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => fileRef.current.click()}
          >
            Upload Photo
          </button>

          {user?.profilePicture && (
            <button
              className="btn btn-secondary"
              onClick={removePicture}
            >
              Remove
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProfilePictureCard;
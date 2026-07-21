import React, { useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";

import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import AccountInfoCard from "../components/profile/AccountInfoCard";
import ResidenceHistoryCard from "../components/profile/ResidenceHistoryCard";
import SecurityCard from "../components/profile/SecurityCard";
import PrivacyCard from "../components/profile/PrivacyCard";
import ProfilePictureCard from "../components/profile/ProfilePictureCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import { useAuth } from "../context/AuthContext";


const Profile = () => {
  const [showEdit, setShowEdit] = useState(false);

  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Topbar title="My Profile" />

        <div className="page-content">

          <ProfilePictureCard />

          {/* Personal Information */}
          <PersonalInfoCard
  onEdit={() => setShowEdit(true)}
/>

          {/* Account Information */}
          <AccountInfoCard />

          {/* Residence History */}
          <ResidenceHistoryCard />

          {/* Security */}
          <SecurityCard />

          {/* Privacy */}
          <PrivacyCard />

        </div>
        {showEdit && (
  <EditProfileModal
    open={showEdit}
    user={user}
    onClose={() => setShowEdit(false)}
    onUpdated={() => setShowEdit(false)}
  />
)}
      </div>
    </div>
  );
};

export default Profile;
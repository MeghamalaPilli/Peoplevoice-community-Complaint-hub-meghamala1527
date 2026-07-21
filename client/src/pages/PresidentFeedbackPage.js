import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./PresidentFeedbackPage.css";

export default function PresidentFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/complaints/${id}`);
        setComplaint(res.data.complaint);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading)
    return <div className="feedback-loading">Loading...</div>;

  if (!complaint)
    return <div className="feedback-loading">Feedback not found</div>;

  const rating = complaint.feedback?.rating || 0;

  return (
    <div className="feedback-page">

      <div className="feedback-card">

        <div className="emoji">
          🎉
        </div>

        <h1>
          Citizen Appreciated Your Work
        </h1>

        <p className="subtitle">
          Your effort made a real difference in your community.
        </p>

        <div className="stars">
          {"★".repeat(rating)}
          {"☆".repeat(5-rating)}
        </div>

        <div className="rating">
          {rating}/5 Rating
        </div>

        <div className="quote">
          "
          {complaint.feedback?.comment || "Citizen submitted a positive feedback."}
          "
        </div>

        <div className="info-box">

          <div className="row">
            <span>Complaint</span>
            <strong>{complaint.title}</strong>
          </div>

          <div className="row">
            <span>Complaint ID</span>
            <strong>{complaint.complaintId}</strong>
          </div>

          <div className="row">
            <span>Citizen</span>
            <strong>{complaint.submittedBy?.name}</strong>
          </div>

        </div>

        <button
          className="view-btn"
          onClick={() => navigate(`/complaint/${complaint._id}`)}
        >
          View Complaint
        </button>

      </div>

    </div>
  );
}
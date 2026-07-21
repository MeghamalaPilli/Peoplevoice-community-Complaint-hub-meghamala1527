import React, { useState, useEffect, useRef } from 'react';
import { MdNotifications, MdClose } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.notifications?.filter(n => !n.read).length || 0);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleNotificationClick = async (notification) => {
  try {
    // Mark notification as read
    if (!notification.read) {
      await API.put(`/notifications/${notification._id}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id
            ? { ...n, read: true }
            : n
        )
      );

      setUnread(prev => Math.max(prev - 1, 0));
    }

    setShowNotifs(false);

    // Feedback notification
    if (
      notification.message.toLowerCase().includes("feedback") &&
      notification.complaintId
    ) {
      navigate(`/president/feedback/${notification.complaintId}`);
      return;
    }

    // Default notification
    if (notification.complaintId) {
      navigate(`/complaint/${notification.complaintId}`);
    }

  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <div ref={ref} style={{ position: 'relative' }}>
          <button className="notification-btn" onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) fetchNotifications(); }}>
            <MdNotifications size={20} />
            {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 11, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 15).map((n, i) => (
                  <div
  key={i}
  className={`notif-item ${!n.read ? 'unread' : ''}`}
  style={{ cursor: "pointer" }}
  onClick={() => handleNotificationClick(n)}
>
                    <div>{n.message}</div>
                    <div className="notif-time">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;

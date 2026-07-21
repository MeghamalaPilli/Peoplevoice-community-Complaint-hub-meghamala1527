# CivicPulse Project Reference Manual (SKILL.md)

This reference manual provides a detailed architectural breakdown of the **CivicPulse** project (People Voice Community Complaint System), explaining the role of each directory, file, page, and backend route in the system.

---

## 📂 Project Directory Structure

```
civicpulse/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI configuration (Test, Lint, Docker build on push)
│       └── deploy.yml          # CD configuration (SSH deployment on release)
├── nginx/
│   ├── nginx.prod.conf         # Production Nginx reverse proxy & rate-limiting config
│   └── ssl/                    # Nginx SSL certificates directory
├── client/                     # Frontend Application (React.js)
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── chatbot/        # FAQ assistant bot component
│   │   │   ├── shared/         # Sidebar navigation & Topbar headers
│   │   │   └── ui/             # Global error boundaries & loaders
│   │   ├── context/            # Auth & Real-Time Socket context state
│   │   ├── hooks/              # Custom API hooks
│   │   ├── pages/              # User-facing app pages
│   │   ├── styles/             # Global CSS design system
│   │   ├── utils/              # Axios HTTP client configuration
│   │   ├── App.js              # Application router and layout management
│   │   └── index.js            # Frontend DOM mount entrypoint
│   ├── Dockerfile              # Multi-stage production build configuration
│   ├── nginx.conf              # Client-side routing reverse-proxy configuration
│   └── package.json            # Frontend dependency manifest
├── server/                     # Backend API Application (Node.js & Express)
│   ├── config/                 # DB pooling & Logger setup
│   ├── middleware/             # Role verification & Image uploading
│   ├── models/                 # Mongoose schemas (User, Category, Complaint)
│   ├── routes/                 # Express API endpoints
│   ├── tests/                  # Automated integration tests
│   ├── utils/                  # AI category detection & Jaccard similarity helpers
│   ├── uploads/                # Local file storage for uploads (Git ignored)
│   ├── logs/                   # System log output directory (Git ignored)
│   ├── Dockerfile              # Backend container build configuration
│   ├── index.js                # Express app startup & Socket.io server logic
│   ├── seed.js                 # Seeding script to populate sample database content
│   └── package.json            # Backend dependency manifest
├── docker-compose.yml          # Multi-container local development stack configuration
├── docker-compose.prod.yml     # Multi-container production deployment config
├── Makefile                    # Automation shortcuts (run dev, tests, seeds)
├── .gitignore                  # Git exclusions definition
└── README.md                   # Setup instructions and documentation
```

---

## 🏛️ Client (Frontend) - In-Depth Analysis

### 🔑 Context Providers & Core Files
- **[App.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/App.js)**: 
  - Manages the client-side router (`react-router-dom`).
  - Implements the `<ProtectedRoute>` wrapper that restricts access based on authenticated status and specific roles (`admin`, `president`, `citizen`).
  - Loads a global floating chatbot overlay (`<Chatbot />`) on every page.
  - Controls online connectivity checking via the `OnlineStatusBanner`.
- **[index.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/index.js)**: Registers React 18's root structure, mounting the main App component into the HTML container.
- **[context/AuthContext.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/context/AuthContext.js)**: 
  - Manages global state for user authentication.
  - Stores the current user object and raw JWT token.
  - Implements methods for `login`, `register`, `logout`, and loading user sessions from localStorage.
- **[context/SocketContext.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/context/SocketContext.js)**: 
  - Initiates client Socket.io connection pointing to the backend server.
  - Automatically joins roles/user channels upon authorization (`join`, `join-admin`).
  - Captures real-time push events and alerts users dynamically using UI toast banners.

### 🖼️ Components
- **[components/chatbot/Chatbot.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/components/chatbot/Chatbot.js)**: 
  - Floating chatbot interface (`CivicBot`) providing answers to typical citizen issues.
  - Triggers preconfigured text answers on keywords like "submit", "status", "priority", "categories", "upvote".
  - Houses interactive shortcut action buttons (e.g. "Submit a Complaint Now" direct redirect).
- **[components/shared/Sidebar.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/components/shared/Sidebar.js)**:
  - Dynamically builds navigation menus based on role permissions:
    - **Citizen**: Dashboard, My Complaints, Submit Complaint.
    - **President**: Dashboard, Analytics.
    - **Admin**: Dashboard, Analytics, Manage Users, Manage Categories.
- **[components/shared/Topbar.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/components/shared/Topbar.js)**:
  - Renders top toolbar containing current page title.
  - Displays user profile options and logout triggers.
  - Integrates an interactive notifications bell dropdown matching push updates from `SocketContext`.
- **[components/ui/ErrorBoundary.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/components/ui/ErrorBoundary.js)**: Wraps routing paths to capture unexpected errors, preventing app crashes by showing a premium custom error screen.
- **[components/ui/Skeleton.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/components/ui/Skeleton.js)**: Reusable skeletons mimicking lists, cards, and tables to enhance loading states.

### 📄 Pages & Layouts
- **[pages/LoginPage.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/LoginPage.js)**:
  - Tabbed interface allowing users to switch between authentication actions (Log In vs Register).
  - Collects names, emails, passwords, phones, and role selections.
- **[pages/CitizenDashboard.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/CitizenDashboard.js)**:
  - Landing screen for logged-in citizens.
  - Summarizes complaint state statistics (Total, Pending, In Progress, Resolved).
  - Fetches the 5 most recently created issues, rendering summary status badges, categories, locations, and thumbnail images.
- **[pages/SubmitComplaint.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/SubmitComplaint.js)**:
  - Citizen complaint submission forms. Features:
    - **AI Category Auto-Detection**: Pulls content on description/title blur, calls classification endpoints, and autofills categories with estimated confidence levels.
    - **Description Word Counter**: Validates detail depth, enforcing guidelines (minimum 20-30 words).
    - **Location Tagging**: Integrates geolocation extraction (`navigator.geolocation.getCurrentPosition`) alongside manual state/district/village address fields.
    - **Drag & Drop Upload**: Supports adding up to 5 images with on-the-fly local URL preview generation and delete capabilities.
- **[pages/MyComplaints.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/MyComplaints.js)**:
  - Filterable search list allowing citizens to scroll, sort, search, and page through all their submitted complaints.
- **[pages/ComplaintDetail.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/ComplaintDetail.js)**:
  - Full details view of a single complaint. Features:
    - Interactive title, unique ticket ID, view counters, upvote buttons, and tags.
    - Clickable image thumbnails opening interactive modal view lightboxes.
    - Horizontal status milestone timeline showing history, who updated it, and notes.
    - Official response message logs.
    - Review interface: citizens can rate resolution outcomes (1-5 stars) and write comments once resolved.
- **[pages/AdminDashboard.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/AdminDashboard.js)**:
  - Core control center for administrators.
  - Lists and aggregates overall system stats (Average Resolution Times, Resolution Rates, Critical and Daily lists).
  - Shows search bars and filters for categories, status, and priorities.
  - Features a management modal allowing administrators to reassign complaints to presidents, update status logs, submit internal notes, and write official responses back to the citizen.
- **[pages/PresidentDashboard.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/PresidentDashboard.js)**:
  - Tailored console for the President role to oversee complaints within their region or department.
  - Allows managing complaint status, adding notes, and posting citizen responses.
- **[pages/ManageUsers.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/ManageUsers.js)**:
  - Admin-only user management interface.
  - Features dashboard counters tracking Citizen, President, and Admin numbers.
  - Interactive table supporting CRUD operations for system users, setting roles, blocking/activating accounts, and deleting users.
- **[pages/AnalyticsDashboard.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/AnalyticsDashboard.js)**:
  - Analytical interface mapping trends via chart libraries (`recharts`).
  - Includes charts for category distributions, monthly counts, priority splits, and average resolution speed.
- **[pages/PublicDashboard.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/PublicDashboard.js)**:
  - Unauthenticated access landing board for guest users.
  - Exposes global platform analytics charts (Category Pie chart, Location bar charts).
  - Renders a list of public complaints and provides map statistics highlighting active issue points.
- **[pages/ForgotPassword.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/ForgotPassword.js)**: Password reset request processing page.
- **[pages/NotFound.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/client/src/pages/NotFound.js)**: Landing template routing standard 404 navigation errors.

---

## ⚙️ Server (Backend) - In-Depth Analysis

### 🚀 Boot & Config Files
- **[index.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/index.js)**: 
  - Boots up the core API server (Express) and WebSockets listener (Socket.io).
  - Configures security measures (Helmet, MongoSanitize, XSS, HPP parameters).
  - Establishes API global request rate limits (300 requests / 15 mins) and strict auth route limits (20 attempts / 15 mins).
  - Connects static content delivery routes for uploads.
  - Hooks MongoDB connections with fail-soft backup behavior.
- **[config/database.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/config/database.js)**: Custom mongoose pooling configurations.
- **[config/logger.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/config/logger.js)**: Winston logging pipeline routing error alerts to rotational daily log files.

### 🛡️ Middlewares
- **[middleware/auth.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/middleware/auth.js)**: 
  - Implements JWT authentication validation checks on requests.
  - Provides the `protect` check and `authorize` middleware to restrict routes dynamically to Admin and President roles.
- **[middleware/upload.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/middleware/upload.js)**:
  - Hooks Multer parsing engine for file attachments.
  - Validates sizes (maximum 10MB) and formats (image mime-types).
  - Formats stored files with randomized UUIDs to prevent directory conflicts.

### 🗃️ Models (Mongoose Schemas)
- **[models/User.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/models/User.js)**:
  - User model schema (stores names, emails, hashed passwords, ward tags, roles, phone numbers, OTP details).
  - Implements pre-save hooks to hash password fields dynamically via `bcryptjs`.
  - Holds notification arrays (capped at a rolling queue limit of 100 entries).
- **[models/Complaint.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/models/Complaint.js)**:
  - Central schema modeling complaint data.
  - Manages statuses, categories, location coordinate markers, assigned officers, histories, upvotes, responses, and ratings.
  - Pre-save trigger checks auto-increment reference ID strings (e.g. `CMP26000001`).
  - Houses the priority score calculation logic (`calculatePriorityScore`) that updates fields automatically using keyword matching, vote tallies, and duplicate overlaps.
- **[models/Category.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/models/Category.js)**:
  - Simple schema defining categories (name, description, isActive status).

### 🛣️ Routes (API Controllers)
- **[routes/auth.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/routes/auth.js)**: Handles registration, login (JWT payload emission), session details (`/me`), details update, password updates, and notification updates.
- **[routes/complaints.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/routes/complaints.js)**: Controls citizen operations: posting issues, details views (increments view count), upvoting, category suggestion queries, and review ratings.
- **[routes/admin.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/routes/admin.js)**: Controls admin-exclusive operations: fetching all issues, status updating, officer assignments, responses, stats collection, user creation/editing/toggling, and database deletions.
- **[routes/analytics.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/routes/analytics.js)**: Collects analytics via MongoDB aggregation frameworks (monthly tracking, categories, resolution time distributions, officer performance).
- **[routes/public.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/routes/public.js)**: Guest routes to feed complaints, heatmap coordinates, and global metrics to the public board.
- **[routes/notifications.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/routes/notifications.js)**: Endpoint controls to pull or clear notifications.

### 🛠️ Backend Utilities
- **[utils/aiDetection.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/utils/aiDetection.js)**:
  - **Category Detection**: Employs keyword weight scores matching word maps (e.g. road, sanitation) to categorize complaints automatically.
  - **Priority Detection**: Matches urgency keywords to auto-assign Low/Medium/High/Critical priorities.
  - **Duplicate Detection**: Calculates text similarities using **Jaccard Similarity** (intersection over union of word tokens). Evaluates complaints submitted in the last 30 days. Warns users when overlaps exceed a similarity threshold (0.3+).
- **[utils/notifications.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/utils/notifications.js)**: Helper utility to emit Socket.io updates to connected clients.
- **[seed.js](file:///c:/Users/HP/Documents/MinorProject_CivicSense_AnjaliBhadoriya-main/MinorProject_CivicSense_AnjaliBhadoriya-main/server/seed.js)**: Populates the MongoDB instance with dummy users (Admin, President, Citizen) and sample complaints for local testing.

---

## 🔌 API Reference Map

| Component | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/register` | User Registration | Public |
| | POST | `/api/auth/login` | Session Login (emits JWT) | Public |
| | GET | `/api/auth/me` | Loaded User Profile | Authenticated |
| | PUT | `/api/auth/profile` | Update Profile Details | Authenticated |
| | PUT | `/api/auth/change-password`| Change Password | Authenticated |
| **Citizen Complaints** | POST | `/api/complaints` | File New Complaint (Uploads files) | Citizen |
| | GET | `/api/complaints/my` | List Current User's Complaints | Citizen |
| | GET | `/api/complaints/:id` | View Details / Increment View Count | Authenticated |
| | POST | `/api/complaints/:id/upvote` | Toggle Complaint Upvote | Authenticated |
| | POST | `/api/complaints/:id/feedback` | Post Star Rating & Feedback | Citizen |
| | POST | `/api/complaints/detect-category` | AI category classification helper | Authenticated |
| **Admin Operations** | GET | `/api/admin/complaints` | List All Complaints (Filterable) | Admin/President |
| | PUT | `/api/admin/complaints/:id/status` | Update Complaint Status | Admin/President |
| | PUT | `/api/admin/complaints/:id/assign` | Assign Complaint to President | Admin/President |
| | POST | `/api/admin/complaints/:id/respond` | Submit Official Response | Admin/President |
| | GET | `/api/admin/stats` | Dashboard Summary metrics | Admin/President |
| | GET | `/api/admin/presidents` | List Available Presidents | Admin/President |
| | GET | `/api/admin/users` | List Platform Users | Admin Only |
| | PUT | `/api/admin/users/:id/toggle` | Enable/Disable user account | Admin Only |
| **Analytics** | GET | `/api/analytics/monthly` | 12-Month complaint count trends | Admin/President |
| | GET | `/api/analytics/category` | Category metrics | Admin/President |
| | GET | `/api/analytics/resolution-time` | Average resolution metrics | Admin/President |
| **Public Guest** | GET | `/api/public/complaints` | Public Complaint List | Public |
| | GET | `/api/public/map-data` | Coordinates for Heatmaps | Public |
| | GET | `/api/public/stats` | Overall statistics | Public |

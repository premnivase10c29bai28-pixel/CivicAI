# CivicAI — AI-Powered Citizen Grievance & Municipal Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)](https://github.com/premnivase10c29bai28-pixel/CivicAI)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> A modern, trustworthy Indian public-service civic portal that bridges citizens and municipal administrators using multimodal AI, automated geographic triage, and verified public datasets.

---

## 🏛️ Platform Overview

**CivicAI** transforms municipal governance and public service delivery by empowering citizens to report civic grievances effortlessly while providing urban local bodies (ULBs) and zonal commissioners with AI-assisted decision support, hotspot detection, and workflow tracking.

### Key Capabilities

* **Multimodal Civic Reporting:** File grievances via audio voice recordings (Tamil & English support), photo evidence, or standard text forms.
* **Automatic AI Triage:** Classifies problem categories, extracts key infrastructure entities, assesses urgency levels (Critical, High, Medium, Low), and routes to the relevant municipal department.
* **Geospatial Intelligence & Hotspots:** Captures verified GPS coordinates, plots incidents on interactive Leaflet maps, and identifies geographic clusters and recurring infrastructure bottlenecks.
* **Municipal Decision Support:** Integrates open municipal data (e.g., Greater Chennai Corporation health centers and zonal boundaries) to assist authorities with dispatch prioritization.
* **Transparent Civic Timeline:** End-to-end complaint lifecycle tracking: `Reported` → `Under Review` → `Assigned` → `In Progress` → `Resolved`.
* **Government Portal Design Identity:** Clean Indian public-service aesthetics with Navy (`#123B63`), Blue (`#1769AA`), and Saffron accents (`#E88A1A`), adhering to WCAG 2.1 accessibility and light/dark theme modes.

---

## 📸 Core Modules

### 1. Citizen Portal (`/citizen`)
* **Dashboard:** Personal civic activity overview, quick filing shortcuts, and resolution statistics.
* **Report a Problem (`/citizen/report`):** Interactive grievance submission featuring:
  * Speech-to-text voice recorder (Tamil & English transcription)
  * Interactive map pin picker with reverse geocoding
  * Local photo evidence preview
  * Real-time AI preview of category, department, and priority
* **My Complaints (`/citizen/complaints`):** Search, filter, and track all submitted complaints with live timeline logs and feedback submission.
* **Civic Insights (`/citizen/insights`):** Locality-wide transparency metrics and resolution efficiency.

### 2. Authority Portal (`/authority`)
* **Executive Overview:** High-level municipal KPIs, pending triage counts, and SLA compliance metrics.
* **Triage & Complaints (`/authority/complaints`):** Filter by ward, department, severity, and status. Direct assignment to field engineers and status updates.
* **Civic GIS Map (`/authority/map`):** Interactive map visualizing city-wide complaint distribution and density heatmaps.
* **Civic Hotspots (`/authority/hotspots`):** AI-identified cluster zones requiring preventative municipal intervention.
* **AI Decision Support (`/authority/insights`):** Predictive advisories, seasonal trends (monsoon drainage, road wear), and resource allocation recommendations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, Vite, React Router v7, Vanilla CSS (Government Design System) |
| **Icons & Visuals** | Lucide React, SVG vector emblem |
| **Maps & GIS** | Leaflet, React-Leaflet, OpenStreetMap |
| **Data Visualization** | Recharts |
| **Authentication & Database** | Firebase Authentication, Firebase Cloud Firestore |
| **AI / Machine Learning** | Google Gemini API, Audio Speech-to-Text, NLP Classifier |
| **Backend API** | Node.js, Express, CORS |

---

## 📂 Project Structure

```text
CivicAI/
├── backend/                  # Node.js / Express backend service
│   ├── data/                 # Municipal datasets & GeoJSON data
│   ├── routes/               # AI, complaints, and analytics API endpoints
│   ├── services/             # Gemini AI and Firebase backend services
│   ├── server.js             # API server entrypoint
│   └── package.json
│
├── frontend/                 # React 19 + Vite frontend application
│   ├── public/               # Favicon and static web assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Footer, CivicAILogo, Badges, Modals
│   │   │   └── layout/       # CitizenLayout, AuthorityLayout
│   │   ├── context/          # AuthContext, CivicDataContext, ThemeContext
│   │   ├── data/             # Mock datasets and GeoJSON public facilities
│   │   ├── pages/
│   │   │   ├── authority/    # Authority admin dashboards & analytics
│   │   │   ├── citizen/      # Citizen grievance filing & tracking
│   │   │   └── public/       # LandingPage, LoginPage, RegisterPage
│   │   ├── services/         # AI, geocoding, and complaint client services
│   │   ├── App.jsx           # Master route configurations
│   │   ├── index.css         # Government portal design tokens & styles
│   │   └── main.jsx          # React DOM entrypoint
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── firestore.rules           # Security rules for Firestore collections
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18.0 or higher recommended)
* **npm** (v9.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/premnivase10c29bai28-pixel/CivicAI.git
cd CivicAI
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will launch locally at `http://localhost:5173`.

### 3. Backend Setup (Optional for standalone AI server)
```bash
cd ../backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

---

## 🔐 Demo Credentials

Quickly test the platform using built-in demo credentials on the [Login Page](/login):

* **Citizen Demo:**
  * **Email:** `joshua.sheshan@civicai.org`
  * **Password:** `CivicAI@2026`
  * *(Or simply click **"Continue as Demo Citizen"** on the Sign In page)*
* **Municipal Authority Demo:**
  * **Email:** `commissioner@chennaicorporation.gov.in`
  * **Password:** `Authority@2026`
  * *(Or click **"Sign In with Authority Credentials"** on the Sign In page)*

---

## 🔒 Security & Privacy

* Sensitive environment variables and API keys are managed through `.env` and kept out of version control via `.gitignore`.
* Firebase Firestore Security Rules enforce strict role-based data access (Citizens can only edit their own grievances; Municipal Administrators can review and dispatch).
* Open municipal data attribution conforms to the National Data Sharing and Accessibility Policy (NDSAP).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details. Built for public service advancement and community civic development.

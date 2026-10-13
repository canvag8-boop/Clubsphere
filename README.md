# ClubSphere – College Club Activities & Attendance Tracker

A modern, responsive web application for college students, club coordinators, and university administrators to discover student clubs, register for campus events, track attendance in real time, and earn participation points.

---

## 🚀 Key Features

### 1. Student Dashboard
- **Personalized Metrics**: Real-time counters for clubs joined, upcoming registered events, events attended, and participation points balance.
- **Actionable Cards**: Upcoming registered events with dates, times, venues, and point rewards.
- **Recent Activities Ledger**: Audit log of clubs joined, registrations, and verified attendance points.
- **Student Badges & Honours**: Unlocked achievement badges with progress toward campus milestones.

### 2. Club Management
- **Official Club Directory**: Full listings for Coding Club, Robotics Club, Sports & Athletics Club, Music & Acoustics Club, and Photography & Visual Arts.
- **Club Detail Modal**: Meeting schedules, lab/venue locations, lead coordinators, and active member rosters.
- **Join & Leave Clubs**: Real-time membership tracking and club participation hub.

### 3. Event Management
- **Event Categorization**: Upcoming and completed hackathons, tournaments, workshops, and acoustic jams.
- **Registration & Capacity Tracking**: Visual capacity meters with duplicate registration prevention.
- **Event Logistics**: Dates, times, locations, host club banners, and participation rewards.

### 4. Attendance Tracking & Points Engine
- **Participation Points Rule**: Every verified club activity grants strictly **5 points** (`Points = Participations × 5`). Arbitrary bonuses removed; more participation yields more points.
- **Coordinator Verification Hub**: Club coordinators and administrators select an event and verify student check-ins.
- **Attendance Actions**: Toggle "Present" (+5 pts) or "Absent" for each registered student in real time.
- **Live Statistics**: Real-time attendance rate percentages and attendance counters.

### 5. Dual University Leaderboards
- **🏆 Activity Points Leaderboard**:
  - Ranked dynamically by earned activity points (`Attended Sessions × 5 pts`).
  - Top 3 champion podium with gold crown, silver and bronze medals.
  - Shows activity participation breakdown, department, and earned badges.
- **📊 Attendance Positions Leaderboard**:
  - Positions ranked strictly by total verified club attendances and attendance reliability rate.
  - Displays attendance position (#1, #2, #3...), sessions attended (`N of M`), attendance rate progress bar, and standing badges (Top / Good / Regular).
- **Classification & Cohort Filters**:
  - Filter both leaderboards across **1st Year & 2nd Year** and **Section A & Section B** (or quick preset combinations).
  - Animated SVG avatars custom-rendered based on student gender (`male`, `female`, `other`).

### 6. Admin Console
- **Campus Statistics**: Total clubs, total students, total coordinators, scheduled events, verified attendances, and points pool.
- **User & Coordinator Management**: Assign student, club coordinator, or administrator roles with a single click.
- **Create Clubs & Events**: Interactive forms to schedule new events or register official campus clubs.
- **Live Activity Stream & Demo Reset**: Complete audit log with a one-click database reset utility.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Express API server with SQLite (`better-sqlite3`) database.
- **Database Schema**: Persistent tables for `users`, `clubs`, `club_members`, `events`, `event_registrations`, `attendance`, `achievements`, and `activities`.
- **Theme**: Navy blue (`#0F172A`, `#102A43`), crisp white, and indigo (`#4F46E5`, `#6366F1`) aesthetic with glassmorphic cards and responsive mobile drawer navigation.

---

## 👥 Demo Personas & Full Access

| Role | Persona Name | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | **Kunal Gaur** | `kunal@clubsphere.edu` | `[Protected Admin Credential]` | **Full Master Access**: Admin Console, create/edit/delete clubs & events, mark attendance, manage users & roles |
| **Student** | Alex Rivera | `alex.rivera@college.edu` | `student123` | Member of Coding & Photography, registered for HackForge 2026 |
| **Coordinator** | Maya Lin | `maya.lin@college.edu` | `coordinator123` | Lead of Robotics Club, marks attendance, awards points |
| **Faculty Admin** | Prof. Robert Vance | `admin@college.edu` | `[Protected Admin Credential]` | Campus Club Director, university analytics |

---

## 💻 Running Locally & Backend Architecture

The application runs as a complete fullstack service:

```bash
# Start both Backend (Port 3001) and Frontend (Port 5173) concurrently:
npm run dev

# Or start Backend separately:
npm run server       # Starts Express API at http://localhost:3001

# Or start Frontend separately:
npm run dev:frontend # Starts Vite at http://localhost:5173
```

### Direct Backend API URLs
- **Root Overview & Docs**: `GET http://localhost:3001/`
- **Health Check**: `GET http://localhost:3001/health`
- **API Status**: `GET http://localhost:3001/api/status`
- **Clubs**: `GET http://localhost:3001/api/clubs`
- **Events**: `GET http://localhost:3001/api/events`
- **Attendance**: `GET http://localhost:3001/api/events/:id/attendance`
- **Leaderboard**: `GET http://localhost:3001/api/leaderboard`
- **Elevate to Admin**: `POST http://localhost:3001/api/auth/elevate-me` (`{ "userId": "<id>" }`)
# Clubsphere
# club-sphere

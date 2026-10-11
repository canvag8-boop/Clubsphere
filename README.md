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
- **Join & Leave Clubs**: Real-time membership tracking with an instant **+25 participation points** welcome reward and celebratory confetti.

### 3. Event Management
- **Event Categorization**: Upcoming and completed hackathons, tournaments, workshops, and acoustic jams.
- **Registration & Capacity Tracking**: Visual capacity meters with duplicate registration prevention.
- **Event Logistics**: Dates, times, locations, host club banners, and point values.

### 4. Attendance Tracking
- **Coordinator Verification Hub**: Club coordinators and administrators can select an event and verify student check-ins.
- **Attendance Actions**: Toggle "Present" or "Absent" for each registered student.
- **Gamified Rewards**: Marking a student present automatically credits the event's participation points directly to their profile and updates the live leaderboard.
- **Live Statistics**: Real-time attendance rate percentages and attendance counters.

### 5. University Leaderboard
- **Podium Showcase**: Top 3 ranking podium cards for Gold (#1), Silver (#2), and Bronze (#3) champions.
- **Full Ranks Table**: Filterable student leaderboard displaying points, club memberships, verified events attended, and earned badges.
- **Current User Highlighting**: Visual indicators pinpointing the student's personal rank.

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

## 👥 Demo Personas

Use the **Role Preview** pills in the top header to instantly switch between roles:

| Role | Persona Name | Email | Password | Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `alex.rivera@college.edu` | `student123` | Member of Coding & Photography, registered for HackForge 2026 |
| **Coordinator** | Maya Lin | `maya.lin@college.edu` | `coordinator123` | Lead of Robotics Club, marks attendance, awards points |
| **Admin** | Prof. Robert Vance | `admin@college.edu` | `admin123` | Campus Club Director, full administrative console |

---

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server (serves frontend + embedded API)
npm run dev

# Open http://localhost:5173
```
# Clubsphere

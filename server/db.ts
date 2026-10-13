import Database from 'better-sqlite3';
import path from 'path';
import { generateAnimatedAvatar, Gender } from './avatarGenerator';

const DB_PATH = path.resolve(process.cwd(), 'clubsphere.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'coordinator', 'admin')),
      student_id TEXT,
      department TEXT,
      year INTEGER DEFAULT 1,
      section TEXT DEFAULT 'A',
      gender TEXT DEFAULT 'other',
      avatar TEXT,
      points INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clubs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      lead_coordinator_id TEXT,
      logo_icon TEXT,
      banner_gradient TEXT,
      location TEXT,
      meeting_schedule TEXT,
      member_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS club_members (
      id TEXT PRIMARY KEY,
      club_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT NOT NULL,
      UNIQUE(club_id, user_id),
      FOREIGN KEY(club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      club_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      points_value INTEGER DEFAULT 50,
      max_capacity INTEGER DEFAULT 100,
      status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'completed', 'cancelled')),
      banner_color TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(club_id) REFERENCES clubs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      registered_at TEXT NOT NULL,
      status TEXT DEFAULT 'registered' CHECK(status IN ('registered', 'attended', 'cancelled')),
      UNIQUE(event_id, user_id),
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
      marked_by TEXT NOT NULL,
      points_awarded INTEGER DEFAULT 0,
      verified_at TEXT NOT NULL,
      UNIQUE(event_id, user_id),
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_icon TEXT NOT NULL,
      description TEXT NOT NULL,
      points_threshold INTEGER DEFAULT 0,
      awarded_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      points_earned INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migration: Ensure year, section, gender columns exist in users table
  const userCols = db.prepare('PRAGMA table_info(users)').all() as any[];
  const colNames = userCols.map((c) => c.name);
  if (!colNames.includes('year')) {
    db.exec('ALTER TABLE users ADD COLUMN year INTEGER DEFAULT 1');
  }
  if (!colNames.includes('section')) {
    db.exec("ALTER TABLE users ADD COLUMN section TEXT DEFAULT 'A'");
  }
  if (!colNames.includes('gender')) {
    db.exec("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'other'");
  }

  // Seed default data if users table is empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase();
  }
}

export function seedDatabase() {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, student_id, department, year, section, gender, avatar, points, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertClub = db.prepare(`
    INSERT INTO clubs (id, name, category, description, lead_coordinator_id, logo_icon, banner_gradient, location, meeting_schedule, member_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertClubMember = db.prepare(`
    INSERT INTO club_members (id, club_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (id, club_id, title, description, date, time, location, points_value, max_capacity, status, banner_color, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRegistration = db.prepare(`
    INSERT INTO event_registrations (id, event_id, user_id, registered_at, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertAttendance = db.prepare(`
    INSERT INTO attendance (id, event_id, user_id, status, marked_by, points_awarded, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAchievement = db.prepare(`
    INSERT INTO achievements (id, user_id, badge_name, badge_icon, description, points_threshold, awarded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, points_earned, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  // ----------------------------------------------------
  // CLASSIFIED STUDENTS & ADMINISTRATORS
  // 1st Year (Section A & B) and 2nd Year (Section A & B)
  // With Animated SVGs based on Gender
  // ----------------------------------------------------

  const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeOnFirstLogin!';

  // 0. Kunal Gaur (Super Administrator)
  insertUser.run(
    'usr-kunal',
    'Kunal Gaur',
    'kunal@clubsphere.edu',
    adminInitialPassword,
    'admin',
    'ADMIN-001',
    'Dean of Student Affairs & Technology',
    2,
    'A',
    'male',
    generateAnimatedAvatar('male', 'Kunal Gaur'),
    0,
    now
  );

  // 1. Prof. Robert Vance (Admin demo)
  insertUser.run(
    'usr-admin',
    'Prof. Robert Vance',
    'admin@college.edu',
    adminInitialPassword,
    'admin',
    'FAC-8801',
    'Student Affairs Directorate',
    2,
    'A',
    'male',
    generateAnimatedAvatar('male', 'Robert Vance'),
    0,
    now
  );

  // === 1st YEAR – SECTION A ===
  // 2. Alex Rivera (Male, 1st Year, Sec A) - 4 participations = 20 pts
  insertUser.run(
    'usr-alex',
    'Alex Rivera',
    'alex.rivera@college.edu',
    'student123',
    'student',
    'CS-2025-042',
    'Computer Science & Engineering',
    1,
    'A',
    'male',
    generateAnimatedAvatar('male', 'Alex Rivera'),
    20,
    now
  );

  // 3. Sophia Patel (Female, 1st Year, Sec A) - 5 participations = 25 pts
  insertUser.run(
    'usr-sophia',
    'Sophia Patel',
    'sophia.p@college.edu',
    'student123',
    'student',
    'CS-2025-018',
    'Computer Science & Engineering',
    1,
    'A',
    'female',
    generateAnimatedAvatar('female', 'Sophia Patel'),
    25,
    now
  );

  // === 1st YEAR – SECTION B ===
  // 4. Liam Chen (Male, 1st Year, Sec B) - 2 participations = 10 pts
  insertUser.run(
    'usr-liam',
    'Liam Chen',
    'liam.c@college.edu',
    'student123',
    'student',
    'EC-2025-031',
    'Electronics & Communication',
    1,
    'B',
    'male',
    generateAnimatedAvatar('male', 'Liam Chen'),
    10,
    now
  );

  // 5. Emma Davis (Female, 1st Year, Sec B) - 3 participations = 15 pts
  insertUser.run(
    'usr-emma',
    'Emma Davis',
    'emma.d@college.edu',
    'student123',
    'student',
    'IT-2025-055',
    'Information Technology',
    1,
    'B',
    'female',
    generateAnimatedAvatar('female', 'Emma Davis'),
    15,
    now
  );

  // === 2nd YEAR – SECTION A ===
  // 6. Priya Sharma (Female, 2nd Year, Sec A) - 8 participations = 40 pts
  insertUser.run(
    'usr-priya',
    'Priya Sharma',
    'priya.s@college.edu',
    'student123',
    'student',
    'CS-2024-019',
    'Information Technology',
    2,
    'A',
    'female',
    generateAnimatedAvatar('female', 'Priya Sharma'),
    40,
    now
  );

  // 7. Marcus Chen (Male, 2nd Year, Sec A) - 6 participations = 30 pts
  insertUser.run(
    'usr-marcus',
    'Marcus Chen',
    'marcus.c@college.edu',
    'student123',
    'student',
    'ME-2024-088',
    'Mechanical Engineering',
    2,
    'A',
    'male',
    generateAnimatedAvatar('male', 'Marcus Chen'),
    30,
    now
  );

  // 8. Maya Lin (Female, Coordinator, 2nd Year, Sec A) - 7 participations = 35 pts
  insertUser.run(
    'usr-maya',
    'Maya Lin',
    'maya.lin@college.edu',
    'coordinator123',
    'coordinator',
    'EC-2024-118',
    'Robotics & Automation',
    2,
    'A',
    'female',
    generateAnimatedAvatar('female', 'Maya Lin'),
    35,
    now
  );

  // === 2nd YEAR – SECTION B ===
  // 9. David Kim (Male, 2nd Year, Sec B) - 1 participation = 5 pts
  insertUser.run(
    'usr-david',
    'David Kim',
    'david.k@college.edu',
    'student123',
    'student',
    'DS-2024-012',
    'Data Science & Analytics',
    2,
    'B',
    'male',
    generateAnimatedAvatar('male', 'David Kim'),
    5,
    now
  );

  // 10. Ananya Gupta (Female, 2nd Year, Sec B) - 2 participations = 10 pts
  insertUser.run(
    'usr-ananya',
    'Ananya Gupta',
    'ananya.g@college.edu',
    'student123',
    'student',
    'AI-2024-077',
    'Artificial Intelligence & ML',
    2,
    'B',
    'female',
    generateAnimatedAvatar('female', 'Ananya Gupta'),
    10,
    now
  );

  // Clubs requested: Coding, Robotics, Sports, Music, and Photography
  insertClub.run(
    'club-coding',
    'Coding Club',
    'Technology & Development',
    'Empowering student engineers through competitive programming, open source hackathons, web & AI development, and peer mentorship.',
    'usr-alex',
    'Code',
    'from-blue-600 to-indigo-700',
    'Turing Lab, Turing Hall 302',
    'Every Tuesday & Thursday, 5:30 PM',
    48,
    now
  );

  insertClub.run(
    'club-robotics',
    'Robotics Club',
    'Engineering & Hardware',
    'Designing autonomous rovers, drone swarms, and combat bots. Competing in national collegiate robotics challenges with hands-on maker labs.',
    'usr-maya',
    'Cpu',
    'from-indigo-600 to-purple-700',
    'Mechatronics Bay, Engineering Block B',
    'Every Wednesday, 4:00 PM',
    36,
    now
  );

  insertClub.run(
    'club-sports',
    'Sports & Athletics Club',
    'Fitness & Athletics',
    'Promoting athletic excellence, team spirit, and campus wellness through inter-collegiate tournaments in football, basketball, badminton, and track.',
    'usr-marcus',
    'Trophy',
    'from-emerald-600 to-teal-700',
    'University Sports Complex & Field 1',
    'Mon / Wed / Sat, 6:00 AM & 5:00 PM',
    72,
    now
  );

  insertClub.run(
    'club-music',
    'Music & Acoustics Club',
    'Arts & Performance',
    'A sanctuary for vocalists, instrumentalists, and music producers. Organizing open-mic jam nights, studio sessions, and the campus annual fest band battle.',
    'usr-priya',
    'Music',
    'from-rose-500 to-indigo-600',
    'Auditorium Sound Studio & Amphitheatre',
    'Every Friday, 6:00 PM',
    41,
    now
  );

  insertClub.run(
    'club-photography',
    'Photography & Visual Arts',
    'Media & Design',
    'Capturing campus life, street photography, and visual storytelling. Features darkroom technique workshops, golden hour photo walks, and exhibitions.',
    'usr-david',
    'Camera',
    'from-amber-500 to-orange-600',
    'Visual Arts Media Lab, Block C',
    'Alternate Saturdays, 10:00 AM',
    29,
    now
  );

  // Club Memberships
  // Alex Rivera is in Coding and Photography
  insertClubMember.run('cm-1', 'club-coding', 'usr-alex', 'member', now);
  insertClubMember.run('cm-2', 'club-photography', 'usr-alex', 'member', now);

  // Maya is coordinator of Robotics and member of Coding
  insertClubMember.run('cm-3', 'club-robotics', 'usr-maya', 'coordinator', now);
  insertClubMember.run('cm-4', 'club-coding', 'usr-maya', 'member', now);

  // Priya is in Music and Coding
  insertClubMember.run('cm-5', 'club-music', 'usr-priya', 'coordinator', now);
  insertClubMember.run('cm-6', 'club-coding', 'usr-priya', 'member', now);

  // Marcus in Sports and Robotics
  insertClubMember.run('cm-7', 'club-sports', 'usr-marcus', 'member', now);
  insertClubMember.run('cm-8', 'club-robotics', 'usr-marcus', 'member', now);

  // David in Photography and Sports
  insertClubMember.run('cm-9', 'club-photography', 'usr-david', 'member', now);
  insertClubMember.run('cm-10', 'club-sports', 'usr-david', 'member', now);

  // Sophia (1st Year, Sec A) in Coding and Music
  insertClubMember.run('cm-11', 'club-coding', 'usr-sophia', 'member', now);
  insertClubMember.run('cm-12', 'club-music', 'usr-sophia', 'member', now);

  // Liam (1st Year, Sec B) in Robotics and Coding
  insertClubMember.run('cm-13', 'club-robotics', 'usr-liam', 'member', now);
  insertClubMember.run('cm-14', 'club-coding', 'usr-liam', 'member', now);

  // Emma (1st Year, Sec B) in Photography and Coding
  insertClubMember.run('cm-15', 'club-photography', 'usr-emma', 'member', now);
  insertClubMember.run('cm-16', 'club-coding', 'usr-emma', 'member', now);

  // Ananya (2nd Year, Sec B) in Coding and Robotics
  insertClubMember.run('cm-17', 'club-coding', 'usr-ananya', 'member', now);
  insertClubMember.run('cm-18', 'club-robotics', 'usr-ananya', 'member', now);

  // Events
  // Upcoming events
  insertEvent.run(
    'evt-hackathon-2026',
    'club-coding',
    'Campus HackForge 2026: 24h AI Sprint',
    'Join 200+ collegiate builders in creating AI-powered social impact solutions. Mentorship from alumni engineers, keynote workshops, and $5,000 in prizes!',
    '2026-10-25',
    '09:00 AM - Next Day',
    'Main Innovation Hub & Lab 4',
    5,
    150,
    'upcoming',
    '#3B82F6',
    'usr-alex',
    now
  );

  insertEvent.run(
    'evt-bot-battle',
    'club-robotics',
    'Autonomous RoboWars & Drone Obstacle Derby',
    'Watch combat bots test their structural and algorithmic limits. Interactive drone flight demo arena open to all registered spectators.',
    '2026-10-30',
    '02:00 PM - 06:00 PM',
    'Indoor Sports Arena & Ring',
    5,
    100,
    'upcoming',
    '#6366F1',
    'usr-maya',
    now
  );

  insertEvent.run(
    'evt-football-derby',
    'club-sports',
    'Inter-Department 7v7 Football Clash',
    'The classic annual varsity 7v7 tournament. Represent your department, cheer on your peers, and compete for the golden campus shield.',
    '2026-11-05',
    '04:30 PM - 08:30 PM',
    'University Football Field 1',
    5,
    80,
    'upcoming',
    '#10B981',
    'usr-marcus',
    now
  );

  insertEvent.run(
    'evt-golden-hour-walk',
    'club-photography',
    'Golden Hour Architectural Walk & Portrait Lab',
    'Explore campus brutalist architecture during golden hour with expert guidance on composition, natural lighting, and color grading.',
    '2026-11-12',
    '04:45 PM - 07:15 PM',
    'Clock Tower Quad & Botanical Gardens',
    5,
    40,
    'upcoming',
    '#F59E0B',
    'usr-david',
    now
  );

  // Completed events (1 participation = 5 points)
  insertEvent.run(
    'evt-git-workshop',
    'club-coding',
    'Hands-on Git, GitHub & Open Source Workshop',
    'Mastering Git rebase, multi-developer pull request workflows, CI/CD pipelines, and contributing to open-source software.',
    '2026-10-02',
    '05:00 PM - 07:30 PM',
    'Turing Hall 302',
    5,
    60,
    'completed',
    '#3B82F6',
    'usr-alex',
    now
  );

  insertEvent.run(
    'evt-acoustic-night',
    'club-music',
    'Moonlit Acoustic Jam & Open Mic',
    'A cozy evening of unplugged vocals, indie folk performances, and student singer-songwriter showcases under the stars.',
    '2026-09-26',
    '07:00 PM - 10:00 PM',
    'Campus Amphitheatre',
    5,
    90,
    'completed',
    '#EC4899',
    'usr-priya',
    now
  );

  insertEvent.run(
    'evt-rover-bootcamp',
    'club-robotics',
    'Arduino & Motor Control Fundamentals',
    'Deep dive into PWM signals, motor H-bridges, sonar sensors, and breadboard circuit debugging for freshman robotics builders.',
    '2026-09-18',
    '03:00 PM - 06:00 PM',
    'Mechatronics Bay 104',
    5,
    50,
    'completed',
    '#8B5CF6',
    'usr-maya',
    now
  );

  insertEvent.run(
    'evt-web-summit',
    'club-coding',
    'Modern Fullstack Web Architecture Summit',
    'Building reactive real-time web applications with modern toolchains, micro-frontends, and cloud deployment.',
    '2026-09-12',
    '04:00 PM - 07:00 PM',
    'Hall 101',
    5,
    60,
    'completed',
    '#3B82F6',
    'usr-alex',
    now
  );

  insertEvent.run(
    'evt-badminton-cup',
    'club-sports',
    'Intra-College Smash Badminton Cup',
    'Fast-paced doubles and singles tournament with points for every active participant.',
    '2026-09-08',
    '05:00 PM - 08:00 PM',
    'Sports Pavilion',
    5,
    50,
    'completed',
    '#10B981',
    'usr-marcus',
    now
  );

  insertEvent.run(
    'evt-photo-walk',
    'club-photography',
    'Campus Brutalist Photo Walk & Portrait Lab',
    'Hands-on photography walk exploring architectural angles and natural light portraits.',
    '2026-09-02',
    '04:00 PM - 06:30 PM',
    'Clock Tower Quad',
    5,
    40,
    'completed',
    '#F59E0B',
    'usr-david',
    now
  );

  insertEvent.run(
    'evt-algo-sprint',
    'club-coding',
    'Competitive Algorithm & LeetCode Blitz',
    'Timed problem solving sprint tackling graphs, dynamic programming, and binary search.',
    '2026-08-28',
    '05:30 PM - 07:30 PM',
    'Lab 2',
    5,
    50,
    'completed',
    '#3B82F6',
    'usr-alex',
    now
  );

  insertEvent.run(
    'evt-ai-primer',
    'club-coding',
    'Neural Networks & Deep Learning Primer',
    'Introductory workshop on tensors, convolutional networks, and local LLM execution.',
    '2026-08-20',
    '04:00 PM - 06:30 PM',
    'Turing Hall 302',
    5,
    50,
    'completed',
    '#3B82F6',
    'usr-sophia',
    now
  );

  // Event Registrations & Attendances
  // 1. Priya (8 attended out of 8 = 100% attendance, 8 * 5 = 40 pts)
  const priyaEvents = ['evt-git-workshop', 'evt-acoustic-night', 'evt-rover-bootcamp', 'evt-web-summit', 'evt-badminton-cup', 'evt-photo-walk', 'evt-algo-sprint', 'evt-ai-primer'];
  priyaEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-p-${idx}`, eid, 'usr-priya', now, 'attended');
    insertAttendance.run(`att-p-${idx}`, eid, 'usr-priya', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-p-up', 'evt-hackathon-2026', 'usr-priya', now, 'registered');

  // 2. Maya (7 attended out of 8 = 88% attendance, 7 * 5 = 35 pts)
  const mayaEvents = ['evt-git-workshop', 'evt-acoustic-night', 'evt-rover-bootcamp', 'evt-web-summit', 'evt-badminton-cup', 'evt-algo-sprint', 'evt-ai-primer'];
  mayaEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-m-${idx}`, eid, 'usr-maya', now, 'attended');
    insertAttendance.run(`att-m-${idx}`, eid, 'usr-maya', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-m-abs', 'evt-photo-walk', 'usr-maya', now, 'registered');
  insertAttendance.run('att-m-abs', 'evt-photo-walk', 'usr-maya', 'absent', 'usr-admin', 0, now);
  insertRegistration.run('reg-m-up', 'evt-hackathon-2026', 'usr-maya', now, 'registered');

  // 3. Marcus (6 attended out of 7 = 86% attendance, 6 * 5 = 30 pts)
  const marcusEvents = ['evt-git-workshop', 'evt-acoustic-night', 'evt-rover-bootcamp', 'evt-badminton-cup', 'evt-algo-sprint', 'evt-ai-primer'];
  marcusEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-mc-${idx}`, eid, 'usr-marcus', now, 'attended');
    insertAttendance.run(`att-mc-${idx}`, eid, 'usr-marcus', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-mc-abs', 'evt-web-summit', 'usr-marcus', now, 'registered');
  insertAttendance.run('att-mc-abs', 'evt-web-summit', 'usr-marcus', 'absent', 'usr-admin', 0, now);
  insertRegistration.run('reg-mc-up', 'evt-football-derby', 'usr-marcus', now, 'registered');

  // 4. Sophia (5 attended out of 5 = 100% attendance, 5 * 5 = 25 pts) - 1st Year Sec A
  const sophiaEvents = ['evt-git-workshop', 'evt-web-summit', 'evt-algo-sprint', 'evt-ai-primer', 'evt-acoustic-night'];
  sophiaEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-sp-${idx}`, eid, 'usr-sophia', now, 'attended');
    insertAttendance.run(`att-sp-${idx}`, eid, 'usr-sophia', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-sp-up', 'evt-hackathon-2026', 'usr-sophia', now, 'registered');

  // 5. Alex (4 attended out of 5 = 80% attendance, 4 * 5 = 20 pts) - 1st Year Sec A
  const alexEvents = ['evt-git-workshop', 'evt-acoustic-night', 'evt-web-summit', 'evt-algo-sprint'];
  alexEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-al-${idx}`, eid, 'usr-alex', now, 'attended');
    insertAttendance.run(`att-al-${idx}`, eid, 'usr-alex', 'present', 'usr-maya', 5, now);
  });
  insertRegistration.run('reg-al-abs', 'evt-rover-bootcamp', 'usr-alex', now, 'registered');
  insertAttendance.run('att-al-abs', 'evt-rover-bootcamp', 'usr-alex', 'absent', 'usr-maya', 0, now);
  insertRegistration.run('reg-al-up', 'evt-hackathon-2026', 'usr-alex', now, 'registered');

  // 6. Emma (3 attended out of 4 = 75% attendance, 3 * 5 = 15 pts) - 1st Year Sec B
  const emmaEvents = ['evt-git-workshop', 'evt-web-summit', 'evt-ai-primer'];
  emmaEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-em-${idx}`, eid, 'usr-emma', now, 'attended');
    insertAttendance.run(`att-em-${idx}`, eid, 'usr-emma', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-em-abs', 'evt-algo-sprint', 'usr-emma', now, 'registered');
  insertAttendance.run('att-em-abs', 'evt-algo-sprint', 'usr-emma', 'absent', 'usr-admin', 0, now);
  insertRegistration.run('reg-em-up', 'evt-golden-hour-walk', 'usr-emma', now, 'registered');

  // 7. Liam (2 attended out of 3 = 67% attendance, 2 * 5 = 10 pts) - 1st Year Sec B
  const liamEvents = ['evt-git-workshop', 'evt-rover-bootcamp'];
  liamEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-lm-${idx}`, eid, 'usr-liam', now, 'attended');
    insertAttendance.run(`att-lm-${idx}`, eid, 'usr-liam', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-lm-abs', 'evt-algo-sprint', 'usr-liam', now, 'registered');
  insertAttendance.run('att-lm-abs', 'evt-algo-sprint', 'usr-liam', 'absent', 'usr-admin', 0, now);
  insertRegistration.run('reg-lm-up', 'evt-bot-battle', 'usr-liam', now, 'registered');

  // 8. Ananya (2 attended out of 2 = 100% attendance, 2 * 5 = 10 pts) - 2nd Year Sec B
  const ananyaEvents = ['evt-ai-primer', 'evt-algo-sprint'];
  ananyaEvents.forEach((eid, idx) => {
    insertRegistration.run(`reg-an-${idx}`, eid, 'usr-ananya', now, 'attended');
    insertAttendance.run(`att-an-${idx}`, eid, 'usr-ananya', 'present', 'usr-admin', 5, now);
  });
  insertRegistration.run('reg-an-up', 'evt-hackathon-2026', 'usr-ananya', now, 'registered');

  // 9. David (1 attended out of 3 = 33% attendance, 1 * 5 = 5 pts) - 2nd Year Sec B
  insertRegistration.run('reg-dv-0', 'evt-photo-walk', 'usr-david', now, 'attended');
  insertAttendance.run('att-dv-0', 'evt-photo-walk', 'usr-david', 'present', 'usr-admin', 5, now);
  insertRegistration.run('reg-dv-abs1', 'evt-git-workshop', 'usr-david', now, 'registered');
  insertAttendance.run('att-dv-abs1', 'evt-git-workshop', 'usr-david', 'absent', 'usr-admin', 0, now);
  insertRegistration.run('reg-dv-abs2', 'evt-algo-sprint', 'usr-david', now, 'registered');
  insertAttendance.run('att-dv-abs2', 'evt-algo-sprint', 'usr-david', 'absent', 'usr-admin', 0, now);
  insertRegistration.run('reg-dv-up', 'evt-golden-hour-walk', 'usr-david', now, 'registered');

  // Achievements / Badges
  insertAchievement.run('ach-kunal-1', 'usr-kunal', 'System Master', 'Shield', 'Full Administrative and Systems Clearance across ClubSphere', 1000, now);
  insertAchievement.run('ach-kunal-2', 'usr-kunal', 'Grand Architect', 'Crown', 'Chief of College Student Activities Directorate', 800, now);

  insertAchievement.run('ach-1', 'usr-alex', 'Early Bird', 'Zap', 'Registered for 3+ events within first 24h of release', 50, now);
  insertAchievement.run('ach-2', 'usr-alex', 'Code Crafter', 'Terminal', 'Attended inaugural Git & Systems architecture workshop', 100, now);
  insertAchievement.run('ach-3', 'usr-alex', 'Double Trouble', 'Users', 'Active member of 2 distinct campus student clubs', 150, now);

  insertAchievement.run('ach-4', 'usr-priya', 'Campus Legend', 'Crown', 'Accumulated 500+ student participation points', 500, now);
  insertAchievement.run('ach-5', 'usr-priya', 'Melody Maestro', 'Music', 'Spearheaded the Acoustic Jam Festivities', 200, now);
  insertAchievement.run('ach-6', 'usr-priya', 'Event Maestro', 'Sparkles', 'Maintained 100% verified attendance rate', 300, now);

  insertAchievement.run('ach-7', 'usr-maya', 'Robo Pioneer', 'Cpu', 'Mentored 30+ students in robotics bootcamp', 250, now);
  insertAchievement.run('ach-8', 'usr-marcus', 'Iron Athlete', 'Flame', 'Represented Mechanical department in sports tournament', 150, now);
  insertAchievement.run('ach-9', 'usr-david', 'Visual Storyteller', 'Camera', 'Photographed campus fall exhibition', 100, now);

  // Activities
  insertActivity.run('act-1', 'usr-alex', 'registered_event', 'Registered for HackForge 2026', 'Signed up for Campus HackForge 2026: 24h AI Sprint.', 0, '2026-10-10T14:30:00Z');
  insertActivity.run('act-2', 'usr-alex', 'attended_event', 'Attended Git Workshop', 'Verified present at Hands-on Git & Open Source Workshop.', 50, '2026-10-02T19:30:00Z');
  insertActivity.run('act-3', 'usr-alex', 'joined_club', 'Joined Photography Club', 'Became an active member of Photography & Visual Arts.', 20, '2026-09-28T11:00:00Z');
  insertActivity.run('act-4', 'usr-alex', 'attended_event', 'Attended Moonlit Jam', 'Verified attendance at Moonlit Acoustic Jam & Open Mic.', 50, '2026-09-26T22:00:00Z');
  insertActivity.run('act-5', 'usr-alex', 'joined_club', 'Joined Coding Club', 'Became an active member of Coding Club.', 20, '2026-09-15T09:00:00Z');

  // Other activities
  insertActivity.run('act-6', 'usr-maya', 'created_event', 'Scheduled Bot Battle', 'Created Autonomous RoboWars & Drone Obstacle Derby event.', 0, '2026-10-09T16:00:00Z');
  insertActivity.run('act-7', 'usr-priya', 'earned_points', 'Earned Campus Legend Badge', 'Surpassed 500 participation points milestone.', 50, '2026-10-08T18:00:00Z');
}

export { db };

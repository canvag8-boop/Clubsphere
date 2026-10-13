import { Router } from 'express';
import { db, seedDatabase } from './db';
import { generateAnimatedAvatar, Gender } from './avatarGenerator';
import { connectMongoDB, isMongoConnected, getMongoConnectionState } from './mongodb';
import { seedMongoDB } from './mongoSeed';
import {
  hashPassword,
  verifyPassword,
  createToken,
  requireAuth,
  optionalAuth,
  requireRole,
  AuthenticatedRequest,
} from './auth';
import {
  User as MongoUser,
  Club as MongoClub,
  Event as MongoEvent,
  EventRegistration as MongoEventRegistration,
  Attendance as MongoAttendance,
  Achievement as MongoAchievement,
  Activity as MongoActivity,
} from './models';

const apiRouter = Router();

// ----------------------------------------------------
// DATABASE STATUS & MONGODB INTEGRATION
// ----------------------------------------------------

apiRouter.get('/status', async (req, res) => {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as any;
  const clubCount = db.prepare('SELECT count(*) as count FROM clubs').get() as any;
  const eventCount = db.prepare('SELECT count(*) as count FROM events').get() as any;
  const mongoState = getMongoConnectionState();

  let mongoCounts = null;
  if (isMongoConnected()) {
    try {
      const [mUsers, mClubs, mEvents] = await Promise.all([
        MongoUser.countDocuments(),
        MongoClub.countDocuments(),
        MongoEvent.countDocuments(),
      ]);
      mongoCounts = { users: mUsers, clubs: mClubs, events: mEvents };
    } catch {
      // ignore
    }
  }

  return res.json({
    status: 'online',
    service: 'ClubSphere Fullstack Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    primary_database: 'SQLite (clubsphere.db)',
    mongodb: {
      ...mongoState,
      counts: mongoCounts,
    },
    counts: {
      users: userCount.count,
      clubs: clubCount.count,
      events: eventCount.count,
    },
  });
});

apiRouter.get('/mongodb/status', async (req, res) => {
  const state = getMongoConnectionState();
  let collections: any = null;
  if (state.connected) {
    try {
      const [users, clubs, events, registrations, attendance, achievements, activities] = await Promise.all([
        MongoUser.countDocuments(),
        MongoClub.countDocuments(),
        MongoEvent.countDocuments(),
        MongoEventRegistration.countDocuments(),
        MongoAttendance.countDocuments(),
        MongoAchievement.countDocuments(),
        MongoActivity.countDocuments(),
      ]);
      collections = { users, clubs, events, registrations, attendance, achievements, activities };
    } catch (err: any) {
      collections = { error: err.message };
    }
  }

  return res.json({
    ...state,
    collections,
  });
});

apiRouter.post('/mongodb/connect', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({ error: 'Valid MongoDB connection URI is required' });
  }

  try {
    const success = await connectMongoDB(uri);
    if (!success) {
      return res.status(500).json({ error: 'Failed to connect to MongoDB with provided URI' });
    }
    return res.json({
      success: true,
      message: 'Connected to MongoDB successfully!',
      state: getMongoConnectionState(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/mongodb/seed', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!isMongoConnected()) {
      const connected = await connectMongoDB();
      if (!connected) {
        return res.status(503).json({
          error: 'MongoDB is not currently connected. Please configure MONGODB_URI in .env or run local MongoDB.',
          state: getMongoConnectionState(),
        });
      }
    }

    const stats = await seedMongoDB();
    return res.json({
      success: true,
      message: 'MongoDB database successfully seeded with ClubSphere data!',
      counts: stats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// AUTHENTICATION & IDENTITY
// ----------------------------------------------------

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email or username is required' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  const cleanInput = email.toLowerCase().trim();
  
  // Support flexible login for administrator or standard email
  let user: any;
  if (cleanInput === 'kunal' || cleanInput === 'admin' || cleanInput === 'kunal@clubsphere.edu') {
    user = db.prepare("SELECT * FROM users WHERE id = 'usr-kunal' OR email = 'kunal@clubsphere.edu'").get();
  } else {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanInput);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your email or password.' });
  }

  // Strict password verification (purely cryptographic hash verification)
  const isMatch = await verifyPassword(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  // Generate cryptographically signed token
  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  // Safe user without password
  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

apiRouter.post('/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({ error: 'Current password is required to verify your identity.' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const isMatch = user.password ? await verifyPassword(currentPassword, user.password) : false;

  if (!isMatch) {
    return res.status(400).json({ error: 'Incorrect past password. You must provide your correct current password to update it.' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'New password cannot be the same as your old password.' });
  }

  const hashedPassword = await hashPassword(newPassword);

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

  // Sync to MongoDB if connected
  if (isMongoConnected()) {
    try {
      await MongoUser.updateOne(
        { $or: [{ id: userId }, { email: user.email }] },
        { $set: { password: hashedPassword } }
      );
    } catch (err) {
      console.error('[MongoDB] Failed to update password in Mongo:', err);
    }
  }

  return res.json({ success: true, message: 'Password updated successfully! Please keep your new credentials safe.' });
});

apiRouter.post('/auth/elevate-me', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { userId } = req.body;
  if (!userId || userId !== 'usr-kunal') {
    return res.status(403).json({ error: 'Admin account is predefined. Elevation is restricted to the primary administrator.' });
  }

  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(userId);
  const updated = db.prepare('SELECT id, name, email, role, student_id, department, year, section, gender, avatar, points FROM users WHERE id = ?').get(userId);
  return res.json({
    success: true,
    message: 'Super Administrator access granted!',
    user: updated,
  });
});

apiRouter.post('/auth/register', async (req, res) => {
  const {
    name,
    email,
    password,
    role = 'student',
    studentId,
    department,
    year = 1,
    section = 'A',
    gender = 'other',
    avatar: customAvatar,
  } = req.body;

  if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Prevent registration as admin (admin is predefined)
  if (role === 'admin') {
    return res.status(403).json({ error: 'The Administrator account is predefined. Registration as admin is strictly prohibited.' });
  }

  const safeRole = role === 'coordinator' ? 'coordinator' : 'student';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const id = `usr-${Date.now()}`;
  const now = new Date().toISOString();
  const userYear = Number(year) === 2 ? 2 : 1;
  const userSection = section === 'B' ? 'B' : 'A';
  const userGender = (gender === 'male' || gender === 'female' ? gender : 'other') as Gender;
  const avatar = customAvatar || generateAnimatedAvatar(userGender, name);

  // Hash password with salted scrypt
  const hashedPassword = await hashPassword(password);

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, student_id, department, year, section, gender, avatar, points, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 50, ?)
    `).run(
      id,
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      safeRole,
      studentId || (userYear === 1 ? 'CS-2025-STU' : 'CS-2024-STU'),
      department || 'Computer Science & Engineering',
      userYear,
      userSection,
      userGender,
      avatar,
      now
    );

    // Sync to MongoDB if connected
    if (isMongoConnected()) {
      MongoUser.create({
        id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: safeRole,
        student_id: studentId || (userYear === 1 ? 'CS-2025-STU' : 'CS-2024-STU'),
        department: department || 'Computer Science & Engineering',
        year: userYear,
        section: userSection,
        gender: userGender,
        avatar,
        points: 50,
        created_at: now,
      }).catch((err) => console.error('[MongoDB] Sync error for new user:', err));
    }

    // Initial sign-up activity & welcome points
    db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, points_earned, created_at)
      VALUES (?, ?, 'welcome', 'Welcome to ClubSphere!', 'Earned 50 welcome points for creating an account.', 50, ?)
    `).run(`act-${Date.now()}`, id, now);

    // Welcome Badge
    db.prepare(`
      INSERT INTO achievements (id, user_id, badge_name, badge_icon, description, points_threshold, awarded_at)
      VALUES (?, ?, 'New Recruit', 'Sparkles', 'Joined ClubSphere community', 50, ?)
    `).run(`ach-${Date.now()}`, id, now);

    const newUser = db.prepare('SELECT id, name, email, role, student_id, department, year, section, gender, avatar, points, created_at FROM users WHERE id = ?').get(id) as any;
    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

apiRouter.get('/auth/users', requireAuth, (req: AuthenticatedRequest, res) => {
  const users = db.prepare('SELECT id, name, email, role, student_id, department, year, section, gender, avatar, points, created_at FROM users ORDER BY year ASC, section ASC, name ASC').all();
  return res.json({ users });
});

apiRouter.get('/auth/me/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  // Verify token matches requested profile or user is admin
  if (req.user!.id !== req.params.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden: You can only access your own profile.' });
  }

  const user = db.prepare('SELECT id, name, email, role, student_id, department, year, section, gender, avatar, points, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
});

// ----------------------------------------------------
// DASHBOARD - STUDENT (IDOR Protected)
// ----------------------------------------------------

apiRouter.get('/dashboard/student', requireAuth, (req: AuthenticatedRequest, res) => {
  // Prevent IDOR: Standard students can only view their own dashboard.
  // Admins and coordinators can optionally view another student's dashboard.
  const targetUserId =
    (req.user!.role === 'admin' || req.user!.role === 'coordinator') && req.query.userId
      ? (req.query.userId as string)
      : req.user!.id;

  const userId = targetUserId;
  const user = db.prepare('SELECT id, name, email, role, student_id, department, year, section, gender, avatar, points FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Total clubs joined
  const clubsJoinedCount = (db.prepare('SELECT count(*) as count FROM club_members WHERE user_id = ?').get(userId) as any).count;

  // Upcoming registered events
  const upcomingEvents = db.prepare(`
    SELECT e.*, c.name as club_name, c.logo_icon as club_icon
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    JOIN event_registrations r ON e.id = r.event_id
    WHERE r.user_id = ? AND e.status = 'upcoming'
    ORDER BY e.date ASC
  `).all(userId);

  // Events attended count
  const attendedCount = (db.prepare(`
    SELECT count(*) as count
    FROM attendance
    WHERE user_id = ? AND status = 'present'
  `).get(userId) as any).count;

  // Recent activities
  const recentActivities = db.prepare(`
    SELECT * FROM activities
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 6
  `).all(userId);

  // Badges / Achievements
  const achievements = db.prepare(`
    SELECT * FROM achievements
    WHERE user_id = ?
    ORDER BY awarded_at DESC
  `).all(userId);

  // Recommended upcoming events not registered yet
  const recommendedEvents = db.prepare(`
    SELECT e.*, c.name as club_name, c.logo_icon as club_icon
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.status = 'upcoming' AND e.id NOT IN (
      SELECT event_id FROM event_registrations WHERE user_id = ?
    )
    ORDER BY e.date ASC
    LIMIT 3
  `).all(userId);

  return res.json({
    user,
    stats: {
      clubsJoined: clubsJoinedCount,
      upcomingEventsCount: upcomingEvents.length,
      eventsAttended: attendedCount,
      participationPoints: user.points,
    },
    upcomingEvents,
    recentActivities,
    achievements,
    recommendedEvents,
  });
});

// ----------------------------------------------------
// DASHBOARD - ADMIN (Protected)
// ----------------------------------------------------

apiRouter.get('/dashboard/admin', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const totalClubs = (db.prepare('SELECT count(*) as count FROM clubs').get() as any).count;
  const totalStudents = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'student'").get() as any).count;
  const totalCoordinators = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'coordinator'").get() as any).count;
  const totalEvents = (db.prepare('SELECT count(*) as count FROM events').get() as any).count;
  const totalAttendances = (db.prepare("SELECT count(*) as count FROM attendance WHERE status = 'present'").get() as any).count;
  const totalPoints = (db.prepare('SELECT sum(points) as sum FROM users').get() as any).sum || 0;

  const clubsSummary = db.prepare(`
    SELECT c.*, u.name as coordinator_name,
      (SELECT count(*) FROM club_members WHERE club_id = c.id) as actual_members,
      (SELECT count(*) FROM events WHERE club_id = c.id) as total_events
    FROM clubs c
    LEFT JOIN users u ON c.lead_coordinator_id = u.id
    ORDER BY c.created_at DESC
  `).all();

  const recentRegistrations = db.prepare(`
    SELECT r.registered_at, u.name as student_name, u.email, e.title as event_title, c.name as club_name
    FROM event_registrations r
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    JOIN clubs c ON e.club_id = c.id
    ORDER BY r.registered_at DESC
    LIMIT 6
  `).all();

  const systemActivities = db.prepare(`
    SELECT a.*, u.name as user_name, u.role
    FROM activities a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all();

  return res.json({
    stats: {
      totalClubs,
      totalStudents,
      totalCoordinators,
      totalEvents,
      totalAttendances,
      totalPointsDistributed: totalPoints,
    },
    clubs: clubsSummary,
    recentRegistrations,
    systemActivities,
  });
});

// ----------------------------------------------------
// CLUBS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/clubs', optionalAuth, (req: AuthenticatedRequest, res) => {
  const effectiveUserId = req.user?.id || (req.query.userId as string);

  const clubs = db.prepare(`
    SELECT c.*,
      u.name as coordinator_name,
      u.email as coordinator_email,
      (SELECT count(*) FROM club_members WHERE club_id = c.id) as member_count,
      (SELECT count(*) FROM events WHERE club_id = c.id AND status = 'upcoming') as upcoming_events_count
    FROM clubs c
    LEFT JOIN users u ON c.lead_coordinator_id = u.id
    ORDER BY c.name ASC
  `).all() as any[];

  let userClubIds = new Set<string>();
  if (effectiveUserId) {
    const memberships = db.prepare('SELECT club_id FROM club_members WHERE user_id = ?').all(effectiveUserId) as any[];
    userClubIds = new Set(memberships.map((m) => m.club_id));
  }

  const enrichedClubs = clubs.map((c) => ({
    ...c,
    isMember: effectiveUserId ? userClubIds.has(c.id) : false,
  }));

  return res.json({ clubs: enrichedClubs });
});

apiRouter.get('/clubs/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const effectiveUserId = req.user?.id || (req.query.userId as string);

  const club = db.prepare(`
    SELECT c.*, u.name as coordinator_name, u.email as coordinator_email, u.avatar as coordinator_avatar
    FROM clubs c
    LEFT JOIN users u ON c.lead_coordinator_id = u.id
    WHERE c.id = ?
  `).get(id) as any;

  if (!club) {
    return res.status(404).json({ error: 'Club not found' });
  }

  // Members list
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.department, u.avatar, u.points, cm.role as club_role, cm.joined_at
    FROM club_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.club_id = ?
    ORDER BY cm.role DESC, u.name ASC
  `).all(id);

  // Upcoming and past activities/events
  const events = db.prepare(`
    SELECT * FROM events
    WHERE club_id = ?
    ORDER BY date ASC
  `).all(id);

  let isMember = false;
  if (effectiveUserId) {
    const membership = db.prepare('SELECT 1 FROM club_members WHERE club_id = ? AND user_id = ?').get(id, effectiveUserId);
    isMember = !!membership;
  }

  return res.json({
    club: {
      ...club,
      isMember,
      members,
      events,
    },
  });
});

apiRouter.post('/clubs', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const { name, category, description, location, meetingSchedule, bannerGradient, logoIcon, leadCoordinatorId } = req.body;

  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Name, category, and description are required.' });
  }

  const id = `club-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO clubs (id, name, category, description, lead_coordinator_id, logo_icon, banner_gradient, location, meeting_schedule, member_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      name.trim(),
      category.trim(),
      description.trim(),
      leadCoordinatorId || req.user!.id,
      logoIcon || 'Sparkles',
      bannerGradient || 'from-blue-600 to-indigo-700',
      location?.trim() || 'Student Activity Center',
      meetingSchedule?.trim() || 'Weekly Wednesdays 5:00 PM',
      now
    );

    const coordinatorToAssign = leadCoordinatorId || req.user!.id;
    if (coordinatorToAssign) {
      db.prepare(`
        INSERT INTO club_members (id, club_id, user_id, role, joined_at)
        VALUES (?, ?, ?, 'coordinator', ?)
      `).run(`cm-${Date.now()}`, id, coordinatorToAssign, now);

      db.prepare('UPDATE clubs SET member_count = member_count + 1 WHERE id = ?').run(id);
    }

    const createdClub = db.prepare('SELECT * FROM clubs WHERE id = ?').get(id);
    return res.status(201).json({ club: createdClub });
  } catch (err: any) {
    console.error('Error creating club:', err);
    return res.status(500).json({ error: 'Failed to create club' });
  }
});

apiRouter.put('/clubs/:id', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, category, description, location, meetingSchedule, logoIcon, bannerGradient } = req.body;

  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Name, category, and description are required.' });
  }

  const existing = db.prepare('SELECT * FROM clubs WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Club not found' });
  }

  db.prepare(`
    UPDATE clubs
    SET name = ?, category = ?, description = ?, location = ?, meeting_schedule = ?,
        logo_icon = COALESCE(?, logo_icon), banner_gradient = COALESCE(?, banner_gradient)
    WHERE id = ?
  `).run(
    name.trim(),
    category.trim(),
    description.trim(),
    location?.trim() || existing.location,
    meetingSchedule?.trim() || existing.meeting_schedule,
    logoIcon || existing.logo_icon,
    bannerGradient || existing.banner_gradient,
    id
  );

  const updated = db.prepare('SELECT * FROM clubs WHERE id = ?').get(id);
  return res.json({ success: true, message: `Club updated to "${name}" successfully!`, club: updated });
});

apiRouter.delete('/clubs/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const club = db.prepare('SELECT name FROM clubs WHERE id = ?').get(id) as any;
  if (!club) {
    return res.status(404).json({ error: 'Club not found' });
  }

  db.prepare('DELETE FROM clubs WHERE id = ?').run(id);
  return res.json({ success: true, message: `Club "${club.name}" was permanently deleted.` });
});

apiRouter.post('/clubs/:id/join', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  // Strictly enforce authenticated user ID (prevent IDOR)
  const userId = req.user!.id;

  // The Admin acts strictly as the Controller of the App and cannot participate as a club member
  if (req.user?.role === 'admin') {
    return res.status(403).json({ error: 'Administrators control and manage clubs; they cannot join as student members.' });
  }

  const club = db.prepare('SELECT id, name FROM clubs WHERE id = ?').get(id) as any;
  if (!club) {
    return res.status(404).json({ error: 'Club not found.' });
  }

  const existing = db.prepare('SELECT id FROM club_members WHERE club_id = ? AND user_id = ?').get(id, userId);
  if (existing) {
    return res.status(409).json({ error: 'You are already a member of this club.' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO club_members (id, club_id, user_id, role, joined_at)
    VALUES (?, ?, ?, 'member', ?)
  `).run(`cm-${Date.now()}`, id, userId, now);

  db.prepare('UPDATE clubs SET member_count = member_count + 1 WHERE id = ?').run(id);

  // Award 25 club joining points!
  const pointsAwarded = 25;
  db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsAwarded, userId);

  // Add activity
  db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, points_earned, created_at)
    VALUES (?, ?, 'joined_club', ?, ?, ?, ?)
  `).run(
    `act-${Date.now()}`,
    userId,
    `Joined ${club.name}`,
    `Became a member of ${club.name} and earned ${pointsAwarded} participation points.`,
    pointsAwarded,
    now
  );

  return res.json({ success: true, message: `Successfully joined ${club.name}!`, pointsAwarded });
});

apiRouter.post('/clubs/:id/leave', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  // Strictly enforce authenticated user ID (prevent IDOR)
  const userId = req.user!.id;

  // The Admin acts strictly as the Controller of the App and cannot leave/join clubs
  if (req.user?.role === 'admin') {
    return res.status(403).json({ error: 'Administrators cannot join or leave clubs.' });
  }

  const result = db.prepare('DELETE FROM club_members WHERE club_id = ? AND user_id = ?').run(id, userId);
  if (result.changes > 0) {
    db.prepare('UPDATE clubs SET member_count = MAX(0, member_count - 1) WHERE id = ?').run(id);
    return res.json({ success: true, message: 'You have left the club.' });
  }

  return res.status(400).json({ error: 'You are not a member of this club.' });
});

// ----------------------------------------------------
// EVENT MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/events', optionalAuth, (req: AuthenticatedRequest, res) => {
  const effectiveUserId = req.user?.id || (req.query.userId as string);
  const clubId = req.query.clubId as string;

  let query = `
    SELECT e.*, c.name as club_name, c.logo_icon as club_icon,
      (SELECT count(*) FROM event_registrations WHERE event_id = e.id AND status != 'cancelled') as registered_count
    FROM events e
    JOIN clubs c ON e.club_id = c.id
  `;
  const params: any[] = [];

  if (clubId) {
    query += ' WHERE e.club_id = ?';
    params.push(clubId);
  }

  query += ' ORDER BY e.date ASC, e.time ASC';

  const events = db.prepare(query).all(...params) as any[];

  let registeredEventIds = new Set<string>();
  let attendedEventIds = new Set<string>();

  if (effectiveUserId) {
    const regs = db.prepare('SELECT event_id, status FROM event_registrations WHERE user_id = ?').all(effectiveUserId) as any[];
    regs.forEach((r) => {
      if (r.status === 'registered') registeredEventIds.add(r.event_id);
      if (r.status === 'attended') attendedEventIds.add(r.event_id);
    });
  }

  const enriched = events.map((e) => ({
    ...e,
    isRegistered: registeredEventIds.has(e.id),
    hasAttended: attendedEventIds.has(e.id),
    isFull: e.registered_count >= e.max_capacity,
  }));

  const upcoming = enriched.filter((e) => e.status === 'upcoming');
  const completed = enriched.filter((e) => e.status === 'completed');

  return res.json({ events: enriched, upcoming, completed });
});

apiRouter.get('/events/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const effectiveUserId = req.user?.id || (req.query.userId as string);

  const event = db.prepare(`
    SELECT e.*, c.name as club_name, c.logo_icon as club_icon, c.description as club_description,
      (SELECT count(*) FROM event_registrations WHERE event_id = e.id AND status != 'cancelled') as registered_count
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.id = ?
  `).get(id) as any;

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  let isRegistered = false;
  let hasAttended = false;
  if (effectiveUserId) {
    const reg = db.prepare('SELECT status FROM event_registrations WHERE event_id = ? AND user_id = ?').get(id, effectiveUserId) as any;
    if (reg) {
      isRegistered = reg.status === 'registered';
      hasAttended = reg.status === 'attended';
    }
  }

  const attendees = db.prepare(`
    SELECT u.id, u.name, u.email, u.department, u.avatar, r.registered_at, r.status as registration_status,
      COALESCE(a.status, 'unmarked') as attendance_status,
      a.points_awarded
    FROM event_registrations r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN attendance a ON a.event_id = r.event_id AND a.user_id = r.user_id
    WHERE r.event_id = ? AND u.role != 'admin'
    ORDER BY u.name ASC
  `).all(id);

  return res.json({
    event: {
      ...event,
      isRegistered,
      hasAttended,
      attendees,
    },
  });
});

apiRouter.post('/events', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const { clubId, title, description, date, time, location, pointsValue = 50, maxCapacity = 100, bannerColor = '#3B82F6' } = req.body;

  if (!clubId || !title || !description || !date || !time || !location) {
    return res.status(400).json({ error: 'Please provide all required event details (club, title, description, date, time, location).' });
  }

  const id = `evt-${Date.now()}`;
  const now = new Date().toISOString();
  const createdBy = req.user!.id;

  try {
    db.prepare(`
      INSERT INTO events (id, club_id, title, description, date, time, location, points_value, max_capacity, status, banner_color, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?, ?)
    `).run(id, clubId, title.trim(), description.trim(), date, time.trim(), location.trim(), pointsValue, maxCapacity, bannerColor, createdBy, now);

    db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, points_earned, created_at)
      VALUES (?, ?, 'created_event', ?, ?, 0, ?)
    `).run(`act-${Date.now()}`, createdBy, `Created event: ${title}`, `Scheduled new event on ${date}`, now);

    const createdEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    return res.status(201).json({ event: createdEvent });
  } catch (err: any) {
    console.error('Error creating event:', err);
    return res.status(500).json({ error: 'Failed to create event.' });
  }
});

apiRouter.put('/events/:id', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, date, time, location, pointsValue, maxCapacity, status } = req.body;

  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Event not found' });
  }

  db.prepare(`
    UPDATE events
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        location = COALESCE(?, location),
        points_value = COALESCE(?, points_value),
        max_capacity = COALESCE(?, max_capacity),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(
    title !== undefined ? title.trim() : null,
    description !== undefined ? description.trim() : null,
    date || null,
    time !== undefined ? time.trim() : null,
    location !== undefined ? location.trim() : null,
    pointsValue !== undefined ? Number(pointsValue) : null,
    maxCapacity !== undefined ? Number(maxCapacity) : null,
    status || null,
    id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  return res.json({ success: true, message: 'Event updated successfully!', event: updated });
});

apiRouter.delete('/events/:id', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT title FROM events WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Event not found' });
  }

  db.prepare('DELETE FROM events WHERE id = ?').run(id);
  return res.json({ success: true, message: `Event "${existing.title}" deleted successfully.` });
});

apiRouter.post('/events/:id/register', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  // Strictly enforce authenticated user ID (prevent IDOR)
  const userId = req.user!.id;

  // The Admin acts strictly as the Controller of the App and cannot register for events as an attendee
  if (req.user?.role === 'admin') {
    return res.status(403).json({ error: 'Administrators control the application and cannot register for events as attendees.' });
  }

  const event = db.prepare(`
    SELECT e.*, c.name as club_name,
      (SELECT count(*) FROM event_registrations WHERE event_id = e.id AND status != 'cancelled') as registered_count
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.id = ?
  `).get(id) as any;

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (event.status !== 'upcoming') {
    return res.status(400).json({ error: 'Registrations are only open for upcoming events.' });
  }

  if (event.registered_count >= event.max_capacity) {
    return res.status(400).json({ error: 'This event has reached full capacity.' });
  }

  // Prevent duplicate registration
  const existing = db.prepare('SELECT id, status FROM event_registrations WHERE event_id = ? AND user_id = ?').get(id, userId) as any;
  if (existing) {
    if (existing.status === 'cancelled') {
      // Re-activate registration
      db.prepare("UPDATE event_registrations SET status = 'registered', registered_at = ? WHERE id = ?").run(new Date().toISOString(), existing.id);
      return res.json({ success: true, message: 'Registration reactivated successfully!' });
    }
    return res.status(409).json({ error: 'You are already registered for this event.' });
  }

  const regId = `reg-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO event_registrations (id, event_id, user_id, registered_at, status)
    VALUES (?, ?, ?, ?, 'registered')
  `).run(regId, id, userId, now);

  // Log activity
  db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, points_earned, created_at)
    VALUES (?, ?, 'registered_event', ?, ?, 0, ?)
  `).run(
    `act-${Date.now()}`,
    userId,
    `Registered for ${event.title}`,
    `Secured ticket for ${event.title} organized by ${event.club_name}.`,
    now
  );

  return res.status(201).json({ success: true, message: `Successfully registered for ${event.title}!` });
});

apiRouter.delete('/events/:id/register', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  // Strictly enforce authenticated user ID (prevent IDOR)
  const userId = req.user!.id;

  const result = db.prepare('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?').run(id, userId);
  if (result.changes > 0) {
    return res.json({ success: true, message: 'Registration cancelled.' });
  }

  return res.status(400).json({ error: 'You are not registered for this event.' });
});

// ----------------------------------------------------
// ATTENDANCE TRACKING & POINTS AWARDING (Protected)
// ----------------------------------------------------

apiRouter.get('/events/:id/attendance', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const records = db.prepare(`
    SELECT u.id as user_id, u.name, u.email, u.student_id, u.department, u.year, u.section, u.gender, u.avatar, u.points,
      r.status as reg_status,
      COALESCE(a.status, 'unmarked') as attendance_status,
      a.points_awarded,
      a.verified_at,
      u2.name as marked_by_name
    FROM event_registrations r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN attendance a ON a.event_id = r.event_id AND a.user_id = r.user_id
    LEFT JOIN users u2 ON a.marked_by = u2.id
    WHERE r.event_id = ? AND u.role != 'admin'
    ORDER BY u.year ASC, u.section ASC, u.name ASC
  `).all(id);

  return res.json({ event, attendees: records });
});

apiRouter.post('/events/:id/attendance', requireAuth, requireRole(['admin', 'coordinator']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { userId, status } = req.body;
  // Strictly enforce that markedBy is the authenticated user making the request
  const markedBy = req.user!.id;

  if (!userId || !status) {
    return res.status(400).json({ error: 'User ID and status (present/absent) are required.' });
  }

  if (status !== 'present' && status !== 'absent') {
    return res.status(400).json({ error: 'Status must be present or absent.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const student = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  // The Admin acts strictly as the Controller of the App: No attendance may be logged for an Admin ID
  if (student.role === 'admin') {
    return res.status(400).json({ error: 'Attendance cannot be logged or counted for Administrator accounts.' });
  }

  const now = new Date().toISOString();
  const existingAttendance = db.prepare('SELECT * FROM attendance WHERE event_id = ? AND user_id = ?').get(id, userId) as any;

  let pointsToAward = 0;
  if (status === 'present') {
    pointsToAward = 5; // 1 participation = 5 points
  }

  if (existingAttendance) {
    // If they were already present and now absent, retract points
    if (existingAttendance.status === 'present' && status === 'absent') {
      db.prepare('UPDATE users SET points = MAX(0, points - ?) WHERE id = ?').run(existingAttendance.points_awarded || 5, userId);
      pointsToAward = 0;
    } else if (existingAttendance.status === 'absent' && status === 'present') {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(5, userId);
    }

    db.prepare(`
      UPDATE attendance
      SET status = ?, marked_by = ?, points_awarded = ?, verified_at = ?
      WHERE event_id = ? AND user_id = ?
    `).run(status, markedBy, pointsToAward, now, id, userId);
  } else {
    // Insert new attendance record
    db.prepare(`
      INSERT INTO attendance (id, event_id, user_id, status, marked_by, points_awarded, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`att-${Date.now()}`, id, userId, status, markedBy, pointsToAward, now);

    if (status === 'present') {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(5, userId);
    }
  }

  // Update registration status
  db.prepare(`
    UPDATE event_registrations
    SET status = ?
    WHERE event_id = ? AND user_id = ?
  `).run(status === 'present' ? 'attended' : 'registered', id, userId);

  // If present, add activity record & check badge thresholds
  if (status === 'present') {
    db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, points_earned, created_at)
      VALUES (?, ?, 'attended_event', ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`,
      userId,
      `Verified Attendance: ${event.title}`,
      `Earned ${pointsToAward} participation points for attending ${event.title}.`,
      pointsToAward,
      now
    );

    // Check if new points reached milestone badges
    const updatedUser = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
    if (updatedUser.points >= 300) {
      const existingBadge = db.prepare("SELECT 1 FROM achievements WHERE user_id = ? AND badge_name = 'Silver Scholar'").get(userId);
      if (!existingBadge) {
        db.prepare(`
          INSERT INTO achievements (id, user_id, badge_name, badge_icon, description, points_threshold, awarded_at)
          VALUES (?, ?, 'Silver Scholar', 'Medal', 'Reached 300+ participation points milestone!', 300, ?)
        `).run(`ach-${Date.now()}`, userId, now);
      }
    }
    if (updatedUser.points >= 500) {
      const existingBadge = db.prepare("SELECT 1 FROM achievements WHERE user_id = ? AND badge_name = 'Campus Legend'").get(userId);
      if (!existingBadge) {
        db.prepare(`
          INSERT INTO achievements (id, user_id, badge_name, badge_icon, description, points_threshold, awarded_at)
          VALUES (?, ?, 'Campus Legend', 'Crown', 'Surpassed 500 participation points!', 500, ?)
        `).run(`ach-${Date.now()}`, userId, now);
      }
    }
  }

  // Update event status to completed if coordinator wishes or keep active
  const remainingAttendees = db.prepare('SELECT count(*) as count FROM attendance WHERE event_id = ?').get(id) as any;
  if (remainingAttendees.count > 0 && event.status === 'upcoming') {
    db.prepare("UPDATE events SET status = 'completed' WHERE id = ?").run(id);
  }

  const updatedStudent = db.prepare('SELECT id, name, points FROM users WHERE id = ?').get(userId);
  return res.json({
    success: true,
    message: status === 'present' ? `Marked ${student.name} as Present (+${pointsToAward} pts)` : `Marked ${student.name} as Absent`,
    student: updatedStudent,
    pointsAwarded: pointsToAward,
  });
});

// ----------------------------------------------------
// LEADERBOARD (Publicly accessible with sanitized scores)
// ----------------------------------------------------

apiRouter.get('/leaderboard', (req, res) => {
  const { year, section, type } = req.query;
  const isAttendanceRank = type === 'attendance';

  let query = `
    SELECT u.id, u.name, u.email, u.student_id, u.department, u.year, u.section, u.gender, u.avatar,
      (SELECT count(*) FROM attendance WHERE user_id = u.id AND status = 'present') as attended_count,
      (SELECT count(*) FROM event_registrations WHERE user_id = u.id) as total_registered,
      (SELECT count(*) FROM club_members WHERE user_id = u.id) as clubs_count
    FROM users u
    WHERE (u.role = 'student' OR u.role = 'coordinator') AND u.role != 'admin' AND u.email != 'kunal@clubsphere.edu'
  `;
  const params: any[] = [];

  if (year) {
    query += ' AND u.year = ?';
    params.push(Number(year));
  }

  if (section) {
    query += ' AND u.section = ?';
    params.push(String(section).toUpperCase());
  }

  if (isAttendanceRank) {
    query += ' ORDER BY attended_count DESC, total_registered DESC, u.name ASC';
  } else {
    query += ' ORDER BY (attended_count * 5) DESC, attended_count DESC, u.name ASC';
  }

  const rawStudents = db.prepare(query).all(...params) as any[];

  // Attach badges, calculate 5 pts per participation and attendance rate
  const studentsWithStats = rawStudents.map((student, idx) => {
    const attended = Number(student.attended_count) || 0;
    const registered = Math.max(attended, Number(student.total_registered) || 0);
    const points = attended * 5;
    const attendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : (attended > 0 ? 100 : 0);

    const badges = db.prepare(`
      SELECT badge_name, badge_icon, description, awarded_at
      FROM achievements
      WHERE user_id = ?
      ORDER BY awarded_at DESC
    `).all(student.id);

    return {
      ...student,
      points,
      participations_count: attended,
      attended_count: attended,
      total_registered: registered,
      attendance_rate: attendanceRate,
      rank: idx + 1,
      attendance_rank: idx + 1,
      badges,
    };
  });

  return res.json({ leaderboard: studentsWithStats, type: isAttendanceRank ? 'attendance' : 'points' });
});

// ----------------------------------------------------
// USER ROLE MANAGEMENT (ADMIN STRICT)
// ----------------------------------------------------

apiRouter.patch('/users/:id/role', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === 'usr-kunal') {
    return res.status(403).json({ error: 'Cannot modify primary administrator role.' });
  }

  if (!role || !['student', 'coordinator', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Valid role required (student, coordinator, admin).' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  const updated = db.prepare('SELECT id, name, email, role, department, points FROM users WHERE id = ?').get(id);
  return res.json({ user: updated });
});

apiRouter.patch('/users/:id/points', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { points } = req.body;
  if (points === undefined || typeof points !== 'number') {
    return res.status(400).json({ error: 'Valid points number required' });
  }

  db.prepare('UPDATE users SET points = ? WHERE id = ?').run(Number(points), id);
  const updated = db.prepare('SELECT id, name, email, role, department, points FROM users WHERE id = ?').get(id);
  return res.json({ success: true, user: updated, message: `Points updated to ${points}` });
});

apiRouter.delete('/users/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (id === 'usr-kunal') {
    return res.status(403).json({ error: 'Cannot delete Super Administrator account.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return res.json({ success: true, message: 'User removed from college database.' });
});

// ----------------------------------------------------
// RESET DEMO DATA (ADMIN STRICT)
// ----------------------------------------------------

apiRouter.post('/reset-demo', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  try {
    db.exec(`
      DELETE FROM activities;
      DELETE FROM achievements;
      DELETE FROM attendance;
      DELETE FROM event_registrations;
      DELETE FROM events;
      DELETE FROM club_members;
      DELETE FROM clubs;
      DELETE FROM users;
    `);
    seedDatabase();
    return res.json({ success: true, message: 'Database reset to demo state successfully.' });
  } catch (err: any) {
    console.error('Error resetting database:', err);
    return res.status(500).json({ error: 'Failed to reset database.' });
  }
});

export { apiRouter };


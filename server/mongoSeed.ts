import { connectMongoDB, isMongoConnected, disconnectMongoDB } from './mongodb';
import {
  User,
  Club,
  ClubMember,
  Event,
  EventRegistration,
  Attendance,
  Achievement,
  Activity,
} from './models';
import { generateAnimatedAvatar } from './avatarGenerator';

export async function seedMongoDB() {
  const connected = await connectMongoDB();
  if (!connected) {
    throw new Error('Could not connect to MongoDB. Please check your MONGODB_URI.');
  }

  console.log('[MongoSeed] 🔄 Resetting and seeding MongoDB collections...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    ClubMember.deleteMany({}),
    Event.deleteMany({}),
    EventRegistration.deleteMany({}),
    Attendance.deleteMany({}),
    Achievement.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const now = new Date().toISOString();

  const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeOnFirstLogin!';

  // 1. Users
  const usersData = [
    {
      id: 'usr-kunal',
      name: 'Kunal Gaur',
      email: 'kunal@clubsphere.edu',
      password: adminInitialPassword,
      role: 'admin',
      student_id: 'ADMIN-001',
      department: 'Dean of Student Affairs & Technology',
      year: 2,
      section: 'A',
      gender: 'male',
      avatar: generateAnimatedAvatar('male', 'Kunal Gaur'),
      points: 0,
      created_at: now,
    },
    {
      id: 'usr-admin',
      name: 'Prof. Robert Vance',
      email: 'admin@college.edu',
      password: adminInitialPassword,
      role: 'admin',
      student_id: 'FAC-8801',
      department: 'Student Affairs Directorate',
      year: 2,
      section: 'A',
      gender: 'male',
      avatar: generateAnimatedAvatar('male', 'Robert Vance'),
      points: 0,
      created_at: now,
    },
    {
      id: 'usr-alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'CS-2025-042',
      department: 'Computer Science & Engineering',
      year: 1,
      section: 'A',
      gender: 'male',
      avatar: generateAnimatedAvatar('male', 'Alex Rivera'),
      points: 20,
      created_at: now,
    },
    {
      id: 'usr-sophia',
      name: 'Sophia Patel',
      email: 'sophia.p@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'CS-2025-018',
      department: 'Computer Science & Engineering',
      year: 1,
      section: 'A',
      gender: 'female',
      avatar: generateAnimatedAvatar('female', 'Sophia Patel'),
      points: 25,
      created_at: now,
    },
    {
      id: 'usr-liam',
      name: 'Liam Chen',
      email: 'liam.c@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'EC-2025-031',
      department: 'Electronics & Communication',
      year: 1,
      section: 'B',
      gender: 'male',
      avatar: generateAnimatedAvatar('male', 'Liam Chen'),
      points: 10,
      created_at: now,
    },
    {
      id: 'usr-emma',
      name: 'Emma Davis',
      email: 'emma.d@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'IT-2025-055',
      department: 'Information Technology',
      year: 1,
      section: 'B',
      gender: 'female',
      avatar: generateAnimatedAvatar('female', 'Emma Davis'),
      points: 15,
      created_at: now,
    },
    {
      id: 'usr-priya',
      name: 'Priya Sharma',
      email: 'priya.s@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'CS-2024-019',
      department: 'Information Technology',
      year: 2,
      section: 'A',
      gender: 'female',
      avatar: generateAnimatedAvatar('female', 'Priya Sharma'),
      points: 40,
      created_at: now,
    },
    {
      id: 'usr-marcus',
      name: 'Marcus Chen',
      email: 'marcus.c@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'ME-2024-088',
      department: 'Mechanical Engineering',
      year: 2,
      section: 'A',
      gender: 'male',
      avatar: generateAnimatedAvatar('male', 'Marcus Chen'),
      points: 30,
      created_at: now,
    },
    {
      id: 'usr-maya',
      name: 'Maya Lin',
      email: 'maya.lin@college.edu',
      password: 'coordinator123',
      role: 'coordinator',
      student_id: 'EC-2024-118',
      department: 'Robotics & Automation',
      year: 2,
      section: 'A',
      gender: 'female',
      avatar: generateAnimatedAvatar('female', 'Maya Lin'),
      points: 35,
      created_at: now,
    },
    {
      id: 'usr-david',
      name: 'David Kim',
      email: 'david.k@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'DS-2024-012',
      department: 'Data Science & Analytics',
      year: 2,
      section: 'B',
      gender: 'male',
      avatar: generateAnimatedAvatar('male', 'David Kim'),
      points: 5,
      created_at: now,
    },
    {
      id: 'usr-ananya',
      name: 'Ananya Gupta',
      email: 'ananya.g@college.edu',
      password: 'student123',
      role: 'student',
      student_id: 'AI-2024-077',
      department: 'Artificial Intelligence & ML',
      year: 2,
      section: 'B',
      gender: 'female',
      avatar: generateAnimatedAvatar('female', 'Ananya Gupta'),
      points: 10,
      created_at: now,
    },
  ];

  await User.insertMany(usersData);
  console.log(`[MongoSeed] ✅ Inserted ${usersData.length} Users.`);

  // 2. Clubs
  const clubsData = [
    {
      id: 'club-coding',
      name: 'Coding Club',
      category: 'Technology & Development',
      description: 'Empowering student engineers through competitive programming, open source hackathons, web & AI development, and peer mentorship.',
      lead_coordinator_id: 'usr-alex',
      logo_icon: 'Code',
      banner_gradient: 'from-blue-600 to-indigo-700',
      location: 'Turing Lab, Turing Hall 302',
      meeting_schedule: 'Every Tuesday & Thursday, 5:30 PM',
      member_count: 48,
      created_at: now,
    },
    {
      id: 'club-robotics',
      name: 'Robotics Club',
      category: 'Engineering & Hardware',
      description: 'Designing autonomous rovers, drone swarms, and combat bots. Competing in national collegiate robotics challenges with hands-on maker labs.',
      lead_coordinator_id: 'usr-maya',
      logo_icon: 'Cpu',
      banner_gradient: 'from-indigo-600 to-purple-700',
      location: 'Mechatronics Bay, Engineering Block B',
      meeting_schedule: 'Every Wednesday, 4:00 PM',
      member_count: 36,
      created_at: now,
    },
    {
      id: 'club-sports',
      name: 'Sports & Athletics Club',
      category: 'Fitness & Athletics',
      description: 'Promoting athletic excellence, team spirit, and campus wellness through inter-collegiate tournaments in football, basketball, badminton, and track.',
      lead_coordinator_id: 'usr-marcus',
      logo_icon: 'Trophy',
      banner_gradient: 'from-emerald-600 to-teal-700',
      location: 'University Sports Complex & Field 1',
      meeting_schedule: 'Mon / Wed / Sat, 6:00 AM & 5:00 PM',
      member_count: 72,
      created_at: now,
    },
    {
      id: 'club-music',
      name: 'Music & Acoustics Club',
      category: 'Arts & Performance',
      description: 'A sanctuary for vocalists, instrumentalists, and music producers. Organizing open-mic jam nights, studio sessions, and the campus annual fest band battle.',
      lead_coordinator_id: 'usr-priya',
      logo_icon: 'Music',
      banner_gradient: 'from-rose-500 to-indigo-600',
      location: 'Auditorium Sound Studio & Amphitheatre',
      meeting_schedule: 'Every Friday, 6:00 PM',
      member_count: 41,
      created_at: now,
    },
    {
      id: 'club-photography',
      name: 'Photography & Visual Arts',
      category: 'Media & Design',
      description: 'Capturing campus life, street photography, and visual storytelling. Features darkroom technique workshops, golden hour photo walks, and exhibitions.',
      lead_coordinator_id: 'usr-david',
      logo_icon: 'Camera',
      banner_gradient: 'from-amber-500 to-orange-600',
      location: 'Visual Arts Media Lab, Block C',
      meeting_schedule: 'Alternate Saturdays, 10:00 AM',
      member_count: 29,
      created_at: now,
    },
  ];

  await Club.insertMany(clubsData);
  console.log(`[MongoSeed] ✅ Inserted ${clubsData.length} Clubs.`);

  // 3. Club Members
  const membersData = [
    { id: 'cm-1', club_id: 'club-coding', user_id: 'usr-alex', role: 'member', joined_at: now },
    { id: 'cm-2', club_id: 'club-photography', user_id: 'usr-alex', role: 'member', joined_at: now },
    { id: 'cm-3', club_id: 'club-robotics', user_id: 'usr-maya', role: 'coordinator', joined_at: now },
    { id: 'cm-4', club_id: 'club-coding', user_id: 'usr-maya', role: 'member', joined_at: now },
    { id: 'cm-5', club_id: 'club-music', user_id: 'usr-priya', role: 'coordinator', joined_at: now },
    { id: 'cm-6', club_id: 'club-coding', user_id: 'usr-priya', role: 'member', joined_at: now },
    { id: 'cm-7', club_id: 'club-sports', user_id: 'usr-marcus', role: 'member', joined_at: now },
    { id: 'cm-8', club_id: 'club-robotics', user_id: 'usr-marcus', role: 'member', joined_at: now },
    { id: 'cm-9', club_id: 'club-photography', user_id: 'usr-david', role: 'member', joined_at: now },
    { id: 'cm-10', club_id: 'club-sports', user_id: 'usr-david', role: 'member', joined_at: now },
    { id: 'cm-11', club_id: 'club-coding', user_id: 'usr-sophia', role: 'member', joined_at: now },
    { id: 'cm-12', club_id: 'club-music', user_id: 'usr-sophia', role: 'member', joined_at: now },
    { id: 'cm-13', club_id: 'club-robotics', user_id: 'usr-liam', role: 'member', joined_at: now },
    { id: 'cm-14', club_id: 'club-coding', user_id: 'usr-liam', role: 'member', joined_at: now },
    { id: 'cm-15', club_id: 'club-photography', user_id: 'usr-emma', role: 'member', joined_at: now },
    { id: 'cm-16', club_id: 'club-coding', user_id: 'usr-emma', role: 'member', joined_at: now },
    { id: 'cm-17', club_id: 'club-coding', user_id: 'usr-ananya', role: 'member', joined_at: now },
    { id: 'cm-18', club_id: 'club-robotics', user_id: 'usr-ananya', role: 'member', joined_at: now },
  ];

  await ClubMember.insertMany(membersData);
  console.log(`[MongoSeed] ✅ Inserted ${membersData.length} Club Members.`);

  // 4. Events
  const eventsData = [
    {
      id: 'evt-hackathon-2026',
      club_id: 'club-coding',
      title: 'Campus HackForge 2026: 24h AI Sprint',
      description: 'Join 200+ collegiate builders in creating AI-powered social impact solutions. Mentorship from alumni engineers, keynote workshops, and $5,000 in prizes!',
      date: '2026-10-25',
      time: '09:00 AM - Next Day',
      location: 'Main Innovation Hub & Lab 4',
      points_value: 5,
      max_capacity: 150,
      status: 'upcoming',
      banner_color: '#3B82F6',
      created_by: 'usr-alex',
      created_at: now,
    },
    {
      id: 'evt-bot-battle',
      club_id: 'club-robotics',
      title: 'Autonomous RoboWars & Drone Obstacle Derby',
      description: 'Watch combat bots test their structural and algorithmic limits. Interactive drone flight demo arena open to all registered spectators.',
      date: '2026-10-30',
      time: '02:00 PM - 06:00 PM',
      location: 'Indoor Sports Arena & Ring',
      points_value: 5,
      max_capacity: 100,
      status: 'upcoming',
      banner_color: '#6366F1',
      created_by: 'usr-maya',
      created_at: now,
    },
    {
      id: 'evt-football-derby',
      club_id: 'club-sports',
      title: 'Inter-Department 7v7 Football Clash',
      description: 'The classic annual varsity 7v7 tournament. Represent your department, cheer on your peers, and compete for the golden campus shield.',
      date: '2026-11-05',
      time: '04:30 PM - 08:30 PM',
      location: 'University Football Field 1',
      points_value: 5,
      max_capacity: 80,
      status: 'upcoming',
      banner_color: '#10B981',
      created_by: 'usr-marcus',
      created_at: now,
    },
    {
      id: 'evt-golden-hour-walk',
      club_id: 'club-photography',
      title: 'Golden Hour Architectural Walk & Portrait Lab',
      description: 'Explore campus brutalist architecture during golden hour with expert guidance on composition, natural lighting, and color grading.',
      date: '2026-11-12',
      time: '04:45 PM - 07:15 PM',
      location: 'Clock Tower Quad & Botanical Gardens',
      points_value: 5,
      max_capacity: 40,
      status: 'upcoming',
      banner_color: '#F59E0B',
      created_by: 'usr-david',
      created_at: now,
    },
    {
      id: 'evt-git-workshop',
      club_id: 'club-coding',
      title: 'Hands-on Git, GitHub & Open Source Workshop',
      description: 'Mastering Git rebase, multi-developer pull request workflows, CI/CD pipelines, and contributing to open-source software.',
      date: '2026-10-02',
      time: '05:00 PM - 07:30 PM',
      location: 'Turing Hall 302',
      points_value: 5,
      max_capacity: 60,
      status: 'completed',
      banner_color: '#3B82F6',
      created_by: 'usr-alex',
      created_at: now,
    },
    {
      id: 'evt-acoustic-night',
      club_id: 'club-music',
      title: 'Moonlit Acoustic Jam & Open Mic',
      description: 'A cozy evening of unplugged vocals, indie folk performances, and student singer-songwriter showcases under the stars.',
      date: '2026-09-26',
      time: '07:00 PM - 10:00 PM',
      location: 'Campus Amphitheatre',
      points_value: 5,
      max_capacity: 90,
      status: 'completed',
      banner_color: '#EC4899',
      created_by: 'usr-priya',
      created_at: now,
    },
    {
      id: 'evt-rover-bootcamp',
      club_id: 'club-robotics',
      title: 'Arduino & Motor Control Fundamentals',
      description: 'Deep dive into PWM signals, motor H-bridges, sonar sensors, and breadboard circuit debugging for freshman robotics builders.',
      date: '2026-09-18',
      time: '03:00 PM - 06:00 PM',
      location: 'Mechatronics Bay 104',
      points_value: 5,
      max_capacity: 50,
      status: 'completed',
      banner_color: '#8B5CF6',
      created_by: 'usr-maya',
      created_at: now,
    },
    {
      id: 'evt-web-summit',
      club_id: 'club-coding',
      title: 'Modern Fullstack Web Architecture Summit',
      description: 'Building reactive real-time web applications with modern toolchains, micro-frontends, and cloud deployment.',
      date: '2026-09-12',
      time: '04:00 PM - 07:00 PM',
      location: 'Hall 101',
      points_value: 5,
      max_capacity: 60,
      status: 'completed',
      banner_color: '#3B82F6',
      created_by: 'usr-alex',
      created_at: now,
    },
    {
      id: 'evt-badminton-cup',
      club_id: 'club-sports',
      title: 'Intra-College Smash Badminton Cup',
      description: 'Fast-paced doubles and singles tournament with points for every active participant.',
      date: '2026-09-08',
      time: '05:00 PM - 08:00 PM',
      location: 'Sports Pavilion',
      points_value: 5,
      max_capacity: 50,
      status: 'completed',
      banner_color: '#10B981',
      created_by: 'usr-marcus',
      created_at: now,
    },
    {
      id: 'evt-photo-walk',
      club_id: 'club-photography',
      title: 'Campus Brutalist Photo Walk & Portrait Lab',
      description: 'Hands-on photography walk exploring architectural angles and natural light portraits.',
      date: '2026-09-02',
      time: '04:00 PM - 06:30 PM',
      location: 'Clock Tower Quad',
      points_value: 5,
      max_capacity: 40,
      status: 'completed',
      banner_color: '#F59E0B',
      created_by: 'usr-david',
      created_at: now,
    },
    {
      id: 'evt-algo-sprint',
      club_id: 'club-coding',
      title: 'Competitive Algorithm & LeetCode Blitz',
      description: 'Timed problem solving sprint tackling graphs, dynamic programming, and binary search.',
      date: '2026-08-28',
      time: '05:30 PM - 07:30 PM',
      location: 'Lab 2',
      points_value: 5,
      max_capacity: 50,
      status: 'completed',
      banner_color: '#3B82F6',
      created_by: 'usr-alex',
      created_at: now,
    },
    {
      id: 'evt-ai-primer',
      club_id: 'club-coding',
      title: 'Neural Networks & Deep Learning Primer',
      description: 'Introductory workshop on tensors, convolutional networks, and local LLM execution.',
      date: '2026-08-20',
      time: '04:00 PM - 06:30 PM',
      location: 'Turing Hall 302',
      points_value: 5,
      max_capacity: 50,
      status: 'completed',
      banner_color: '#3B82F6',
      created_by: 'usr-sophia',
      created_at: now,
    },
  ];

  await Event.insertMany(eventsData);
  console.log(`[MongoSeed] ✅ Inserted ${eventsData.length} Events.`);

  // 5. Registrations & Attendance
  const registrations: any[] = [];
  const attendances: any[] = [];

  const addRegAtt = (
    prefix: string,
    events: string[],
    userId: string,
    verifiedBy: string = 'usr-admin'
  ) => {
    events.forEach((eid, idx) => {
      registrations.push({
        id: `reg-${prefix}-${idx}`,
        event_id: eid,
        user_id: userId,
        registered_at: now,
        status: 'attended',
      });
      attendances.push({
        id: `att-${prefix}-${idx}`,
        event_id: eid,
        user_id: userId,
        status: 'present',
        marked_by: verifiedBy,
        points_awarded: 5,
        verified_at: now,
      });
    });
  };

  // Priya: 8 attended
  addRegAtt(
    'p',
    ['evt-git-workshop', 'evt-acoustic-night', 'evt-rover-bootcamp', 'evt-web-summit', 'evt-badminton-cup', 'evt-photo-walk', 'evt-algo-sprint', 'evt-ai-primer'],
    'usr-priya'
  );
  registrations.push({ id: 'reg-p-up', event_id: 'evt-hackathon-2026', user_id: 'usr-priya', registered_at: now, status: 'registered' });

  // Maya: 7 attended, 1 absent
  addRegAtt(
    'm',
    ['evt-git-workshop', 'evt-acoustic-night', 'evt-rover-bootcamp', 'evt-web-summit', 'evt-badminton-cup', 'evt-algo-sprint', 'evt-ai-primer'],
    'usr-maya'
  );
  registrations.push({ id: 'reg-m-abs', event_id: 'evt-photo-walk', user_id: 'usr-maya', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-m-abs', event_id: 'evt-photo-walk', user_id: 'usr-maya', status: 'absent', marked_by: 'usr-admin', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-m-up', event_id: 'evt-hackathon-2026', user_id: 'usr-maya', registered_at: now, status: 'registered' });

  // Marcus: 6 attended, 1 absent
  addRegAtt(
    'mc',
    ['evt-git-workshop', 'evt-acoustic-night', 'evt-rover-bootcamp', 'evt-badminton-cup', 'evt-algo-sprint', 'evt-ai-primer'],
    'usr-marcus'
  );
  registrations.push({ id: 'reg-mc-abs', event_id: 'evt-web-summit', user_id: 'usr-marcus', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-mc-abs', event_id: 'evt-web-summit', user_id: 'usr-marcus', status: 'absent', marked_by: 'usr-admin', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-mc-up', event_id: 'evt-football-derby', user_id: 'usr-marcus', registered_at: now, status: 'registered' });

  // Sophia: 5 attended
  addRegAtt(
    'sp',
    ['evt-git-workshop', 'evt-web-summit', 'evt-algo-sprint', 'evt-ai-primer', 'evt-acoustic-night'],
    'usr-sophia'
  );
  registrations.push({ id: 'reg-sp-up', event_id: 'evt-hackathon-2026', user_id: 'usr-sophia', registered_at: now, status: 'registered' });

  // Alex: 4 attended, 1 absent
  addRegAtt('al', ['evt-git-workshop', 'evt-acoustic-night', 'evt-web-summit', 'evt-algo-sprint'], 'usr-alex', 'usr-maya');
  registrations.push({ id: 'reg-al-abs', event_id: 'evt-rover-bootcamp', user_id: 'usr-alex', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-al-abs', event_id: 'evt-rover-bootcamp', user_id: 'usr-alex', status: 'absent', marked_by: 'usr-maya', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-al-up', event_id: 'evt-hackathon-2026', user_id: 'usr-alex', registered_at: now, status: 'registered' });

  // Emma: 3 attended, 1 absent
  addRegAtt('em', ['evt-git-workshop', 'evt-web-summit', 'evt-ai-primer'], 'usr-emma');
  registrations.push({ id: 'reg-em-abs', event_id: 'evt-algo-sprint', user_id: 'usr-emma', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-em-abs', event_id: 'evt-algo-sprint', user_id: 'usr-emma', status: 'absent', marked_by: 'usr-admin', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-em-up', event_id: 'evt-golden-hour-walk', user_id: 'usr-emma', registered_at: now, status: 'registered' });

  // Liam: 2 attended, 1 absent
  addRegAtt('lm', ['evt-git-workshop', 'evt-rover-bootcamp'], 'usr-liam');
  registrations.push({ id: 'reg-lm-abs', event_id: 'evt-algo-sprint', user_id: 'usr-liam', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-lm-abs', event_id: 'evt-algo-sprint', user_id: 'usr-liam', status: 'absent', marked_by: 'usr-admin', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-lm-up', event_id: 'evt-bot-battle', user_id: 'usr-liam', registered_at: now, status: 'registered' });

  // Ananya: 2 attended
  addRegAtt('an', ['evt-ai-primer', 'evt-algo-sprint'], 'usr-ananya');
  registrations.push({ id: 'reg-an-up', event_id: 'evt-hackathon-2026', user_id: 'usr-ananya', registered_at: now, status: 'registered' });

  // David: 1 attended, 2 absent
  registrations.push({ id: 'reg-dv-0', event_id: 'evt-photo-walk', user_id: 'usr-david', registered_at: now, status: 'attended' });
  attendances.push({ id: 'att-dv-0', event_id: 'evt-photo-walk', user_id: 'usr-david', status: 'present', marked_by: 'usr-admin', points_awarded: 5, verified_at: now });
  registrations.push({ id: 'reg-dv-abs1', event_id: 'evt-git-workshop', user_id: 'usr-david', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-dv-abs1', event_id: 'evt-git-workshop', user_id: 'usr-david', status: 'absent', marked_by: 'usr-admin', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-dv-abs2', event_id: 'evt-algo-sprint', user_id: 'usr-david', registered_at: now, status: 'registered' });
  attendances.push({ id: 'att-dv-abs2', event_id: 'evt-algo-sprint', user_id: 'usr-david', status: 'absent', marked_by: 'usr-admin', points_awarded: 0, verified_at: now });
  registrations.push({ id: 'reg-dv-up', event_id: 'evt-golden-hour-walk', user_id: 'usr-david', registered_at: now, status: 'registered' });

  await EventRegistration.insertMany(registrations);
  await Attendance.insertMany(attendances);
  console.log(`[MongoSeed] ✅ Inserted ${registrations.length} Registrations and ${attendances.length} Attendance records.`);

  // 6. Achievements
  const achievementsData = [
    { id: 'ach-kunal-1', user_id: 'usr-kunal', badge_name: 'System Master', badge_icon: 'Shield', description: 'Full Administrative and Systems Clearance across ClubSphere', points_threshold: 1000, awarded_at: now },
    { id: 'ach-kunal-2', user_id: 'usr-kunal', badge_name: 'Grand Architect', badge_icon: 'Crown', description: 'Chief of College Student Activities Directorate', points_threshold: 800, awarded_at: now },
    { id: 'ach-1', user_id: 'usr-alex', badge_name: 'Early Bird', badge_icon: 'Zap', description: 'Registered for 3+ events within first 24h of release', points_threshold: 50, awarded_at: now },
    { id: 'ach-2', user_id: 'usr-alex', badge_name: 'Code Crafter', badge_icon: 'Terminal', description: 'Attended inaugural Git & Systems architecture workshop', points_threshold: 100, awarded_at: now },
    { id: 'ach-3', user_id: 'usr-alex', badge_name: 'Double Trouble', badge_icon: 'Users', description: 'Active member of 2 distinct campus student clubs', points_threshold: 150, awarded_at: now },
    { id: 'ach-4', user_id: 'usr-priya', badge_name: 'Campus Legend', badge_icon: 'Crown', description: 'Accumulated 500+ student participation points', points_threshold: 500, awarded_at: now },
    { id: 'ach-5', user_id: 'usr-priya', badge_name: 'Melody Maestro', badge_icon: 'Music', description: 'Spearheaded the Acoustic Jam Festivities', points_threshold: 200, awarded_at: now },
    { id: 'ach-6', user_id: 'usr-priya', badge_name: 'Event Maestro', badge_icon: 'Sparkles', description: 'Maintained 100% verified attendance rate', points_threshold: 300, awarded_at: now },
    { id: 'ach-7', user_id: 'usr-maya', badge_name: 'Robo Pioneer', badge_icon: 'Cpu', description: 'Mentored 30+ students in robotics bootcamp', points_threshold: 250, awarded_at: now },
    { id: 'ach-8', user_id: 'usr-marcus', badge_name: 'Iron Athlete', badge_icon: 'Flame', description: 'Represented Mechanical department in sports tournament', points_threshold: 150, awarded_at: now },
    { id: 'ach-9', user_id: 'usr-david', badge_name: 'Visual Storyteller', badge_icon: 'Camera', description: 'Photographed campus fall exhibition', points_threshold: 100, awarded_at: now },
  ];

  await Achievement.insertMany(achievementsData);
  console.log(`[MongoSeed] ✅ Inserted ${achievementsData.length} Achievements.`);

  // 7. Activities
  const activitiesData = [
    { id: 'act-1', user_id: 'usr-alex', type: 'registered_event', title: 'Registered for HackForge 2026', description: 'Signed up for Campus HackForge 2026: 24h AI Sprint.', points_earned: 0, created_at: '2026-10-10T14:30:00Z' },
    { id: 'act-2', user_id: 'usr-alex', type: 'attended_event', title: 'Attended Git Workshop', description: 'Verified present at Hands-on Git & Open Source Workshop.', points_earned: 50, created_at: '2026-10-02T19:30:00Z' },
    { id: 'act-3', user_id: 'usr-alex', type: 'joined_club', title: 'Joined Photography Club', description: 'Became an active member of Photography & Visual Arts.', points_earned: 20, created_at: '2026-09-28T11:00:00Z' },
    { id: 'act-4', user_id: 'usr-alex', type: 'attended_event', title: 'Attended Moonlit Jam', description: 'Verified attendance at Moonlit Acoustic Jam & Open Mic.', points_earned: 50, created_at: '2026-09-26T22:00:00Z' },
    { id: 'act-5', user_id: 'usr-alex', type: 'joined_club', title: 'Joined Coding Club', description: 'Became an active member of Coding Club.', points_earned: 20, created_at: '2026-09-15T09:00:00Z' },
    { id: 'act-6', user_id: 'usr-maya', type: 'created_event', title: 'Scheduled Bot Battle', description: 'Created Autonomous RoboWars & Drone Obstacle Derby event.', points_earned: 0, created_at: '2026-10-09T16:00:00Z' },
    { id: 'act-7', user_id: 'usr-priya', type: 'earned_points', title: 'Earned Campus Legend Badge', description: 'Surpassed 500 participation points milestone.', points_earned: 50, created_at: '2026-10-08T18:00:00Z' },
  ];

  await Activity.insertMany(activitiesData);
  console.log(`[MongoSeed] ✅ Inserted ${activitiesData.length} Activities.`);

  console.log('[MongoSeed] 🌟 MongoDB Database seeding successfully completed!');
  return {
    users: usersData.length,
    clubs: clubsData.length,
    club_members: membersData.length,
    events: eventsData.length,
    registrations: registrations.length,
    attendance: attendances.length,
    achievements: achievementsData.length,
    activities: activitiesData.length,
  };
}

// Standalone execution
if (process.argv[1]?.endsWith('mongoSeed.ts')) {
  seedMongoDB()
    .then((stats) => {
      console.log('Seed summary:', stats);
      return disconnectMongoDB();
    })
    .catch((err) => {
      console.error('[MongoSeed] Error seeding MongoDB:', err);
      process.exit(1);
    });
}

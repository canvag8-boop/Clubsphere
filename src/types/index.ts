export type UserRole = 'student' | 'coordinator' | 'admin';
export type StudentYear = 1 | 2;
export type StudentSection = 'A' | 'B';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  student_id?: string;
  department?: string;
  year?: StudentYear;
  section?: StudentSection;
  gender?: Gender;
  avatar?: string;
  points: number;
  created_at?: string;
}

export interface ClubMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  year?: StudentYear;
  section?: StudentSection;
  gender?: Gender;
  avatar?: string;
  points: number;
  club_role: 'member' | 'coordinator' | 'lead';
  joined_at: string;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  lead_coordinator_id?: string;
  logo_icon: string;
  banner_gradient: string;
  location: string;
  meeting_schedule: string;
  member_count: number;
  upcoming_events_count?: number;
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_avatar?: string;
  isMember?: boolean;
  members?: ClubMember[];
  events?: Event[];
  created_at?: string;
}

export type EventStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  club_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  points_value: number;
  max_capacity: number;
  status: EventStatus;
  banner_color?: string;
  created_by?: string;
  club_name?: string;
  club_icon?: string;
  club_description?: string;
  registered_count: number;
  isRegistered?: boolean;
  hasAttended?: boolean;
  isFull?: boolean;
  attendees?: Attendee[];
  created_at?: string;
}

export interface Attendee {
  user_id?: string;
  id?: string;
  name: string;
  email: string;
  student_id?: string;
  department?: string;
  year?: StudentYear;
  section?: StudentSection;
  gender?: Gender;
  avatar?: string;
  points: number;
  reg_status?: string;
  attendance_status: 'present' | 'absent' | 'unmarked';
  points_awarded?: number;
  verified_at?: string;
  marked_by_name?: string;
}

export interface Achievement {
  id: string;
  user_id?: string;
  badge_name: string;
  badge_icon: string;
  description: string;
  points_threshold: number;
  awarded_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  points_earned: number;
  created_at: string;
  user_name?: string;
  role?: string;
}

export interface StudentDashboardData {
  user: User;
  stats: {
    clubsJoined: number;
    upcomingEventsCount: number;
    eventsAttended: number;
    participationPoints: number;
  };
  upcomingEvents: Event[];
  recentActivities: Activity[];
  achievements: Achievement[];
  recommendedEvents: Event[];
}

export interface AdminDashboardData {
  stats: {
    totalClubs: number;
    totalStudents: number;
    totalCoordinators: number;
    totalEvents: number;
    totalAttendances: number;
    totalPointsDistributed: number;
  };
  clubs: (Club & { actual_members: number; total_events: number })[];
  recentRegistrations: {
    registered_at: string;
    student_name: string;
    email: string;
    event_title: string;
    club_name: string;
  }[];
  systemActivities: Activity[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  department?: string;
  year?: StudentYear;
  section?: StudentSection;
  gender?: Gender;
  avatar?: string;
  points: number;
  rank: number;
  attendance_rank?: number;
  participations_count?: number;
  attended_count: number;
  total_registered?: number;
  attendance_rate?: number;
  clubs_count: number;
  badges: Achievement[];
}

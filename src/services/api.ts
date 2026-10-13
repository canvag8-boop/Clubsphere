import {
  User,
  Club,
  Event,
  StudentDashboardData,
  AdminDashboardData,
  LeaderboardEntry,
  Attendee,
} from '../types';

const API_BASE = '/api';

export function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('clubsphere_token');
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const apiService = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ user: User; token: string }>(res);
    if (data.token) {
      localStorage.setItem('clubsphere_token', data.token);
    }
    return data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    studentId?: string;
    department?: string;
    year?: number;
    section?: string;
    gender?: string;
    avatar?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ user: User; token: string }>(res);
    if (result.token) {
      localStorage.setItem('clubsphere_token', result.token);
    }
    return result;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getAllUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Student Dashboard
  async getStudentDashboard(userId?: string): Promise<StudentDashboardData> {
    const url = userId
      ? `${API_BASE}/dashboard/student?userId=${encodeURIComponent(userId)}`
      : `${API_BASE}/dashboard/student`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Dashboard
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const res = await fetch(`${API_BASE}/dashboard/admin`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Clubs
  async getClubs(userId?: string): Promise<{ clubs: Club[] }> {
    const url = userId ? `${API_BASE}/clubs?userId=${encodeURIComponent(userId)}` : `${API_BASE}/clubs`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getClubDetails(clubId: string, userId?: string): Promise<{ club: Club }> {
    const url = userId
      ? `${API_BASE}/clubs/${clubId}?userId=${encodeURIComponent(userId)}`
      : `${API_BASE}/clubs/${clubId}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createClub(clubData: {
    name: string;
    category: string;
    description: string;
    location?: string;
    meetingSchedule?: string;
    bannerGradient?: string;
    logoIcon?: string;
    leadCoordinatorId?: string;
  }): Promise<{ club: Club }> {
    const res = await fetch(`${API_BASE}/clubs`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(clubData),
    });
    return handleResponse(res);
  },

  async joinClub(clubId: string, userId?: string): Promise<{ success: boolean; message: string; pointsAwarded: number }> {
    const res = await fetch(`${API_BASE}/clubs/${clubId}/join`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  async leaveClub(clubId: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/clubs/${clubId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  // Events
  async getEvents(userId?: string, clubId?: string): Promise<{ events: Event[]; upcoming: Event[]; completed: Event[] }> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (clubId) params.set('clubId', clubId);
    const res = await fetch(`${API_BASE}/events?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getEventDetails(eventId: string, userId?: string): Promise<{ event: Event }> {
    const url = userId
      ? `${API_BASE}/events/${eventId}?userId=${encodeURIComponent(userId)}`
      : `${API_BASE}/events/${eventId}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createEvent(eventData: {
    clubId: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    pointsValue?: number;
    maxCapacity?: number;
    bannerColor?: string;
    createdBy?: string;
  }): Promise<{ event: Event }> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  async registerForEvent(eventId: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  async cancelEventRegistration(eventId: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  // Attendance
  async getEventAttendance(eventId: string): Promise<{ event: Event; attendees: Attendee[] }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markAttendance(
    eventId: string,
    userId: string,
    status: 'present' | 'absent',
    markedBy?: string
  ): Promise<{ success: boolean; message: string; pointsAwarded: number; student: any }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId, status, markedBy }),
    });
    return handleResponse(res);
  },

  // Leaderboard
  async getLeaderboard(year?: number, section?: string, type?: 'points' | 'attendance'): Promise<{ leaderboard: LeaderboardEntry[]; type?: string }> {
    const params = new URLSearchParams();
    if (year) params.set('year', year.toString());
    if (section) params.set('section', section);
    if (type) params.set('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/leaderboard${query}`);
    return handleResponse(res);
  },

  // Admin User Role Update
  async updateUserRole(userId: string, role: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  async updateUserPoints(userId: string, points: number): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/users/${userId}/points`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ points }),
    });
    return handleResponse(res);
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Edit / Delete Club
  async updateClub(
    clubId: string,
    data: {
      name: string;
      category: string;
      description: string;
      location?: string;
      meetingSchedule?: string;
      logoIcon?: string;
      bannerGradient?: string;
    }
  ): Promise<{ success: boolean; message: string; club: Club }> {
    const res = await fetch(`${API_BASE}/clubs/${clubId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteClub(clubId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/clubs/${clubId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Edit / Delete Event
  async updateEvent(
    eventId: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      time?: string;
      location?: string;
      pointsValue?: number;
      maxCapacity?: number;
      status?: string;
    }
  ): Promise<{ success: boolean; message: string; event: Event }> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reset Demo
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-demo`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

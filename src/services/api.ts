import { User, Course, CourseNote, LectureRecording, Assignment, AssignmentSubmission, Announcement, ChatMessage, AuditLog, StudentPasswordRecord, PdfRequest } from '../types';
import { OFFICIAL_ROSTER_114, StudentRecord } from '../data/rosterData';
import rosterJson from '../data/roster.json';
import coursesJson from '../data/courses.json';
import passwordsJson from '../data/passwords.json';
import auditLogsJson from '../data/auditLogs.json';
import progressMonitorJson from '../data/progressMonitor.json';
import notesJson from '../data/notes.json';
import recordingsJson from '../data/recordings.json';
import assignmentsJson from '../data/assignments.json';
import announcementsJson from '../data/announcements.json';

// In-Memory mutable storage initialized from JSON files (guarantees data exists on static Netlify & fresh page reloads)
let inMemoryCourses: Course[] = [...(coursesJson as Course[])];
let inMemoryPasswords: StudentPasswordRecord[] = (passwordsJson as StudentPasswordRecord[]).map((p) => ({
  ...p,
  password: p.hasPassword ? '******' : '',
}));
let inMemoryAuditLogs: AuditLog[] = [...(auditLogsJson as AuditLog[])];
let inMemoryMonitor: any[] = [...(progressMonitorJson as any[])];
let inMemoryNotes: CourseNote[] = [...(notesJson as CourseNote[])];
let inMemoryRecordings: LectureRecording[] = [...(recordingsJson as LectureRecording[])];
let inMemoryAssignments: Assignment[] = [...(assignmentsJson as Assignment[])];
let inMemoryAnnouncements: Announcement[] = [...(announcementsJson as Announcement[])];
let inMemorySubmissions: AssignmentSubmission[] = [];
let inMemoryPdfRequests: PdfRequest[] = [
  {
    id: 'req-sample-1',
    courseCode: 'MEE 204',
    requestTitle: 'I want ME 204 Fluid Mechanics PDF',
    details: 'Looking for full textbook or lecture slide notes for Chapter 1-4 Fluid Mechanics.',
    requestedByMatric: 'EES/23/24/0006',
    requestedByName: 'Habeebullah Opemipo ABDULKAREEM',
    status: 'fulfilled',
    replies: [
      {
        id: 'rep-1',
        senderMatric: 'EES/23/24/0456',
        senderName: 'Micheal Chukwuemeka OBI',
        senderRole: 'Master Admin',
        senderAvatar: '⚡',
        text: 'Uploaded the complete MEE 204 Fluid Mechanics PDF notes to the Course Notes section! You can download it directly.',
        attachmentName: 'MEE204_Fluid_Mechanics_Complete.pdf',
        attachmentUrl: '#',
        timestamp: '2026-10-02T11:48:36.749Z',
      },
    ],
    timestamp: '2026-10-01T12:48:36.749Z',
  },
];
let inMemoryChatMessages: Record<string, ChatMessage[]> = {
  general: [
    {
      id: 'msg-welcome',
      channelId: 'general',
      senderMatric: 'EES/23/24/0456',
      senderName: 'Micheal Chukwuemeka OBI',
      senderRole: 'Master Admin',
      senderAvatar: '⚡',
      text: 'Welcome to the official 400L Mechanical Engineering ClassHub Commons! All official course notes, recordings, and assignments are accessible here.',
      timestamp: '2026-10-02T12:48:36.749Z',
      reactions: { '👍': ['Micheal Chukwuemeka OBI'] },
    },
  ],
};

// Custom API Error to distinguish legitimate server validation failures from complete network offline failures
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Safe fetch helper that handles empty text, HTML error pages, and network failures without throwing JSON syntax errors
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw new Error('Network unreachable');
  }

  const text = await res.text();

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      if (text && text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        if (parsed.error) errorMsg = parsed.error;
      }
    } catch (_) {}
    throw new ApiError(errorMsg, res.status);
  }

  if (!text || !text.trim()) {
    throw new Error('Empty response received from server');
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error('Invalid JSON response format');
  }
}

export const api = {
  // Authentication & Passwords
  async checkMatric(matricNo: string): Promise<{ success: boolean; matricNo: string; fullName: string; requiresPasswordSetup: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean; matricNo: string; fullName: string; requiresPasswordSetup: boolean }>(
        '/api/auth/check-matric',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matricNo }),
        }
      );
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err;
      }
      // Offline / Static deployment fallback (Netlify) - uses roster.json
      const normalized = matricNo.trim().toUpperCase();
      const student = (rosterJson as StudentRecord[]).find((s) => s.matricNo === normalized);
      if (!student) {
        throw new Error('NO ACCESS: Matriculation number not found in official 114 student register.');
      }
      const passRecord = inMemoryPasswords.find((p) => p.matricNo === student.matricNo);
      return {
        success: true,
        matricNo: student.matricNo,
        fullName: student.fullName,
        requiresPasswordSetup: !passRecord?.hasPassword,
      };
    }
  },

  async setupPassword(matricNo: string, password: string): Promise<{ success: boolean; user: User }> {
    try {
      const res = await safeFetchJson<{ success: boolean; user: User }>('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo, password }),
      });
      const norm = matricNo.trim().toUpperCase();
      const target = inMemoryPasswords.find((p) => p.matricNo === norm);
      if (target) {
        target.hasPassword = true;
        target.password = '******';
      }
      return res;
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err;
      }
      const normalized = matricNo.trim().toUpperCase();
      const student = (rosterJson as StudentRecord[]).find((s) => s.matricNo === normalized);
      if (!student) throw new Error('NO ACCESS: Matriculation number not found.');
      if (password.length < 4) throw new Error('Password must be at least 4 characters long.');

      const target = inMemoryPasswords.find((p) => p.matricNo === student.matricNo);
      if (target) {
        target.hasPassword = true;
        target.password = '******';
      }

      const isMaster = student.matricNo === 'EES/23/24/0456';
      return {
        success: true,
        user: {
          matricNo: student.matricNo,
          fullName: student.fullName,
          department: 'Mechanical Engineering',
          level: student.level,
          isAdmin: isMaster,
          isPartialAdmin: isMaster || student.isPartialAdmin,
          avatarEmoji: student.avatarEmoji,
        },
      };
    }
  },

  async loginWithPassword(matricNo: string, password: string): Promise<{ success: boolean; user: User }> {
    try {
      return await safeFetchJson<{ success: boolean; user: User }>('/api/auth/login-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo, password }),
      });
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err;
      }
      const normalized = matricNo.trim().toUpperCase();
      const student = (rosterJson as StudentRecord[]).find((s) => s.matricNo === normalized);
      if (!student) throw new Error('NO ACCESS: Matriculation number not found in official 114 student register.');

      const isMaster = student.matricNo === 'EES/23/24/0456';
      return {
        success: true,
        user: {
          matricNo: student.matricNo,
          fullName: student.fullName,
          department: 'Mechanical Engineering',
          level: student.level,
          isAdmin: isMaster,
          isPartialAdmin: isMaster || student.isPartialAdmin,
          avatarEmoji: student.avatarEmoji,
        },
      };
    }
  },

  async verifySession(matricNo: string, pass: string): Promise<{ success: boolean; user: User }> {
    return await safeFetchJson<{ success: boolean; user: User }>('/api/auth/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricNo, password: pass }),
    });
  },

  async adminQuickLogin(pin: string): Promise<{ success: boolean; user: User }> {
    try {
      return await safeFetchJson<{ success: boolean; user: User }>('/api/auth/admin-quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
    } catch (err) {
      const hashPin = (p: string) => btoa(p + "MEE_SALT_2026");
      const MASTER_HASH = "NTgzN01FRV9TQUxUXzIwMjY=";
      if (!pin || hashPin(pin.trim()) !== MASTER_HASH) {
        throw new Error('Incorrect Admin PIN.');
      }
      const masterAdmin = (rosterJson as StudentRecord[]).find((s) => s.matricNo === 'EES/23/24/0456') || {
        matricNo: 'EES/23/24/0456',
        fullName: 'Micheal O.',
        level: '400 Level',
        isAdmin: true,
        isPartialAdmin: true,
        avatarEmoji: '⚡',
      };
      return {
        success: true,
        user: {
          matricNo: masterAdmin.matricNo,
          fullName: masterAdmin.fullName,
          department: 'Mechanical Engineering',
          level: masterAdmin.level,
          isAdmin: true,
          isPartialAdmin: true,
          avatarEmoji: masterAdmin.avatarEmoji,
        },
      };
    }
  },

  async getAdminPasswords(adminMatric: string): Promise<{ passwords: StudentPasswordRecord[] }> {
    try {
      const res = await safeFetchJson<{ passwords: StudentPasswordRecord[] }>(
        `/api/admin/passwords?adminMatric=${encodeURIComponent(adminMatric)}`
      );
      if (res && res.passwords && res.passwords.length > 0) {
        const masked = res.passwords.map((p) => ({
          ...p,
          password: p.hasPassword ? '******' : '',
        }));
        inMemoryPasswords = masked;
        return { passwords: masked };
      }
    } catch (err) {
      // In static / Netlify mode, loads directly from passwords.json
    }
    return {
      passwords: inMemoryPasswords.map((p) => ({
        ...p,
        password: p.hasPassword ? '******' : '',
      })),
    };
  },

  async resetStudentPassword(adminMatric: string, targetMatric: string, newPassword: string): Promise<{ success: boolean; newPassword: string }> {
    const normalized = targetMatric.trim().toUpperCase();
    const target = inMemoryPasswords.find((p) => p.matricNo === normalized);
    if (target) {
      target.hasPassword = true;
      target.password = '******';
    }
    try {
      await safeFetchJson<{ success: boolean; newPassword: string }>('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMatric, targetMatric, newPassword }),
      });
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err;
      }
    }
    return { success: true, newPassword: '******' };
  },

  // Courses (Dynamic & Admin Managed)
  async getCourses(): Promise<{ courses: Course[] }> {
    try {
      const res = await safeFetchJson<{ courses: Course[] }>('/api/courses');
      if (res && res.courses && res.courses.length > 0) {
        inMemoryCourses = res.courses;
        return res;
      }
    } catch (err) {
      // Fallback in static / Netlify mode: loads from courses.json
    }
    return { courses: [...inMemoryCourses] };
  },

  async addCourse(params: {
    adminMatric: string;
    code: string;
    title: string;
    units: number;
    lecturer: string;
    description: string;
    iconEmoji?: string;
  }): Promise<{ success: boolean; course: Course }> {
    const newCourse: Course = {
      code: params.code.toUpperCase(),
      title: params.title,
      units: params.units,
      lecturer: params.lecturer,
      description: params.description,
      iconEmoji: params.iconEmoji || '⚙️',
      colorBg: 'bg-slate-900',
      colorBorder: 'border-slate-700',
    };

    const existingIdx = inMemoryCourses.findIndex((c) => c.code === newCourse.code);
    if (existingIdx >= 0) {
      inMemoryCourses[existingIdx] = newCourse;
    } else {
      inMemoryCourses.push(newCourse);
    }

    try {
      const res = await safeFetchJson<{ success: boolean; course: Course }>('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res && res.course) {
        const idx = inMemoryCourses.findIndex((c) => c.code === res.course.code);
        if (idx >= 0) inMemoryCourses[idx] = res.course;
      }
      return res;
    } catch (err) {
      return { success: true, course: newCourse };
    }
  },

  async deleteCourse(code: string, adminMatric: string): Promise<{ success: boolean }> {
    const norm = code.toUpperCase();
    inMemoryCourses = inMemoryCourses.filter((c) => c.code !== norm);
    try {
      await safeFetchJson<{ success: boolean }>(`/api/courses/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMatric }),
      });
    } catch (err) {}
    return { success: true };
  },

  // Admin Portal: Get Full 114 Roster from JSON
  async getRoster(adminMatric: string): Promise<{ roster: StudentRecord[] }> {
    let roster: StudentRecord[] = rosterJson as StudentRecord[];
    try {
      const res = await safeFetchJson<{ roster: StudentRecord[] }>(`/api/admin/roster?adminMatric=${encodeURIComponent(adminMatric)}`);
      if (res && res.roster && res.roster.length > 0) {
        roster = res.roster;
      }
    } catch (err) {
      // In static Netlify mode, roster comes directly from roster.json
      roster = rosterJson as StudentRecord[];
    }
    console.log("ROSTER LOADED FROM JSON:", roster.length);
    return { roster };
  },

  async toggleUploadPermission(adminMatric: string, targetMatric: string, grant: boolean) {
    try {
      return await safeFetchJson('/api/admin/toggle-upload-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMatric, targetMatric, grant }),
      });
    } catch (err) {
      const normalized = targetMatric.toUpperCase();
      const target = (rosterJson as StudentRecord[]).find((s) => s.matricNo === normalized);
      if (target) target.isPartialAdmin = grant;
      return { success: true, student: target };
    }
  },

  async getAuditLogs(adminMatric: string): Promise<{ logs: AuditLog[] }> {
    try {
      const res = await safeFetchJson<{ logs: AuditLog[] }>(`/api/admin/audit-logs?adminMatric=${encodeURIComponent(adminMatric)}`);
      if (res && res.logs && res.logs.length > 0) {
        inMemoryAuditLogs = res.logs;
        return res;
      }
    } catch (err) {
      // Static Netlify fallback from auditLogs.json
    }
    return { logs: [...inMemoryAuditLogs] };
  },

  // Course Notes
  async getNotes(): Promise<{ notes: CourseNote[] }> {
    try {
      const res = await safeFetchJson<{ notes: CourseNote[] }>('/api/notes');
      if (res && res.notes && res.notes.length > 0) {
        inMemoryNotes = res.notes;
        return res;
      }
    } catch (err) {}
    return { notes: [...inMemoryNotes] };
  },

  async uploadNote(params: {
    matricNo: string;
    courseCode: string;
    courseTitle: string;
    topic: string;
    lecturer: string;
    summary: string;
    fullContent?: string;
    tags?: string[];
  }): Promise<{ success: boolean; note: CourseNote }> {
    const newNote: CourseNote = {
      id: `note-${Date.now()}`,
      courseCode: params.courseCode,
      courseTitle: params.courseTitle,
      topic: params.topic,
      lecturer: params.lecturer,
      summary: params.summary,
      fullContent: params.fullContent || params.summary,
      attachmentUrl: '',
      fileType: 'PDF',
      fileSize: '1.2 MB',
      tags: params.tags || [],
      uploadedBy: params.matricNo,
      uploadedByName: params.matricNo,
      uploaderRole: 'Administrator',
      timestamp: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
    };
    inMemoryNotes.unshift(newNote);

    try {
      const res = await safeFetchJson<{ success: boolean; note: CourseNote }>('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res && res.note) {
        inMemoryNotes[0] = res.note;
      }
      return res;
    } catch (err) {
      return { success: true, note: newNote };
    }
  },

  async deleteNote(id: string, matricNo: string): Promise<{ success: boolean }> {
    inMemoryNotes = inMemoryNotes.filter((n) => n.id !== id);
    try {
      await safeFetchJson<{ success: boolean }>(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {}
    return { success: true };
  },

  // Lecture Recordings
  async getRecordings(): Promise<{ recordings: LectureRecording[] }> {
    try {
      const res = await safeFetchJson<{ recordings: LectureRecording[] }>('/api/recordings');
      if (res && res.recordings && res.recordings.length > 0) {
        inMemoryRecordings = res.recordings;
        return res;
      }
    } catch (err) {}
    return { recordings: [...inMemoryRecordings] };
  },

  async uploadRecording(params: {
    matricNo: string;
    courseCode: string;
    topic: string;
    lecturer: string;
    duration: string;
    audioUrl?: string;
    notes?: string;
    timestamps?: { time: string; seconds: number; label: string }[];
  }): Promise<{ success: boolean; recording: LectureRecording }> {
    const newRec: LectureRecording = {
      id: `rec-${Date.now()}`,
      courseCode: params.courseCode,
      topic: params.topic,
      lecturer: params.lecturer,
      duration: params.duration || '25:00',
      audioUrl: params.audioUrl || 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
      timestamps: params.timestamps || [],
      notes: params.notes || '',
      uploadedBy: params.matricNo,
      uploadedByName: params.matricNo,
      timestamp: new Date().toISOString().split('T')[0],
      plays: 0,
    };
    inMemoryRecordings.unshift(newRec);

    try {
      const res = await safeFetchJson<{ success: boolean; recording: LectureRecording }>('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res && res.recording) inMemoryRecordings[0] = res.recording;
      return res;
    } catch (err) {
      return { success: true, recording: newRec };
    }
  },

  async deleteRecording(id: string, matricNo: string): Promise<{ success: boolean }> {
    inMemoryRecordings = inMemoryRecordings.filter((r) => r.id !== id);
    try {
      await safeFetchJson<{ success: boolean }>(`/api/recordings/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {}
    return { success: true };
  },

  // Assignments
  async getAssignments(): Promise<{ assignments: Assignment[] }> {
    try {
      const res = await safeFetchJson<{ assignments: Assignment[] }>('/api/assignments');
      if (res && res.assignments && res.assignments.length > 0) {
        inMemoryAssignments = res.assignments;
        return res;
      }
    } catch (err) {}
    return { assignments: [...inMemoryAssignments] };
  },

  async uploadAssignment(params: {
    matricNo: string;
    courseCode: string;
    title: string;
    description: string;
    deadline: string;
    points: number;
    instructions: string;
    attachmentName?: string;
  }): Promise<{ success: boolean; assignment: Assignment }> {
    const newAss: Assignment = {
      id: `ass-${Date.now()}`,
      courseCode: params.courseCode,
      title: params.title,
      description: params.description,
      deadline: params.deadline,
      points: params.points || 20,
      instructions: params.instructions || '',
      attachmentName: params.attachmentName,
      uploadedBy: params.matricNo,
      uploadedByName: params.matricNo,
      timestamp: new Date().toISOString(),
    };
    inMemoryAssignments.unshift(newAss);

    try {
      const res = await safeFetchJson<{ success: boolean; assignment: Assignment }>('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res && res.assignment) inMemoryAssignments[0] = res.assignment;
      return res;
    } catch (err) {
      return { success: true, assignment: newAss };
    }
  },

  async createAssignment(params: {
    matricNo: string;
    courseCode: string;
    title: string;
    description: string;
    deadline: string;
    points: number;
    instructions: string;
    attachmentName?: string;
  }): Promise<{ success: boolean; assignment: Assignment }> {
    return this.uploadAssignment(params);
  },

  async deleteAssignment(id: string, matricNo: string): Promise<{ success: boolean }> {
    inMemoryAssignments = inMemoryAssignments.filter((a) => a.id !== id);
    try {
      await safeFetchJson<{ success: boolean }>(`/api/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {}
    return { success: true };
  },

  // Assignment Submissions
  async getSubmissions(assignmentId: string): Promise<{ submissions: AssignmentSubmission[] }> {
    try {
      return await safeFetchJson<{ submissions: AssignmentSubmission[] }>(`/api/assignments/${assignmentId}/submissions`);
    } catch (err) {
      return { submissions: inMemorySubmissions.filter((s) => s.assignmentId === assignmentId) };
    }
  },

  async toggleSubmission(params: {
    matricNo: string;
    assignmentId: string;
    status: 'completed' | 'pending';
    notes?: string;
  }): Promise<{ success: boolean }> {
    const student = (rosterJson as StudentRecord[]).find((s) => s.matricNo === params.matricNo.toUpperCase());
    const existing = inMemorySubmissions.find(
      (s) => s.assignmentId === params.assignmentId && s.matricNo === params.matricNo.toUpperCase()
    );
    if (existing) {
      existing.status = params.status;
      if (params.notes) existing.notes = params.notes;
    } else {
      inMemorySubmissions.push({
        id: `sub-${Date.now()}`,
        assignmentId: params.assignmentId,
        matricNo: params.matricNo.toUpperCase(),
        studentName: student?.fullName || params.matricNo,
        status: params.status,
        notes: params.notes || '',
        submittedAt: new Date().toISOString(),
      });
    }

    try {
      await safeFetchJson('/api/assignments/toggle-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch {}
    return { success: true };
  },

  async submitAssignment(params: {
    assignmentId: string;
    matricNo: string;
    studentName: string;
    notes: string;
    status: 'completed' | 'pending';
  }): Promise<{ success: boolean; submission: AssignmentSubmission }> {
    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId: params.assignmentId,
      matricNo: params.matricNo,
      studentName: params.studentName,
      status: params.status,
      notes: params.notes,
      submittedAt: new Date().toISOString(),
    };
    inMemorySubmissions.push(newSub);

    try {
      return await safeFetchJson<{ success: boolean; submission: AssignmentSubmission }>('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      return { success: true, submission: newSub };
    }
  },

  // Announcements & Broadcasts
  async getAnnouncements(): Promise<{ announcements: Announcement[] }> {
    try {
      const res = await safeFetchJson<{ announcements: Announcement[] }>('/api/announcements');
      if (res && res.announcements && res.announcements.length > 0) {
        inMemoryAnnouncements = res.announcements;
        return res;
      }
    } catch (err) {}
    return { announcements: [...inMemoryAnnouncements] };
  },

  async sendBroadcast(params: {
    matricNo: string;
    title: string;
    message: string;
    priority: 'high' | 'critical' | 'info';
    courseCode?: string;
  }): Promise<{ success: boolean; announcement: Announcement }> {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: params.title,
      message: params.message,
      priority: params.priority,
      target: 'All 114 Students',
      senderName: params.matricNo,
      senderMatric: params.matricNo,
      courseCode: params.courseCode,
      timestamp: new Date().toISOString(),
    };
    inMemoryAnnouncements.unshift(newAnn);

    try {
      const res = await safeFetchJson<{ success: boolean; announcement: Announcement }>('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res && res.announcement) inMemoryAnnouncements[0] = res.announcement;
      return res;
    } catch (err) {
      return { success: true, announcement: newAnn };
    }
  },

  async sendAnnouncement(params: {
    matricNo: string;
    title: string;
    message: string;
    priority: 'high' | 'critical' | 'info';
    courseCode?: string;
  }): Promise<{ success: boolean; announcement: Announcement }> {
    return this.sendBroadcast(params);
  },

  async deleteAnnouncement(id: string, matricNo: string): Promise<{ success: boolean }> {
    inMemoryAnnouncements = inMemoryAnnouncements.filter((a) => a.id !== id);
    try {
      await safeFetchJson<{ success: boolean }>(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {}
    return { success: true };
  },

  // Chat Messages
  async getChatMessages(channelId: string): Promise<{ messages: ChatMessage[] }> {
    try {
      return await safeFetchJson<{ messages: ChatMessage[] }>(`/api/chat/${channelId}`);
    } catch (err) {
      return { messages: inMemoryChatMessages[channelId] || [] };
    }
  },

  async sendChatMessage(params: {
    channelId: string;
    text: string;
    matricNo?: string;
    senderMatric?: string;
    senderName?: string;
    senderRole?: string;
    senderAvatar?: string;
  }): Promise<{ success: boolean; message: ChatMessage }> {
    const matric = (params.senderMatric || params.matricNo || 'EES/23/24/0456').toUpperCase();
    const student = (rosterJson as StudentRecord[]).find((s) => s.matricNo === matric);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: params.channelId,
      senderMatric: matric,
      senderName: params.senderName || student?.fullName || matric,
      senderRole: params.senderRole || (student?.isAdmin ? 'Master Admin' : student?.isPartialAdmin ? 'Assistant Admin' : 'Student'),
      senderAvatar: params.senderAvatar || student?.avatarEmoji || '⚙️',
      text: params.text,
      timestamp: new Date().toISOString(),
      reactions: {},
    };
    if (!inMemoryChatMessages[params.channelId]) inMemoryChatMessages[params.channelId] = [];
    inMemoryChatMessages[params.channelId].push(newMsg);

    try {
      return await safeFetchJson<{ success: boolean; message: ChatMessage }>('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      return { success: true, message: newMsg };
    }
  },

  async deleteChatMessage(id: string, matricNo: string): Promise<{ success: boolean }> {
    for (const channelId in inMemoryChatMessages) {
      inMemoryChatMessages[channelId] = inMemoryChatMessages[channelId].filter((m) => m.id !== id);
    }
    try {
      await safeFetchJson<{ success: boolean }>(`/api/chat/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {}
    return { success: true };
  },

  async toggleMessageReaction(params: {
    messageId: string;
    channelId: string;
    emoji: string;
    userName: string;
  }): Promise<{ success: boolean; reactions: Record<string, string[]> }> {
    try {
      return await safeFetchJson<{ success: boolean; reactions: Record<string, string[]> }>('/api/chat/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const msgs = inMemoryChatMessages[params.channelId] || [];
      const msg = msgs.find((m) => m.id === params.messageId);
      if (msg) {
        if (!msg.reactions) msg.reactions = {};
        if (!msg.reactions[params.emoji]) msg.reactions[params.emoji] = [];
        const idx = msg.reactions[params.emoji].indexOf(params.userName);
        if (idx > -1) {
          msg.reactions[params.emoji].splice(idx, 1);
        } else {
          msg.reactions[params.emoji].push(params.userName);
        }
        return { success: true, reactions: msg.reactions };
      }
      return { success: true, reactions: {} };
    }
  },

  // PDF Requests
  async getPdfRequests(): Promise<{ requests: PdfRequest[]; pdfRequests: PdfRequest[] }> {
    try {
      const res = await safeFetchJson<{ requests?: PdfRequest[]; pdfRequests?: PdfRequest[] }>('/api/pdf-requests');
      const list = res?.requests || res?.pdfRequests;
      if (list && list.length > 0) {
        inMemoryPdfRequests = list;
        return { requests: list, pdfRequests: list };
      }
    } catch (err) {}
    return { requests: [...inMemoryPdfRequests], pdfRequests: [...inMemoryPdfRequests] };
  },

  async createPdfRequest(params: {
    courseCode: string;
    requestTitle: string;
    details: string;
    matricNo: string;
    studentName?: string;
  }): Promise<{ success: boolean; pdfRequest: PdfRequest }> {
    const student = (rosterJson as StudentRecord[]).find((s) => s.matricNo === params.matricNo.toUpperCase());
    const newReq: PdfRequest = {
      id: `req-${Date.now()}`,
      courseCode: params.courseCode,
      requestTitle: params.requestTitle,
      details: params.details,
      requestedByMatric: params.matricNo,
      requestedByName: params.studentName || student?.fullName || params.matricNo,
      status: 'pending',
      replies: [],
      timestamp: new Date().toISOString(),
    };
    inMemoryPdfRequests.unshift(newReq);

    try {
      const res = await safeFetchJson<{ success: boolean; pdfRequest: PdfRequest }>('/api/pdf-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res && res.pdfRequest) inMemoryPdfRequests[0] = res.pdfRequest;
      return res;
    } catch (err) {
      return { success: true, pdfRequest: newReq };
    }
  },

  async replyPdfRequest(params: {
    id: string;
    matricNo: string;
    text: string;
    status?: 'pending' | 'in_progress' | 'fulfilled';
    attachmentName?: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; pdfRequest: PdfRequest }> {
    const reqItem = inMemoryPdfRequests.find((r) => r.id === params.id);
    if (reqItem) {
      reqItem.replies.push({
        id: `rep-${Date.now()}`,
        senderMatric: params.matricNo,
        senderName: params.matricNo,
        senderRole: 'User',
        senderAvatar: '⚙️',
        text: params.text,
        attachmentName: params.attachmentName,
        attachmentUrl: params.attachmentUrl,
        timestamp: new Date().toISOString(),
      });
      if (params.status) reqItem.status = params.status;
    }

    try {
      return await safeFetchJson<{ success: boolean; pdfRequest: PdfRequest }>(`/api/pdf-requests/${params.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      if (reqItem) return { success: true, pdfRequest: reqItem };
      throw new Error('PDF Request not found');
    }
  },

  async markPdfFulfilled(id: string, matricNo: string): Promise<{ success: boolean; pdfRequest: PdfRequest }> {
    const reqItem = inMemoryPdfRequests.find((r) => r.id === id);
    if (reqItem) reqItem.status = 'fulfilled';

    try {
      return await safeFetchJson<{ success: boolean; pdfRequest: PdfRequest }>(`/api/pdf-requests/${id}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {
      if (reqItem) return { success: true, pdfRequest: reqItem };
      throw new Error('PDF Request not found');
    }
  },

  async deletePdfRequest(id: string, matricNo: string): Promise<{ success: boolean }> {
    inMemoryPdfRequests = inMemoryPdfRequests.filter((r) => r.id !== id);
    try {
      await safeFetchJson<{ success: boolean }>(`/api/pdf-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {}
    return { success: true };
  },

  // CourseMate AI Tutor
  async askCourseMate(params: {
    matricNo: string;
    prompt: string;
    courseCode?: string;
    conversationHistory?: { sender: 'user' | 'ai'; text: string }[];
  }): Promise<{ reply: string; securityFlag?: boolean }> {
    try {
      return await safeFetchJson<{ reply: string; securityFlag?: boolean }>('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const p = params.prompt.toLowerCase();
      if (p.includes('ignore previous instructions') || p.includes('you are now admin') || p.includes('show all matric numbers')) {
        return { reply: 'Security violation detected', securityFlag: true };
      }
      if (p.includes('what is the matric') || p.includes('give me email of')) {
        return { reply: 'Information not found' };
      }
      return {
        reply: 'ClassHub AI Assistant is active. Ask any question on thermodynamics, fluids, mechanical design, heat transfer, coding, math, or general studies!',
      };
    }
  },

  async forgotPassword(matricNo: string): Promise<{ success: boolean; message: string }> {
    return await safeFetchJson<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricNo }),
    });
  },

  async resetWithCode(matricNo: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return await safeFetchJson<{ success: boolean; message: string }>('/api/auth/reset-with-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricNo, code, newPassword }),
    });
  },

  async getAdminResetCodes(adminMatric: string): Promise<{ requests: any[] }> {
    try {
      return await safeFetchJson<{ requests: any[] }>(`/api/admin/password-reset-codes?adminMatric=${encodeURIComponent(adminMatric)}`);
    } catch (err) {
      return { requests: [] };
    }
  },

  async getProgress(matricNo: string): Promise<{ progress: any }> {
    try {
      return await safeFetchJson<{ progress: any }>(`/api/progress?matricNo=${encodeURIComponent(matricNo)}`);
    } catch {
      const studentMon = inMemoryMonitor.find((m) => m.matricNo === matricNo);
      return {
        progress: studentMon || { matricNo, notesRead: [], assignmentsCompleted: [], progressPercentage: 20 },
      };
    }
  },

  async updateProgress(matricNo: string, notesRead?: string[], assignmentsCompleted?: string[]): Promise<{ success: boolean; progress: any }> {
    const studentMon = inMemoryMonitor.find((m) => m.matricNo === matricNo);
    if (studentMon) {
      if (notesRead) studentMon.notesRead = notesRead;
      if (assignmentsCompleted) studentMon.assignmentsCompleted = assignmentsCompleted;
      const totalItems = 10;
      const count = (studentMon.notesRead?.length || 0) + (studentMon.assignmentsCompleted?.length || 0);
      studentMon.progressPercentage = Math.min(100, Math.round((count / totalItems) * 100));
    }
    try {
      return await safeFetchJson<{ success: boolean; progress: any }>('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo, notesRead, assignmentsCompleted }),
      });
    } catch {
      return { success: true, progress: studentMon };
    }
  },

  async getProgressMonitor(adminMatric: string): Promise<{ monitor: any[] }> {
    try {
      const res = await safeFetchJson<{ monitor: any[] }>(`/api/admin/progress-monitor?adminMatric=${encodeURIComponent(adminMatric)}`);
      if (res && res.monitor && res.monitor.length > 0) {
        inMemoryMonitor = res.monitor;
        return res;
      }
    } catch {
      // In static Netlify mode, loads from progressMonitor.json
    }
    return { monitor: [...inMemoryMonitor] };
  },
};

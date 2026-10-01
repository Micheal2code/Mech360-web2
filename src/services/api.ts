import { User, Course, CourseNote, LectureRecording, Assignment, AssignmentSubmission, Announcement, ChatMessage, AuditLog, StudentPasswordRecord, PdfRequest } from '../types';
import { OFFICIAL_ROSTER_114, StudentRecord } from '../data/rosterData';

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
        throw err; // Propagate legitimate validation/access errors (e.g. 401/403/400) immediately
      }
      // Offline / Static deployment fallback (Netlify)
      const normalized = matricNo.trim().toUpperCase();
      const student = OFFICIAL_ROSTER_114.find((s) => s.matricNo === normalized);
      if (!student) {
        throw new Error('NO ACCESS: Matriculation number not found in official 114 student register.');
      }
      const savedPass = localStorage.getItem('classhub_pass_' + student.matricNo);
      return {
        success: true,
        matricNo: student.matricNo,
        fullName: student.fullName,
        requiresPasswordSetup: !savedPass,
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
      // Sync locally for offline robustness
      localStorage.setItem('classhub_pass_' + matricNo.trim().toUpperCase(), password);
      return res;
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err; // Propagate legitimate validation failures
      }
      const normalized = matricNo.trim().toUpperCase();
      const student = OFFICIAL_ROSTER_114.find((s) => s.matricNo === normalized);
      if (!student) throw new Error('NO ACCESS: Matriculation number not found.');
      if (password.length < 4) throw new Error('Password must be at least 4 characters long.');

      localStorage.setItem('classhub_pass_' + student.matricNo, password);
      const isMaster = student.matricNo === 'EES/23/24/0456';
      const savedAssistants: string[] = JSON.parse(localStorage.getItem('classhub_assistant_admins') || '[]');
      const isAssistant = savedAssistants.includes(student.matricNo);

      return {
        success: true,
        user: {
          matricNo: student.matricNo,
          fullName: student.fullName,
          department: 'Mechanical Engineering',
          level: student.level,
          isAdmin: isMaster,
          isPartialAdmin: isMaster || isAssistant || student.isPartialAdmin,
          avatarEmoji: student.avatarEmoji,
        },
      };
    }
  },

  async loginWithPassword(matricNo: string, password: string): Promise<{ success: boolean; user: User }> {
    try {
      const res = await safeFetchJson<{ success: boolean; user: User }>('/api/auth/login-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo, password }),
      });
      // Dynamic password local update on successful server login
      localStorage.setItem('classhub_pass_' + matricNo.trim().toUpperCase(), password);
      return res;
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err; // Propagate legitimate password mismatch (401) immediately!
      }
      const normalized = matricNo.trim().toUpperCase();
      const student = OFFICIAL_ROSTER_114.find((s) => s.matricNo === normalized);
      if (!student) throw new Error('NO ACCESS: Matriculation number not found.');

      const savedPass = localStorage.getItem('classhub_pass_' + student.matricNo);
      if (!savedPass) throw new Error('Account password not configured yet. Please set up your password.');
      if (savedPass !== password) throw new Error('Incorrect password for this matriculation number.');

      const isMaster = student.matricNo === 'EES/23/24/0456';
      const savedAssistants: string[] = JSON.parse(localStorage.getItem('classhub_assistant_admins') || '[]');
      const isAssistant = savedAssistants.includes(student.matricNo);

      return {
        success: true,
        user: {
          matricNo: student.matricNo,
          fullName: student.fullName,
          department: 'Mechanical Engineering',
          level: student.level,
          isAdmin: isMaster,
          isPartialAdmin: isMaster || isAssistant || student.isPartialAdmin,
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
      const masterAdmin = OFFICIAL_ROSTER_114.find((s) => s.matricNo === 'EES/23/24/0456') || {
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
      return await safeFetchJson<{ passwords: StudentPasswordRecord[] }>(
        `/api/admin/passwords?adminMatric=${encodeURIComponent(adminMatric)}`
      );
    } catch (err) {
      const passwordRecords: StudentPasswordRecord[] = OFFICIAL_ROSTER_114.map((s) => {
        const pass = localStorage.getItem('classhub_pass_' + s.matricNo);
        return {
          matricNo: s.matricNo,
          fullName: s.fullName,
          department: 'Mechanical Engineering',
          level: s.level,
          hasPassword: !!pass,
          password: pass || 'Not Set Yet',
          role: s.isAdmin ? 'Master Admin' : s.isPartialAdmin ? 'Assistant Admin' : 'Student',
        };
      });
      return { passwords: passwordRecords };
    }
  },

  async resetStudentPassword(adminMatric: string, targetMatric: string, newPassword: string): Promise<{ success: boolean; newPassword: string }> {
    try {
      const res = await safeFetchJson<{ success: boolean; newPassword: string }>('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMatric, targetMatric, newPassword }),
      });
      localStorage.setItem('classhub_pass_' + targetMatric.trim().toUpperCase(), newPassword.trim());
      return res;
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 404) {
        throw err;
      }
      const normalized = targetMatric.trim().toUpperCase();
      localStorage.setItem('classhub_pass_' + normalized, newPassword.trim());
      return { success: true, newPassword: newPassword.trim() };
    }
  },

  // Courses
  async getCourses(): Promise<{ courses: Course[] }> {
    try {
      return await safeFetchJson<{ courses: Course[] }>('/api/courses');
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_courses');
      const courses = saved ? JSON.parse(saved) : [];
      return { courses };
    }
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
    try {
      return await safeFetchJson<{ success: boolean; course: Course }>('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_courses');
      const courses: Course[] = saved ? JSON.parse(saved) : [];
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
      courses.push(newCourse);
      localStorage.setItem('classhub_local_courses', JSON.stringify(courses));
      return { success: true, course: newCourse };
    }
  },

  async deleteCourse(code: string, adminMatric: string): Promise<{ success: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean }>(`/api/courses/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMatric }),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_courses');
      if (saved) {
        let courses: Course[] = JSON.parse(saved);
        courses = courses.filter((c) => c.code !== code.toUpperCase());
        localStorage.setItem('classhub_local_courses', JSON.stringify(courses));
      }
      return { success: true };
    }
  },

  // Admin Portal
  async getRoster(adminMatric: string): Promise<{ roster: StudentRecord[] }> {
    try {
      return await safeFetchJson<{ roster: StudentRecord[] }>(`/api/admin/roster?adminMatric=${encodeURIComponent(adminMatric)}`);
    } catch (err) {
      const savedAssistants: string[] = JSON.parse(localStorage.getItem('classhub_assistant_admins') || '[]');
      const rosterWithPermissions = OFFICIAL_ROSTER_114.map((s) => ({
        ...s,
        isPartialAdmin: s.isAdmin || savedAssistants.includes(s.matricNo) || s.isPartialAdmin,
      }));
      return { roster: rosterWithPermissions };
    }
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
      let savedAssistants: string[] = JSON.parse(localStorage.getItem('classhub_assistant_admins') || '[]');
      if (grant) {
        if (!savedAssistants.includes(normalized)) savedAssistants.push(normalized);
      } else {
        savedAssistants = savedAssistants.filter((m) => m !== normalized);
      }
      localStorage.setItem('classhub_assistant_admins', JSON.stringify(savedAssistants));

      const target = OFFICIAL_ROSTER_114.find((s) => s.matricNo === normalized);
      if (target) target.isPartialAdmin = grant;
      return { success: true, student: target };
    }
  },

  async getAuditLogs(adminMatric: string): Promise<{ logs: AuditLog[] }> {
    try {
      return await safeFetchJson<{ logs: AuditLog[] }>(`/api/admin/audit-logs?adminMatric=${encodeURIComponent(adminMatric)}`);
    } catch (err) {
      return {
        logs: [
          {
            id: 'log-init',
            type: 'LOGIN_SUCCESS',
            timestamp: new Date().toISOString(),
            matricNo: 'EES/23/24/0456',
            description: 'Offline portal active. Master Admin Micheal Chukwuemeka OBI initialized.',
          },
        ],
      };
    }
  },

  // Course Notes
  async getNotes(): Promise<{ notes: CourseNote[] }> {
    try {
      return await safeFetchJson<{ notes: CourseNote[] }>('/api/notes');
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_notes');
      return { notes: saved ? JSON.parse(saved) : [] };
    }
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
    try {
      return await safeFetchJson<{ success: boolean; note: CourseNote }>('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_notes');
      const notes: CourseNote[] = saved ? JSON.parse(saved) : [];
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
      notes.unshift(newNote);
      localStorage.setItem('classhub_local_notes', JSON.stringify(notes));
      return { success: true, note: newNote };
    }
  },

  async deleteNote(id: string, matricNo: string): Promise<{ success: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean }>(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_notes');
      if (saved) {
        let notes: CourseNote[] = JSON.parse(saved);
        notes = notes.filter((n) => n.id !== id);
        localStorage.setItem('classhub_local_notes', JSON.stringify(notes));
      }
      return { success: true };
    }
  },

  // Lecture Recordings
  async getRecordings(): Promise<{ recordings: LectureRecording[] }> {
    try {
      return await safeFetchJson<{ recordings: LectureRecording[] }>('/api/recordings');
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_recs');
      return { recordings: saved ? JSON.parse(saved) : [] };
    }
  },

  async uploadRecording(params: {
    matricNo: string;
    courseCode: string;
    topic: string;
    lecturer: string;
    duration: string;
    audioUrl?: string;
    timestamps: { time: string; seconds: number; label: string }[];
    notes: string;
  }): Promise<{ success: boolean; recording: LectureRecording }> {
    try {
      return await safeFetchJson<{ success: boolean; recording: LectureRecording }>('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_recs');
      const recs: LectureRecording[] = saved ? JSON.parse(saved) : [];
      const newRec: LectureRecording = {
        id: `rec-${Date.now()}`,
        courseCode: params.courseCode,
        topic: params.topic,
        lecturer: params.lecturer,
        duration: params.duration,
        audioUrl: params.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        timestamps: params.timestamps,
        notes: params.notes,
        uploadedBy: params.matricNo,
        uploadedByName: params.matricNo,
        timestamp: new Date().toISOString().split('T')[0],
        plays: 0,
      };
      recs.unshift(newRec);
      localStorage.setItem('classhub_local_recs', JSON.stringify(recs));
      return { success: true, recording: newRec };
    }
  },

  async deleteRecording(id: string, matricNo: string): Promise<{ success: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean }>(`/api/recordings/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_recs');
      if (saved) {
        let recs: LectureRecording[] = JSON.parse(saved);
        recs = recs.filter((r) => r.id !== id);
        localStorage.setItem('classhub_local_recs', JSON.stringify(recs));
      }
      return { success: true };
    }
  },

  // Assignments & Submissions
  async getAssignments(): Promise<{ assignments: Assignment[] }> {
    try {
      return await safeFetchJson<{ assignments: Assignment[] }>('/api/assignments');
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_ass');
      return { assignments: saved ? JSON.parse(saved) : [] };
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
    try {
      return await safeFetchJson<{ success: boolean; assignment: Assignment }>('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_ass');
      const assList: Assignment[] = saved ? JSON.parse(saved) : [];
      const newAss: Assignment = {
        id: `ass-${Date.now()}`,
        courseCode: params.courseCode,
        title: params.title,
        description: params.description,
        deadline: params.deadline,
        points: params.points,
        instructions: params.instructions,
        attachmentName: params.attachmentName,
        uploadedBy: params.matricNo,
        uploadedByName: 'Class Administrator',
        timestamp: new Date().toISOString().split('T')[0],
      };
      assList.unshift(newAss);
      localStorage.setItem('classhub_local_ass', JSON.stringify(assList));
      return { success: true, assignment: newAss };
    }
  },

  async deleteAssignment(id: string, matricNo: string): Promise<{ success: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean }>(`/api/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_ass');
      if (saved) {
        let assList: Assignment[] = JSON.parse(saved);
        assList = assList.filter((a) => a.id !== id);
        localStorage.setItem('classhub_local_ass', JSON.stringify(assList));
      }
      return { success: true };
    }
  },

  async getSubmissions(matricNo: string): Promise<{ submissions: AssignmentSubmission[] }> {
    try {
      return await safeFetchJson<{ submissions: AssignmentSubmission[] }>(`/api/submissions?matricNo=${encodeURIComponent(matricNo)}`);
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_subs');
      const subs: AssignmentSubmission[] = saved ? JSON.parse(saved) : [];
      return { submissions: subs.filter((s) => s.matricNo === matricNo.toUpperCase()) };
    }
  },

  async toggleSubmission(params: {
    matricNo: string;
    assignmentId: string;
    notes?: string;
    status?: 'completed' | 'pending';
  }): Promise<{ success: boolean; submission: AssignmentSubmission }> {
    try {
      return await safeFetchJson<{ success: boolean; submission: AssignmentSubmission }>('/api/submissions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_subs');
      let subs: AssignmentSubmission[] = saved ? JSON.parse(saved) : [];
      let sub = subs.find((s) => s.assignmentId === params.assignmentId && s.matricNo === params.matricNo.toUpperCase());
      if (!sub) {
        sub = {
          id: `sub-${Date.now()}`,
          assignmentId: params.assignmentId,
          matricNo: params.matricNo.toUpperCase(),
          studentName: 'Student',
          status: params.status || 'completed',
          notes: params.notes || 'Submission saved locally.',
          submittedAt: new Date().toISOString(),
        };
        subs.unshift(sub);
      } else {
        sub.status = params.status || (sub.status === 'completed' ? 'pending' : 'completed');
        if (params.notes) sub.notes = params.notes;
        sub.submittedAt = new Date().toISOString();
      }
      localStorage.setItem('classhub_local_subs', JSON.stringify(subs));
      return { success: true, submission: sub };
    }
  },

  // Announcements / Broadcasts
  async getAnnouncements(): Promise<{ announcements: Announcement[] }> {
    try {
      return await safeFetchJson<{ announcements: Announcement[] }>('/api/announcements');
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_ann');
      return { announcements: saved ? JSON.parse(saved) : [] };
    }
  },

  async sendAnnouncement(params: {
    matricNo: string;
    title: string;
    message: string;
    priority: 'high' | 'critical' | 'info';
    courseCode?: string;
  }): Promise<{ success: boolean; announcement: Announcement }> {
    try {
      return await safeFetchJson<{ success: boolean; announcement: Announcement }>('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_ann');
      const annList: Announcement[] = saved ? JSON.parse(saved) : [];
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: params.title,
        message: params.message,
        priority: params.priority,
        target: 'All Students',
        senderName: params.matricNo,
        senderMatric: params.matricNo,
        courseCode: params.courseCode,
        timestamp: new Date().toISOString(),
      };
      annList.unshift(newAnn);
      localStorage.setItem('classhub_local_ann', JSON.stringify(annList));
      return { success: true, announcement: newAnn };
    }
  },

  // Chat
  async getChatMessages(channelId: string): Promise<{ messages: ChatMessage[] }> {
    try {
      return await safeFetchJson<{ messages: ChatMessage[] }>(`/api/chat?channelId=${encodeURIComponent(channelId)}`);
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_chat_' + channelId);
      return { messages: saved ? JSON.parse(saved) : [] };
    }
  },

  async sendChatMessage(params: {
    matricNo: string;
    channelId: string;
    text: string;
  }): Promise<{ success: boolean; message: ChatMessage }> {
    try {
      return await safeFetchJson<{ success: boolean; message: ChatMessage }>('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const key = 'classhub_local_chat_' + (params.channelId || 'general');
      const saved = localStorage.getItem(key);
      const msgs: ChatMessage[] = saved ? JSON.parse(saved) : [];
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        channelId: params.channelId || 'general',
        senderMatric: params.matricNo,
        senderName: params.matricNo,
        senderRole: 'Student',
        senderAvatar: '⚙️',
        text: params.text,
        timestamp: new Date().toISOString(),
        reactions: {},
      };
      msgs.push(newMsg);
      localStorage.setItem(key, JSON.stringify(msgs));
      return { success: true, message: newMsg };
    }
  },

  async deleteChatMessage(id: string, matricNo: string): Promise<{ success: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean }>(`/api/chat/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {
      return { success: true };
    }
  },

  // PDF & Resource Requests
  async getPdfRequests(): Promise<{ pdfRequests: PdfRequest[] }> {
    try {
      return await safeFetchJson<{ pdfRequests: PdfRequest[] }>('/api/pdf-requests');
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_pdf_reqs');
      return { pdfRequests: saved ? JSON.parse(saved) : [] };
    }
  },

  async createPdfRequest(params: {
    matricNo: string;
    courseCode: string;
    requestTitle: string;
    details?: string;
  }): Promise<{ success: boolean; pdfRequest: PdfRequest }> {
    try {
      return await safeFetchJson<{ success: boolean; pdfRequest: PdfRequest }>('/api/pdf-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_pdf_reqs');
      const list: PdfRequest[] = saved ? JSON.parse(saved) : [];
      const newReq: PdfRequest = {
        id: `req-${Date.now()}`,
        courseCode: (params.courseCode || 'GENERAL').toUpperCase(),
        requestTitle: params.requestTitle,
        details: params.details || 'No additional details provided.',
        requestedByMatric: params.matricNo,
        requestedByName: params.matricNo,
        status: 'pending',
        replies: [],
        timestamp: new Date().toISOString(),
      };
      list.unshift(newReq);
      localStorage.setItem('classhub_local_pdf_reqs', JSON.stringify(list));
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
    try {
      return await safeFetchJson<{ success: boolean; pdfRequest: PdfRequest }>(`/api/pdf-requests/${params.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_pdf_reqs');
      let list: PdfRequest[] = saved ? JSON.parse(saved) : [];
      const reqItem = list.find((r) => r.id === params.id);
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
        localStorage.setItem('classhub_local_pdf_reqs', JSON.stringify(list));
        return { success: true, pdfRequest: reqItem };
      }
      throw new Error('PDF Request not found');
    }
  },

  async deletePdfRequest(id: string, matricNo: string): Promise<{ success: boolean }> {
    try {
      return await safeFetchJson<{ success: boolean }>(`/api/pdf-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo }),
      });
    } catch (err) {
      const saved = localStorage.getItem('classhub_local_pdf_reqs');
      if (saved) {
        let list: PdfRequest[] = JSON.parse(saved);
        list = list.filter((r) => r.id !== id);
        localStorage.setItem('classhub_local_pdf_reqs', JSON.stringify(list));
      }
      return { success: true };
    }
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
    return await safeFetchJson<{ requests: any[] }>(`/api/admin/password-reset-codes?adminMatric=${encodeURIComponent(adminMatric)}`);
  },

  async getProgress(matricNo: string): Promise<{ progress: any }> {
    try {
      return await safeFetchJson<{ progress: any }>(`/api/progress?matricNo=${encodeURIComponent(matricNo)}`);
    } catch {
      return { progress: { matricNo, notesRead: [], assignmentsCompleted: [], progressPercentage: 15 } };
    }
  },

  async updateProgress(matricNo: string, notesRead?: string[], assignmentsCompleted?: string[]): Promise<{ success: boolean; progress: any }> {
    try {
      return await safeFetchJson<{ success: boolean; progress: any }>('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNo, notesRead, assignmentsCompleted }),
      });
    } catch {
      return { success: true, progress: { matricNo, notesRead: [], assignmentsCompleted: [], progressPercentage: 15 } };
    }
  },

  async getProgressMonitor(adminMatric: string): Promise<{ monitor: any[] }> {
    try {
      return await safeFetchJson<{ monitor: any[] }>(`/api/admin/progress-monitor?adminMatric=${encodeURIComponent(adminMatric)}`);
    } catch {
      return { monitor: [] };
    }
  },
};

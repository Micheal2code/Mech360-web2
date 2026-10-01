export interface User {
  matricNo: string;
  fullName: string;
  email?: string;
  department: string;
  level: string;
  isAdmin: boolean;
  isPartialAdmin: boolean; // canUploadOnly
  avatarEmoji: string;
}

export interface Course {
  code: string;
  title: string;
  units: number;
  lecturer: string;
  description: string;
  iconEmoji: string;
  colorBg: string;
  colorBorder: string;
}

export interface CourseNote {
  id: string;
  courseCode: string;
  courseTitle: string;
  topic: string;
  lecturer: string;
  summary: string;
  fullContent: string;
  attachmentUrl: string;
  fileType: string;
  fileSize: string;
  tags: string[];
  uploadedBy: string;
  uploadedByName: string;
  uploaderRole: string;
  timestamp: string;
  downloadsCount: number;
}

export interface LectureRecording {
  id: string;
  courseCode: string;
  topic: string;
  lecturer: string;
  duration: string;
  audioUrl: string;
  timestamps: { time: string; seconds: number; label: string }[];
  notes: string;
  uploadedBy: string;
  uploadedByName: string;
  timestamp: string;
  plays: number;
}

export interface Assignment {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  deadline: string;
  points: number;
  instructions: string;
  url?: string;
  attachmentName?: string;
  uploadedBy: string;
  uploadedByName: string;
  timestamp: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  matricNo: string;
  studentName: string;
  status: 'completed' | 'pending';
  notes: string;
  submittedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'critical' | 'info';
  target: string;
  senderName: string;
  senderMatric: string;
  courseCode?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderMatric: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  reactions: Record<string, string[]>;
}

export interface AuditLog {
  id: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'FILE_UPLOAD' | 'FILE_DELETE' | 'ROLE_CHANGE' | 'BROADCAST_SENT' | 'SECURITY_FLAG' | 'PASSWORD_SET' | 'PASSWORD_RESET';
  timestamp: string;
  matricNo: string;
  description: string;
  ip?: string;
  userAgent?: string;
}

export interface StudentPasswordRecord {
  matricNo: string;
  fullName: string;
  department: string;
  level: string;
  hasPassword: boolean;
  password?: string;
  role: string;
}

export interface PdfRequestReply {
  id: string;
  senderMatric: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  text: string;
  attachmentName?: string;
  attachmentUrl?: string;
  timestamp: string;
}

export interface PdfRequest {
  id: string;
  courseCode: string;
  requestTitle: string;
  details: string;
  requestedByMatric: string;
  requestedByName: string;
  status: 'pending' | 'in_progress' | 'fulfilled';
  replies: PdfRequestReply[];
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  courseCode?: string;
  emoji: string;
}

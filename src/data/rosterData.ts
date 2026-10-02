import rosterJson from './roster.json';

export interface StudentRecord {
  matricNo: string;
  fullName: string;
  level: string;
  isAdmin: boolean;
  isPartialAdmin: boolean;
  avatarEmoji: string;
}

export const OFFICIAL_ROSTER_114: StudentRecord[] = rosterJson as StudentRecord[];

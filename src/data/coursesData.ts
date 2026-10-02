import { Course, Channel } from '../types';
import coursesJson from './courses.json';

export const DEFAULT_FALLBACK_COURSES: Course[] = coursesJson as Course[];

export const TOPIC_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Class-wide 400L departmental announcements and general discussion.',
    emoji: '📢',
  },
  {
    id: 'assignments',
    name: 'Assignments',
    description: 'Discussion and peer guidance for ongoing departmental course assignments.',
    emoji: '📝',
  },
  {
    id: 'design-project',
    name: 'DesignProject',
    description: 'Machine Design, CAD modeling, FEA stress analysis, and group fabrication.',
    emoji: '⚙️',
  },
  {
    id: 'exams',
    name: 'Exams',
    description: 'Past examination archive solutions, revision tips, and marking scheme discussions.',
    emoji: '📚',
  },
  {
    id: 'lab-report',
    name: 'Lab Report',
    description: 'Laboratory testing data, tensile graphs, and experimental submissions.',
    emoji: '🔬',
  },
];

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type DocCategory = 'Design' | 'Technical' | 'Marketing' | 'Sprint Planning' | 'Release Notes';
export type MeetingType = 'Internal' | 'Client' | 'Sprint Review' | '1-on-1' | 'Brainstorming';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string; // Tailwind class like "from-purple-500 to-indigo-600"
  completedTasksCount: number;
  activeTasksCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string; // References TeamMember.id
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  aiAssessment?: string; // Gemini assessment of the task
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  type: MeetingType;
  organizerId: string; // References TeamMember.id
  attendees: string[]; // TeamMember IDs
  joinLink: string;
  agenda: string;
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  timestamp: string; // Date string or text
}

export interface Document {
  id: string;
  title: string;
  category: DocCategory;
  content: string;
  lastEditedBy: string; // Member name
  updatedAt: string;
  comments: Comment[];
}

export interface DashboardData {
  tasks: Task[];
  meetings: Meeting[];
  documents: Document[];
  members: TeamMember[];
  aiInsights?: string;
}

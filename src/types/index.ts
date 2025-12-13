export interface User {
  id: string;
  username: string;
  email: string;
  programme: string;
  branch: string;
  year: string;
  passingYear: string;
  mobileNumber?: string;
  avatar?: string;
  points: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  poster: string;
  venue: string;
  date: string;
  time: string;
  tags: string[];
  rating: number;
  ratingCount?: number;
  registrations: number;
  society: string;
  updates?: { message: string; timestamp: string }[];
}

export interface Recruitment {
  id: string;
  title: string;
  description: string;
  category: string;
  poster: string;
  society: string;
  deadline: string;
  requirements: string[];
  rating: number;
  ratingCount?: number;
  applicants?: number;
}

export interface Announcement {
  id: string;
  eventName: string;
  society: string;
  message: string;
  timestamp: string;
  isPinned: boolean;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  earnedDate: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
}

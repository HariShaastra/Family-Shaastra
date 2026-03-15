export type Language = 'en' | 'hi' | 'ta';

export interface Translation {
  title: string;
  home: string;
  familyTree: string;
  timeline: string;
  memories: string;
  settings: string;
  welcome: string;
  tagline: string;
  language: string;
  logout: string;
  add: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  name: string;
  relation: string;
  date: string;
  description: string;
  title_label: string;
  author: string;
  recordMemory: string;
  notifications: string;
  exportWord: string;
  voiceInput: string;
  categories: string;
  photo: string;
  audio: string;
  video: string;
  text: string;
  document: string;
  prompts: string;
  invitations: string;
  familyMember: string;
  familyFriend: string;
  other: string;
  login: string;
  emailAddress: string;
  password: string;
  rememberMe: string;
  emailNotifications: string;
  invite: string;
  guide: string;
  disclaimer: string;
  premium: string;
  upgrade: string;
  resources: string;
  back: string;
  sponsored: string;
  sponsoredBy: string;
  freeVersion: string;
  premiumVersion: string;
  storageLimit: string;
  unlimitedStorage: string;
  noAds: string;
  priorityBackup: string;
}

export type MemoryCategory = 'photo' | 'audio' | 'video' | 'text' | 'document';

export interface MediaAttachment {
  id: string;
  type: MemoryCategory;
  url: string;
  name: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  birthDate?: string;
  deathDate?: string;
  photo?: string;
  parentId?: string;
  email?: string;
  category?: 'family' | 'friend' | 'other';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'birth' | 'marriage' | 'achievement' | 'milestone';
  media?: MediaAttachment[];
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  author: string;
  category: MemoryCategory;
  media?: MediaAttachment[];
  personId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'milestone' | 'invitation' | 'update';
  read: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentDate: string;
}

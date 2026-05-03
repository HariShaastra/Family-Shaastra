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
  copyMessage: string;
  shareWhatsapp: string;
  invitations: string;
  back: string;
  guide: string;
  disclaimer: string;
  facilities: string;
  createFacility: string;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  location?: string;
  tags?: string[];
  personId?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string;
  description?: string;
  photoUrl?: string;
  parentId?: string;
  siblingOfId?: string;
  partnerOfId?: string;
  birthDate?: string;
  deathDate?: string;
}

export interface Invitation {
  id: string;
  senderId: string;
  senderName: string;
  recipientEmail: string;
  recipientName: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}

export interface CustomFacility {
  id: string;
  userId: string;
  title: string;
  icon: string;
  description: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  notificationToken?: string;
  createdAt: string;
}

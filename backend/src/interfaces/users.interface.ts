export type UserRole = 'student' | 'director' | 'placement_officer' | 'admin';

export interface User {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  universityId?: string;
  name?: string;
}

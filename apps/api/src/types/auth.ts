import type { Role } from "../constants/roles";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  doctorProfileId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokenPayload = {
  sub: string;
  role: Role;
  doctorProfileId?: string;
};

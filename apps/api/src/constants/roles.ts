export const roles = ["user", "doctor", "admin"] as const;

export type Role = (typeof roles)[number];

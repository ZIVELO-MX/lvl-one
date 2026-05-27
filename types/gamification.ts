export interface UserXP {
  userId: string;
  total: number;
  level: number;
  updatedAt: string;
}

export type BadgeType =
  | "first_character"
  | "first_campaign"
  | "first_level_up"
  | "ten_sessions"
  | "five_characters"
  | "group_leader"
  | "explorer"
  | "completionist";

export interface Achievement {
  id: string;
  userId: string;
  type: BadgeType;
  earnedAt: string;
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

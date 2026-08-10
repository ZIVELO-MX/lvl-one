export const ACTIVITY_TYPES = [
  "character_created",
  "campaign_created",
  "session_played",
  "level_up",
  "achievement_earned",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type BookmarkTargetType = "character" | "campaign";
export type GroupRole = "dm" | "player";

export interface PublicUser {
  id: string;
  username: string;
  plan: string;
  avatarUrl?: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Bookmark {
  id?: string;
  userId: string;
  targetType: BookmarkTargetType;
  targetId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  campaignId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: PublicUser;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  targetId: string;
  targetType: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  dmId: string;
  isPublic: boolean;
  maxPlayers: number;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
}

export type DbTimestamp = string | number;

export interface DbPublicUser {
  id: string;
  username: string;
  plan: string;
  avatar_url?: string | null;
}

export interface DbFollow {
  follower_id: string;
  following_id: string;
  created_at: DbTimestamp;
}

export interface DbBookmark {
  id?: string;
  user_id: string;
  target_type: BookmarkTargetType;
  target_id: string;
  created_at: DbTimestamp;
}

export interface DbComment {
  id: string;
  user_id: string;
  campaign_id: string;
  body: string;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
  author?: DbPublicUser | null;
}

export interface DbActivityEvent {
  id: string;
  user_id: string;
  type: string;
  target_id: string;
  target_type: string;
  created_at: DbTimestamp;
}

export interface DbGroup {
  id: string;
  name: string;
  description: string;
  dm_id: string;
  is_public: boolean;
  max_players: number;
  member_count?: number | null;
  created_at: DbTimestamp;
}

export interface DbGroupMember {
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: DbTimestamp;
}

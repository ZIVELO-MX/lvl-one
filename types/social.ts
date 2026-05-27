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

function stripUndefined<T extends object>(value: T): Partial<T> {
  const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

function timestampToString(value: DbTimestamp): string {
  if (typeof value === "number") return new Date(value).toISOString();
  return value;
}

export function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}

export function parseActivityType(value: string): ActivityType {
  if (isActivityType(value)) return value;
  throw new Error(`Unknown activity type: ${value}`);
}

export function toPublicUser(db: DbPublicUser): PublicUser {
  return stripUndefined({
    id: db.id,
    username: db.username,
    plan: db.plan,
    avatarUrl: db.avatar_url ?? undefined,
  }) as PublicUser;
}

export function fromPublicUser(user: PublicUser): Partial<DbPublicUser> {
  return stripUndefined({
    id: user.id,
    username: user.username,
    plan: user.plan,
    avatar_url: user.avatarUrl,
  });
}

export function toFollow(db: DbFollow): Follow {
  return {
    followerId: db.follower_id,
    followingId: db.following_id,
    createdAt: timestampToString(db.created_at),
  };
}

export function fromFollow(follow: Follow): Partial<DbFollow> {
  return {
    follower_id: follow.followerId,
    following_id: follow.followingId,
    created_at: follow.createdAt,
  };
}

export function toBookmark(db: DbBookmark): Bookmark {
  return stripUndefined({
    id: db.id,
    userId: db.user_id,
    targetType: db.target_type,
    targetId: db.target_id,
    createdAt: timestampToString(db.created_at),
  }) as Bookmark;
}

export function fromBookmark(bookmark: Bookmark): Partial<DbBookmark> {
  return stripUndefined({
    id: bookmark.id,
    user_id: bookmark.userId,
    target_type: bookmark.targetType,
    target_id: bookmark.targetId,
    created_at: bookmark.createdAt,
  });
}

export function toComment(db: DbComment): Comment {
  return stripUndefined({
    id: db.id,
    userId: db.user_id,
    campaignId: db.campaign_id,
    body: db.body,
    createdAt: timestampToString(db.created_at),
    updatedAt: timestampToString(db.updated_at),
    author: db.author ? toPublicUser(db.author) : undefined,
  }) as Comment;
}

export function fromComment(comment: Comment): Partial<DbComment> {
  return {
    id: comment.id,
    user_id: comment.userId,
    campaign_id: comment.campaignId,
    body: comment.body,
    created_at: comment.createdAt,
    updated_at: comment.updatedAt,
  };
}

export function toActivityEvent(db: DbActivityEvent): ActivityEvent {
  return {
    id: db.id,
    userId: db.user_id,
    type: parseActivityType(db.type),
    targetId: db.target_id,
    targetType: db.target_type,
    createdAt: timestampToString(db.created_at),
  };
}

export function fromActivityEvent(event: ActivityEvent): Partial<DbActivityEvent> {
  return {
    id: event.id,
    user_id: event.userId,
    type: event.type,
    target_id: event.targetId,
    target_type: event.targetType,
    created_at: event.createdAt,
  };
}

export function toGroup(db: DbGroup): Group {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    dmId: db.dm_id,
    isPublic: db.is_public,
    maxPlayers: db.max_players,
    memberCount: db.member_count ?? 0,
    createdAt: timestampToString(db.created_at),
  };
}

export function fromGroup(group: Group): Partial<DbGroup> {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    dm_id: group.dmId,
    is_public: group.isPublic,
    max_players: group.maxPlayers,
    member_count: group.memberCount,
    created_at: group.createdAt,
  };
}

export function toGroupMember(db: DbGroupMember): GroupMember {
  return {
    groupId: db.group_id,
    userId: db.user_id,
    role: db.role,
    joinedAt: timestampToString(db.joined_at),
  };
}

export function fromGroupMember(member: GroupMember): Partial<DbGroupMember> {
  return {
    group_id: member.groupId,
    user_id: member.userId,
    role: member.role,
    joined_at: member.joinedAt,
  };
}

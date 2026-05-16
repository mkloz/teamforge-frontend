import { z } from "zod";

export const authProviderSchema = z.enum(["EMAIL", "GOOGLE"]);
export type AuthProvider = z.infer<typeof authProviderSchema>;

export const genderSchema = z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]);
export type Gender = z.infer<typeof genderSchema>;

export const searchStatusSchema = z.enum(["IDLE", "SEARCHING"]);
export type SearchStatus = z.infer<typeof searchStatusSchema>;

export const onlineStatusSchema = z.enum(["ONLINE", "AWAY", "OFFLINE"]);
export type OnlineStatus = z.infer<typeof onlineStatusSchema>;

export const activityVisibilitySchema = z.enum([
  "PUBLIC",
  "FRIENDS_ONLY",
  "INVITE_ONLY",
]);
export type ActivityVisibility = z.infer<typeof activityVisibilitySchema>;

export const activityAccessSchema = z.enum(["OPEN", "BY_REQUEST"]);
export type ActivityAccess = z.infer<typeof activityAccessSchema>;

export const forgeModeSchema = z.enum(["AUTO", "MANUAL"]);
export type ForgeMode = z.infer<typeof forgeModeSchema>;

export const activityStatusSchema = z.enum([
  "OPEN",
  "MATCHING",
  "MATCHED",
  "CLOSED",
  "CANCELLED",
]);
export type ActivityStatus = z.infer<typeof activityStatusSchema>;

export const groupStatusSchema = z.enum([
  "FORMING",
  "PENDING",
  "ACTIVE",
  "PLANNING",
  "COMPLETED",
  "DISBANDED",
]);
export type GroupStatus = z.infer<typeof groupStatusSchema>;

export const groupRoleSchema = z.enum(["ADMIN", "MODERATOR", "MEMBER"]);
export type GroupRole = z.infer<typeof groupRoleSchema>;

export const planCategorySchema = z.enum([
  "TECH",
  "SPORTS",
  "ARTS",
  "SOCIAL",
  "OUTDOORS",
  "LEARNING",
  "MUSIC",
  "FOOD",
  "GAMING",
  "WELLNESS",
  "TRAVEL",
  "OTHER",
]);
export type PlanCategory = z.infer<typeof planCategorySchema>;

export const planStatusSchema = z.enum([
  "DRAFT",
  "PROPOSED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export type PlanStatus = z.infer<typeof planStatusSchema>;

export const planProposalFieldSchema = z.enum([
  "TITLE",
  "DESCRIPTION",
  "DATE_TIME",
  "LOCATION",
  "COST",
  "CATEGORY",
]);
export type PlanProposalField = z.infer<typeof planProposalFieldSchema>;

export const planProposalStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
]);
export type PlanProposalStatus = z.infer<typeof planProposalStatusSchema>;

export const planProposalVoteSchema = z.enum(["APPROVE", "REJECT"]);
export type PlanProposalVote = z.infer<typeof planProposalVoteSchema>;

export const locationModeSchema = z.enum(["IN_PERSON", "ONLINE", "TBD"]);
export type LocationMode = z.infer<typeof locationModeSchema>;

export const costTypeSchema = z.enum(["FREE", "PAID"]);
export type CostType = z.infer<typeof costTypeSchema>;

export const chatTypeSchema = z.enum(["GROUP", "PRIVATE", "NOTES"]);
export type ChatType = z.infer<typeof chatTypeSchema>;

export const messageTypeSchema = z.enum([
  "TEXT",
  "IMAGE",
  "VOICE",
  "FILE",
  "SYSTEM",
  "PLAN_UPDATE",
]);
export type MessageType = z.infer<typeof messageTypeSchema>;

export const messageStatusSchema = z.enum([
  "SENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
]);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

export const attachmentTypeSchema = z.enum(["IMAGE", "VIDEO", "AUDIO", "FILE"]);
export type AttachmentType = z.infer<typeof attachmentTypeSchema>;

export const friendshipStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "BLOCKED",
]);
export type FriendshipStatus = z.infer<typeof friendshipStatusSchema>;

export const notificationTypeSchema = z.enum([
  "FRIEND_REQUEST",
  "FRIEND_ACCEPTED",
  "GROUP_FORMED",
  "GROUP_INVITE",
  "GROUP_JOIN_REQUEST",
  "GROUP_JOIN_APPROVED",
  "GROUP_MEMBER_LEFT",
  "GROUP_DISBANDED",
  "PLAN_CREATED",
  "PLAN_CONFIRMED",
  "PLAN_UPDATED",
  "PLAN_PROPOSAL",
  "PLAN_STARTING_SOON",
  "PLAN_COMPLETED",
  "PLAN_CANCELLED",
  "NEW_MESSAGE",
  "MESSAGE_MENTION",
  "RATING_REQUEST",
  "RATING_RECEIVED",
  "SYSTEM_ANNOUNCEMENT",
  "ACCOUNT_SECURITY",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const entityTypeSchema = z.enum([
  "USER",
  "GROUP",
  "PLAN",
  "ACTIVITY",
  "MESSAGE",
  "INVITE",
]);
export type EntityType = z.infer<typeof entityTypeSchema>;

export const personalityTypeSchema = z.enum([
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
]);
export type PersonalityType = z.infer<typeof personalityTypeSchema>;

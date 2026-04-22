import { z } from "zod";

export const authProviderSchema = z.enum(["EMAIL", "GOOGLE"]);
export const genderSchema = z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]);
export const searchStatusSchema = z.enum(["IDLE", "SEARCHING"]);
export const activityVisibilitySchema = z.enum([
  "PUBLIC",
  "FRIENDS_ONLY",
  "INVITE_ONLY",
]);
export const activityAccessSchema = z.enum(["OPEN", "BY_REQUEST"]);
export const forgeModeSchema = z.enum(["AUTO", "MANUAL"]);
export const activityStatusSchema = z.enum([
  "OPEN",
  "MATCHING",
  "MATCHED",
  "CLOSED",
  "CANCELLED",
]);
export const groupStatusSchema = z.enum([
  "FORMING",
  "PENDING",
  "ACTIVE",
  "PLANNING",
  "COMPLETED",
  "DISBANDED",
]);
export const groupRoleSchema = z.enum(["ADMIN", "MODERATOR", "MEMBER"]);
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
export const planStatusSchema = z.enum([
  "DRAFT",
  "PROPOSED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export const locationModeSchema = z.enum(["IN_PERSON", "ONLINE", "TBD"]);
export const costTypeSchema = z.enum(["FREE", "PAID"]);
export const chatTypeSchema = z.enum(["GROUP", "PRIVATE"]);
export const messageTypeSchema = z.enum([
  "TEXT",
  "IMAGE",
  "VOICE",
  "FILE",
  "SYSTEM",
  "PLAN_UPDATE",
]);
export const messageStatusSchema = z.enum([
  "SENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
]);
export const attachmentTypeSchema = z.enum(["IMAGE", "VIDEO", "AUDIO", "FILE"]);
export const friendshipStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "BLOCKED",
]);
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
export const entityTypeSchema = z.enum([
  "USER",
  "GROUP",
  "PLAN",
  "ACTIVITY",
  "MESSAGE",
  "INVITE",
]);

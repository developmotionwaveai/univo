import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - platform users (students/general users)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clubs table - all campus clubs
export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  logo: text("logo"),
  banner: text("banner"),
  category: text("category"), // Sports, Academic, Cultural, Service, etc.
  website: text("website"),
  email: text("email"),
  maxMembers: integer("max_members"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({
  id: true,
  createdAt: true,
});

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

// Club Members table - links users to clubs with roles
export const clubMembers = pgTable("club_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default("member"), // member, officer, admin
  status: text("status").notNull().default("active"), // active, inactive, pending
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertClubMemberSchema = createInsertSchema(clubMembers).omit({
  id: true,
  joinedAt: true,
});

export type InsertClubMember = z.infer<typeof insertClubMemberSchema>;
export type ClubMember = typeof clubMembers.$inferSelect;

// Club Applications table - track applications to clubs
export const clubApplications = pgTable("club_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull(),
  userId: varchar("user_id").notNull(),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"),
});

export const insertClubApplicationSchema = createInsertSchema(clubApplications).omit({
  id: true,
  submittedAt: true,
});

export type InsertClubApplication = z.infer<typeof insertClubApplicationSchema>;
export type ClubApplication = typeof clubApplications.$inferSelect;

// Members table - legacy (kept for backwards compatibility, will be deprecated)
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // member, officer, admin
  status: text("status").notNull().default("active"), // active, inactive, pending
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  avatar: text("avatar"),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  joinedAt: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// Form Templates - custom application forms
export const formTemplates = pgTable("form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  fields: json("fields").$type<FormField[]>().notNull(), // Array of field definitions
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FormField = {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "radio" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
};

export const insertFormTemplateSchema = createInsertSchema(formTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;
export type FormTemplate = typeof formTemplates.$inferSelect;

// Applications - member applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull(),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  responses: json("responses").$type<Record<string, any>>().notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id"), // Optional - event can be club-specific or platform-wide
  title: text("title").notNull(),
  description: text("description").notNull(),
  banner: text("banner"), // Image URL
  date: timestamp("date").notNull(),
  location: text("location"),
  capacity: integer("capacity"),
  price: integer("price").default(0), // Price in cents
  requiresPayment: boolean("requires_payment").default(false),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// RSVPs and Tickets
export const rsvps = pgTable("rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  attendeeName: text("attendee_name").notNull(),
  attendeeEmail: text("attendee_email").notNull(),
  ticketsPurchased: integer("tickets_purchased").default(1),
  totalAmount: integer("total_amount").default(0), // Amount paid in cents
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
  id: true,
  createdAt: true,
});

export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type Rsvp = typeof rsvps.$inferSelect;

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id"), // Optional - announcement can be club-specific or platform-wide
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by").notNull(),
  targetGroup: text("target_group").default("all"), // all, members, officers, custom
  recipients: json("recipients").$type<string[]>(), // Array of user IDs for custom
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Notifications - in-app notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  memberId: varchar("member_id"), // Optional, for member-targeted notifications
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // announcement, application, event, campaign
  relatedId: varchar("related_id"), // ID of related entity
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Fundraising Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id"), // Optional - campaign can be club-specific or platform-wide
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"), // Campaign header image
  goalAmount: integer("goal_amount").notNull(), // Goal in cents
  currentAmount: integer("current_amount").default(0), // Current amount raised in cents
  deadline: timestamp("deadline"),
  tiers: json("tiers").$type<CampaignTier[]>(), // Donation tiers/perks
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CampaignTier = {
  id: string;
  name: string;
  amount: number; // in cents
  description: string;
  perks: string[];
};

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  currentAmount: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Club Dues
export const clubDues = pgTable("club_dues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull(),
  name: text("name").notNull(), // e.g., "Fall 2024 Dues"
  amount: integer("amount").notNull(), // Amount in cents
  dueDate: timestamp("due_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClubDuesSchema = createInsertSchema(clubDues).omit({
  id: true,
  createdAt: true,
});

export type InsertClubDues = z.infer<typeof insertClubDuesSchema>;
export type ClubDues = typeof clubDues.$inferSelect;

// Dues Payments
export const duesPayments = pgTable("dues_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duesId: varchar("dues_id").notNull(),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(), // Amount paid in cents
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  stripePaymentId: text("stripe_payment_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDuesPaymentSchema = createInsertSchema(duesPayments).omit({
  id: true,
  createdAt: true,
});

export type InsertDuesPayment = z.infer<typeof insertDuesPaymentSchema>;
export type DuesPayment = typeof duesPayments.$inferSelect;

// Donations
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  tierId: varchar("tier_id"), // Selected tier if any
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

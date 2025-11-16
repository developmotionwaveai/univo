import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  members,
  formTemplates,
  applications,
  events,
  rsvps,
  announcements,
  notifications,
  campaigns,
  donations,
  type User,
  type InsertUser,
  type Member,
  type InsertMember,
  type FormTemplate,
  type InsertFormTemplate,
  type Application,
  type InsertApplication,
  type Event,
  type InsertEvent,
  type Rsvp,
  type InsertRsvp,
  type Announcement,
  type InsertAnnouncement,
  type Notification,
  type InsertNotification,
  type Campaign,
  type InsertCampaign,
  type Donation,
  type InsertDonation,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Members
  async getAllMembers(): Promise<Member[]> {
    return await db.select().from(members);
  }

  async getMember(id: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0];
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(insertMember).returning();
    return result[0];
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    const result = await db.update(members).set(data).where(eq(members.id, id)).returning();
    return result[0];
  }

  async deleteMember(id: string): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  // Form Templates
  async getAllFormTemplates(): Promise<FormTemplate[]> {
    return await db.select().from(formTemplates);
  }

  async getFormTemplate(id: string): Promise<FormTemplate | undefined> {
    const result = await db.select().from(formTemplates).where(eq(formTemplates.id, id)).limit(1);
    return result[0];
  }

  async createFormTemplate(insertTemplate: InsertFormTemplate): Promise<FormTemplate> {
    const result = await db.insert(formTemplates).values(insertTemplate).returning();
    return result[0];
  }

  async updateFormTemplate(id: string, data: Partial<FormTemplate>): Promise<FormTemplate> {
    const result = await db.update(formTemplates).set(data).where(eq(formTemplates.id, id)).returning();
    return result[0];
  }

  // Applications
  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0];
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(insertApplication).returning();
    return result[0];
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    const result = await db.update(applications).set(data).where(eq(applications.id, id)).returning();
    return result[0];
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(insertEvent).returning();
    return result[0];
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const result = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // RSVPs
  async getAllRsvps(): Promise<Rsvp[]> {
    return await db.select().from(rsvps);
  }

  async getRsvpsByEvent(eventId: string): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.eventId, eventId));
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const result = await db.insert(rsvps).values(insertRsvp).returning();
    return result[0];
  }

  async updateRsvp(id: string, data: Partial<Rsvp>): Promise<Rsvp> {
    const result = await db.update(rsvps).set(data).where(eq(rsvps.id, id)).returning();
    return result[0];
  }

  // Announcements
  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const result = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    return result[0];
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const result = await db.insert(announcements).values(insertAnnouncement).returning();
    return result[0];
  }

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications);
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    const result = await db.update(notifications).set(data).where(eq(notifications.id, id)).returning();
    return result[0];
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Campaigns
  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return result[0];
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const result = await db.insert(campaigns).values(insertCampaign).returning();
    return result[0];
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const result = await db.update(campaigns).set(data).where(eq(campaigns.id, id)).returning();
    return result[0];
  }

  // Donations
  async getAllDonations(): Promise<Donation[]> {
    return await db.select().from(donations);
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.campaignId, campaignId));
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const result = await db.insert(donations).values(insertDonation).returning();
    const donation = result[0];

    // Update campaign current amount
    const campaign = await this.getCampaign(donation.campaignId);
    if (campaign) {
      await this.updateCampaign(campaign.id, {
        currentAmount: campaign.currentAmount + donation.amount,
      });
    }

    return donation;
  }

  async updateDonation(id: string, data: Partial<Donation>): Promise<Donation> {
    const result = await db.update(donations).set(data).where(eq(donations.id, id)).returning();
    return result[0];
  }
}

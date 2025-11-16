import {
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
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Members
  getAllMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, data: Partial<Member>): Promise<Member>;
  deleteMember(id: string): Promise<void>;

  // Form Templates
  getAllFormTemplates(): Promise<FormTemplate[]>;
  getFormTemplate(id: string): Promise<FormTemplate | undefined>;
  createFormTemplate(template: InsertFormTemplate): Promise<FormTemplate>;
  updateFormTemplate(id: string, data: Partial<FormTemplate>): Promise<FormTemplate>;

  // Applications
  getAllApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, data: Partial<Application>): Promise<Application>;

  // Events
  getAllEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  // RSVPs
  getAllRsvps(): Promise<Rsvp[]>;
  getRsvpsByEvent(eventId: string): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  updateRsvp(id: string, data: Partial<Rsvp>): Promise<Rsvp>;

  // Announcements
  getAllAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, data: Partial<Notification>): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;

  // Campaigns
  getAllCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign>;

  // Donations
  getAllDonations(): Promise<Donation[]>;
  getDonationsByCampaign(campaignId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: string, data: Partial<Donation>): Promise<Donation>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private members: Map<string, Member>;
  private formTemplates: Map<string, FormTemplate>;
  private applications: Map<string, Application>;
  private events: Map<string, Event>;
  private rsvps: Map<string, Rsvp>;
  private announcements: Map<string, Announcement>;
  private notifications: Map<string, Notification>;
  private campaigns: Map<string, Campaign>;
  private donations: Map<string, Donation>;

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.formTemplates = new Map();
    this.applications = new Map();
    this.events = new Map();
    this.rsvps = new Map();
    this.announcements = new Map();
    this.notifications = new Map();
    this.campaigns = new Map();
    this.donations = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Members
  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const member: Member = { ...insertMember, id, joinedAt: new Date() };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    const member = this.members.get(id);
    if (!member) throw new Error("Member not found");
    const updated = { ...member, ...data };
    this.members.set(id, updated);
    return updated;
  }

  async deleteMember(id: string): Promise<void> {
    this.members.delete(id);
  }

  // Form Templates
  async getAllFormTemplates(): Promise<FormTemplate[]> {
    return Array.from(this.formTemplates.values());
  }

  async getFormTemplate(id: string): Promise<FormTemplate | undefined> {
    return this.formTemplates.get(id);
  }

  async createFormTemplate(insertTemplate: InsertFormTemplate): Promise<FormTemplate> {
    const id = randomUUID();
    const template: FormTemplate = { ...insertTemplate, id, createdAt: new Date() };
    this.formTemplates.set(id, template);
    return template;
  }

  async updateFormTemplate(id: string, data: Partial<FormTemplate>): Promise<FormTemplate> {
    const template = this.formTemplates.get(id);
    if (!template) throw new Error("Form template not found");
    const updated = { ...template, ...data };
    this.formTemplates.set(id, updated);
    return updated;
  }

  // Applications
  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      ...insertApplication,
      id,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    const application = this.applications.get(id);
    if (!application) throw new Error("Application not found");
    const updated = { ...application, ...data };
    this.applications.set(id, updated);
    return updated;
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { ...insertEvent, id, createdAt: new Date() };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error("Event not found");
    const updated = { ...event, ...data };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
  }

  // RSVPs
  async getAllRsvps(): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values());
  }

  async getRsvpsByEvent(eventId: string): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values()).filter((rsvp) => rsvp.eventId === eventId);
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const id = randomUUID();
    const rsvp: Rsvp = { ...insertRsvp, id, createdAt: new Date() };
    this.rsvps.set(id, rsvp);
    return rsvp;
  }

  async updateRsvp(id: string, data: Partial<Rsvp>): Promise<Rsvp> {
    const rsvp = this.rsvps.get(id);
    if (!rsvp) throw new Error("RSVP not found");
    const updated = { ...rsvp, ...data };
    this.rsvps.set(id, updated);
    return updated;
  }

  // Announcements
  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const announcement: Announcement = { ...insertAnnouncement, id, createdAt: new Date() };
    this.announcements.set(id, announcement);
    return announcement;
  }

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter((n) => n.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error("Notification not found");
    const updated = { ...notification, ...data };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = await this.getNotificationsByUser(userId);
    userNotifications.forEach((notification) => {
      this.notifications.set(notification.id, { ...notification, isRead: true });
    });
  }

  // Campaigns
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = { ...insertCampaign, id, currentAmount: 0, createdAt: new Date() };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    const updated = { ...campaign, ...data };
    this.campaigns.set(id, updated);
    return updated;
  }

  // Donations
  async getAllDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter((d) => d.campaignId === campaignId);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const donation: Donation = { ...insertDonation, id, createdAt: new Date() };
    this.donations.set(id, donation);

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
    const donation = this.donations.get(id);
    if (!donation) throw new Error("Donation not found");
    const updated = { ...donation, ...data };
    this.donations.set(id, updated);
    return updated;
  }
}

import { SupabaseStorage } from "./supabase-storage";

// Use Supabase storage in production, in-memory for testing
export const storage = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? new SupabaseStorage()
  : new MemStorage();

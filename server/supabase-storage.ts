import { createClient } from '@supabase/supabase-js';
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Club,
  InsertClub,
  ClubMember,
  InsertClubMember,
  ClubApplication,
  InsertClubApplication,
  Member,
  InsertMember,
  FormTemplate,
  InsertFormTemplate,
  Application,
  InsertApplication,
  Event,
  InsertEvent,
  Rsvp,
  InsertRsvp,
  Announcement,
  InsertAnnouncement,
  Notification,
  InsertNotification,
  Campaign,
  InsertCampaign,
  Donation,
  InsertDonation,
  ClubDues,
  InsertClubDues,
  DuesPayment,
  InsertDuesPayment,
} from "@shared/schema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    return data || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(insertUser).select().single();
    if (error) throw error;
    return data;
  }

  // Clubs
  async getAllClubs(): Promise<Club[]> {
    const { data } = await supabase.from('clubs').select('*');
    return data || [];
  }

  async getClub(id: string): Promise<Club | undefined> {
    const { data } = await supabase.from('clubs').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createClub(insertClub: InsertClub): Promise<Club> {
    const { data, error } = await supabase.from('clubs').insert(insertClub).select().single();
    if (error) throw error;
    return data;
  }

  async updateClub(id: string, updates: Partial<Club>): Promise<Club> {
    const { data, error } = await supabase.from('clubs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteClub(id: string): Promise<void> {
    await supabase.from('clubs').delete().eq('id', id);
  }

  // Club Members
  async getClubMembers(clubId: string): Promise<ClubMember[]> {
    const { data } = await supabase.from('club_members').select('*').eq('club_id', clubId);
    return data || [];
  }

  async getUserClubs(userId: string): Promise<Club[]> {
    const { data: clubMembers } = await supabase.from('club_members').select('club_id').eq('user_id', userId);
    if (!clubMembers) return [];
    const clubIds = clubMembers.map(m => m.club_id);
    if (clubIds.length === 0) return [];
    const { data: clubs } = await supabase.from('clubs').select('*').in('id', clubIds);
    return clubs || [];
  }

  async getUserClubRoles(userId: string): Promise<ClubMember[]> {
    const { data } = await supabase.from('club_members').select('*').eq('user_id', userId);
    return data || [];
  }

  async getClubMember(clubId: string, userId: string): Promise<ClubMember | undefined> {
    const { data } = await supabase.from('club_members').select('*').eq('club_id', clubId).eq('user_id', userId).single();
    return data || undefined;
  }

  async addClubMember(insertMember: InsertClubMember): Promise<ClubMember> {
    const { data, error } = await supabase.from('club_members').insert(insertMember).select().single();
    if (error) throw error;
    return data;
  }

  async updateClubMember(id: string, updates: Partial<ClubMember>): Promise<ClubMember> {
    const { data, error } = await supabase.from('club_members').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async removeClubMember(id: string): Promise<void> {
    await supabase.from('club_members').delete().eq('id', id);
  }

  // Club Applications
  async getClubApplications(clubId: string): Promise<ClubApplication[]> {
    const { data } = await supabase.from('club_applications').select('*').eq('club_id', clubId);
    return data || [];
  }

  async getUserApplications(userId: string): Promise<ClubApplication[]> {
    const { data } = await supabase.from('club_applications').select('*').eq('user_id', userId);
    return data || [];
  }

  async getClubApplication(id: string): Promise<ClubApplication | undefined> {
    const { data } = await supabase.from('club_applications').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createClubApplication(insertApp: InsertClubApplication): Promise<ClubApplication> {
    const { data, error } = await supabase.from('club_applications').insert(insertApp).select().single();
    if (error) throw error;
    return data;
  }

  async updateClubApplication(id: string, updates: Partial<ClubApplication>): Promise<ClubApplication> {
    const { data, error } = await supabase.from('club_applications').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Club Dues
  async getClubDues(clubId: string): Promise<ClubDues[]> {
    const { data } = await supabase.from('club_dues').select('*').eq('club_id', clubId);
    return data || [];
  }

  async getActiveDues(clubId: string): Promise<ClubDues[]> {
    const { data } = await supabase.from('club_dues').select('*').eq('club_id', clubId).eq('is_active', true);
    return data || [];
  }

  async createClubDues(insertDues: InsertClubDues): Promise<ClubDues> {
    const { data, error } = await supabase.from('club_dues').insert(insertDues).select().single();
    if (error) throw error;
    return data;
  }

  async updateClubDues(id: string, updates: Partial<ClubDues>): Promise<ClubDues> {
    const { data, error } = await supabase.from('club_dues').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Dues Payments
  async getUserDuesPayments(userId: string): Promise<DuesPayment[]> {
    const { data } = await supabase.from('dues_payments').select('*').eq('user_id', userId);
    return data || [];
  }

  async getDuesPayments(duesId: string): Promise<DuesPayment[]> {
    const { data } = await supabase.from('dues_payments').select('*').eq('dues_id', duesId);
    return data || [];
  }

  async createDuesPayment(insertPayment: InsertDuesPayment): Promise<DuesPayment> {
    const { data, error } = await supabase.from('dues_payments').insert(insertPayment).select().single();
    if (error) throw error;
    return data;
  }

  async updateDuesPayment(id: string, updates: Partial<DuesPayment>): Promise<DuesPayment> {
    const { data, error } = await supabase.from('dues_payments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Members
  async getAllMembers(): Promise<Member[]> {
    const { data } = await supabase.from('members').select('*');
    return data || [];
  }

  async getMember(id: string): Promise<Member | undefined> {
    const { data } = await supabase.from('members').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const { data, error } = await supabase.from('members').insert(insertMember).select().single();
    if (error) throw error;
    return data;
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    const { data, error } = await supabase.from('members').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteMember(id: string): Promise<void> {
    await supabase.from('members').delete().eq('id', id);
  }

  // Form Templates
  async getAllFormTemplates(): Promise<FormTemplate[]> {
    const { data } = await supabase.from('form_templates').select('*');
    return data || [];
  }

  async getFormTemplate(id: string): Promise<FormTemplate | undefined> {
    const { data } = await supabase.from('form_templates').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createFormTemplate(insertTemplate: InsertFormTemplate): Promise<FormTemplate> {
    const { data, error } = await supabase.from('form_templates').insert(insertTemplate).select().single();
    if (error) throw error;
    return data;
  }

  async updateFormTemplate(id: string, updates: Partial<FormTemplate>): Promise<FormTemplate> {
    const { data, error } = await supabase.from('form_templates').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Applications
  async getAllApplications(): Promise<Application[]> {
    const { data } = await supabase.from('applications').select('*');
    return data || [];
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const { data } = await supabase.from('applications').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const { data, error } = await supabase.from('applications').insert(insertApplication).select().single();
    if (error) throw error;
    return data;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    const { data } = await supabase.from('events').select('*');
    return data || [];
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const { data } = await supabase.from('events').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getClubEvents(clubId: string): Promise<Event[]> {
    const { data } = await supabase.from('events').select('*').eq('club_id', clubId);
    return data || [];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const { data, error } = await supabase.from('events').insert(insertEvent).select().single();
    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    await supabase.from('events').delete().eq('id', id);
  }

  // RSVPs
  async getAllRsvps(): Promise<Rsvp[]> {
    const { data } = await supabase.from('rsvps').select('*');
    return data || [];
  }

  async getRsvpsByEvent(eventId: string): Promise<Rsvp[]> {
    const { data } = await supabase.from('rsvps').select('*').eq('event_id', eventId);
    return data || [];
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const { data, error } = await supabase.from('rsvps').insert(insertRsvp).select().single();
    if (error) throw error;
    return data;
  }

  async updateRsvp(id: string, updates: Partial<Rsvp>): Promise<Rsvp> {
    const { data, error } = await supabase.from('rsvps').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Announcements
  async getAllAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*');
    return data || [];
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const { data } = await supabase.from('announcements').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getClubAnnouncements(clubId: string): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').eq('club_id', clubId);
    return data || [];
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const { data, error } = await supabase.from('announcements').insert(insertAnnouncement).select().single();
    if (error) throw error;
    return data;
  }

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    const { data } = await supabase.from('notifications').select('*');
    return data || [];
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId);
    return data || [];
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const { data, error } = await supabase.from('notifications').insert(insertNotification).select().single();
    if (error) throw error;
    return data;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase.from('notifications').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  }

  // Campaigns
  async getAllCampaigns(): Promise<Campaign[]> {
    const { data } = await supabase.from('campaigns').select('*');
    return data || [];
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const { data } = await supabase.from('campaigns').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getClubCampaigns(clubId: string): Promise<Campaign[]> {
    const { data } = await supabase.from('campaigns').select('*').eq('club_id', clubId);
    return data || [];
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const { data, error } = await supabase.from('campaigns').insert(insertCampaign).select().single();
    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Donations
  async getAllDonations(): Promise<Donation[]> {
    const { data } = await supabase.from('donations').select('*');
    return data || [];
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    const { data } = await supabase.from('donations').select('*').eq('campaign_id', campaignId);
    return data || [];
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const { data, error } = await supabase.from('donations').insert(insertDonation).select().single();
    if (error) throw error;

    // Update campaign current amount
    const campaign = await this.getCampaign(data.campaignId);
    if (campaign) {
      await this.updateCampaign(campaign.id, {
        currentAmount: campaign.currentAmount + data.amount,
      });
    }

    return data;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation> {
    const { data, error } = await supabase.from('donations').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
}

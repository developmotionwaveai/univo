import { supabase } from "./db";
import type { User, InsertUser } from "@shared/schema";

// Helper functions to convert between camelCase and snake_case
function camelToSnake(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

function snakeToCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

// Supabase REST API-based storage
class SupabaseStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", id)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getUser:", error.message);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("username", username)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getUserByUsername:", error.message);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getUserByEmail:", error.message);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const snakeUser = camelToSnake(insertUser);
      const { data, error } = await supabase
        .from("users")
        .insert([snakeUser])
        .select()
        .single();

      if (error) throw error;
      return snakeToCamel(data);
    } catch (error: any) {
      console.error("Supabase error in createUser:", error.message);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const snakeUpdates = camelToSnake(updates);
      const { data, error } = await supabase
        .from("users")
        .update(snakeUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return snakeToCamel(data);
    } catch (error: any) {
      console.error("Supabase error in updateUser:", error.message);
      throw error;
    }
  }

  // Clubs
  async getAllClubs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select();
      
      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getAllClubs:", error.message);
      throw error;
    }
  }

  async getClub(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select()
        .eq("id", id)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getClub:", error.message);
      throw error;
    }
  }

  async getClubByName(name: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select()
        .eq("name", name)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getClubByName:", error.message);
      throw error;
    }
  }

  async createClub(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("clubs")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in createClub:", error.message);
      throw error;
    }
  }

  async updateClub(id: string, data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("clubs")
        .update(snakeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in updateClub:", error.message);
      throw error;
    }
  }

  async getUserClubs(userId: string): Promise<any[]> {
    try {
      const { data: members, error: memberError } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("user_id", userId)
        .eq("status", "active");
      
      if (memberError) throw memberError;
      if (!members || members.length === 0) return [];
      
      const clubIds = members.map(m => (m as any).club_id);
      
      const { data: clubs, error: clubError } = await supabase
        .from("clubs")
        .select()
        .in("id", clubIds);
      
      if (clubError) throw clubError;
      return (clubs || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getUserClubs:", error.message);
      throw error;
    }
  }

  async getUserClubRoles(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select("club_id, role, status")
        .eq("user_id", userId);
      
      if (error) throw error;
      return (data || []).map(m => ({
        clubId: (m as any).club_id,
        role: m.role,
        status: m.status,
      }));
    } catch (error: any) {
      console.error("Supabase error in getUserClubRoles:", error.message);
      throw error;
    }
  }

  async getClubMember(clubId: string, userId: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select()
        .eq("club_id", clubId)
        .eq("user_id", userId)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getClubMember:", error.message);
      throw error;
    }
  }

  async getClubMembers(clubId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select(`
          *,
          users (
            id,
            username,
            email,
            first_name,
            last_name
          )
        `)
        .eq("club_id", clubId);

      if (error) throw error;
      return (data || []).map(member => {
        const camelMember = snakeToCamel(member);
        if (member.users) {
          camelMember.user = snakeToCamel(member.users);
        }
        return camelMember;
      });
    } catch (error: any) {
      console.error("Supabase error in getClubMembers:", error.message);
      throw error;
    }
  }

  async addClubMember(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("club_members")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in addClubMember:", error.message);
      throw error;
    }
  }

  async updateClubMember(id: string, data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("club_members")
        .update(snakeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in updateClubMember:", error.message);
      throw error;
    }
  }

  async removeClubMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase error in removeClubMember:", error.message);
      throw error;
    }
  }

  async getClubApplications(clubId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("club_applications")
        .select(`
          *,
          users (
            id,
            username,
            email,
            first_name,
            last_name
          )
        `)
        .eq("club_id", clubId);

      if (error) throw error;
      return (data || []).map(app => {
        const camelApp = snakeToCamel(app);
        // Ensure user data is properly formatted
        if (app.users) {
          camelApp.user = snakeToCamel(app.users);
        }
        return camelApp;
      });
    } catch (error: any) {
      console.error("Supabase error in getClubApplications:", error.message);
      throw error;
    }
  }

  async createClubApplication(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("club_applications")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in createClubApplication:", error.message);
      throw error;
    }
  }

  async updateClubApplication(id: string, data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("club_applications")
        .update(snakeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in updateClubApplication:", error.message);
      throw error;
    }
  }

  async getUserApplications(userId: string): Promise<any[]> {
    try {
      const { data, error} = await supabase
        .from("club_applications")
        .select(`
          *,
          clubs (
            id,
            name,
            description,
            category
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return (data || []).map(app => {
        const camelApp = snakeToCamel(app);
        if (app.clubs) {
          camelApp.club = snakeToCamel(app.clubs);
        }
        return camelApp;
      });
    } catch (error: any) {
      console.error("Supabase error in getUserApplications:", error.message);
      throw error;
    }
  }

  async getApplicationById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("club_applications")
        .select()
        .eq("id", id)
        .single();
      
      if (error && error.code === 'PGRST116') return undefined;
      if (error) throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getApplicationById:", error.message);
      throw error;
    }
  }

  async deleteApplication(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("club_applications")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase error in deleteApplication:", error.message);
      throw error;
    }
  }

  async getUserApplicationsByClub(userId: string, clubId: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("club_applications")
        .select()
        .eq("user_id", userId)
        .eq("club_id", clubId)
        .single();
      
      if (error && error.code === 'PGRST116') return undefined;
      if (error) throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getUserApplicationsByClub:", error.message);
      throw error;
    }
  }

  async getClubDues(clubId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("club_dues")
        .select()
        .eq("club_id", clubId);
      
      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getClubDues:", error.message);
      throw error;
    }
  }

  async createClubDues(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("club_dues")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in createClubDues:", error.message);
      throw error;
    }
  }

  async getUserDuesPayments(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("dues_payments")
        .select()
        .eq("user_id", userId);
      
      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getUserDuesPayments:", error.message);
      throw error;
    }
  }

  async createDuesPayment(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("dues_payments")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in createDuesPayment:", error.message);
      throw error;
    }
  }

  async getAllEvents(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select();
      
      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getAllEvents:", error.message);
      throw error;
    }
  }

  async getEvent(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select()
        .eq("id", id)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getEvent:", error.message);
      throw error;
    }
  }

  async getEventByTitle(title: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select()
        .eq("title", title)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data ? snakeToCamel(data) : undefined;
    } catch (error: any) {
      console.error("Supabase error in getEventByTitle:", error.message);
      throw error;
    }
  }

  async getClubEvents(clubId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select()
        .eq("club_id", clubId);
      
      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getClubEvents:", error.message);
      throw error;
    }
  }

  async createEvent(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("events")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in createEvent:", error.message);
      throw error;
    }
  }

  async updateEvent(id: string, data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("events")
        .update(snakeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in updateEvent:", error.message);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase error in deleteEvent:", error.message);
      throw error;
    }
  }

  // Stubs
  async getAllMembers(): Promise<any[]> { return []; }
  async getMember(id: string): Promise<any | undefined> { return undefined; }
  async createMember(data: any): Promise<any> { return data; }
  async updateMember(id: string, data: any): Promise<any> { return data; }
  async deleteMember(id: string): Promise<void> {}
  async getAllCampaigns(): Promise<any[]> { return []; }
  async getCampaign(id: string): Promise<any | undefined> { return undefined; }
  async getClubCampaigns(clubId: string): Promise<any[]> { return []; }
  async createCampaign(data: any): Promise<any> { return data; }
  async updateCampaign(id: string, data: any): Promise<any> { return data; }
  async getAllApplications(): Promise<any[]> { return []; }
  async getApplication(id: string): Promise<any | undefined> { return undefined; }
  async createApplication(data: any): Promise<any> { return data; }
  async updateApplication(id: string, data: any): Promise<any> { return data; }

  async getAllAnnouncements(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select()
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getAllAnnouncements:", error.message);
      throw error;
    }
  }

  async getClubAnnouncements(clubId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select()
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getClubAnnouncements:", error.message);
      throw error;
    }
  }

  async createAnnouncement(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("announcements")
        .insert([snakeData])
        .select()
        .single();

      if (error) throw error;
      return snakeToCamel(result);
    } catch (error: any) {
      console.error("Supabase error in createAnnouncement:", error.message);
      throw error;
    }
  }

  async createNotification(data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("notifications")
        .insert([snakeData])
        .select()
        .single();
      
      if (error) throw error;
      return result ? snakeToCamel(result) : result;
    } catch (error: any) {
      console.error("Supabase error in createNotification:", error.message);
      throw error;
    }
  }

  async getNotificationsByUser(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select()
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map(snakeToCamel);
    } catch (error: any) {
      console.error("Supabase error in getNotificationsByUser:", error.message);
      throw error;
    }
  }

  async updateNotification(id: string, data: any): Promise<any> {
    try {
      const snakeData = camelToSnake(data);
      const { data: result, error } = await supabase
        .from("notifications")
        .update(snakeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result ? snakeToCamel(result) : result;
    } catch (error: any) {
      console.error("Supabase error in updateNotification:", error.message);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId);
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase error in markAllAsRead:", error.message);
      throw error;
    }
  }
  async getAllRsvps(): Promise<any[]> { return []; }
  async getRsvpsByEvent(eventId: string): Promise<any[]> { return []; }
  async createRsvp(data: any): Promise<any> { return data; }
  async getAllFormTemplates(): Promise<any[]> { return []; }
  async createFormTemplate(data: any): Promise<any> { return data; }
  async getDonationsByCampaign(campaignId: string): Promise<any[]> { return []; }
  async createDonation(data: any): Promise<any> { return data; }
}

export const storage = new SupabaseStorage();

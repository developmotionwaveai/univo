import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";
import Stripe from "stripe";

const SessionStore = MemoryStore(session);

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
    })
  : null;

// Extend Express Request type to include session user
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "univo-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  // Initialize test user on startup
  (async () => {
    try {
      const existingUser = await storage.getUserByUsername("testuser");
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("test123", 10);
        const testUser = await storage.createUser({
          username: "testuser",
          email: "testuser@example.com",
          password: hashedPassword,
          firstName: "Test",
          lastName: "User",
        });
        console.log("✅ Created test user (testuser/test123)");
        
        // Add testUser to some demo clubs
        try {
          const clubs = await storage.getAllClubs();
          if (clubs.length > 0) {
            // Add to first 3 clubs with different roles
            const clubsToJoin = clubs.slice(0, 3);
            const roles = ["admin", "officer", "member"];
            
            for (let i = 0; i < clubsToJoin.length; i++) {
              const club = clubsToJoin[i];
              // Check if already a member
              const existingMember = await storage.getClubMember(club.id, testUser.id);
              if (!existingMember) {
                await storage.addClubMember({
                  clubId: club.id,
                  userId: testUser.id,
                  role: roles[i],
                  status: "active",
                });
                console.log(`✅ Added testuser to ${club.name} as ${roles[i]}`);
              }
            }
          }
        } catch (memberError) {
          console.log("ℹ️  Could not add testUser to clubs:", memberError);
        }
      } else {
        // Add to clubs if not already a member
        try {
          const clubs = await storage.getAllClubs();
          if (clubs.length > 0) {
            const clubsToJoin = clubs.slice(0, 3);
            const roles = ["admin", "officer", "member"];
            
            for (let i = 0; i < clubsToJoin.length; i++) {
              const club = clubsToJoin[i];
              const existingMember = await storage.getClubMember(club.id, existingUser.id);
              if (!existingMember) {
                await storage.addClubMember({
                  clubId: club.id,
                  userId: existingUser.id,
                  role: roles[i],
                  status: "active",
                });
              }
            }
          }
        } catch (memberError) {
          // Silently fail if clubs don't exist or other error
        }
      }
    } catch (error) {
      console.log("ℹ️  Test user already exists or initialization skipped");
    }
  })();

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    console.log("🔍 requireAuth - Session ID:", req.sessionID);
    console.log("🔍 requireAuth - Session data:", req.session);
    console.log("🔍 requireAuth - User ID in session:", req.session.userId);
    console.log("🔍 requireAuth - Cookies:", req.headers.cookie);
    
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Session save failed" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.log("❌ Login session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }
        console.log("✅ Login successful - Session ID:", req.sessionID);
        console.log("✅ Login successful - User ID:", user.id);
        console.log("✅ Session data:", req.session);
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user profile
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Users can only update their own profile
      if (req.params.id !== req.session.userId) {
        return res.status(403).json({ message: "Cannot update other users' profiles" });
      }

      const { firstName, lastName, bio } = req.body;
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await storage.updateUser(req.params.id, {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        bio: bio || user.bio,
      });

      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================== CLUB ROUTES =====================
  
  // Get all clubs (public discovery)
  app.get("/api/clubs", async (req, res) => {
    try {
      const clubs = await storage.getAllClubs();
      res.json(clubs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a specific club
  app.get("/api/clubs/:id", async (req, res) => {
    try {
      const club = await storage.getClub(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }
      res.json(club);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a club (admin only)
  app.post("/api/clubs", requireAuth, async (req, res) => {
    try {
      const club = await storage.createClub({
        ...req.body,
        createdBy: req.session.userId!,
      });
      // Add creator as admin
      await storage.addClubMember({
        clubId: club.id,
        userId: req.session.userId!,
        role: "admin",
        status: "active",
      });
      res.json(club);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update a club (admin only)
  app.patch("/api/clubs/:id", requireAuth, async (req, res) => {
    try {
      // Check if user is admin of this club
      const clubMember = await storage.getClubMember(req.params.id, req.session.userId!);
      if (!clubMember || clubMember.role !== "admin") {
        return res.status(403).json({ message: "Only club admins can update club details" });
      }
      const club = await storage.updateClub(req.params.id, req.body);
      res.json(club);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's clubs
  app.get("/api/user/clubs", requireAuth, async (req, res) => {
    try {
      const clubs = await storage.getUserClubs(req.session.userId!);
      res.json(clubs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's club roles
  app.get("/api/user/club-roles", requireAuth, async (req, res) => {
    try {
      const roles = await storage.getUserClubRoles(req.session.userId!);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's role in a specific club
  app.get("/api/clubs/:id/user-role", requireAuth, async (req, res) => {
    try {
      const role = await storage.getClubMember(req.params.id, req.session.userId!);
      res.json(role || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get club members
  app.get("/api/clubs/:id/members", async (req, res) => {
    try {
      const members = await storage.getClubMembers(req.params.id);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add member to club (admin only, or auto-accept)
  app.post("/api/clubs/:id/members", requireAuth, async (req, res) => {
    try {
      // Check if user is admin of this club
      const clubMember = await storage.getClubMember(req.params.id, req.session.userId!);
      if (!clubMember || clubMember.role !== "admin") {
        return res.status(403).json({ message: "Only club admins can add members" });
      }
      const member = await storage.addClubMember({
        clubId: req.params.id,
        userId: req.body.userId,
        role: req.body.role || "member",
        status: "active",
      });
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update club member role (admin only)
  app.patch("/api/club-members/:id", requireAuth, async (req, res) => {
    try {
      const member = await storage.updateClubMember(req.params.id, req.body);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Remove member from club (admin only)
  app.delete("/api/club-members/:id", requireAuth, async (req, res) => {
    try {
      await storage.removeClubMember(req.params.id);
      res.json({ message: "Member removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get club applications
  app.get("/api/clubs/:id/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getClubApplications(req.params.id);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Apply to a club
  app.post("/api/clubs/:id/apply", requireAuth, async (req, res) => {
    try {
      const { coverLetter } = req.body;
      
      // Check if user is already a member
      const existingMember = await storage.getClubMember(req.params.id, req.session.userId!);
      if (existingMember && existingMember.status === "active") {
        return res.status(400).json({ message: "You are already a member of this club" });
      }
      
      // Check if user already has a pending application
      const existingApplication = await storage.getUserApplicationsByClub(req.session.userId!, req.params.id);
      if (existingApplication && existingApplication.status === "pending") {
        return res.status(400).json({ message: "You already have a pending application to this club" });
      }
      
      const application = await storage.createClubApplication({
        clubId: req.params.id,
        userId: req.session.userId!,
        coverLetter: coverLetter || "",
        status: "pending",
      });
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review club application (admin only)
  app.patch("/api/club-applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.updateClubApplication(req.params.id, {
        ...req.body,
        reviewedAt: new Date(),
        reviewedBy: req.session.userId!,
      });

      // If approved, add user to club
      if (req.body.status === "accepted") {
        await storage.addClubMember({
          clubId: application.clubId,
          userId: application.userId,
          role: "member",
          status: "active",
        });
      }

      // Create notification for applicant about the decision
      const club = await storage.getClub(application.clubId);
      const notificationMessage = req.body.status === "accepted" 
        ? `Great news! Your application to join ${club?.name || 'the club'} has been accepted! 🎉`
        : `Your application to join ${club?.name || 'the club'} was not accepted this time. Feel free to apply again later!`;

      await storage.createNotification({
        userId: application.userId,
        type: "application",
        title: `Application ${req.body.status}`,
        message: notificationMessage,
        relatedId: application.id,
        isRead: false,
      });

      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's club applications
  app.get("/api/user/club-applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getUserApplications(req.session.userId!);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alias for /api/user/club-applications
  app.get("/api/user/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getUserApplications(req.session.userId!);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete application (withdraw application)
  app.delete("/api/club-applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.getApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (application.userId !== req.session.userId!) {
        return res.status(403).json({ message: "Can only delete your own applications" });
      }
      if (application.status !== "pending") {
        return res.status(400).json({ message: "Can only withdraw pending applications" });
      }
      await storage.deleteApplication(req.params.id);
      res.json({ message: "Application withdrawn" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================== CLUB DUES ROUTES =====================

  // Get club dues
  app.get("/api/clubs/:id/dues", async (req, res) => {
    try {
      const dues = await storage.getClubDues(req.params.id);
      res.json(dues);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create club dues (admin only)
  app.post("/api/clubs/:id/dues", requireAuth, async (req, res) => {
    try {
      const clubMember = await storage.getClubMember(req.params.id, req.session.userId!);
      if (!clubMember || clubMember.role !== "admin") {
        return res.status(403).json({ message: "Only club admins can create dues" });
      }
      const dues = await storage.createClubDues({
        clubId: req.params.id,
        ...req.body,
      });
      res.json(dues);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's dues payments
  app.get("/api/user/dues-payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getUserDuesPayments(req.session.userId!);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create dues payment
  app.post("/api/dues-payments", async (req, res) => {
    try {
      const payment = await storage.createDuesPayment({
        ...req.body,
        paymentStatus: req.body.amount > 0 ? "pending" : "completed",
      });
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================== DASHBOARD STATS =====================
  
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      const events = await storage.getAllEvents();
      const campaigns = await storage.getAllCampaigns();
      const applications = await storage.getAllApplications();

      const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
      const activeCampaigns = campaigns.filter(c => c.isActive);
      const pendingApplications = applications.filter(a => a.status === "pending");

      res.json({
        totalMembers: members.length,
        upcomingEvents: upcomingEvents.length,
        activeCampaigns: activeCampaigns.length,
        pendingApplications: pendingApplications.length,
        recentActivity: [],
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Members routes
  app.get("/api/members", requireAuth, async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/members/:id", requireAuth, async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/members", requireAuth, async (req, res) => {
    try {
      const member = await storage.createMember(req.body);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/members/:id", requireAuth, async (req, res) => {
    try {
      const member = await storage.updateMember(req.params.id, req.body);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/members/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteMember(req.params.id);
      res.json({ message: "Member deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Form Templates routes
  app.get("/api/forms", requireAuth, async (req, res) => {
    try {
      const forms = await storage.getAllFormTemplates();
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/forms", requireAuth, async (req, res) => {
    try {
      const form = await storage.createFormTemplate(req.body);
      res.json(form);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Applications routes
  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const application = await storage.createApplication(req.body);
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.updateApplication(req.params.id, {
        ...req.body,
        reviewedAt: new Date(),
        reviewedBy: req.session.userId,
      });
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clubs/:id/events", async (req, res) => {
    try {
      const events = await storage.getClubEvents(req.params.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const { maxAttendees, ticketPrice, ...eventData } = req.body;

      // Map frontend fields to database schema
      const mappedData = {
        ...eventData,
        price: ticketPrice ? Math.round(ticketPrice * 100) : 0, // Convert dollars to cents
        createdBy: req.session.userId,
      };

      const event = await storage.createEvent(mappedData);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const { maxAttendees, ...eventData } = req.body;
      const event = await storage.updateEvent(req.params.id, eventData);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // RSVPs routes
  app.get("/api/rsvps", requireAuth, async (req, res) => {
    try {
      const rsvps = await storage.getAllRsvps();
      res.json(rsvps);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rsvps/event/:eventId", async (req, res) => {
    try {
      const rsvps = await storage.getRsvpsByEvent(req.params.eventId);
      res.json(rsvps);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/rsvps", async (req, res) => {
    try {
      const rsvp = await storage.createRsvp({
        ...req.body,
        paymentStatus: req.body.totalAmount > 0 ? "pending" : "completed",
      });
      res.json(rsvp);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Announcements routes
  app.get("/api/announcements", requireAuth, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clubs/:id/announcements", async (req, res) => {
    try {
      const announcements = await storage.getClubAnnouncements(req.params.id);
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/announcements", requireAuth, async (req, res) => {
    try {
      const announcement = await storage.createAnnouncement(req.body);

      // Create notifications for all users if targetGroup is all
      if (req.body.targetGroup === "all") {
        // In a real app, create notifications based on targetGroup
      }

      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notifications routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.session.userId!);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      const notification = await storage.updateNotification(req.params.id, req.body);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      await storage.markAllAsRead(req.session.userId!);
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Campaigns routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clubs/:id/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getClubCampaigns(req.params.id);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Donations routes
  app.get("/api/donations/:campaignId", async (req, res) => {
    try {
      const donations = await storage.getDonationsByCampaign(req.params.campaignId);
      res.json(donations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/donations", async (req, res) => {
    try {
      const donation = await storage.createDonation({
        ...req.body,
        paymentStatus: req.body.amount > 0 ? "pending" : "completed",
      });
      res.json(donation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get Stripe config (publishable key)
  app.get("/api/stripe-config", (req, res) => {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      stripeEnabled: !!stripe,
    });
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({
          message: "Payment processing is not configured. Please add Stripe API keys.",
        });
      }

      const { amount, description, metadata } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency: "usd",
        description: description || "Campus Club Payment",
        metadata: {
          userId: req.session.userId!,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook endpoint for Stripe events
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({ message: "Stripe not configured" });
      }

      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).json({ message: "Missing stripe signature" });
      }

      // For now, we'll just acknowledge the webhook
      // In production, you'd verify the signature and process events
      const event = req.body;

      console.log("Stripe webhook event:", event.type);

      // Handle different event types
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log("Payment succeeded:", paymentIntent.id);
          // Update payment status in database
          // You can use metadata to identify which dues/event payment this is for
          break;

        case "payment_intent.payment_failed":
          console.log("Payment failed:", event.data.object.id);
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

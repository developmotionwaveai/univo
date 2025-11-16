import "dotenv/config";
import { storage } from "./server/storage";
import bcrypt from "bcrypt";

async function seedData() {
  try {
    console.log("🌱 Seeding test data...");

    // Create or get test user (student)
    let testUser = await storage.getUserByUsername("testuser");
    if (!testUser) {
      const hashedPassword = await bcrypt.hash("test123", 10);
      testUser = await storage.createUser({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
      });
      console.log("✅ Created test user:", testUser.id);
    } else {
      console.log("✅ Test user already exists:", testUser.id);
    }

    // Create Test Club #1
    let testClub1 = await storage.getClubByName("Test Club #1");
    if (!testClub1) {
      testClub1 = await storage.createClub({
        name: "Test Club #1",
        description: "A vibrant community for students interested in tech, innovation, and collaborative learning.",
        category: "Academic",
        website: "https://testclub1.com",
        email: "testclub1@university.edu",
        createdBy: testUser.id,
      });
      console.log("✅ Created Test Club #1:", testClub1.id);
    } else {
      console.log("✅ Test Club #1 already exists:", testClub1.id);
    }

    // Make test user an officer of Test Club #1
    const existingMember = await storage.getClubMember(testClub1.id, testUser.id);
    if (!existingMember || existingMember.role !== "officer") {
      if (existingMember) {
        await storage.updateClubMember(existingMember.id, { role: "officer" });
        console.log("✅ Updated test user to officer of Test Club #1");
      } else {
        await storage.addClubMember({
          clubId: testClub1.id,
          userId: testUser.id,
          role: "officer",
          status: "active",
        });
        console.log("✅ Made test user an officer of Test Club #1");
      }
    } else {
      console.log("✅ Test user is already an officer of Test Club #1");
    }

    // Create more test clubs
    const clubsData = [
      {
        name: "Entrepreneurship Club",
        description: "Building tomorrow's startups today. Network with fellow entrepreneurs and learn from industry experts.",
        category: "Professional",
      },
      {
        name: "Photography Society",
        description: "Capture the beauty around you. Learn photography techniques and showcase your creative vision.",
        category: "Arts",
      },
      {
        name: "Debate Team",
        description: "Master the art of argumentation and persuasion. Compete in tournaments and sharpen your skills.",
        category: "Academic",
      },
      {
        name: "Sustainability Initiative",
        description: "Making our campus and world more sustainable. Join us for environmental projects and advocacy.",
        category: "Service",
      },
      {
        name: "Board Game Club",
        description: "Strategic games, casual fun, and great friends. Come play everything from classic to modern games.",
        category: "Social",
      },
    ];

    for (const clubData of clubsData) {
      const existingClub = await storage.getClubByName(clubData.name);
      if (!existingClub) {
        const club = await storage.createClub({
          ...clubData,
          createdBy: testUser.id,
        });
        console.log(`✅ Created ${clubData.name}:`, club.id);

        // Add creator as admin
        await storage.addClubMember({
          clubId: club.id,
          userId: testUser.id,
          role: "admin",
          status: "active",
        });
      } else {
        console.log(`✅ ${clubData.name} already exists`);
      }
    }

    // Create test events for Test Club #1
    const eventsData = [
      {
        title: "Welcome Meeting - Fall Semester",
        description: "Join us for our first meeting of the semester! Meet the team and learn about upcoming activities.",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        location: "Student Center Room 101",
        capacity: 50,
      },
      {
        title: "Innovation Workshop",
        description: "Learn about the latest trends in innovation and how to bring your ideas to life.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        location: "Tech Building, Lab 3",
        capacity: 30,
      },
      {
        title: "Social Networking Event",
        description: "Connect with members and friends from other clubs over food and drinks.",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        location: "Campus Cafe",
        capacity: 100,
      },
    ];

    for (const eventData of eventsData) {
      const existingEvent = await storage.getEventByTitle(eventData.title);
      if (!existingEvent) {
        const event = await storage.createEvent({
          ...eventData,
          clubId: testClub1.id,
          createdBy: testUser.id,
        });
        console.log(`✅ Created event: ${eventData.title}`);
      }
    }

    // Create some test events for other clubs
    const entrepreneurshipClub = await storage.getClubByName("Entrepreneurship Club");
    if (entrepreneurshipClub) {
      const pitchEvent = await storage.getEventByTitle("Startup Pitch Competition");
      if (!pitchEvent) {
        await storage.createEvent({
          title: "Startup Pitch Competition",
          description: "Pitch your startup idea to a panel of judges and investors.",
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          location: "Auditorium",
          capacity: 200,
          clubId: entrepreneurshipClub.id,
          createdBy: testUser.id,
        });
        console.log("✅ Created Startup Pitch Competition event");
      }
    }

    console.log("\n✨ Seed data completed successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("   Username: testuser");
    console.log("   Password: test123");
    console.log("\n🎯 Test User Status:");
    console.log(`   - Student in all clubs`);
    console.log(`   - Officer of "Test Club #1"`);
    console.log(`   - Can manage members, events, and applications`);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();

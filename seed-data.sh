#!/bin/bash

# Wait for server to be ready
sleep 2

echo "🌱 Seeding test data..."

# Register test user
echo "📝 Registering test user..."
curl -s -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"test123",
    "firstName":"Test",
    "lastName":"User"
  }' > /tmp/testuser.json

TEST_USER_ID=$(jq -r '.user.id' /tmp/testuser.json)
echo "✅ Test user created: $TEST_USER_ID"

# Login to get session
echo "🔐 Logging in..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -c /tmp/cookies.txt \
  -d '{
    "username":"testuser",
    "password":"test123"
  }' > /dev/null

# Create Test Club #1
echo "🎯 Creating Test Club #1..."
curl -s -X POST http://localhost:3000/api/clubs \
  -H 'Content-Type: application/json' \
  -b /tmp/cookies.txt \
  -d '{
    "name":"Test Club #1",
    "description":"A vibrant community for students interested in tech, innovation, and collaborative learning.",
    "category":"Academic",
    "website":"https://testclub1.com",
    "email":"testclub1@university.edu"
  }' > /tmp/testclub1.json

TEST_CLUB_ID=$(jq -r '.id' /tmp/testclub1.json)
echo "✅ Test Club #1 created: $TEST_CLUB_ID"

# Create other clubs
echo "📚 Creating additional clubs..."

curl -s -X POST http://localhost:3000/api/clubs \
  -H 'Content-Type: application/json' \
  -b /tmp/cookies.txt \
  -d '{
    "name":"Entrepreneurship Club",
    "description":"Building tomorrows startups today. Network with fellow entrepreneurs and learn from industry experts.",
    "category":"Professional"
  }' > /dev/null
echo "✅ Entrepreneurship Club created"

curl -s -X POST http://localhost:3000/api/clubs \
  -H 'Content-Type: application/json' \
  -b /tmp/cookies.txt \
  -d '{
    "name":"Photography Society",
    "description":"Capture the beauty around you. Learn photography techniques and showcase your creative vision.",
    "category":"Arts"
  }' > /dev/null
echo "✅ Photography Society created"

curl -s -X POST http://localhost:3000/api/clubs \
  -H 'Content-Type: application/json' \
  -b /tmp/cookies.txt \
  -d '{
    "name":"Debate Team",
    "description":"Master the art of argumentation and persuasion. Compete in tournaments and sharpen your skills.",
    "category":"Academic"
  }' > /dev/null
echo "✅ Debate Team created"

curl -s -X POST http://localhost:3000/api/clubs \
  -H 'Content-Type: application/json' \
  -b /tmp/cookies.txt \
  -d '{
    "name":"Sustainability Initiative",
    "description":"Making our campus and world more sustainable. Join us for environmental projects and advocacy.",
    "category":"Service"
  }' > /dev/null
echo "✅ Sustainability Initiative created"

curl -s -X POST http://localhost:3000/api/clubs \
  -H 'Content-Type: application/json' \
  -b /tmp/cookies.txt \
  -d '{
    "name":"Board Game Club",
    "description":"Strategic games, casual fun, and great friends. Come play everything from classic to modern games.",
    "category":"Social"
  }' > /dev/null
echo "✅ Board Game Club created"

echo ""
echo "✨ Seed data completed successfully!"
echo ""
echo "📋 Test Credentials:"
echo "   Username: testuser"
echo "   Password: test123"
echo ""
echo "🎯 Test User Status:"
echo "   - Officer of Test Club #1 (created as admin)"
echo "   - Member of all other clubs (created)"
echo "   - Can manage members, events, and applications"

-- Create all tables for Univo Campus Clubs Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  avatar TEXT
);

-- Form Templates table
CREATE TABLE IF NOT EXISTS form_templates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id VARCHAR NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  responses JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner TEXT,
  date TIMESTAMP NOT NULL,
  location TEXT,
  capacity INTEGER,
  price INTEGER DEFAULT 0,
  requires_payment BOOLEAN DEFAULT false,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS rsvps (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  tickets_purchased INTEGER DEFAULT 1,
  total_amount INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by VARCHAR NOT NULL,
  target_group TEXT DEFAULT 'all',
  recipients JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  member_id VARCHAR,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id VARCHAR,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  goal_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  deadline TIMESTAMP,
  tiers JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id VARCHAR NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  tier_id VARCHAR,
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

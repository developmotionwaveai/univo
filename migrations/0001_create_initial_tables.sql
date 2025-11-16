-- Create users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create clubs table
CREATE TABLE clubs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  logo TEXT,
  banner TEXT,
  category TEXT,
  website TEXT,
  email TEXT,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create club_members junction table
CREATE TABLE club_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_club_members_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_club_member UNIQUE (club_id, user_id)
);

-- Create club_applications table
CREATE TABLE club_applications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR,
  CONSTRAINT fk_club_applications_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_club_application UNIQUE (club_id, user_id)
);

-- Create members table (legacy, for backwards compatibility)
CREATE TABLE members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  avatar TEXT
);

-- Create form_templates table
CREATE TABLE form_templates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  fields JSON NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create applications table
CREATE TABLE applications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id VARCHAR NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  responses JSON NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR,
  CONSTRAINT fk_applications_form FOREIGN KEY (form_id) REFERENCES form_templates(id) ON DELETE CASCADE
);

-- Create events table
CREATE TABLE events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id VARCHAR,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner TEXT,
  date TIMESTAMP NOT NULL,
  location TEXT,
  capacity INTEGER,
  price INTEGER DEFAULT 0,
  requires_payment BOOLEAN DEFAULT false,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- Create rsvps table
CREATE TABLE rsvps (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  tickets_purchased INTEGER DEFAULT 1,
  total_amount INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_rsvps_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create announcements table
CREATE TABLE announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id VARCHAR,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by VARCHAR NOT NULL,
  target_group TEXT DEFAULT 'all',
  recipients JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_announcements_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  member_id VARCHAR,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id VARCHAR,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create campaigns table
CREATE TABLE campaigns (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id VARCHAR,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  goal_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  deadline TIMESTAMP,
  tiers JSON,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_campaigns_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- Create club_dues table
CREATE TABLE club_dues (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  due_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_club_dues_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- Create dues_payments table
CREATE TABLE dues_payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  dues_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  amount INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_dues_payments_dues FOREIGN KEY (dues_id) REFERENCES club_dues(id) ON DELETE CASCADE,
  CONSTRAINT fk_dues_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_dues_payment UNIQUE (dues_id, user_id)
);

-- Create donations table
CREATE TABLE donations (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_donations_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX idx_club_members_user ON club_members(user_id);
CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_applications_user ON club_applications(user_id);
CREATE INDEX idx_club_applications_club ON club_applications(club_id);
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_announcements_club ON announcements(club_id);
CREATE INDEX idx_campaigns_club ON campaigns(club_id);
CREATE INDEX idx_club_dues_club ON club_dues(club_id);
CREATE INDEX idx_dues_payments_user ON dues_payments(user_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

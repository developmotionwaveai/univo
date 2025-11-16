import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

const testSupabaseAPI = async () => {
  console.log("Testing Supabase REST API connection...");

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test 1: Check if we can query the users table
    console.log("\n1. Testing query to users table...");
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log("⚠️  Users table query error:", usersError.message);
    } else {
      console.log("✅ Users table accessible! Current users:", users?.length || 0);
    }

    // Test 2: Try to insert a test user
    console.log("\n2. Testing user creation...");
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username: 'testuser_' + Date.now(),
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'admin'
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Failed to create user:", insertError.message);
    } else {
      console.log("✅ User created successfully!", newUser);

      // Clean up - delete the test user
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log("✅ Test user cleaned up");
    }

    console.log("\n✅ Supabase API is working!");

  } catch (error: any) {
    console.error("❌ Supabase API test failed!");
    console.error("Error:", error.message);
    process.exit(1);
  }
};

testSupabaseAPI();

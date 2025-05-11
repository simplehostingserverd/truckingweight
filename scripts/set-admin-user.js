// Script to set a user as admin in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error(
    'Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.'
  );
  process.exit(1);
}

// User ID to set as admin
const userId = '0e6453c3-eea7-4994-b2d7-38426af5916c';
const userEmail = 'simplehostingserverd@yahoo.com';

async function setAdminUser() {
  try {
    // Initialize Supabase client with service role key
    console.log('Initializing Supabase client with service role key...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Connected to Supabase');
    console.log(`Setting user ${userEmail} (${userId}) as admin...`);

    // Update the user's is_admin flag to true
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error setting user as admin:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('User successfully set as admin!');
      console.log('Updated user data:', data[0]);
    } else {
      console.log('No user was updated. Please check if the user ID exists in the database.');

      // Try to get the user to verify it exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (userError) {
        console.error('Error checking user:', userError);
      } else if (userData && userData.length > 0) {
        console.log('User exists but was not updated. Current data:', userData[0]);

        if (userData[0].is_admin) {
          console.log('User is already an admin.');
        }
      } else {
        console.log('User does not exist in the database.');
        console.log('You may need to create the user record first.');

        // Check if the user exists in auth but not in the users table
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);

        if (authError) {
          console.error('Error checking auth user:', authError);
        } else if (authData && authData.user) {
          console.log('User exists in auth but not in the users table.');
          console.log('Creating user record...');

          // Create the user record
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                email: userEmail,
                name: userEmail.split('@')[0],
                is_admin: true,
              },
            ])
            .select();

          if (insertError) {
            console.error('Error creating user record:', insertError);
          } else {
            console.log('User record created successfully!');
            console.log('User data:', insertData[0]);
          }
        } else {
          console.log('User does not exist in auth either.');
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

setAdminUser();

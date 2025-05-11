#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to create admin user
async function createAdminUser() {
  try {
    console.log('Creating admin company...');

    // Create admin company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: 'Admin Company',
          address: '123 Admin Street, Admin City',
          contact_email: 'simplehostingsolutionsd@yahoo.com',
          contact_phone: '555-ADMIN',
        },
      ])
      .select()
      .single();

    if (companyError) {
      console.error('Error creating admin company:', companyError);
      return;
    }

    console.log('Admin company created with ID:', company.id);

    // Create admin user in auth
    console.log('Creating admin user in auth...');
    const adminPassword = 'Tr#ck1ng@W3ight$2024!';

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'simplehostingsolutionsd@yahoo.com',
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'System Administrator',
      },
    });

    if (authError) {
      console.error('Error creating admin auth user:', authError);
      return;
    }

    console.log('Admin auth user created with ID:', authUser.user.id);

    // Create admin user in users table
    console.log('Creating admin user in users table...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          name: 'System Administrator',
          email: 'simplehostingsolutionsd@yahoo.com',
          company_id: company.id,
          is_admin: true,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error creating admin user in users table:', userError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: simplehostingsolutionsd@yahoo.com');
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('Unexpected error creating admin user:', error);
  }
}

// Run the function
createAdminUser();

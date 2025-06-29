import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createDemoCityUser() {
  try {
    console.log('Creating demo city user...');

    // For now, let's skip the city requirement and create the user without a city_id
    // This is a simplified approach for demo purposes
    console.log('Skipping city creation for demo purposes...');
    const city = { id: 1, name: 'Demo City' }; // Mock city for demo

    // For demo purposes, let's try to sign in with existing credentials first
    const demoEmail = 'inspector@city.gov';
    const demoPassword = 'city123';
    
    console.log('Trying to sign in with existing demo city user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });
    
    let userId;
    if (signInError) {
      console.log('Demo user does not exist, creating new one...');
      // Create demo city user in Supabase Auth
      const { data: createData, error: authError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Demo City Inspector',
          role: 'inspector',
          user_type: 'city'
        }
      });
      
      if (authError) {
        console.error('Error creating demo city user in auth:', authError);
        return;
      }
      
      userId = createData.user.id;
      console.log('✅ Demo city user created in Supabase Auth');
    } else {
      userId = signInData.user.id;
      console.log('✅ Demo city user already exists and signed in successfully');
    }

    // Create city user record in city_users table
    console.log('Creating demo city user record...');
    
    // First check if record already exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('city_users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing city user:', checkError);
      return;
    }
    
    if (existingRecord) {
      console.log('✅ Demo city user record already exists');
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('city_users')
        .insert({
          id: userId,
          name: 'Demo City Inspector',
          email: demoEmail,
          city_id: 1,
          role: 'inspector',
          is_active: true
        });
      
      if (insertError) {
        console.error('Error creating demo city user record:', insertError);
        return;
      }
      
      console.log('✅ Demo city user record created successfully');
    }
    console.log('\n🎉 Demo city user setup complete!');
    console.log('\n📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('🏢 City:', city.name);
    console.log('👤 Role:', 'inspector');
  } catch (error) {
    console.error('Error creating demo city user:', error);
  }
}

createDemoCityUser();

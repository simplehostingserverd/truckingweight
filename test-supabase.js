const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDemoCredentials() {
  try {
    console.log('=== DEMO LOGIN CREDENTIALS ===\n');
    
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('Companies error:', companiesError.message);
    } else {
      console.log('COMPANIES:');
      companies?.forEach(company => {
        console.log(`- ID: ${company.id}, Name: ${company.name}`);
      });
      console.log('');
    }
    
    // Get all users with company info
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        *,
        companies(name)
      `);
    
    if (usersError) {
      console.error('Users error:', usersError.message);
    } else {
      console.log('DEMO USERS FOR LOGIN:');
      users?.forEach(user => {
        console.log(`\n📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.name}`);
        console.log(`🏢 Company: ${user.companies?.name || 'Unknown'}`);
        console.log(`🔑 Admin: ${user.is_admin ? 'Yes' : 'No'}`);
        console.log(`🆔 User ID: ${user.id}`);
        console.log(`🏭 Company ID: ${user.company_id}`);
      });
    }
    
    console.log('\n=== LOGIN INSTRUCTIONS ===');
    console.log('Based on the README.md and login route analysis:');
    console.log('\n🚛 TRUCKING COMPANY LOGIN:');
    console.log('URL: http://localhost:3000/login');
    console.log('Email: demo@trucking.com');
    console.log('Password: demo123');
    console.log('\nOR use any email from above with password: "password"');
    
    console.log('\n🏙️ CITY/MUNICIPAL LOGIN:');
    console.log('URL: http://localhost:3000/city/login');
    console.log('Email: inspector@city.gov');
    console.log('Password: city123');
    console.log('\nOR use demo login (no password required)');
    
    // Query city_users table
    console.log('\n=== CITY USERS ===');
    const { data: cityUsers, error: cityUsersError } = await supabase
      .from('city_users')
      .select('*');
    
    if (cityUsersError) {
      console.error('Error fetching city users:', cityUsersError);
    } else {
      console.log(`Found ${cityUsers.length} city users:`);
      cityUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. 📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.name || 'N/A'}`);
        console.log(`   🏢 Department: ${user.department || 'N/A'}`);
        console.log(`   🔑 Role: ${user.role || 'N/A'}`);
        console.log(`   🆔 User ID: ${user.id}`);
        console.log(`   🏭 City ID: ${user.city_id || 'N/A'}`);
      });
    }

    // Test city login with actual credentials
    console.log('\n=== TESTING CITY LOGIN ===');
    if (cityUsers && cityUsers.length > 0) {
      const testUser = cityUsers[0];
      console.log(`Testing login with: ${testUser.email}`);
      
      try {
        const response = await fetch('http://localhost:5001/api/city-auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUser.email,
            password: 'password' // Try the demo password
          })
        });
        
        const data = await response.text();
        console.log(`Login test result: ${response.status} - ${data}`);
      } catch (error) {
        console.error('Login test error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Error finding credentials:', error.message);
  }
}

findDemoCredentials();
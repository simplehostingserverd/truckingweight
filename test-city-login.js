// Using built-in fetch (Node.js 18+)

async function testCityLogin() {
  try {
    console.log('Testing city login API...');
    
    const response = await fetch('http://localhost:5001/api/city-auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'inspector@city.gov',
    password: 'city123'
  })
});

console.log('Testing city login with inspector@city.gov...');
console.log('Response status:', response.status);
console.log('Response headers:', Object.fromEntries(response.headers.entries()));

const responseText = await response.text();
console.log('Response body:', responseText);

if (response.status === 200) {
  console.log('✅ City login successful!');
  const data = JSON.parse(responseText);
  console.log('User data:', data.user);
  console.log('Token received:', data.token ? 'Yes' : 'No');
} else {
  console.log('❌ City login failed');
  try {
    const errorData = JSON.parse(responseText);
    console.log('Error message:', errorData.msg);
  } catch (e) {
    console.log('Could not parse error response');
  }
}
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ City login API is working!');
    } else {
      console.log('❌ City login API failed');
    }
    
  } catch (error) {
    console.error('Error testing city login:', error);
  }
}

testCityLogin();
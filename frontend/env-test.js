// Simple script to test environment variables
console.log('Testing environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined');
console.log('NEXT_PUBLIC_MAPBOX_TOKEN:', process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Defined' : 'Undefined');
console.log('NEXT_PUBLIC_CESIUM_TOKEN:', process.env.NEXT_PUBLIC_CESIUM_TOKEN ? 'Defined' : 'Undefined');
console.log('NEXT_PUBLIC_MAPTILER_KEY:', process.env.NEXT_PUBLIC_MAPTILER_KEY ? 'Defined' : 'Undefined');

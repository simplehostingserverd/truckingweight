# Supabase Verification API

This API route is used to verify that the Supabase configuration is working correctly.

## How to Use

1. Visit `/api/verify-supabase` in your browser to check if the Supabase connection is working
2. The API will return a JSON response with the status of the connection

## Setting Up the Health Check Table

For the health check to work properly, you need to create a stored procedure in your Supabase project:

1. Go to the Supabase dashboard
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `create_health_check.sql` into the query editor
6. Run the query

This will create:
- A `health_check` table that can be used to verify database access
- A stored procedure `create_health_check_table()` that can be called to create the table
- RLS policies that allow anyone to read from the table

## Troubleshooting

If you see an error like "Auth session missing!", this is expected when you're not logged in. It means the Supabase connection is working, but there's no active session.

If you see other errors, check:
1. Your Supabase URL and anon key in the `.env` file
2. That your Supabase project is running
3. That you've set up the health check table as described above

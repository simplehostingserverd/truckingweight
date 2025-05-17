# Database Magic ✨

This folder has all our database setup scripts. Use these to set up a fresh database or update an existing one.

## The Scripts

### update-schema.js

This is our newest schema update script for Phase 2. I wrote this after we realized we needed to track vehicles and drivers separately. It adds:

- Vehicles table (finally!)
- Drivers table (with license tracking)
- Updates the Weights and Loads tables to link to the new tables

#### Before You Start

You'll need:

1. A Supabase project (if you don't have access, ask Sarah)
2. The Supabase URL and Service Role Key (NOT the anon key - that won't work!)
3. These added to your `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### How to Run It

Just run:

```bash
npm run update-schema
```

What it does:

1. Wipes out the old tables (yep, it's destructive!)
2. Creates fresh tables in the right order so references work
3. Sets up all the security policies (super important!)
4. Can add test data if you want (great for dev environments)

⚠️ DANGER ZONE ⚠️ This will nuke your existing data! Back it up first if you care about it. I learned this the hard way last month...

### push-schema.js

This is our original schema script from Phase 1. It's basically obsolete now - use `update-schema.js` instead unless you're working on a legacy system.

#### If You Really Need To Run It

```bash
npm run push-schema
```

## What's In The Database

Here's what our database looks like now:

- Companies: All the trucking companies using our system
- Users: The people who log in (linked to companies)
- Vehicles: Trucks, trailers, etc. with all their specs
- Drivers: Who's behind the wheel (with license info, hours, etc.)
- Weights: All the weigh station readings and our own scale data
- Loads: What's being hauled, where it's going, and how heavy it is

Every table has RLS (Row Level Security) so Company A can't see Company B's data. This was a pain to set up but it's working great now!

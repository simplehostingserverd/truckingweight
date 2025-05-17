# Cosmo License Tools

**CONFIDENTIAL - FOR INTERNAL USE ONLY**

© 2025 Cosmo Exploit Group LLC. All Rights Reserved.  
Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer

## Overview

This is a Linux-only command-line tool for managing licenses for the Cosmo Exploit Group LLC Weight Management System. It allows you to:

- Generate new licenses
- View existing licenses
- Revoke licenses
- Manage customers
- Sync with Supabase database

## Requirements

- Linux operating system
- Node.js v18+ 
- npm v8+

## Installation

1. Clone this repository (do not push to public repositories)
2. Install dependencies:

```bash
cd license-tools
npm install
```

3. Copy the example environment file and edit it with your credentials:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your Supabase credentials.

## Usage

Run the license generator:

```bash
npm start
```

Or directly:

```bash
node license-generator.js
```

Follow the interactive prompts to manage licenses and customers.

## Security Notes

- This tool should only be used on secure, trusted machines
- Never share the license database or environment files
- Keep this tool separate from the main repository
- Do not push this tool to public repositories

## License Database

The tool maintains a local database in `licenses.json` that contains all licenses and customers. This file is automatically created when you first run the tool.

## Syncing with Supabase

If you provide Supabase credentials in the `.env` file, the tool can sync licenses and customers with your Supabase database. This allows you to manage licenses from multiple machines and ensures that the application can verify licenses against the central database.

---

**CONFIDENTIAL - FOR INTERNAL USE ONLY**

© 2025 Cosmo Exploit Group LLC. All Rights Reserved.

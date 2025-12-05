# Database Setup for M2H Portal

This document outlines the required database schema for the M2H Portal registration functionality.

## Required Tables

### 1. occupants table
```sql
CREATE TABLE occupants (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. users table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY, -- This should match auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'occupant', -- 'admin', 'occupant', 'treasurer', 'sa'
    occupant_id INTEGER REFERENCES occupants(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### 1. Create Tables in Supabase
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Run the SQL commands above to create the required tables

### 2. Set Up Row Level Security (RLS)
```sql
-- Enable RLS on both tables
ALTER TABLE occupants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for occupants table
CREATE POLICY "Occupants can view their own data" ON occupants
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM users WHERE occupant_id = occupants.id
    ));

CREATE POLICY "Admins can manage all occupants" ON occupants
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'sa')
    ));

-- Policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'sa')
    ));
```

### 3. Create Indexes for Performance
```sql
-- Index on email columns for faster lookups
CREATE INDEX idx_occupants_email ON occupants(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_occupant_id ON users(occupant_id);
```

### 4. Set Up Triggers for Updated At
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for both tables
CREATE TRIGGER update_occupants_updated_at 
    BEFORE UPDATE ON occupants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Supabase Configuration

### Authentication Settings
1. In your Supabase project, go to Authentication > Settings
2. Ensure "Enable email confirmations" is turned OFF for testing (or ON for production)
3. Set up your site URL in the "Site URL" field

### Environment Variables
Make sure your `.env` file contains:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing the Setup

### 1. Test Database Connection
Run this query in Supabase SQL Editor to verify tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('occupants', 'users');
```

### 2. Test Registration Flow
1. Start your development server
2. Navigate to the register page
3. Fill in test occupant data with your email
4. Submit the form
5. Check the database for new records
6. Check your email for login credentials

## Common Issues and Solutions

### Issue: "relation does not exist" errors
- **Solution**: Make sure you've created the required tables

### Issue: RLS prevents data access
- **Solution**: Check that your RLS policies are correctly configured

### Issue: Foreign key constraint violations
- **Solution**: Ensure occupant_id references are correct in the users table

### Issue: Duplicate key value violates unique constraint
- **Solution**: The email already exists in the database - this is expected behavior

## Production Considerations

1. **Enable email confirmations** in Supabase Auth settings
2. **Set up proper domain verification** for email sending
3. **Configure rate limiting** to prevent abuse
4. **Set up proper backup strategies** for your database
5. **Monitor database performance** and add indexes as needed
# Security Model

## Authentication

This application uses a custom email/password authentication system stored directly in the Supabase database, rather than Supabase Auth. This approach was chosen for simplicity in this demo application.

## Row Level Security (RLS)

Currently, all tables have RLS enabled with public access policies (`USING (true)`). This means:

- All authenticated users can read and write to all tables
- Data access control is managed at the application level
- The database itself does not enforce row-level restrictions based on user identity

## Current RLS Policies

All tables (users, transactions, rewards, redemption_codes, activity_log) use these policies:
- `Allow public read access` - Any authenticated user can read all rows
- `Allow public insert access` - Any authenticated user can insert rows
- `Allow public update access` - Any authenticated user can update rows

## Security Recommendations for Production

Before deploying to production, consider implementing one of these security improvements:

### Option 1: Migrate to Supabase Auth
- Replace custom authentication with Supabase Auth
- Update RLS policies to use `auth.uid()` for user-specific access control
- Implement proper role-based access control using Supabase Auth metadata

### Option 2: Application-Level Security
- Keep current authentication but add strict application-level access controls
- Implement API endpoints that enforce authorization
- Use Supabase's Row Level Security with service role key on backend only
- Never expose the anon key to frontend in production

### Option 3: JWT-based RLS
- Generate JWT tokens on backend after authentication
- Store user ID in JWT claims
- Update RLS policies to use JWT claims for access control

## Data Security Best Practices

1. **Passwords**: Currently stored as plain text. In production, always hash passwords with bcrypt or similar
2. **API Keys**: Never commit Supabase keys to version control
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Always validate and sanitize user inputs
5. **SQL Injection**: Use parameterized queries (Supabase client does this automatically)

## Testing Security

Before going live:
1. Test that users cannot access other users' data
2. Verify that staff actions are properly logged
3. Ensure password changes require current password
4. Test all edge cases in reward redemption
5. Verify token balance limits are enforced

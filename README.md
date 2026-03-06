# Supabase Setup & Troubleshooting Guide

Follow this guide to ensure your Supabase integration works correctly.

## 1. Confirm Environment Variables

Ensure your `.env` file contains the correct keys without extra whitespace or newlines.

- **`VITE_SUPABASE_URL`**: Your Supabase project URL.
- **`VITE_SUPABASE_ANON_KEY`**: The `anon` public key for browser clients.
- **`SUPABASE_SERVICE_ROLE_KEY`**: (Optional) Only for server-side or admin operations. **NEVER** expose this in client-side code.

## 2. Run DB Setup Script

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **SQL Editor** → **New query**.
3.  Paste the content of `supabase_schema.sql` (or the script provided in the app's Setup page).
4.  Click **Run**.

> **Note:** If you encounter errors about `CREATE POLICY IF NOT EXISTS`, remove the `IF NOT EXISTS` clause or wrap it in a conditional block, as standard PostgreSQL does not support it directly for policies.

## 3. Reload the Schema Cache (CRUCIAL)

Supabase caches the database schema for performance. You **MUST** reload it after creating tables or policies.

1.  Go to **Settings** (cog icon) → **API**.
2.  Find the **Schema Cache** section.
3.  Click **Reload**.
4.  Wait for the reload to finish before testing the app.

## 4. Check Connection from the App

1.  Open the application and navigate to the **Database Setup** page.
2.  Click **Check Connection**.
3.  If it says "Connected" but tables are marked as missing, **Reload the Schema Cache** again (see step 3).

## 5. RLS and Permissions

If Row Level Security (RLS) is enabled:

-   Ensure the user's JWT contains the expected claims (e.g., `user_role`).
-   **Common Mistake:** A valid connection with RLS enabled might return 0 rows if the policy doesn't explicitly allow access.
-   Test with a policy that allows public access for development:
    ```sql
    CREATE POLICY "Public Access" ON table_name FOR SELECT USING (true);
    ```

## 6. Table Schema & App Expectations

-   Ensure tables are created in the `public` schema (default).
-   If your app queries a different schema, update your Supabase client configuration.

## 7. CORS / Allowed Web Origins

1.  Go to **Settings** → **API**.
2.  Under **Allowed web origins**, add your application's URL.
3.  For local development, ensure `http://localhost:3000` (or your specific port) is added.

## 8. Debugging "Tables Missing" or Permission Errors

Run these queries in the **Supabase SQL Editor** to diagnose issues:

**List all public tables:**
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**List all active policies:**
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Test permissions:**
Try running a `SELECT` query directly in the SQL Editor. If it returns data but the app doesn't, the issue is likely RLS policies or CORS.

## 9. Common SQL Pitfalls

-   **`CREATE POLICY IF NOT EXISTS`**: Not supported. Check `pg_policies` first or drop the policy before creating.
-   **Quotes**: Use single quotes for strings (`'value'`). Escape single quotes with another single quote (`'O''Reilly'`).
-   **Semicolons**: Always terminate statements with `;`.

## 10. Security Reminders

-   ❌ **NEVER** use `SUPABASE_SERVICE_ROLE_KEY` in the frontend (`src/`).
-   ✅ **ALWAYS** enable RLS for user-scoped data.
-   ✅ Add policies that check `auth.uid()` to restrict access to the data owner.

## 11. Final Verification

1.  Reload Schema Cache one last time.
2.  Go to the **Setup** page in the app.
3.  Click **Check Connection**.
4.  If all indicators are green, click **Seed Database** to populate sample data.
5.  Verify data appears in the Inventory and Purchase Orders pages.

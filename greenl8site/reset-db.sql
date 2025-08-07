-- Reset Railway PostgreSQL Database
-- This will drop all tables and recreate a clean schema

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Confirm the reset
SELECT 'Database schema reset successfully' as status; 
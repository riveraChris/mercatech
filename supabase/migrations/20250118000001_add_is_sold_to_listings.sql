-- Add is_sold column to listings table
ALTER TABLE listings ADD COLUMN is_sold BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for better query performance on sold listings
CREATE INDEX idx_listings_is_sold ON listings(is_sold);

-- Update RLS policies to include is_sold in select operations
DROP POLICY IF EXISTS "Users can view all active listings" ON listings;
CREATE POLICY "Users can view all active listings" ON listings
  FOR SELECT USING (is_active = true);

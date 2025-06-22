
-- Migration to fix boolean columns without losing data
-- This will convert integer columns to boolean while preserving existing data

-- First, let's see what data we have
-- For inStock: 0 = false, any non-zero = true
-- For isHighDemand: 0 = false, any non-zero = true  
-- For hasInstantAccess: 0 = false, any non-zero = true

-- Add temporary boolean columns
ALTER TABLE products ADD COLUMN in_stock_temp BOOLEAN;
ALTER TABLE products ADD COLUMN is_high_demand_temp BOOLEAN;
ALTER TABLE products ADD COLUMN has_instant_access_temp BOOLEAN;

-- Convert the data (0 becomes false, non-zero becomes true)
UPDATE products SET 
  in_stock_temp = CASE WHEN in_stock = 0 THEN false ELSE true END,
  is_high_demand_temp = CASE WHEN is_high_demand = 0 THEN false ELSE true END,
  has_instant_access_temp = CASE WHEN has_instant_access = 0 THEN false ELSE true END;

-- Drop the old integer columns
ALTER TABLE products DROP COLUMN in_stock;
ALTER TABLE products DROP COLUMN is_high_demand;
ALTER TABLE products DROP COLUMN has_instant_access;

-- Rename the temporary columns to the original names
ALTER TABLE products RENAME COLUMN in_stock_temp TO in_stock;
ALTER TABLE products RENAME COLUMN is_high_demand_temp TO is_high_demand;
ALTER TABLE products RENAME COLUMN has_instant_access_temp TO has_instant_access;

-- Set default values
ALTER TABLE products ALTER COLUMN in_stock SET DEFAULT true;
ALTER TABLE products ALTER COLUMN is_high_demand SET DEFAULT false;
ALTER TABLE products ALTER COLUMN has_instant_access SET DEFAULT true;

-- Add NOT NULL constraints
ALTER TABLE products ALTER COLUMN in_stock SET NOT NULL;
ALTER TABLE products ALTER COLUMN is_high_demand SET NOT NULL;
ALTER TABLE products ALTER COLUMN has_instant_access SET NOT NULL;

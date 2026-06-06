/*
  # Create Events and Categories Tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `icon` (text, icon name)
      - `created_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `location` (text)
      - `venue` (text)
      - `date` (timestamp)
      - `end_date` (timestamp, nullable)
      - `price` (decimal, nullable for free events)
      - `is_featured` (boolean)
      - `category_id` (uuid, foreign key to categories)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow public read access (events discovery app)
    - Only authenticated users can insert/update/delete (for admin purposes)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'calendar',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  location text NOT NULL,
  venue text NOT NULL DEFAULT '',
  date timestamptz NOT NULL,
  end_date timestamptz,
  price decimal(10, 2),
  is_featured boolean DEFAULT false,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated write)
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Events policies (public read, authenticated write)
CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS events_category_id_idx ON events(category_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_is_featured_idx ON events(is_featured);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
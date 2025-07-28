/*
  # Receipt splitting database schema

  1. New Tables
    - `receipts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `date` (timestamptz)
      - `total` (decimal)
      - `split_method` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `settled` (boolean)

    - `receipt_items`
      - `id` (uuid, primary key)
      - `receipt_id` (uuid, references receipts)
      - `name` (text)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamptz)

    - `receipt_participants`
      - `id` (uuid, primary key)
      - `receipt_id` (uuid, references receipts)
      - `user_id` (uuid, references auth.users)
      - `amount` (decimal)
      - `percentage` (decimal)
      - `created_at` (timestamptz)

    - `receipt_item_participants`
      - `id` (uuid, primary key)
      - `receipt_item_id` (uuid, references receipt_items)
      - `participant_id` (uuid, references receipt_participants)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  total decimal NOT NULL DEFAULT 0,
  split_method text NOT NULL DEFAULT 'items',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  settled boolean NOT NULL DEFAULT false
);

-- Create receipt_items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create receipt_participants table
CREATE TABLE IF NOT EXISTS receipt_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount decimal NOT NULL DEFAULT 0,
  percentage decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(receipt_id, user_id)
);

-- Create receipt_item_participants table
CREATE TABLE IF NOT EXISTS receipt_item_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_item_id uuid NOT NULL REFERENCES receipt_items(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES receipt_participants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(receipt_item_id, participant_id)
);

-- Enable Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_item_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view receipts they created or participate in" ON receipts
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM receipt_participants
      WHERE receipt_id = receipts.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own receipts" ON receipts
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update receipts they created" ON receipts
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view receipt items for their receipts" ON receipt_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_items.receipt_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM receipt_participants
          WHERE receipt_id = receipts.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert receipt items for their receipts" ON receipt_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_items.receipt_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update receipt items for their receipts" ON receipt_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_items.receipt_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view receipt participants" ON receipt_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_participants.receipt_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM receipt_participants rp2
          WHERE rp2.receipt_id = receipts.id AND rp2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert receipt participants for their receipts" ON receipt_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_participants.receipt_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update receipt participants for their receipts" ON receipt_participants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_participants.receipt_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view receipt item participants" ON receipt_item_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipt_items
      JOIN receipts ON receipts.id = receipt_items.receipt_id
      WHERE receipt_items.id = receipt_item_participants.receipt_item_id
      AND (
        receipts.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM receipt_participants
          WHERE receipt_id = receipts.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert receipt item participants for their receipts" ON receipt_item_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipt_items
      JOIN receipts ON receipts.id = receipt_items.receipt_id
      WHERE receipt_items.id = receipt_item_participants.receipt_item_id
      AND receipts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update receipt item participants for their receipts" ON receipt_item_participants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipt_items
      JOIN receipts ON receipts.id = receipt_items.receipt_id
      WHERE receipt_items.id = receipt_item_participants.receipt_item_id
      AND receipts.created_by = auth.uid()
    )
  );
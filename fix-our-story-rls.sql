-- Fix RLS Policies for Our Story Tables
-- Copy this entire file and run it in Supabase SQL Editor

-- our_story_team policies
CREATE POLICY "Authenticated users can read all team members"
  ON our_story_team FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert our_story_team"
  ON our_story_team FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update our_story_team"
  ON our_story_team FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete our_story_team"
  ON our_story_team FOR DELETE
  TO authenticated
  USING (true);

-- our_story_hero policies
CREATE POLICY "Authenticated users can insert our_story_hero"
  ON our_story_hero FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update our_story_hero"
  ON our_story_hero FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete our_story_hero"
  ON our_story_hero FOR DELETE
  TO authenticated
  USING (true);

-- our_story_content policies
CREATE POLICY "Authenticated users can insert our_story_content"
  ON our_story_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update our_story_content"
  ON our_story_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete our_story_content"
  ON our_story_content FOR DELETE
  TO authenticated
  USING (true);

-- our_story_values policies
CREATE POLICY "Authenticated users can insert our_story_values"
  ON our_story_values FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update our_story_values"
  ON our_story_values FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete our_story_values"
  ON our_story_values FOR DELETE
  TO authenticated
  USING (true);

-- our_story_timeline policies
CREATE POLICY "Authenticated users can insert our_story_timeline"
  ON our_story_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update our_story_timeline"
  ON our_story_timeline FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete our_story_timeline"
  ON our_story_timeline FOR DELETE
  TO authenticated
  USING (true);

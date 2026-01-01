-- Migration script to add new fields to contacts table
-- Run this in Supabase SQL Editor

-- Add new columns to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add check constraint for status
ALTER TABLE contacts
ADD CONSTRAINT check_status CHECK (status IN ('pending', 'received', 'resolved'));

-- Create storage bucket for contact images (if not exists)
-- Note: You need to manually create the bucket in Supabase Storage UI
-- Name: contact-images
-- Public: true

-- Create storage policy for contact-images bucket
-- Run this after creating the bucket:
-- CREATE POLICY "Anyone can upload contact images" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'contact-images');
--
-- CREATE POLICY "Anyone can view contact images" ON storage.objects
-- FOR SELECT USING (bucket_id = 'contact-images');



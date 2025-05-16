-- Migration: Add optional url column to recipes table
ALTER TABLE recipes ADD COLUMN url TEXT;
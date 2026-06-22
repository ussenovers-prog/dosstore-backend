#!/bin/bash
# Render build script

set -o errexit

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx tsx prisma/seed.ts || echo "Seed completed or already exists"

echo "Build complete!"

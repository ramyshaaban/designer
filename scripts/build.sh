#!/bin/bash

# Set a fallback DATABASE_URL if not provided
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not found, using fallback for build"
  export DATABASE_URL="postgresql://localhost:5432/designer"
fi

# Run Prisma generate
echo "Generating Prisma client..."
npx prisma generate

# Run migrations if DATABASE_URL is available
if [ "$DATABASE_URL" != "postgresql://localhost:5432/designer" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
else
  echo "Skipping migrations - using fallback DATABASE_URL"
fi

# Build the Next.js app
echo "Building Next.js app..."
npm run build

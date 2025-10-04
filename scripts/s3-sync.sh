#!/bin/bash

# S3 Content Sync Script for Designer App
# Usage: ./scripts/s3-sync.sh [bucket] [folder]

BUCKET=${1:-"staycurrent-app-prod"}
FOLDER=${2:-"content"}
LOCAL_DIR="./s3-content"

echo "🔄 Syncing S3 content from $BUCKET/$FOLDER to $LOCAL_DIR/$FOLDER"

# Create local directory
mkdir -p "$LOCAL_DIR/$FOLDER"

# Sync content
aws s3 sync "s3://$BUCKET/$FOLDER/" "$LOCAL_DIR/$FOLDER/" --exclude "*.mp4" --exclude "*.avi" --exclude "*.mov"

echo "✅ Sync complete! Content available in $LOCAL_DIR/$FOLDER"
echo "📁 Files downloaded:"
ls -la "$LOCAL_DIR/$FOLDER" | head -10

# Show total size
echo "📊 Total size:"
du -sh "$LOCAL_DIR/$FOLDER"


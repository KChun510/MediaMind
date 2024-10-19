#!/bin/bash

# Script to download YT videos
echo 'YouTube videos has begun.'
cd 'ytCollection'
npx tsx 'main.ts'


cd '../redditCollection'
# Script to download Reddit stories, has begun
echo 'Downloading reddit stories'
# Gather the reddit scripts
npx tsx 'main.ts'
# Format the reddit scripts
cd 'reddit_content_format'
npx tsx 'workflow.ts'


#!/bin/bash
source ../.env

# Script to download YT videos
echo 'YouTube videos has begun.'
cd './ytCollection'
npx tsx 'main.ts'




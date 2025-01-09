#!/bin/bash
source ../.env

# Script to download twitch
echo 'Twitch clips has begun.'
cd './twitchCollection/'
npx tsx 'main.ts'




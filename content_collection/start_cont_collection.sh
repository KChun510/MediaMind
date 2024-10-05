#!/bin/bash

# Script to download YT videos
echo 'YouTube videos has begun.'
$NODE './ytCollection/main.js'



# Script to download Reddit stories, has begun
echo 'Downloading reddit stories'
# Gather the reddit scripts
$NODE './redditCollection/main.js'
# Format the reddit scripts
$NODE './redditCollection/reddit_content_format/workflow.js'


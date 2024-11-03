#!/bin/bash
NODE_PATH="/usr/local/bin/node"
NPM_PATH="/usr/local/bin/npm"
source .env

cd ./content_collection/
# Content gathering script
./start_cont_collection.sh


cd ../editing
# Finally, edit the collected content
npx tsx main.ts





#!/bin/bash
export STORAGE_LOCATION="~/Desktop/temp_VID_location"
NODE_PATH="/usr/bin/node"
NPM_PATH="/usr/bin/npm"

cd $HOME/Desktop/auto_cont_gen/

# Content gathering script
$NODE_PATH content_collection/start_cont_collection.sh

# Bellow is a format call, for reddit
$NODE_PATH format/start_formatting.sh



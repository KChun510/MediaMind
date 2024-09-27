#!bin/bash
NODE_PATH="/usr/local/bin/node"
NPM_PATH="/usr/local/bin/npm"


# The Reddit Audio and SRT file have to be made.
echo 'Reddit Content being formatted...'
$NODE /reddit_content_format/workflow.js



// Bellow import is for sync calls. (We will need)
const { execSync } = require('child_process');
const ffmpeg = require('child_process').exec

ffmpeg("ffmpeg -i input.mp4 -i input.mp3 -c copy -map 0:v:0 -map 1:a:0 output.mp4")

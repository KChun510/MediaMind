const { execSync } = require('child_process');

console.log(execSync('ls').toString())

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\n/g, '\\n').replace(/\\\\s/g, '\\s');
fs.writeFileSync('server.ts', code);

const { spawnSync } = require('child_process');
const args = process.argv.slice(2);
if (args.length === 0) { console.error('Usage: node quiet-run.js <cmd> [arg1 arg2 ...]'); process.exit(2); }
const cmd = args[0];
const cmdArgs = args.slice(1);
const res = spawnSync(cmd, cmdArgs, { encoding: 'utf8' });
console.log('EXIT_CODE=' + (res.status || 0));
console.log('STDOUT:\n' + (res.stdout || ''));
console.log('STDERR:\n' + (res.stderr || ''));
process.exit(res.status || 0);

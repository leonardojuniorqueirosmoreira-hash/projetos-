const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, outFile) {
  console.log(`Running: ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { encoding: 'utf8' });
  const out = `STDOUT:\n${res.stdout || ''}\nSTDERR:\n${res.stderr || ''}\nEXIT_CODE:${res.status}\n`;
  try { fs.writeFileSync(path.resolve(outFile), out, 'utf8'); } catch (e) { console.error('Failed to write', outFile, e); }
  console.log(`${outFile} written (exit ${res.status})`);
  return res.status || 0;
}

const results = [];
results.push({ name: 'api-tests', code: run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'test:api', '--silent'], 'test-api.log') });
results.push({ name: 'handler-tests', code: run(process.execPath, ['scripts/test-handlers.js'], 'test-handlers.log') });
results.push({ name: 'cli-integration', code: run(process.execPath, ['scripts/test-cli-integration.js'], 'test-cli.log') });

const failed = results.filter(r => r.code !== 0);
console.log('\nSummary:');
results.forEach(r => console.log(` - ${r.name}: exit ${r.code}`));
if (failed.length) {
  console.error('Some tests failed. See logs: test-api.log, test-handlers.log, test-cli.log');
  process.exit(2);
}
console.log('All tests passed.');
process.exit(0);

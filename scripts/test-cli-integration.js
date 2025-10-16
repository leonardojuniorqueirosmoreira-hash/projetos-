const { spawn } = require('child_process');

(async ()=>{
  const cli = spawn(process.execPath, ['src/index.js'], { stdio: ['pipe','pipe','pipe'] });
  let out = '';
  cli.stdout.on('data', (b) => { out += b.toString(); });
  cli.stderr.on('data', (b) => { out += b.toString(); });

  function write(cmd) {
    cli.stdin.write(cmd + '\n');
  }

  // esperar pelo prompt inicial
  await new Promise((res, rej) => {
    const to = setTimeout(() => rej(new Error('timeout waiting for prompt')), 3000);
    const checker = setInterval(() => {
      if (out.includes('>')) { clearTimeout(to); clearInterval(checker); res(); }
    }, 50);
  }).catch(err => { console.error(err); process.exit(2); });

  write('help');
  await new Promise(r => setTimeout(r, 200));
  write('listar');
  await new Promise(r => setTimeout(r, 200));
  write('ver paracetamol');
  await new Promise(r => setTimeout(r, 200));
  write('vender paracetamol 1');
  await new Promise(r => setTimeout(r, 200));
  write('exit');

  const finished = await new Promise((res) => {
    cli.on('close', (code) => res(code));
  });

  // validações simples
  const ok = out.includes('Comandos:') && out.includes('Estoque:') && out.includes('Paracetamol 500mg') && out.includes('Venda realizada');
  console.log('OUT:', out.replace(/\r/g,''));
  if (!ok) {
    console.error('Integration test failed');
    process.exit(2);
  }
  console.log('Integration test passed');
  process.exit(0);
})();

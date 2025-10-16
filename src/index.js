#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const autoresponses = require('./handlers/autoresponses');
const stockHandler = require('./handlers/stock');
const logger = require('./services/logger');
const { prettyCurrency } = require('./utils/format');

const BOT_NAME = process.env.BOT_NAME || 'FarmaciaBot';

function printHelp() {
  console.log('Comandos:');
  console.log('  help                      Mostra esta ajuda');
  console.log('  listar                    Lista todos os itens');
  console.log('  ver <chave>               Mostra detalhe de um item');
  console.log('  vender <chave> <qtd>      Vende uma quantidade (inteira)');
  console.log('  autoresp <texto>          Força resposta automática');
  console.log('  sair | exit               Encerra o CLI');
}

async function handleList() {
  const all = await stockHandler.listAll();
  console.log('Estoque:');
  for (const key of Object.keys(all || {})) {
    const it = all[key];
    console.log(` - ${key}: ${it.name} — ${it.quantity} un. — ${prettyCurrency(it.price)}`);
  }
}

async function handleView(key) {
  const it = await stockHandler.getItem(key);
  if (!it) { console.log('Item não encontrado:', key); return; }
  console.log(`${it.name} — ${it.quantity} un. — ${prettyCurrency(it.price)}`);
}

async function handleSell(key, qty) {
  const q = Number(qty || 1);
  if (!Number.isInteger(q) || q <= 0) { console.log('Quantidade inválida:', qty); return; }
  const res = await stockHandler.sellItem(key, q);
  if (!res || !res.success) { console.log('Venda falhou:', res && res.message); return; }
  console.log(`Venda realizada: ${res.item.name} x ${q}. Subtotal: ${prettyCurrency(res.subtotal)}. Saldo restante: ${res.item.quantity}`);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: `${BOT_NAME}> ` });

console.log(`== ${BOT_NAME} iniciado (CLI demo) ==`);
console.log('Digite "help" para ver os comandos.\n');
rl.prompt();

rl.on('line', async (raw) => {
  const line = String(raw || '').trim();
  if (!line) { rl.prompt(); return; }

  // autoresponse hook (non-blocking)
  try {
    if (autoresponses && typeof autoresponses.handleMessage === 'function') {
      const auto = autoresponses.handleMessage(line);
      if (auto) { console.log(auto); rl.prompt(); return; }
    }
  } catch (err) { logger.error && logger.error('autoresponses error', err); }

  const parts = line.split(/\s+/).filter(Boolean);
  const cmd = (parts[0] || '').toLowerCase();

  try {
    switch (cmd) {
      case 'help':
        printHelp();
        break;
      case 'listar':
        await handleList();
        break;
      case 'ver':
        await handleView(parts[1]);
        break;
      case 'vender':
        await handleSell(parts[1], parts[2]);
        break;
      case 'autoresp': {
        const text = parts.slice(1).join(' ');
        const reply = autoresponses.handleMessage(text || '');
        console.log('Autoresponse:', reply);
        break;
      }
      case 'sair':
      case 'exit':
        console.log('Encerrando...');
        rl.close();
        return;
      default:
        console.log('Comando não reconhecido. Digite help.');
    }
  } catch (err) {
    logger.error && logger.error('Erro ao processar comando', err);
    console.log('Ocorreu um erro ao executar o comando. Veja logs.');
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('Bye');
  process.exit(0);
});
 
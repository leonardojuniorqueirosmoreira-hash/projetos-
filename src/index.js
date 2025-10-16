#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const autoresponses = require('./handlers/autoresponses');
const stockHandler = require('./handlers/stock');
const logger = require('./services/logger');
const { prettyCurrency } = require('./utils/format');

// QR code for WhatsApp integration (optional)
const fs = require('fs');
let qrcodeTerminal = null;
let qrcodeImg = null;
try { qrcodeTerminal = require('qrcode-terminal'); } catch (err) { qrcodeTerminal = null; }
try { qrcodeImg = require('qrcode'); } catch (err) { qrcodeImg = null; }

function printWhatsappQR() {
  const show = process.env.SHOW_WA_QR === '1';
  if (!show) return;
  // default to the user-provided WhatsApp link
  const url = process.env.WA_INTEGRATION_URL || 'https://wa.me/557791307594';

  // If user requested saving QR to file
  const saveFile = process.env.SAVE_WA_QR_FILE;
  if (saveFile) {
    if (!qrcodeImg) {
      console.log('Dependência `qrcode` não instalada. Para salvar QR em arquivo: npm install qrcode');
      console.log('URL para integração WhatsApp:', url);
    } else {
      qrcodeImg.toFile(saveFile, url, { margin: 1 }, function (err) {
        if (err) console.error('Erro ao salvar QR:', err);
        else console.log('QR salvo em arquivo:', saveFile);
      });
    }
  }

  if (!qrcodeTerminal) {
    console.log('qrcode-terminal não instalado. Execute: npm install qrcode-terminal');
    console.log('URL para integração WhatsApp:', url);
    return;
  }

  console.log('\nAbra o WhatsApp usando o QR abaixo para integrar este bot:');
  qrcodeTerminal.generate(url, { small: true });
}

const BOT_NAME = process.env.BOT_NAME || 'FarmaciaBot';

function printHelp() {
  console.log('Comandos:');
  console.log(' - listar: lista todos os itens');
  console.log(' - ver <item>: mostra um item');
  console.log(' - vender <item> <qtd>: reduz estoque');
  console.log(' - sair|exit: encerra');
  console.log(' - help: mostra esta ajuda');
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: `${BOT_NAME}> ` });

console.log(`== ${BOT_NAME} iniciado (CLI demo) ==`);
printWhatsappQR();
console.log('Digite "help" para ver os comandos.\n');
rl.prompt();

rl.on('line', async (raw) => {
  const line = String(raw || '').trim();
  if (!line) { rl.prompt(); return; }

  try {
    if (autoresponses && typeof autoresponses.handleMessage === 'function') {
      const auto = autoresponses.handleMessage(line);
      if (auto) { console.log(auto); rl.prompt(); return; }
    }
  } catch (err) { logger && logger.error && logger.error('autoresponses error', err); }

  const parts = line.split(/\s+/).filter(Boolean);
  const cmd = (parts[0] || '').toLowerCase();

  try {
    switch (cmd) {
      case 'help':
        printHelp();
        break;
      case 'listar': {
        if (!stockHandler || typeof stockHandler.listAll !== 'function') { console.log('Função listAll não disponível.'); break; }
        const all = await stockHandler.listAll();
        console.log('Estoque:');
        for (const key of Object.keys(all || {})) {
          const it = all[key];
          console.log(` - ${key}: ${it.name} — ${it.quantity} un. — ${prettyCurrency(it.price)}`);
        }
        break;
      }
      case 'ver': {
        if (!parts[1]) { console.log('Uso: ver <item>'); break; }
        const key = parts[1].toLowerCase();
        const it = stockHandler && typeof stockHandler.getItem === 'function' ? await stockHandler.getItem(key) : null;
        if (!it) console.log(`Item "${key}" não encontrado.`);
        else console.log(`${it.name} — ${it.quantity} un. — ${prettyCurrency(it.price)}`);
        break;
      }
      case 'vender': {
        if (!parts[1] || !parts[2]) { console.log('Uso: vender <item> <quantidade>'); break; }
        const key = parts[1].toLowerCase();
        const qty = parseInt(parts[2], 10);
        if (Number.isNaN(qty) || qty <= 0) { console.log('Quantidade inválida.'); break; }
        if (!stockHandler || typeof stockHandler.sellItem !== 'function') { console.log('Operação de venda não implementada no stock handler.'); break; }
        const result = await stockHandler.sellItem(key, qty);
        if (result && result.success) {
          console.log(`Venda realizada: ${result.item.name} x ${qty}. Subtotal: ${prettyCurrency(result.subtotal)}. Saldo restante: ${result.item.quantity}`);
          logger && typeof logger.info === 'function' && logger.info(`venda: ${key} x${qty} — subtotal ${prettyCurrency(result.subtotal)}`);
        } else {
          console.log('Erro na venda: ' + (result && result.message ? result.message : 'Operação falhou'));
        }
        break;
      }
      case 'sair':
      case 'exit':
        console.log('Encerrando...'); rl.close(); process.exit(0); break;
      case '': break;
      default:
        console.log('Comando não reconhecido. Digite "help".');
    }
  } catch (err) { logger && logger.error && logger.error('Erro ao processar comando', err); console.error('Erro:', err.message || err); }

  rl.prompt();
}).on('close', () => { console.log('Até logo!'); process.exit(0); });

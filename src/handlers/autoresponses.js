
// src/handlers/autoresponses.js
// Retorna string de resposta ou null

const responses = [
  { pattern: /^olá|^oi|^bom dia|^boa tarde|^boa noite/i, reply: 'Olá! Eu sou o bot da farmácia — diga "help" para comandos.' },
  { pattern: /hor[ií]rio/i, reply: 'Nosso horário é de segunda a sexta das 08:00 às 18:00 e sábados das 08:00 às 12:00.' },
  { pattern: /(endereço|onde fica)/i, reply: 'Estamos na Rua Exemplo, 123 — centro.' },
  { pattern: /pre[ií]ço|valor/i, reply: 'Para ver o preço de um produto digite: ver <nome_do_item>.' },
  { pattern: /^ajuda|^help$/i, reply: null } // permite passagem para o comando help
];

function handleMessage(text) {
  if (!text) return null;
  for (const r of responses) {
    if (r.pattern.test(text)) {
      return r.reply; // pode ser null para permitir outras rotas
    }
  }
  return null;
}

module.exports = { handleMessage };


FarmaciaBot (CLI demo)

Uso rápido

- Iniciar o CLI:

  node src/index.js

Comandos disponíveis (em português):
- listar — lista todos os itens no estoque
- ver <item> — mostra detalhes de um item
- vender <item> <qtd> — realiza uma venda (reduz quantidade)
- sair|exit — encerra
- help — mostra ajuda

Handlers:
- `src/handlers/stock.js` — implementação in-memory de estoque com listAll, getItem, sellItem
- `src/handlers/autoresponses.js` — respostas automáticas (handleMessage)

Testes rápidos:
- `npm run test:handlers` — roda um script que valida programaticamente os handlers

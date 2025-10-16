# Farmacia Bot API

Rotas principais:

- GET /health — status
- GET /stock — lista de itens
- GET /stock/:key — obter item
- POST /stock/:key/sell { qty } — vender quantidade
- POST /autoresponse { text } — obter resposta automática
- POST /generate-qr { botId, sessionToken, url, format } — retorna payload JSON + ASCII; se format=png retorna image/png

Exemplo (PowerShell):

```powershell
# health
Invoke-WebRequest -UseBasicParsing http://localhost:3000/health

# vender 1 unidade
Invoke-RestMethod -Uri http://localhost:3000/stock/paracetamol/sell -Method POST -Body (ConvertTo-Json @{qty=1}) -ContentType 'application/json'

# gerar QR PNG
Invoke-RestMethod -Uri http://localhost:3000/generate-qr?format=png -Method POST -Body (ConvertTo-Json @{botId='api-bot'}) -ContentType 'application/json' -OutFile api_qr.png
```

### Venom (WhatsApp) integration

To enable Venom-based WhatsApp integration, set environment variable `USE_VENOM=1` and ensure `venom-bot` is installed (this project already adds `venom-bot` as a dependency).

New endpoints:

- POST /wa/send { to, message } — send a WhatsApp text message. `to` must be in WhatsApp format (example: `5511999999999@c.us`).
- GET /wa/qr — returns the latest QR image (PNG) produced by Venom during the authentication flow.

Security:

- If you want to protect these endpoints, set `API_TOKEN` in the environment and send `Authorization: Bearer <token>` header.

Notes:

- Venom requires Chromium; the server will attempt to start Venom only when `USE_VENOM=1`. In many CI or headless servers you might need extra puppeteer args (for example `--no-sandbox`).
- Starting Venom will create a session directory and emit a QR. You can retrieve that QR via `/wa/qr` while the session is initializing.

## Conectar ao GitHub

Se o repositório local ainda não estiver vinculado ao GitHub, adicione um remote e faça push:

```powershell
# exemplo: substitua a URL pelo seu repositório
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin $(git branch --show-current)
```

## Iniciar Venom localmente

Requisitos:
- Node.js instalado
- Chrome/Chromium disponível (defina `CHROME_PATH` se necessário)

Exemplo para iniciar Venom e mostrar o QR na pasta `venom-session`:

```powershell
# crie um .env com USE_VENOM=1 ou defina as vars inline
$env:USE_VENOM='1'; $env:HEADLESS='0'; node scripts/start-venom.js
```

Se quiser rodar em modo headless (sem abrir o navegador):

```powershell
$env:USE_VENOM='1'; $env:HEADLESS='1'; node scripts/start-venom.js
```

O script salvará um arquivo `venom_qr.png` dentro de `VENOM_DIR` quando receber o QR.
# Farmacia Bot API

Rotas principais:

- GET /health — status
- GET /stock — lista de itens
- GET /stock/:key — obter item
- POST /stock/:key/sell { qty } — vender quantidade
- POST /autoresponse { text } — obter resposta automática
- POST /generate-qr { botId, sessionToken, url, format } — retorna payload JSON + ASCII; se format=png retorna image/png

Exemplo (PowerShell):

```powershell
# health
Invoke-WebRequest -UseBasicParsing http://localhost:3000/health

# vender 1 unidade
Invoke-RestMethod -Uri http://localhost:3000/stock/paracetamol/sell -Method POST -Body (ConvertTo-Json @{qty=1}) -ContentType 'application/json'

# gerar QR PNG
Invoke-RestMethod -Uri http://localhost:3000/generate-qr?format=png -Method POST -Body (ConvertTo-Json @{botId='api-bot'}) -ContentType 'application/json' -OutFile api_qr.png
```

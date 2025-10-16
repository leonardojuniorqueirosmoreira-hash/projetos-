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

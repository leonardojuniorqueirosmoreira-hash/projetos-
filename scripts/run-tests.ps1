param()
Write-Output "Running API tests..."
node node_modules/jest/bin/jest.js __tests__/api.test.js --runInBand --colors *>&1 | Tee-Object test-api.log
Write-Output "API tests logged to test-api.log"

Write-Output "Running handlers smoke test..."
node scripts/test-handlers.js *>&1 | Tee-Object test-handlers.log
Write-Output "Handlers test logged to test-handlers.log"

Write-Output "Running CLI integration test..."
node scripts/test-cli-integration.js *>&1 | Tee-Object test-cli.log
Write-Output "CLI integration test logged to test-cli.log"

Write-Output "Done."

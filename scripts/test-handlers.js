(async ()=>{
  try {
    const stock = require('../src/handlers/stock');
    const auto = require('../src/handlers/autoresponses');
    const all = await stock.listAll();
    console.log('LISTALL OK - items:', Object.keys(all).length);
    const item = await stock.getItem('paracetamol');
    if (!item) throw new Error('getItem failed for paracetamol');
    console.log('GETITEM OK -', item.name);
    const sell = await stock.sellItem('paracetamol', 1);
    if (!sell || !sell.success) throw new Error('sellItem failed');
    console.log('SELL OK - subtotal', sell.subtotal);
    const res1 = auto.handleMessage('olá');
    console.log('AUTORESP OK -', res1 ? 'responded' : 'no response');
    console.log('All handler tests passed');
    process.exit(0);
  } catch (err) {
    console.error('Handler tests failed:', err && err.message);
    process.exit(2);
  }
})();

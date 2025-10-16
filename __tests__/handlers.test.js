const stock = require('../src/handlers/stock');

describe('stock handler', () => {
  test('listAll returns an object with items', async () => {
    const all = await stock.listAll();
    expect(typeof all).toBe('object');
    expect(Object.keys(all).length).toBeGreaterThan(0);
  });

  test('getItem returns item or null', async () => {
    const it = await stock.getItem('paracetamol');
    expect(it).not.toBeNull();
    expect(it.name).toMatch(/Paracetamol/);
  });

  test('sellItem reduces quantity and returns success', async () => {
    const before = (await stock.getItem('dipirona')).quantity;
    const res = await stock.sellItem('dipirona', 1);
    expect(res.success).toBe(true);
    expect(res.subtotal).toBeGreaterThan(0);
    const after = (await stock.getItem('dipirona')).quantity;
    expect(after).toBe(before - 1);
  });
});

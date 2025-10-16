// Handler simples de estoque (in-memory). Substitua por implementação real quando disponível.

const store = {
  paracetamol: { name: 'Paracetamol 500mg', quantity: 120, price: 3.5 },
  dipirona: { name: 'Dipirona 500mg', quantity: 60, price: 2.75 },
  mascara: { name: 'Máscara descartável (10 un.)', quantity: 15, price: 8.0 }
};
module.exports = {
  async listAll() {
    // retorna cópia
    return JSON.parse(JSON.stringify(store));
  },

  async getItem(key) {
    return store[key] || null;
  },

  async sellItem(key, qty) {
    const item = store[key];
    if (!item) return { success: false, message: 'Item não encontrado' };
    if (item.quantity < qty) return { success: false, message: 'Estoque insuficiente' };
    item.quantity -= qty;
    const subtotal = item.price * qty;
    return { success: true, item, subtotal };
  }
};


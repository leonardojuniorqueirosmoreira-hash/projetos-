function prettyCurrency(item) {
  if (!item) return '-';
  if (typeof item === 'number') return `R$ ${item.toFixed(2)}`;
  if (item && typeof item.price === 'number') return `R$ ${item.price.toFixed(2)}`;
  return '-';
}

module.exports = { prettyCurrency };

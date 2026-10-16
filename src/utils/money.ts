const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

/** Formata cêntimos em euros (pt-PT), ex.: 1990 → "19,90 €". */
export function formatEUR(cents: number): string {
  return eur.format(Math.round(cents) / 100);
}

import { describe, expect, it } from 'vitest';
import { monthlyEquivalentCents, quote, simulatedMRRCents } from '../domain/pricing';
import type { Subscription } from '../domain/types';
import { formatEUR } from '../utils/money';
import { addMonths } from '../utils/dates';

describe('preços e portes', () => {
  it('Essencial cobra 3,90 € de portes', () => {
    const q = quote('essencial', 'mensal');
    expect(q).toMatchObject({ priceCents: 1990, shippingCents: 390, totalCents: 2380, recurring: true });
  });
  it('Explorador e Premium têm portes incluídos', () => {
    expect(quote('explorador', 'bimestral')).toMatchObject({ priceCents: 3990, shippingCents: 0, totalCents: 3990 });
    expect(quote('premium', 'mensal')).toMatchObject({ priceCents: 5990, shippingCents: 0, totalCents: 5990 });
  });
  it('compra avulsa tem o mesmo preço e não é recorrente', () => {
    expect(quote('essencial', 'avulsa')).toMatchObject({ totalCents: 2380, recurring: false });
  });
  it('sem desconto por frequência', () => {
    expect(quote('premium', 'bimestral').priceCents).toBe(quote('premium', 'mensal').priceCents);
  });
  it('formata em pt-PT', () => {
    expect(formatEUR(2380).replace(/\s/g, ' ')).toBe('23,80 €');
  });
});

describe('receita recorrente mensal equivalente', () => {
  const sub = (planId: Subscription['planId'], frequency: Subscription['frequency'], status: Subscription['status']): Subscription => ({
    id: Math.random().toString(), customerId: 'c', planId, frequency, status, modality: 'achiga',
    startedAt: '', nextBillingDate: '2026-11-01', skipNext: false, history: [],
  });
  it('mensal = valor do plano; bimestral = metade', () => {
    expect(monthlyEquivalentCents('explorador', 'mensal')).toBe(3990);
    expect(monthlyEquivalentCents('explorador', 'bimestral')).toBe(1995);
  });
  it('exclui pausadas e canceladas e não inclui portes', () => {
    const subs = [
      sub('essencial', 'mensal', 'active'), // 1990 (sem portes)
      sub('premium', 'bimestral', 'active'), // 2995
      sub('premium', 'mensal', 'paused'),
      sub('explorador', 'mensal', 'cancelled'),
    ];
    expect(simulatedMRRCents(subs)).toBe(1990 + 2995);
  });
  it('arredonda só no total (dois bimestrais Essencial = 1990)', () => {
    expect(simulatedMRRCents([sub('essencial', 'bimestral', 'active'), sub('essencial', 'bimestral', 'active')])).toBe(1990);
  });
});

describe('datas', () => {
  it('soma de meses limita ao fim do mês', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-12-15', 2)).toBe('2027-02-15');
  });
});

import { describe, expect, it } from 'vitest';
import { parseStored, SCHEMA_VERSION } from '../data/repository';
import { createSeedData } from '../data/seed';

describe('persistência', () => {
  it('aceita dados válidos da versão atual', () => {
    const data = createSeedData();
    expect(parseStored(JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt: '', data }))).not.toBeNull();
  });
  it('rejeita dados inválidos, de outra versão ou corrompidos', () => {
    const data = createSeedData();
    expect(parseStored(null)).toBeNull();
    expect(parseStored('{nope')).toBeNull();
    expect(parseStored(JSON.stringify({ schemaVersion: 999, data }))).toBeNull();
    expect(parseStored(JSON.stringify({ schemaVersion: SCHEMA_VERSION, data: { ...data, orders: null } }))).toBeNull();
    expect(parseStored(JSON.stringify({ schemaVersion: SCHEMA_VERSION, data: { ...data, activeCustomerId: 'x' } }))).toBeNull();
  });
});

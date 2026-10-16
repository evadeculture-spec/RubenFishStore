import type { ISODate, ISODateTime } from '../domain/types';

const pad = (n: number) => String(n).padStart(2, '0');

function parse(date: ISODate): { y: number; m: number; d: number } {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return { y, m, d };
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function isValidISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { y, m, d } = parse(value);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

/** Soma meses mantendo o dia, limitado ao último dia do mês (31 jan + 1 = 28/29 fev). */
export function addMonths(date: ISODate, months: number): ISODate {
  const { y, m, d } = parse(date);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const nd = Math.min(d, daysInMonth(ny, nm));
  return `${ny}-${pad(nm)}-${pad(nd)}`;
}

export function addDays(date: ISODate, days: number): ISODate {
  const { y, m, d } = parse(date);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function daysBetween(from: ISODate, to: ISODate): number {
  const a = parse(from);
  const b = parse(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

export function monthKey(date: ISODate): string {
  return date.slice(0, 7);
}

/** Converte a data do relógio de demonstração num instante (meio-dia UTC). */
export function atClock(date: ISODate): ISODateTime {
  return `${date.slice(0, 10)}T12:00:00.000Z`;
}

const dateFmt = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortFmt = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatDate(value: ISODate | ISODateTime): string {
  return dateFmt.format(new Date(atClock(value.slice(0, 10))));
}

export function formatShortDate(value: ISODate | ISODateTime): string {
  return shortFmt.format(new Date(atClock(value.slice(0, 10))));
}

export function formatMonth(month: string): string {
  const s = monthFmt.format(new Date(atClock(`${month}-01`)));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

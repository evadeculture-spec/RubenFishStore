import { useCallback, type ReactNode } from 'react';
import { useFeedback } from '../components/feedback';
import type { Customer, DemoData, Result } from '../domain/types';
import { store, useDemo } from './store';

export function useActiveCustomer(): { data: DemoData; customer: Customer } {
  const data = useDemo();
  const customer = data.customers.find((c) => c.id === data.activeCustomerId) ?? data.customers[0];
  return { data, customer };
}

/** Executa uma operação de negócio e mostra a mensagem de sucesso ou erro correspondente. */
export function useAction() {
  const fb = useFeedback();
  return useCallback(
    <T,>(fn: (d: DemoData) => Result<T>, success?: ReactNode | ((v: T) => ReactNode)): Result<T> => {
      const r = store.run(fn);
      if (!r.ok) fb.error(r.error);
      else if (success) fb.success(typeof success === 'function' ? (success as (v: T) => ReactNode)(r.value) : success);
      return r;
    },
    [fb],
  );
}

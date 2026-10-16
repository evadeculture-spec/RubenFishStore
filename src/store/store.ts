import { useSyncExternalStore } from 'react';
import { localRepository, type DemoRepository } from '../data/repository';
import type { DemoData, Result } from '../domain/types';

type Listener = () => void;

/**
 * Store mínimo: cada operação corre sobre uma cópia do estado e só é confirmada (e guardada)
 * se a regra de negócio devolver sucesso. Assim nenhuma operação falhada deixa estado parcial.
 */
function createStore(repo: DemoRepository) {
  const initial = repo.load();
  let state: DemoData = initial.data;
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l());

  return {
    loadStatus: initial.status,
    get: () => state,
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    run<T>(fn: (draft: DemoData) => Result<T>): Result<T> {
      const draft = structuredClone(state);
      const r = fn(draft);
      if (r.ok) {
        state = draft;
        repo.save(state);
        emit();
      }
      return r;
    },
    reset() {
      state = repo.reset();
      emit();
    },
  };
}

export const store = createStore(localRepository);

export function useDemo(): DemoData {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

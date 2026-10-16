import { Compass } from 'lucide-react';
import { EmptyState, LinkButton } from '../../components/ui';

export function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState icon={<Compass className="h-6 w-6" />} title="Página não encontrada" action={<LinkButton to="/">Voltar ao início</LinkButton>}>
        A página que procuras não existe nesta demonstração.
      </EmptyState>
    </div>
  );
}

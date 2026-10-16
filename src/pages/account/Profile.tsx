import { useState } from 'react';
import { Button, Checkbox } from '../../components/ui';
import { ProfileFields } from '../../components/ProfileFields';
import { currentSubscription } from '../../domain/subscriptions';
import type { FishingProfile } from '../../domain/types';
import { useAction, useActiveCustomer } from '../../store/hooks';
import { MODALITIES } from '../../config/business';

export function Profile() {
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const [profile, setProfile] = useState<FishingProfile>(customer.profile);
  const [applyToSub, setApplyToSub] = useState(true);
  const sub = currentSubscription(data, customer.id);
  const modalityChanged = sub && sub.modality !== profile.modality;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Perfil de pesca</h1>
      <p className="mb-6 text-ink-soft">A modalidade define os produtos sugeridos, os guias e as recompensas disponíveis.</p>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          act(
            (d) => {
              const c = d.customers.find((x) => x.id === customer.id)!;
              c.profile = { ...profile };
              const s = d.subscriptions.find((x) => x.id === sub?.id);
              if (s && applyToSub && s.modality !== profile.modality) {
                s.history.push({ at: `${d.clock}T12:00:00.000Z`, type: 'modality_changed', detail: `${MODALITIES[s.modality].label} → ${MODALITIES[profile.modality].label}` });
                s.modality = profile.modality;
              }
              return { ok: true, value: null };
            },
            modalityChanged && applyToSub ? 'Perfil guardado. A subscrição muda de modalidade a partir do próximo ciclo.' : 'Perfil de pesca guardado.',
          );
        }}
      >
        <ProfileFields value={profile} onChange={setProfile} />
        {modalityChanged && (
          <div className="rounded-xl bg-sand-50 p-4 ring-1 ring-sand-300">
            <Checkbox
              checked={applyToSub}
              onChange={setApplyToSub}
              label="Aplicar a nova modalidade também à subscrição"
              description="A alteração aplica-se a partir do próximo ciclo. A encomenda já paga não muda."
            />
          </div>
        )}
        <Button type="submit" size="lg">Guardar perfil</Button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import type { Me, Role, Schema } from '../../api/contract';
import { useWrite } from '../../hooks/useApi';

export function useRoleEditor(me: Me, role: Role, card: Schema<'RoleCardResponse'>) {
  const [draft, setDraft] = useState<Schema<'ReplaceRoleCardRequest'>>({ character: card.character, weakSpots: card.weakSpots });
  const save = useWrite(me.id, 'replaceOwnerRoleCard');
  const valid = !!draft.character.trim() && draft.weakSpots.length >= 5 && draft.weakSpots.every(spot => spot.key.trim() && spot.description.trim());
  const submit = () => save.run({ path: { role }, body: draft }).catch(() => {});
  return { draft, setDraft, save, valid, submit };
}

export function usePackageEditor(me: Me, pack: Schema<'OwnerPackageResponse'>) {
  const [draft, setDraft] = useState<Schema<'OwnerPackageRequest'>>({ strikes: pack.strikes, priceStars: pack.priceStars, active: pack.active, order: pack.order });
  const [confirm, setConfirm] = useState(false);
  const save = useWrite(me.id, 'replaceOwnerPackage');
  const submit = async () => {
    try {
      const response = await save.run({ path: { packageId: pack.id }, body: draft });
      if (response) {
        setConfirm(false);
      }
    } catch { /* Preserve confirmation and changed values. */ }
  };
  return { draft, setDraft, confirm, setConfirm, save, submit };
}

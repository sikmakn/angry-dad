import { Injectable } from '@nestjs/common';
import type { User } from '../../database/schemas/user.schema';
import type { BattleDialog } from '../../database/schemas/battle-dialog.schema';
import type { PageInput } from '../../common/utils/presentation';
import type { BattleDialogResponseView, BattleMessageResponseView, BattleMessageListResponseView, TurnResponseView, RoleCardResponseView, ReplaceRoleCardRequestView } from './battle.types';
import { BattleStoreService } from './services/battle-store.service';
import { TurnService } from './services/turn.service';
import { TurnRecoveryService } from './services/turn-recovery.service';
@Injectable()
export class BattleService {
  constructor(private readonly store: BattleStoreService, private readonly turns: TurnService, private readonly recovery: TurnRecoveryService) { }
  async dialog(user: User, role: 'father' | 'mother'): Promise<BattleDialog> {
    return this.store.dialog(user, role);
  }

  async getDialog(user: User, role: 'father' | 'mother'): Promise<BattleDialogResponseView> {
    return this.store.getDialog(user, role);
  }

  async messages(user: User, role: 'father' | 'mother', input: PageInput): Promise<BattleMessageListResponseView> {
    return this.store.messages(user, role, input);
  }

  async quote(user: User, role: 'father' | 'mother', feedId: string, key?: string): Promise<BattleMessageResponseView> {
    return this.store.quote(user, role, feedId, key);
  }

  async roleCard(role: 'father' | 'mother'): Promise<RoleCardResponseView> {
    return this.store.roleCard(role);
  }

  async replaceRoleCard(role: 'father' | 'mother', input: ReplaceRoleCardRequestView): Promise<RoleCardResponseView> {
    return this.store.replaceRoleCard(role, input);
  }

  async turn(user: User, role: 'father' | 'mother', text: string, key: string): Promise<{
    result: TurnResponseView;
    repeated: boolean;
  }> {
    return this.turns.turn(user, role, text, key);
  }

  async recover(): Promise<void> {
    return this.recovery.recover();
  }
}

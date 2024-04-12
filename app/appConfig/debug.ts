import { socketService } from '@/packages/fp-ts-utils/socketService.ts';
import { getLogger } from '@/utils';

import { Registry } from './registry.ts';

export const debug = {
  initialize: (): void => {
    getLogger(Registry.AppRouteStateController.name).setEnabled(true);
    socketService.setLogger(getLogger(Registry.SocketService.name).setEnabled(true));
    getLogger(Registry.ChatModel.name).setEnabled(true);
    getLogger(Registry.AppPageManager.name).setEnabled(true);
    getLogger(Registry.AppState.name).setEnabled(true);
    getLogger(Registry.AppStateClient.name).setEnabled(true);
    getLogger(Registry.CredentialsService.name).setEnabled(true);
  },
};

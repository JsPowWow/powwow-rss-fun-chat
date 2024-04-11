import { socketService } from '@/packages/fp-ts-utils/socketService.ts';
import { getLogger } from '@/utils';

export const debug = {
  initialize: (): void => {
    getLogger('AppPagesController').setEnabled(true);
    socketService.setLogger(getLogger('socketService').setEnabled(true));
    getLogger('ChatModel').setEnabled(true);
  },
};

import { getLogger } from '@/utils';

export const debug = {
  initialize: (): void => {
    getLogger('AppPagesController').setEnabled(true);
  },
};

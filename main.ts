import './normalize.css';
import './style.css';

import { AppPageStateController } from '@/pages';
import { assertIsInstanceOf, getLogger } from '@/utils';

import { debug } from './app/debug.ts';

const app = document.querySelector('#app');
assertIsInstanceOf(HTMLElement, app);

window.addEventListener('load', () => {
  new AppPageStateController(app, {
    debug: true,
    logger: getLogger('AppPagesController').setEnabled(true),
  }).initialize();
});

debug.initialize();

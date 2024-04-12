import './normalize.css';
import './style.css';
import { debug } from '@/appConfig/debug';
import { Registry } from '@/appConfig/registry';

window.addEventListener('load', () => {
  new Registry().initialize();
  debug.initialize();
});

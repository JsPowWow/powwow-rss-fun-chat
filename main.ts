import './normalize.css';
import './style.css';
import { Registry } from '@/appConfig/registry';

window.addEventListener('load', () => {
  new Registry().initialize();
});

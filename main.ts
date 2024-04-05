import './normalize.css';
import './style.css';
import { assertIsInstanceOf } from '@/utils';

// const envMode = import.meta.env.MODE;
// const params = new URLSearchParams(window.location.search);
//
// const isDevMode = envMode === 'development';
// const isRemoteServerMode = params.has('server', 'remote');
// const isLocalServerMode = params.has('server', 'local');

const app = document.querySelector('#app');
assertIsInstanceOf(HTMLElement, app);

window.addEventListener('load', () => {
  // if ((isDevMode && !isRemoteServerMode) || isLocalServerMode) {
  //   // new RacePageStandalone(app).draw();
  // } else {
  //   // const webContainerPage = new MainWebContainerPage();
  //   // app.append(webContainerPage.element);
  //   // import('./container/files')
  //   //   .then((module) => {
  //   //     webContainerPage.init(module.files).catch(noop);
  //   //   })
  //   //   .catch((e) => logger.error(e));
  // }
});

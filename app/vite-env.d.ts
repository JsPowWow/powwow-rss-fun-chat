/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_MIK_API_URL: string;
  // readonly VITE_ASSETS_URL: string;
  // more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

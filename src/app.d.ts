/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

interface ImportMetaEnv {
  VITE_REMOTE_COUCHDB_URL: string;
}
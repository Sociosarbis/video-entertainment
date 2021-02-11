/// <reference types="react-scripts" />

import { PrecacheEntry } from 'workbox-precaching/_types';
interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: PrecacheEntry[];
}

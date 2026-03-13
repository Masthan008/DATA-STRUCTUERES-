import { createClient } from '@insforge/sdk';

const insforgeUrl = import.meta.env.VITE_INSFORGE_URL || 'https://sjh5cjy4.us-east.insforge.app';
const insforgeAnonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'public-anon-key';

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey
});

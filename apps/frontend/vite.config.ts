import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy JSON-RPC requests at /rpc through the Vite dev server to
      // the local Nitro devnode. The page only ever fetches from its
      // own origin, which sidesteps CORS entirely (the nitro-devnode
      // doesn't set Access-Control-Allow-Origin, and Codespaces' port
      // forwarder doesn't add it either, so a direct fetch from the
      // page to the forwarded :8547 URL is blocked).
      //
      // The browser sends POST to http://localhost:5173/rpc; Vite
      // forwards it to http://localhost:8547, which is reachable from
      // the Vite process itself (it shares the same network namespace
      // as the devnode in both local and Codespaces setups).
      '/rpc': {
        target: 'http://localhost:8547',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ''),
        ws: true,
      },
    },
  },
});

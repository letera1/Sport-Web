import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Runs the same serverless proxy core during `npm run dev`, so local behaviour
 * matches production without needing `vercel dev`. The API key stays in the Node
 * process and is never exposed to the browser.
 */
function sportdbDevProxy(): Plugin {
  return {
    name: 'sportdb-dev-proxy',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/sportdb', async (req, res) => {
        try {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'method_not_allowed' } }));
            return;
          }

          const [proxy, rateLimit] = await Promise.all([
            server.ssrLoadModule('/api/_lib/proxy.ts'),
            server.ssrLoadModule('/api/_lib/rateLimit.ts'),
          ]);

          const [rawPath, rawSearch] = (req.url ?? '/').split('?');
          const segments = rawPath.split('/').filter(Boolean).map(decodeURIComponent);
          const query = Object.fromEntries(new URLSearchParams(rawSearch ?? ''));

          const result = await proxy.handleProxyRequest({
            segments,
            query,
            clientId: rateLimit.clientIdFrom(req.headers),
          });

          res.statusCode = result.status;
          for (const [name, value] of Object.entries(result.headers)) {
            res.setHeader(name, value as string);
          }
          res.end(JSON.stringify(result.body));
        } catch (error) {
          server.config.logger.error(`[sportdb-dev-proxy] ${(error as Error).message}`);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { code: 'dev_proxy_error' } }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_* to the client. Server-only vars are loaded here into
  // the Node process so the dev proxy can read them — they are never bundled.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of Object.keys(env)) {
    if (!key.startsWith('VITE_') && process.env[key] === undefined) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), sportdbDevProxy()],
    server: {
      proxy: {
        // Regex key so /api/sportdb/* falls through to the dev proxy above.
        '^/api/(?!sportdb)': {
          target: 'https://www.thesportsdb.com',
          changeOrigin: true,
          secure: false,
        },
        '/images-r2': {
          target: 'https://r2.thesportsdb.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/images-r2/, '')
        },
        '/images-www': {
          target: 'https://www.thesportsdb.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/images-www/, '')
        },
        '/images-proxy': {
          target: 'https://r2.thesportsdb.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/images-proxy/, '')
        },
      },
    },
    optimizeDeps: {
      include: ['lucide-react'],
    },
  };
});
